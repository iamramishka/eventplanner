'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, CalendarHeart, Loader2, Heart } from 'lucide-react';
import styles from './find-event.module.css';

type EventResult = {
  id: string;
  groomName: string;
  brideName: string;
  weddingTitle?: string;
  date: string;
  venueName?: string;
  slug: string;
  profileImage?: string;
};

export default function FindEventPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<EventResult[]>([]);
  const [error, setError] = useState('');

  function getSearchTerm(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return '';

    try {
      const url = new URL(trimmed);
      const parts = url.pathname.split('/').filter(Boolean);
      return parts.at(-1) || trimmed;
    } catch {
      return trimmed.replace(/^\/?(invitation\/)?/, '').replace(/\/$/, '');
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const searchTerm = getSearchTerm(query);
    if (searchTerm.length < 2) return;
    
    setLoading(true);
    setHasSearched(true);
    setResults([]);
    setError('');

    try {
      const res = await fetch(`/api/events/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (res.ok && data.ok) {
        setResults(data.events || []);
      } else {
        setResults([]);
        setError(data.error || 'Search is temporarily unavailable. Please try again.');
      }
    } catch {
      setResults([]);
      setError('Search is temporarily unavailable. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(ds: string) {
    if (!ds) return 'Date TBA';
    try {
      const d = new Date(ds);
      return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return ds;
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.searchCard}>
        <div className={styles.brandLockup} aria-label="WedPlan">
          <div className={styles.logoW}><Heart size={22} fill="currentColor" aria-hidden="true" /></div>
          <span>WedPlan</span>
        </div>
        <h1 className={styles.title}>Find an Event</h1>
        <p className={styles.subtitle}>
          Enter the couple&apos;s names, event code, or paste the invitation link to find their wedding details and RSVP.
        </p>

        <form onSubmit={handleSearch}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="e.g. Kasun & Priya, or event code"
              className={styles.searchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className={styles.searchBtn} disabled={loading || query.length < 2}>
            {loading ? <Loader2 size={20} className={styles.loadingSpinner} /> : <Search size={20} />}
            {loading ? 'Searching...' : 'Search Events'}
          </button>
        </form>

        {hasSearched && !loading && (
          <div className={styles.resultsArea}>
            <h2 className={styles.resultsTitle}>
              {error ? 'Search problem' : results.length > 0 ? `Found ${results.length} event${results.length === 1 ? '' : 's'}` : 'No events found'}
            </h2>

            {error ? (
              <div className={styles.noResults} role="alert">
                <p>{error}</p>
                <p className={styles.resultHint}>Try again in a moment, or ask the couple for the direct invitation link.</p>
              </div>
            ) : results.length === 0 ? (
              <div className={styles.noResults}>
                <p>We couldn&apos;t find any events matching {`"${query}"`}.</p>
                <p className={styles.resultHint}>Please check the spelling or ask the couple for their exact event link.</p>
              </div>
            ) : (
              <div className={styles.resultsList}>
                {results.map((ev) => (
                  <div key={ev.id} className={styles.eventCard}>
                    {ev.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element -- event avatars may be remote or data URLs from existing event data.
                      <img src={ev.profileImage} alt={ev.weddingTitle || `${ev.brideName} & ${ev.groomName}`} className={styles.eventAvatar} />
                    ) : (
                      <div className={styles.eventAvatar}>
                        {(ev.brideName?.[0] || '') + (ev.groomName?.[0] || '')}
                      </div>
                    )}
                    <div className={styles.eventInfo}>
                      <div className={styles.eventTitle}>{ev.weddingTitle || `${ev.brideName} & ${ev.groomName}`}</div>
                      <div className={styles.eventDetails}>
                        <div className={styles.detailRow}>
                          <CalendarHeart size={14} /> {formatDate(ev.date)}
                        </div>
                        {ev.venueName && (
                          <div className={styles.detailRow}>
                            <MapPin size={14} /> {ev.venueName}
                          </div>
                        )}
                      </div>
                    </div>
                    <Link href={`/${ev.slug}`} className={styles.viewBtn}>
                      View Invitation
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
