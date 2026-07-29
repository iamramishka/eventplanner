import { NextResponse } from 'next/server';
import { dbSelect, storageUpload } from '@/lib/supabase-db';
import { requireWeddingAccess } from '@/lib/rbac';

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['audio/mpeg', 'audio/mp3']);

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function sanitizeFileName(name: string) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 60) || 'track';
}

async function weddingExists(weddingId: string) {
  const rows = await dbSelect<{ id: string }>('Wedding', { id: `eq.${weddingId}` }, 'id', 1);
  return rows.length > 0;
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
    const audioBase64 = String(body?.audioBase64 || '');
    const match = audioBase64.match(/^data:(audio\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ ok: false, error: 'Valid audioBase64 data URL required' }, { status: 400 });
    }

    const mimeType = match[1].toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json({ ok: false, error: 'Only MP3 files are supported' }, { status: 400 });
    }

    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > MAX_AUDIO_BYTES) {
      return NextResponse.json({ ok: false, error: 'Audio must be under 10 MB' }, { status: 400 });
    }

    const baseName = sanitizeFileName(String(body?.fileName || 'track'));
    const storedFileName = `${Date.now().toString(36)}-${baseName}.mp3`;
    const objectPath = `music/${weddingId}/${storedFileName}`;
    const publicUrl = await storageUpload(objectPath, buffer, 'application/octet-stream');

    return NextResponse.json({ ok: true, url: publicUrl }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: errorMessage(error) }, { status: 400 });
  }
}
