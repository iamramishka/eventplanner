import { ImageResponse } from 'next/og';
import { db } from '@/lib/store';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

type Props = { params: { slug: string } };

export default async function OpenGraphImage({ params }: Props) {
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
            fontSize: 48,
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
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #fff8f4 0%, #f9ede8 50%, #f2dbd3 100%)',
          color: '#4b2230',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ fontSize: 28, letterSpacing: 6, textTransform: 'uppercase', color: '#9a5a6d' }}>
              Digital Invitation
            </div>
            <div style={{ fontSize: 66, lineHeight: 1.05, fontWeight: 700 }}>{title}</div>
            <div style={{ fontSize: 28, color: '#6b4a56' }}>
              {wedding.date} • {wedding.time} • {wedding.venueName}
            </div>
          </div>
          <div
            style={{
              width: 132,
              height: 132,
              borderRadius: 999,
              border: '3px solid #c98b99',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9a5a6d',
              fontSize: 24,
              background: 'rgba(255,255,255,0.5)',
            }}
          >
            RSVP
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: 24, maxWidth: 720, lineHeight: 1.4, color: '#704353' }}>
            {wedding.story || 'We look forward to celebrating this special day with you.'}
          </div>
          <div style={{ fontSize: 22, color: '#8d6674' }}>{wedding.rsvpDeadline ? `RSVP by ${wedding.rsvpDeadline}` : ''}</div>
        </div>
      </div>
    ),
    size,
  );
}
