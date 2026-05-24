import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { addWedding } from '@/lib/store';
import { auditLog } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const groomName = body?.groomName as string | undefined;
    const brideName = body?.brideName as string | undefined;
    const date = body?.date as string | undefined;
    const profileImageBase64 = body?.profileImageBase64 as string | undefined;

    if (!groomName || !brideName || !date) {
      return NextResponse.json({ ok: false, error: 'groomName, brideName and date required' }, { status: 400 });
    }

    // Create the wedding record (in-memory)
    const created = addWedding(body || {});

    // If an image base64 string was provided, save it to public/uploads/<id>.<ext>
    if (profileImageBase64) {
      const match = profileImageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      let b64 = profileImageBase64;
      let ext = 'png';
      if (match) {
        const mime = match[1];
        b64 = match[2];
        const parts = mime.split('/');
        if (parts[1]) ext = parts[1];
      } else {
        ext = 'png';
      }

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const filename = `${created.id}.${ext}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
      created.profileImage = `/uploads/${filename}`;
    }

    // Audit
    await auditLog({ action: 'create-wedding', targetId: created.id, data: { groomName, brideName, date } });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error('create-wedding error', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
