import { NextResponse } from 'next/server';
import { dbSelect, dbDelete, storageDeleteByUrl } from '@/lib/supabase-db';
import { requireGalleryAccess } from '@/lib/rbac';

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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await requireGalleryAccess(id);
    if (access.response) return access.response;

    const rows = await dbSelect<GalleryRow>('GalleryImage', { id: `eq.${id}` }, '*', 1);
    const existing = rows[0];
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Gallery image not found' }, { status: 404 });
    }

    // GalleryImage has no altText column; echo the submitted value back without persisting.
    const body = await request.json() as Record<string, unknown>;
    return NextResponse.json({ ...existing, altText: String(body?.altText || '').trim() });
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await requireGalleryAccess(id);
  if (access.response) return access.response;

  const rows = await dbSelect<GalleryRow>('GalleryImage', { id: `eq.${id}` }, '*', 1);
  const removed = rows[0];
  if (!removed) {
    return NextResponse.json({ ok: false, error: 'Gallery image not found' }, { status: 404 });
  }

  await dbDelete('GalleryImage', { id: `eq.${id}` });
  await storageDeleteByUrl(removed.imageUrl || '').catch(() => {});

  return NextResponse.json({ ok: true, removed });
}
