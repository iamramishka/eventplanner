import { ImageResponse } from 'next/og';
import { db } from '@/lib/store';

export const size = {
  width: 1600,
  height: 900,
};

export const contentType = 'image/png';

type Props = { params: { slug: string } };

export default async function TwitterImage({ params }: Props) {
  const resolvedParams = (await params) as { slug: string };
  const wedding = db.weddings.findUnique((w) => w.slug === resolvedParams.slug);

  if (!wedding) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f9ede8 0%, #f5d7cf 100%)',
            color: '#6d2f42',
            fontSize: 56,
            fontFamily: 'Georgia, serif',
          }}
        >
          Invitation not found
        </div>
      ),
      size,
    );
  }

  const title = wedding.weddingTitle || `${wedding.brideName} & ${wedding.groomName}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 96,
          background: 'linear-gradient(135deg, #fff8f4 0%, #f7e4db 100%)',
          color: '#4b2230',
          fontFamily: 'Georgia, serif',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 8, textTransform: 'uppercase', color: '#9a5a6d' }}>
          Wedding Invitation
        </div>
        <div style={{ marginTop: 40, fontSize: 84, lineHeight: 1.05, fontWeight: 700 }}>{title}</div>
        <div style={{ marginTop: 30, fontSize: 32, color: '#6b4a56' }}>
          {wedding.date} • {wedding.time} • {wedding.venueName}
        </div>
        <div style={{ marginTop: 46, maxWidth: 1040, fontSize: 28, lineHeight: 1.45, color: '#704353' }}>
          {wedding.story || 'We look forward to celebrating this special day with you.'}
        </div>
      </div>
    ),
    size,
  );
}
