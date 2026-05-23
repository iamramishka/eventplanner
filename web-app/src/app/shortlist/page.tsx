'use client';

import React, { useEffect, useState } from 'react';
import useShortlist from '@/lib/useShortlist';
import VendorCard from '@/components/vendor/VendorCard';

export default function ShortlistPage() {
  const { list, remove } = useShortlist();
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const fetched = await Promise.all(list.map(async (id) => {
          const res = await fetch(`/api/vendors/${id}`);
          if (!res.ok) return null;
          return res.json();
        }));
        if (!mounted) return;
        setVendors(fetched.filter(Boolean));
      } catch (e) { setVendors([]); }
    })();
    return () => { mounted = false; };
  }, [list]);

  if (list.length === 0) return <section style={{ padding: 16 }}><h1>Your Shortlist</h1><p>No saved vendors yet.</p></section>;

  return (
    <section style={{ padding: 16 }}>
      <h1>Your Shortlist</h1>
      <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
        {vendors.map(v => (
          <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <VendorCard vendor={v} />
            <div style={{ marginLeft: 12 }}>
              <button onClick={() => remove(v.id)} style={{ padding: '6px 10px', borderRadius: 6 }}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
