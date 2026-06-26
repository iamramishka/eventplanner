import { NextResponse } from 'next/server';
import { dbSelect, dbInsert, dbUpdate, storageUpload } from '@/lib/supabase-db';
import { requireWeddingAccess } from '@/lib/rbac';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

interface GalleryRow {
  id: string;
  weddingId: string;
  imageType: string;
  imageUrl: string;
  sortOrder: number;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function sanitizeFileName(name: string) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 60) || 'image';
}

function extensionForMime(mimeType: string) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/gif') return 'gif';
  return 'jpg';
}

async function weddingExists(weddingId: string) {
  const rows = await dbSelect<{ id: string }>('Wedding', { id: `eq.${weddingId}` }, 'id', 1);
  return rows.length > 0;
}

export async function GET(_: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const access = await requireWeddingAccess(weddingId);
  if (access.response) return access.response;

  const images = await dbSelect<GalleryRow>(
    'GalleryImage',
    { weddingId: `eq.${weddingId}`, order: 'sortOrder.asc' },
    '*',
    500,
  );
  return NextResponse.json(images);
}

export async function POST(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  try {
    const { weddingId } = await params;
    const access = await requireWeddingAccess(weddingId);
    if (access.response) return access.response;
    if (!(await weddingExists(weddingId))) {
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

    // imageType: 'hero' | 'couple' (singletons) or 'gallery' (default)
    const VALID_TYPES = new Set(['hero', 'couple', 'gallery']);
    const imageType: string = VALID_TYPES.has(String(body?.imageType)) ? String(body.imageType) : 'gallery';

    const ext = extensionForMime(mimeType);
    const baseName = sanitizeFileName(String(body?.fileName || imageType));
    const storedFileName = `${Date.now().toString(36)}-${baseName}.${ext}`;
    const objectPath = `${imageType}/${weddingId}/${storedFileName}`;
    const publicUrl = await storageUpload(objectPath, buffer, mimeType);

    // Hero and couple are singletons — replace any existing row of the same type.
    if (imageType === 'hero' || imageType === 'couple') {
      const existing = await dbSelect<GalleryRow>(
        'GalleryImage',
        { weddingId: `eq.${weddingId}`, imageType: `eq.${imageType}` },
        '*',
        1,
      );
      if (existing[0]) {
        await dbUpdate('GalleryImage', { id: `eq.${existing[0].id}` }, { imageUrl: publicUrl });
        return NextResponse.json({ ...existing[0], imageUrl: publicUrl, imageType }, { status: 201 });
      }
    }

    const existing = await dbSelect<GalleryRow>('GalleryImage', { weddingId: `eq.${weddingId}` }, 'sortOrder', 500);
    const nextOrder = existing.reduce((max, r) => Math.max(max, r.sortOrder ?? 0), 0) + 1;

    const image = await dbInsert<GalleryRow>('GalleryImage', {
      id: crypto.randomUUID(),
      weddingId,
      imageType,
      imageUrl: publicUrl,
      sortOrder: nextOrder,
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 400 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ weddingId: string }> }) {
  try {
    const { weddingId } = await params;
    const access = await requireWeddingAccess(weddingId);
    if (access.response) return access.response;
    if (!(await weddingExists(weddingId))) {
      return NextResponse.json({ ok: false, error: 'Wedding not found' }, { status: 404 });
    }

    const body = await request.json();
    if (!Array.isArray(body?.orderedIds)) {
      return NextResponse.json({ ok: false, error: 'orderedIds array required' }, { status: 400 });
    }

    const ids: string[] = body.orderedIds.map(String);
    await Promise.all(
      ids.map((id, index) => dbUpdate('GalleryImage', { id: `eq.${id}` }, { sortOrder: index + 1 })),
    );

    const images = await dbSelect<GalleryRow>(
      'GalleryImage',
      { weddingId: `eq.${weddingId}`, order: 'sortOrder.asc' },
      '*',
      500,
    );
    return NextResponse.json(images);
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 400 });
  }
}
