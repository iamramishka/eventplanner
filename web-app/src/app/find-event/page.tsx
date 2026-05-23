'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, CalendarHeart, Loader2 } from 'lucide-react';
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

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || query.length < 2) return;
    
    setLoading(true);
    setHasSearched(true);
    setResults([]);

    try {
      const res = await fetch(`/api/events/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.ok) {
        setResults(data.events || []);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(ds: string) {
    if (!ds) return 'Date TBA';
    try {
      const d = new Date(ds);
      return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return ds;
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles.searchCard}>
        <div className={styles.logoW}>W</div>
        <h1 className={styles.title}>Find an Event</h1>
        <p className={styles.subtitle}>
          Enter the couple's names, event code, or paste the invitation link to find their wedding details and RSVP.
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
              {results.length > 0 ? `Found ${results.length} event${results.length === 1 ? '' : 's'}` : 'No events found'}
            </h2>

            {results.length === 0 ? (
              <div className={styles.noResults}>
                <p>We couldn't find any events matching "{query}".</p>
                <p style={{ marginTop: 8, fontSize: 14 }}>Please check the spelling or ask the couple for their exact event link.</p>
              </div>
            ) : (
              <div className={styles.resultsList}>
                {results.map((ev) => (
                  <div key={ev.id} className={styles.eventCard}>
                    {ev.profileImage ? (
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
