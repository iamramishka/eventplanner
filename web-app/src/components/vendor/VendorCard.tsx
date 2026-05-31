'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Heart, Columns, MapPin } from 'lucide-react';
import styles from './vendor.module.css';
import useShortlist from '@/lib/useShortlist';

export default function VendorCard({ vendor, onCompare }: any) {
  const { isSaved, toggle } = useShortlist();
  const saved = isSaved(vendor.id);

  const logo = (vendor.logoBase64 && `data:image/png;base64,${vendor.logoBase64}`) || (vendor.packages && vendor.packages[0] && vendor.packages[0].image) || '/placeholder-vendor.png';

  return (
    <article className={styles.vendorCard} style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
      <div style={{ position: 'relative', width: '100%', height: 200, background: '#f3f4f6' }}>
        <Image
          src={vendor.coverImageBase64 || logo}
          alt={vendor.businessName}
          fill
          unoptimized
          style={{ objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
          <button className={styles.iconBtn} aria-label="Compare" onClick={() => onCompare?.(vendor.id)} title="Compare">
            <Columns size={16} />
          </button>
          <button className={styles.iconBtn} aria-label={saved ? 'Remove from shortlist' : 'Save to shortlist'} onClick={() => toggle(vendor.id)}>
            <Heart size={16} fill={saved ? '#ef4444' : 'none'} style={{ color: saved ? '#ef4444' : undefined }} />
          </button>
        </div>
      </div>
      
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', marginBottom: 4 }}>{vendor.businessName}</div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>{vendor.category}</span>
              {vendor.location && (
                <>
                  <span style={{ margin: '0 4px' }}>•</span>
                  <MapPin size={12} />
                  <span>{vendor.location}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <p style={{ marginTop: 12, fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.5, flex: 1, margin: '12px 0' }}>
          {vendor.description ? vendor.description.slice(0, 100) + (vendor.description.length > 100 ? '…' : '') : 'No description provided.'}
        </p>
        
        <div style={{ paddingTop: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Star size={14} fill={vendor.rating ? '#F59E0B' : '#CBD5E1'} color={vendor.rating ? '#F59E0B' : '#CBD5E1'} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>{vendor.rating || 'New'}</span>
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>
            {vendor.currency || 'LKR'} {vendor.basePrice?.toLocaleString() ?? '—'}
          </div>
        </div>
      </div>
    </article>
  );
}
