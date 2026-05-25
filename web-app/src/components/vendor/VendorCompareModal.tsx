'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function VendorCompareModal({ open, onClose, ids }: any) {
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const fetched = await Promise.all(ids.slice(0,3).map(async (id: string) => {
          const res = await fetch(`/api/vendors/${id}`);
          if (!res.ok) return null;
          const json = await res.json();
          return json.vendor;
        }));
        setVendors(fetched.filter(Boolean));
      } catch { setVendors([]); }
    })();
  }, [open, ids]);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ width: '90%', maxWidth: 900, background: 'white', borderRadius: 8, padding: 16, maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Compare Vendors</h3>
          <button onClick={onClose} aria-label="Close"><X /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, vendors.length)}, 1fr)`, gap: 12, marginTop: 12 }}>
          {vendors.length === 0 && <div>No vendors selected for compare.</div>}
          {vendors.map((v: any) => (
            <div key={v.id} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: 12 }}>
              <h4 style={{ margin: 0 }}>{v.businessName}</h4>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{v.category} · {v.location}</div>
              <div style={{ marginTop: 8 }}>{v.description ? v.description.slice(0,200) : '—'}</div>
              <div style={{ marginTop: 8, fontSize: 13 }}><strong>From:</strong> {v.currency} {v.basePrice}</div>
              <div style={{ marginTop: 8 }}>
                <strong>Packages</strong>
                <ul>
                  {(v.packages || []).slice(0,3).map((p: any, i: number) => <li key={i}>{p.name} — {p.price}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
