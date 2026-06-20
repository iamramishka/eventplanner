/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, MapPin, Search, Ticket, Users } from 'lucide-react';
import { getInvitationThemeCssVars } from '@/lib/invitation-content';

type LookupResult = {
  ok: boolean;
  status?: 'assigned' | 'unassigned';
  message?: string;
  error?: string;
  wedding?: {
    title: string;
    date: string;
    venueName: string;
    slug: string;
  };
  guest?: {
    name: string;
  };
  table?: null | {
    name: string;
    notes?: string;
  };
};

export default function FindTableClient({ wedding, initialToken }: { wedding: any; initialToken: string }) {
  const [name, setName] = useState('');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [token, setToken] = useState(initialToken || '');
  const [lookupMode, setLookupMode] = useState(initialToken ? 'token' : 'details');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState('');
  const cssVars = useMemo(() => getInvitationThemeCssVars(wedding.theme || {}), [wedding.theme]);
  const title = wedding.weddingTitle || `${wedding.brideName || ''} & ${wedding.groomName || ''}`.trim();

  async function lookup(payload: Record<string, string>) {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/find-table/${encodeURIComponent(wedding.slug)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'We could not verify those details.');
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'We could not verify those details.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialToken) void lookup({ token: initialToken });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (lookupMode === 'token') {
      if (!token.trim()) {
        setError('Enter your private token from the invitation link.');
        return;
      }
      void lookup({ token: token.trim() });
      return;
    }

    const digits = phoneLast4.replace(/\D/g, '');
    if (!name.trim() || digits.length !== 4) {
      setError('Enter your invitation name and last 4 phone digits.');
      return;
    }
    void lookup({ name: name.trim(), phoneLast4: digits });
  };

  return (
    <main style={{ ...cssVars, minHeight: '100vh', background: 'linear-gradient(180deg, var(--theme-surface), #fff)', color: 'var(--theme-text)', fontFamily: 'var(--theme-body-font)', padding: '44px 18px' }}>
      <section style={{ width: 'min(760px, 100%)', margin: '0 auto', display: 'grid', gap: 18 }}>
        <div style={{ textAlign: 'center', display: 'grid', gap: 10 }}>
          <p style={{ margin: 0, color: 'var(--theme-secondary)', fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', fontSize: 12 }}>Find My Table</p>
          <h1 style={{ margin: 0, fontFamily: 'var(--theme-heading-font)', fontSize: 'clamp(2.2rem, 7vw, 4rem)', lineHeight: 1.05 }}>{title}</h1>
          <p style={{ margin: 0, color: 'var(--theme-muted)', lineHeight: 1.6 }}>
            Verify your invitation to see your table.
          </p>
        </div>

        <section style={cardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
            <button type="button" onClick={() => { setLookupMode('details'); setError(''); }} style={tabStyle(lookupMode === 'details')}>
              <Users size={18} /> Name + phone
            </button>
            <button type="button" onClick={() => { setLookupMode('token'); setError(''); }} style={tabStyle(lookupMode === 'token')}>
              <Ticket size={18} /> Private token
            </button>
          </div>

          <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
            {lookupMode === 'details' ? (
              <>
                <label style={labelStyle}>
                  Invitation name
                  <input style={inputStyle} value={name} onChange={event => setName(event.target.value)} placeholder="Name on your invitation" autoComplete="name" />
                </label>
                <label style={labelStyle}>
                  Last 4 phone digits
                  <input style={inputStyle} value={phoneLast4} onChange={event => setPhoneLast4(event.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="1234" inputMode="numeric" autoComplete="off" />
                </label>
              </>
            ) : (
              <label style={labelStyle}>
                Private token
                <input style={inputStyle} value={token} onChange={event => setToken(event.target.value)} placeholder="From your RSVP link" autoComplete="off" />
              </label>
            )}

            {error && (
              <p style={noticeStyle('#B91C1C', '#FEF2F2', '#FECACA')}>
                <AlertCircle size={18} /> {error}
              </p>
            )}

            <button type="submit" disabled={loading} style={buttonStyle(loading)}>
              <Search size={18} /> {loading ? 'Checking...' : 'Find Table'}
            </button>
          </form>
        </section>

        {result?.ok && (
          <section style={resultCardStyle(result.status === 'assigned')}>
            {result.status === 'assigned' ? (
              <>
                <p style={noticeStyle('#047857', '#ECFDF5', '#A7F3D0')}>
                  <CheckCircle size={18} /> Verified for {result.guest?.name}.
                </p>
                <div style={{ display: 'grid', gap: 8 }}>
                  <span style={{ color: 'var(--theme-muted)', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', fontSize: 12 }}>Your table</span>
                  <h2 style={{ margin: 0, fontFamily: 'var(--theme-heading-font)', fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}>{result.table?.name}</h2>
                  {result.table?.notes && <p style={{ margin: 0, color: 'var(--theme-muted)', lineHeight: 1.6 }}>{result.table.notes}</p>}
                  <p style={{ margin: '8px 0 0', color: 'var(--theme-muted)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={16} /> {result.wedding?.venueName || wedding.venueName || 'Venue'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <p style={noticeStyle('#92400E', '#FFFBEB', '#FDE68A')}>
                  <AlertCircle size={18} /> Verified for {result.guest?.name}.
                </p>
                <h2 style={{ margin: 0, fontFamily: 'var(--theme-heading-font)', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)' }}>Your table is not assigned yet.</h2>
                <p style={{ margin: 0, color: 'var(--theme-muted)', lineHeight: 1.6 }}>Please check back closer to the celebration.</p>
              </>
            )}
          </section>
        )}
      </section>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid color-mix(in srgb, var(--theme-secondary) 26%, transparent)',
  borderRadius: 18,
  boxShadow: '0 20px 45px rgba(0,0,0,0.08)',
  padding: 22,
  display: 'grid',
  gap: 18,
};

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  color: 'var(--theme-text)',
  fontWeight: 800,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid color-mix(in srgb, var(--theme-secondary) 36%, transparent)',
  background: '#fff',
  color: 'var(--theme-text)',
  font: 'inherit',
  fontWeight: 600,
  boxSizing: 'border-box',
};

function tabStyle(active: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '11px 12px',
    borderRadius: 999,
    border: `1px solid ${active ? 'var(--theme-primary)' : 'color-mix(in srgb, var(--theme-secondary) 24%, transparent)'}`,
    background: active ? 'color-mix(in srgb, var(--theme-primary) 10%, #fff)' : '#fff',
    color: active ? 'var(--theme-primary)' : 'var(--theme-muted)',
    fontWeight: 800,
    cursor: 'pointer',
  };
}

function buttonStyle(loading: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '14px 18px',
    borderRadius: 999,
    border: 0,
    background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-text))',
    color: '#fff',
    fontWeight: 800,
    fontSize: '1rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.72 : 1,
  };
}

function noticeStyle(color: string, background: string, border: string): React.CSSProperties {
  return {
    margin: 0,
    color,
    background,
    border: `1px solid ${border}`,
    borderRadius: 12,
    padding: '10px 12px',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };
}

function resultCardStyle(assigned: boolean): React.CSSProperties {
  return {
    ...cardStyle,
    borderColor: assigned ? '#A7F3D0' : '#FDE68A',
    background: assigned ? 'linear-gradient(135deg, #fff, #ECFDF5)' : 'linear-gradient(135deg, #fff, #FFFBEB)',
  };
}
