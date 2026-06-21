import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { addWedding } from '@/lib/store';
import { auditLog } from '@/lib/audit';
import { dbSelect, dbInsert } from '@/lib/supabase-db';
import bcrypt from 'bcrypt';

type CreatedWedding = ReturnType<typeof addWedding> & {
  profileImage?: string;
};

interface DbUser { id: string; email: string; }
interface DbWedding { id: string; slug: string; }

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'wedding';
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

    const eventDate = date ? new Date(date) : null;
    if (eventDate && Number.isNaN(eventDate.getTime())) {
      return NextResponse.json({ ok: false, error: 'Invalid wedding date.' }, { status: 400 });
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const created: CreatedWedding = addWedding({ ...(body || {}), id: wedding.id, userId: user.id, email, slug });

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
