import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { addGalleryImage, db, getGalleryImagesByWedding, reorderGalleryImages } from '@/lib/store';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function sanitizeFileName(name: string) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 60) || 'gallery-image';
}

function extensionForMime(mimeType: string) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/gif') return 'gif';
  return 'jpg';
}

export async function GET(_: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const wedding = db.weddings.findUnique((w: any) => w.id === weddingId);
  if (!wedding) {
    return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
  }

  return NextResponse.json(getGalleryImagesByWedding(weddingId));
}

export async function POST(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  try {
    const { weddingId } = await params;
    const wedding = db.weddings.findUnique((w: any) => w.id === weddingId);
    if (!wedding) {
      return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
    }

    const body = await request.json();
    const imageBase64 = String(body?.imageBase64 || '');
    const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ ok: false, error: 'Valid imageBase64 data URL required' }, { status: 400 });
    }

    const mimeType = match[1].toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json({ ok: false, error: 'Unsupported image type' }, { status: 400 });
    }

    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > MAX_IMAGE_BYTES) {
      return NextResponse.json({ ok: false, error: 'Image must be under 5 MB' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'gallery');
    fs.mkdirSync(uploadsDir, { recursive: true });

    const ext = extensionForMime(mimeType);
    const baseName = sanitizeFileName(String(body?.fileName || 'gallery-image'));
    const storedFileName = `${weddingId}-${Date.now().toString(36)}-${baseName}.${ext}`;
    const filePath = path.join(uploadsDir, storedFileName);
    fs.writeFileSync(filePath, buffer);

    const image = addGalleryImage({
      weddingId,
      imageType: 'gallery',
      imageUrl: `/uploads/gallery/${storedFileName}`,
      altText: String(body?.altText || '').trim(),
      fileName: storedFileName,
      mimeType,
      sizeBytes: buffer.length,
      width: Number(body?.width || 0),
      height: Number(body?.height || 0),
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: String(error?.message || error) }, { status: 400 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  try {
    const { weddingId } = await params;
    const wedding = db.weddings.findUnique((w: any) => w.id === weddingId);
    if (!wedding) {
      return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
    }

    const body = await request.json();
    if (!Array.isArray(body?.orderedIds)) {
      return NextResponse.json({ ok: false, error: 'orderedIds array required' }, { status: 400 });
    }

    return NextResponse.json(reorderGalleryImages(weddingId, body.orderedIds.map(String)));
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: String(error?.message || error) }, { status: 400 });
  }
}
