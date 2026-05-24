import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db, deleteGalleryImage, updateGalleryImage } from '@/lib/store';

function deleteUploadedGalleryFile(imageUrl: string) {
  if (!imageUrl.startsWith('/uploads/gallery/')) return;

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'gallery');
  const filePath = path.normalize(path.join(process.cwd(), 'public', imageUrl));
  if (!filePath.startsWith(path.normalize(uploadsDir))) return;
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = db.galleryImages.findUnique(image => image.id === id);
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Gallery image not found' }, { status: 404 });
    }

    const updated = updateGalleryImage(id, { altText: String(body?.altText || '').trim() });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = deleteGalleryImage(id);
  if (!removed) {
    return NextResponse.json({ ok: false, error: 'Gallery image not found' }, { status: 404 });
  }

  deleteUploadedGalleryFile(removed.imageUrl || '');
  return NextResponse.json({ ok: true, removed });
}
