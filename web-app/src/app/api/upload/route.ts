import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { isCloudinaryConfigured, uploadToCloudinary } from '@/lib/cloudinary';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// POST /api/upload — upload a base64 image to Cloudinary, returns { url, publicId }
// Falls back to a 501 when Cloudinary is not configured.
export async function POST(req: NextRequest) {
  const guard = await requireRole(['COUPLE', 'VENDOR', 'SUPER_ADMIN']);
  if (guard.response) return guard.response;

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: 'Cloud storage not configured' }, { status: 501 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const imageBase64 = String(body?.imageBase64 || '');
  const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: 'Valid imageBase64 data URL required' }, { status: 400 });
  }

  const mimeType = match[1].toLowerCase();
  if (!ALLOWED_MIME.has(mimeType)) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 });
  }

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be under 5 MB' }, { status: 400 });
  }

  const folder = String(body?.folder || 'wedplan/uploads');
  const prefix = String(body?.prefix || 'upload').replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 40);

  try {
    const result = await uploadToCloudinary(buffer, folder, prefix);
    return NextResponse.json({ url: result.url, publicId: result.publicId }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
