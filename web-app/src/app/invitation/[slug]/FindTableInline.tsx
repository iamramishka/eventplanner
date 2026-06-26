'use client';

import React, { useState } from 'react';

type Result = { guestName: string; tableName: string | null; token: string | null };

export default function FindTableInline({ slug }: { slug: string }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) {
      setError('Enter at least 2 characters.');
      return;
    }
    setLoading(true);
    setError('');
    setResults(null);
    setSearched(false);
    try {
      const res = await fetch(`/api/invitation/${encodeURIComponent(slug)}/find-table`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: query.trim() }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Search failed.');
      setResults(data.results);
      setSearched(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="find-table"
      style={{
        background: 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(196,90,116,0.15)',
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(100,50,70,0.10)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '36px 24px 24px' }}>
        <span style={{
          display: 'inline-block',
          fontSize: '0.68rem',
          fontWeight: 700,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#fff',
          background: 'var(--inv-primary)',
          padding: '5px 18px',
          borderRadius: 999,
          marginBottom: 16,
        }}>
          Wedding Seating
        </span>
        <h2 style={{
          fontFamily: "'Dancing Script', cursive, 'Playfair Display', Georgia, serif",
          fontSize: 'clamp(2rem, 6vw, 2.8rem)',
          fontWeight: 600,
          color: 'var(--inv-text)',
          margin: '0 0 10px',
          lineHeight: 1.1,
        }}>
          Find Your Table
        </h2>
        <p style={{ color: 'var(--inv-muted)', fontSize: '0.92rem', margin: 0 }}>
          Search your name below to see your assigned table number.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} style={{ padding: '0 20px 20px', display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#fff',
            border: '1px solid rgba(196,90,116,0.25)',
            borderRadius: 999,
            padding: '0 18px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--inv-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter your name"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '0.95rem',
                padding: '13px 0',
                background: 'transparent',
                color: 'var(--inv-text)',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0 26px',
              borderRadius: 999,
              border: 'none',
              background: 'linear-gradient(135deg, var(--inv-primary), color-mix(in srgb, var(--inv-primary) 70%, var(--inv-gold)))',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(196,90,116,0.35)',
            }}
          >
            {loading ? '…' : 'Search'}
          </button>
        </div>

        {error && (
          <p style={{ margin: 0, color: '#B91C1C', fontSize: '0.85rem', paddingLeft: 8 }}>
            {error}
          </p>
        )}
      </form>

      {/* Results */}
      {searched && results !== null && (
        <div style={{ padding: '0 20px 24px', display: 'grid', gap: 8 }}>
          {results.length === 0 ? (
            <p style={{
              textAlign: 'center',
              color: 'var(--inv-muted)',
              fontSize: '0.9rem',
              padding: '20px 0',
            }}>
              No guests found matching &ldquo;{query}&rdquo;. Please check the spelling or contact the couple.
            </p>
          ) : (
            <>
              <p style={{ fontSize: '0.78rem', color: 'var(--inv-muted)', margin: '0 0 4px' }}>
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </p>
              {results.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#fff',
                    border: '1px solid rgba(196,90,116,0.15)',
                    borderRadius: 14,
                    padding: '14px 18px',
                    gap: 14,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}>
                    <div>
                      <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--inv-muted)', margin: '0 0 3px' }}>
                        Guest
                      </p>
                      <p style={{ fontWeight: 700, color: 'var(--inv-text)', margin: 0, fontSize: '1rem' }}>
                        {r.guestName}
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'rgba(196,90,116,0.06)',
                      border: '1px solid rgba(196,90,116,0.18)',
                      borderRadius: 999,
                      padding: '8px 16px',
                      whiteSpace: 'nowrap',
                    }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--inv-muted)' }}>
                        Your table no. is
                      </span>
                      <span style={{ fontWeight: 800, color: r.tableName ? 'var(--inv-text)' : 'var(--inv-muted)', fontSize: r.tableName ? '1rem' : '0.9rem' }}>
                        {r.tableName ?? '—'}
                      </span>
                    </div>
                  </div>

                  {r.token && (
                    <a
                      href={`/rsvp/${r.token}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        textDecoration: 'none',
                        padding: '11px 16px',
                        borderRadius: 999,
                        background: 'linear-gradient(135deg, var(--inv-primary), color-mix(in srgb, var(--inv-primary) 70%, var(--inv-gold)))',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        letterSpacing: '0.02em',
                        boxShadow: '0 4px 16px rgba(196,90,116,0.30)',
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/>
                      </svg>
                      Confirm Your Place
                    </a>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </section>
  );
}
