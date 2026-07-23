import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { addWedding } from '@/lib/store';
import { auditLog } from '@/lib/audit';
import { dbSelect, dbInsert } from '@/lib/supabase-db';
import { getAdminSettings } from '@/lib/adminSettings';
import { upsertAdminCouple } from '@/lib/adminCouples';
import bcrypt from 'bcrypt';

type CreatedWedding = ReturnType<typeof addWedding> & {
  profileImage?: string;
};

interface DbUser { id: string; email: string; }
interface DbWedding { id: string; slug: string; }
function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const minWeddingDate = toDateInputValue(new Date());
const maxWeddingDate = `${new Date().getFullYear() + 10}-12-31`;

function parseWeddingDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  const isRealDate =
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day;

  if (!isRealDate || value < minWeddingDate || value > maxWeddingDate) return null;
  return parsed;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'wedding';
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function uniqueWeddingSlug(baseSlug: string) {
  let candidate = baseSlug;
  let suffix = 2;
  while (true) {
    const rows = await dbSelect<DbWedding>('Wedding', { slug: `eq.${candidate}` }, 'id', 1);
    if (rows.length === 0) break;
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const groomName = String(body?.groomName || '').trim();
    const brideName = String(body?.brideName || '').trim();
    const date = body?.date as string | undefined;
    const dateDeciding = !!body?.dateDeciding;
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    const profileImageBase64 = body?.profileImageBase64 as string | undefined;

    if (!groomName) return NextResponse.json({ ok: false, error: "Groom's first name is required." }, { status: 400 });
    if (!brideName) return NextResponse.json({ ok: false, error: "Bride's first name is required." }, { status: 400 });
    if (!email) return NextResponse.json({ ok: false, error: 'Email is required.' }, { status: 400 });
    if (!password) return NextResponse.json({ ok: false, error: 'Password is required.' }, { status: 400 });
    if (!dateDeciding && !date) return NextResponse.json({ ok: false, error: 'Please select a wedding date or mark it as "still deciding".' }, { status: 400 });

    const eventDate = date ? parseWeddingDate(date) : null;
    if (!dateDeciding && !eventDate) {
      return NextResponse.json({ ok: false, error: `Please select a valid date between ${minWeddingDate} and ${maxWeddingDate}.` }, { status: 400 });
    }

    const existing = await dbSelect<DbUser>('User', { email: `eq.${email}` }, 'id', 1);
    if (existing.length > 0) {
      return NextResponse.json({ ok: false, error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    const slug = await uniqueWeddingSlug(slugify(String(body?.slug || `${brideName}-and-${groomName}`)));

    const user = await dbInsert<DbUser>('User', {
      id: userId,
      email,
      password: passwordHash,
      name: `${brideName} & ${groomName}`,
      role: 'COUPLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const weddingId = crypto.randomUUID();
    const now = new Date();
    const wedding = await dbInsert<DbWedding>('Wedding', {
      id: weddingId,
      userId: user.id,
      groomFirstName: groomName,
      brideFirstName: brideName,
      eventDate: eventDate ? eventDate.toISOString() : null,
      venueName: body?.venueDeciding ? null : (body?.venueName || null),
      slug,
      setupCompleted: true,
      estimatedGuests: Number.isFinite(Number(body?.estimatedGuests)) ? Number(body.estimatedGuests) : null,
      estimatedBudget: Number.isFinite(Number(body?.estimatedBudget)) ? Number(body.estimatedBudget) : null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    const created: CreatedWedding = addWedding({ ...(body || {}), id: wedding.id, userId: user.id, email, slug });
    const defaultTrialDays = getAdminSettings().settings.trial.defaultTrialDays;
    upsertAdminCouple({
      id: user.id,
      name: `${brideName} & ${groomName}`,
      email,
      plan: 'trial',
      trialEnds: addDays(now, defaultTrialDays).toISOString(),
      createdAt: now.toISOString(),
      suspended: false,
      billingState: 'active',
    });

    if (profileImageBase64) {
      const match = profileImageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      let b64 = profileImageBase64;
      let ext = 'png';
      if (match) {
        const mime = match[1];
        b64 = match[2];
        const parts = mime.split('/');
        if (parts[1]) ext = parts[1];
      }
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const filename = `${created.id}.${ext}`;
      fs.writeFileSync(path.join(uploadsDir, filename), Buffer.from(b64, 'base64'));
      created.profileImage = `/uploads/${filename}`;
    }

    await auditLog({ action: 'create-wedding', targetId: created.id, data: { groomName, brideName, date, userId: user.id } });

    return NextResponse.json({ ...created, userId: user.id }, { status: 201 });
  } catch (e) {
    console.error('create-wedding error', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
