'use client';

import Image from 'next/image';
import { useState } from 'react';

type GalleryImageTileProps = {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
};

export default function GalleryImageTile({ src, alt, width, height, caption }: GalleryImageTileProps) {
  const [failed, setFailed] = useState(!src);
  const label = alt || caption || 'Wedding gallery image';

  return (
    <figure
      data-testid="public-gallery-item"
      style={{
        margin: 0,
        display: 'grid',
        gap: 10,
      }}
    >
      <div
        style={{
          position: 'relative',
          aspectRatio: getAspectRatio(width, height),
          minHeight: 220,
          overflow: 'hidden',
          borderRadius: 18,
          background: 'linear-gradient(135deg, rgba(196,90,116,0.12), rgba(201,165,116,0.16))',
          border: '1px solid rgba(153, 90, 109, 0.12)',
        }}
      >
        {!failed && src ? (
          <Image
            src={src}
            alt={label}
            fill
            loading="lazy"
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            onError={() => setFailed(true)}
          />
        ) : (
          <div
            role="img"
            aria-label={label}
            data-testid="public-gallery-fallback"
            style={{
              height: '100%',
              minHeight: 220,
              display: 'grid',
              placeItems: 'center',
              color: '#8f6873',
              textAlign: 'center',
              padding: 22,
            }}
          >
            <div>
              <div style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase' }}>Photo unavailable</div>
              <div style={{ marginTop: 10, fontSize: 18 }}>{label}</div>
            </div>
          </div>
        )}
      </div>
      {caption && <figcaption style={{ color: '#6b4a56', fontSize: 14, lineHeight: 1.5 }}>{caption}</figcaption>}
    </figure>
  );
}

function getAspectRatio(width?: number, height?: number) {
  if (width && height && width > 0 && height > 0) return `${width} / ${height}`;
  return '4 / 3';
}
