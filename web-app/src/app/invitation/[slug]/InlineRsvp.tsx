'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Loader2, Send } from 'lucide-react';
import RsvpFormCore, { type RsvpContext } from '@/components/RsvpFormCore';

export default function InlineRsvp({
  token,
  defaultOpen = false,
  label = 'Confirm Your Place',
}: {
  token: string;
  defaultOpen?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [context, setContext] = useState<RsvpContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!open || fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    setError('');
    fetch(`/api/rsvp/${encodeURIComponent(token)}`)
      .then(res => res.json())
      .then(data => {
        if (!data?.ok) throw new Error(data?.error || 'Could not load your RSVP.');
        setContext({ wedding: data.wedding, guest: data.guest, rsvp: data.rsvp });
      })
      .catch(err => {
        setError(err?.message || 'Could not load your RSVP.');
        fetchedRef.current = false; // allow retry on reopen if it failed
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, token]);

  return (
    <div style={{ display: 'grid', gap: open ? 12 : 0 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          padding: '12px 18px',
          borderRadius: 999,
          border: 'none',
          background: 'linear-gradient(135deg, var(--inv-primary), color-mix(in srgb, var(--inv-primary) 70%, var(--inv-gold)))',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.9rem',
          letterSpacing: '0.02em',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(196,90,116,0.30)',
        }}
      >
        <Send size={15} /> {label}
        <ChevronDown size={16} style={{ marginLeft: 'auto', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .25s ease' }} />
      </button>

      <div
        style={{
          overflow: 'hidden',
          maxHeight: open ? 4000 : 0,
          opacity: open ? 1 : 0,
          transition: 'max-height .4s ease, opacity .3s ease',
        }}
      >
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px', color: '#9ca3af', fontSize: '0.9rem' }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading your details…
          </div>
        )}
        {error && !loading && (
          <p style={{ margin: 0, padding: '14px 4px', color: '#DC2626', fontWeight: 600, fontSize: '0.9rem' }}>{error}</p>
        )}
        {context && !loading && (
          <div style={{ paddingTop: 4 }}>
            <RsvpFormCore token={token} context={context} variant="inline" />
          </div>
        )}
      </div>
    </div>
  );
}
