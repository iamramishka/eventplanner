/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Heart, HeartOff, Loader2, Send } from 'lucide-react';
import { getInvitationThemeCssVars } from '@/lib/invitation-content';

export type RsvpContext = {
  wedding: any;
  guest: {
    name: string;
    maxMembers: number;
    rsvpStatus?: string;
  };
  rsvp: null | {
    attending: boolean;
    memberCount: number;
    mealPreference: string;
    liquorPreference: string;
    notes: string;
    updatedAt?: string;
  };
};

function formatDate(dateStr: string) {
  if (!dateStr) return 'Date TBA';
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function RsvpFormCore({
  token,
  context,
  variant = 'page',
}: {
  token: string;
  context: RsvpContext;
  variant?: 'page' | 'inline';
}) {
  const router = useRouter();
  const initialAttending = context.rsvp ? (context.rsvp.attending ? 'yes' : 'no') : '';
  const [attending, setAttending] = useState(initialAttending);
  const [memberCount, setMemberCount] = useState(context.rsvp?.memberCount || 1);
  const [mealPreference, setMealPreference] = useState(context.rsvp?.mealPreference || 'any');
  const [liquorPreference, setLiquorPreference] = useState(context.rsvp?.liquorPreference || 'No');
  const [notes, setNotes] = useState(context.rsvp?.notes || '');
  const [website, setWebsite] = useState('');
  const [startedAt] = useState(() => Date.now());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(context.rsvp ? 'Your RSVP is already saved. You can update it below.' : '');
  const [submitted, setSubmitted] = useState(false);

  const maxMembers = Math.max(1, Number(context.guest.maxMembers) || 1);
  const coupleNames = context.wedding.weddingTitle || `${context.wedding.brideName} & ${context.wedding.groomName}`;
  const cssVars = useMemo(() => getInvitationThemeCssVars(context.wedding.theme), [context.wedding.theme]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setConfirmation('');

    if (attending !== 'yes' && attending !== 'no') {
      setError('Please choose whether you can attend.');
      return;
    }

    if (attending === 'yes' && (memberCount < 1 || memberCount > maxMembers)) {
      setError(`Guest count must be between 1 and ${maxMembers}.`);
      return;
    }

    if (notes.length > 500) {
      setError('Notes must be 500 characters or fewer.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/rsvp/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attending: attending === 'yes',
          memberCount: attending === 'yes' ? memberCount : 0,
          mealPreference,
          liquorPreference,
          notes,
          website,
          startedAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Unable to save your RSVP.');
      setSubmitted(true);
      if (variant === 'page') {
        const slug = context.wedding.slug;
        const home = slug ? `/invitation/${slug}` : '/';
        setTimeout(() => router.push(home), 2600);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to save your RSVP.');
      setSaving(false);
    }
  };

  const fields = (
    <>
      <input
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={event => setWebsite(event.target.value)}
        name="website"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, opacity: 0 }}
      />

      <div>
        <p style={{ margin: '0 0 6px', color: 'var(--theme-muted)' }}>Invitation for</p>
        <h2 style={{ margin: 0, fontFamily: 'var(--theme-heading-font)', fontSize: variant === 'inline' ? '1.5rem' : '2rem' }}>{context.guest.name}</h2>
        <p style={{ margin: '8px 0 0', color: 'var(--theme-muted)' }}>
          Please respond by {context.wedding.rsvpDeadline ? formatDate(context.wedding.rsvpDeadline) : 'the RSVP deadline'}.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <button type="button" onClick={() => setAttending('yes')} style={choiceStyle(attending === 'yes')}>
          <Heart size={24} /> Joyfully Accept
        </button>
        <button type="button" onClick={() => setAttending('no')} style={choiceStyle(attending === 'no')}>
          <HeartOff size={24} /> Regretfully Decline
        </button>
      </div>

      {attending === 'yes' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <label style={labelStyle}>
            Number attending
            <select value={memberCount} onChange={event => setMemberCount(Number(event.target.value))} style={inputStyle}>
              {Array.from({ length: maxMembers }, (_, index) => index + 1).map(count => (
                <option key={count} value={count}>{count} guest{count > 1 ? 's' : ''}</option>
              ))}
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <label style={labelStyle}>
              Meal preference
              <select value={mealPreference} onChange={event => setMealPreference(event.target.value)} style={inputStyle}>
                <option value="any">Any</option>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-vegetarian</option>
              </select>
            </label>
            <label style={labelStyle}>
              Liquor preference
              <select value={liquorPreference} onChange={event => setLiquorPreference(event.target.value)} style={inputStyle}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </label>
          </div>
        </div>
      )}

      <label style={labelStyle}>
        Notes
        <textarea value={notes} onChange={event => setNotes(event.target.value)} rows={variant === 'inline' ? 3 : 4} maxLength={500} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Dietary needs or a short message" />
      </label>

      {error && <p style={{ margin: 0, color: '#DC2626', fontWeight: 600 }}>{error}</p>}
      {confirmation && (
        <p style={{ margin: 0, color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle size={18} /> {confirmation}
        </p>
      )}

      <button type="submit" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 18px', borderRadius: 999, border: 0, background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-text))', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.72 : 1 }}>
        {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />} {saving ? 'Sending…' : 'Send RSVP'}
      </button>
    </>
  );

  // ── Thank-you (after submit) ──
  if (submitted) {
    const thankYouMessage =
      attending === 'yes'
        ? `We can't wait to celebrate this special day with you, ${context.guest.name}.`
        : `Thank you for letting us know, ${context.guest.name}. You will be missed.`;

    if (variant === 'inline') {
      return (
        <div style={{ ...cssVars }}>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}`}</style>
          <div style={{ textAlign: 'center', padding: '24px 12px', display: 'grid', gap: 12, justifyItems: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'color-mix(in srgb, var(--theme-primary) 12%, #fff)', display: 'grid', placeItems: 'center', animation: 'pop .5s ease-out' }}>
              <Heart size={28} color="var(--theme-primary)" fill="var(--theme-primary)" />
            </div>
            <h3 style={{ margin: 0, fontFamily: 'var(--theme-heading-font)', fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', lineHeight: 1.15, color: 'var(--theme-text)' }}>
              Thank you for confirming us
            </h3>
            <p style={{ margin: 0, color: 'var(--theme-muted)', lineHeight: 1.6, maxWidth: 360 }}>{thankYouMessage}</p>
          </div>
        </div>
      );
    }

    return (
      <main style={{ ...cssVars, minHeight: '100vh', background: 'linear-gradient(180deg, var(--theme-surface), #fff)', color: 'var(--theme-text)', fontFamily: 'var(--theme-body-font)', display: 'grid', placeItems: 'center', padding: '48px 20px' }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}`}</style>
        <section style={{ width: 'min(560px, 100%)', textAlign: 'center', background: '#fff', border: '1px solid color-mix(in srgb, var(--theme-secondary) 26%, transparent)', borderRadius: 20, boxShadow: '0 24px 60px rgba(0,0,0,0.10)', padding: '48px 28px', display: 'grid', gap: 16, justifyItems: 'center' }}>
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'color-mix(in srgb, var(--theme-primary) 12%, #fff)', display: 'grid', placeItems: 'center', animation: 'pop .5s ease-out' }}>
            <Heart size={36} color="var(--theme-primary)" fill="var(--theme-primary)" />
          </div>
          <h1 style={{ margin: 0, fontFamily: 'var(--theme-heading-font)', fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', lineHeight: 1.1 }}>
            Thank you for confirming us
          </h1>
          <p style={{ margin: 0, color: 'var(--theme-muted)', lineHeight: 1.6, maxWidth: 380 }}>{thankYouMessage}</p>
          <p style={{ margin: '8px 0 0', display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--theme-secondary)', fontWeight: 600, fontSize: '.9rem' }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Taking you to the invitation…
          </p>
        </section>
      </main>
    );
  }

  // ── Inline form (no page chrome) ──
  if (variant === 'inline') {
    return (
      <div style={{ ...cssVars }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <form onSubmit={submit} style={{ display: 'grid', gap: 18 }}>
          {fields}
        </form>
      </div>
    );
  }

  // ── Full page form ──
  return (
    <main style={{ ...cssVars, minHeight: '100vh', background: 'linear-gradient(180deg, var(--theme-surface), #fff)', color: 'var(--theme-text)', fontFamily: 'var(--theme-body-font)', padding: '48px 20px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <section style={{ width: 'min(760px, 100%)', margin: '0 auto', display: 'grid', gap: 20 }}>
        <div style={{ textAlign: 'center', display: 'grid', gap: 10 }}>
          <p style={{ margin: 0, color: 'var(--theme-secondary)', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', fontSize: 12 }}>Kindly Reply</p>
          <h1 style={{ margin: 0, fontFamily: 'var(--theme-heading-font)', fontSize: 'clamp(2.4rem, 7vw, 4.2rem)', lineHeight: 1.05 }}>{coupleNames}</h1>
          <p style={{ margin: 0, color: 'var(--theme-muted)', lineHeight: 1.6 }}>
            {formatDate(context.wedding.date)} at {context.wedding.venueName || 'Venue TBA'}
          </p>
        </div>

        <form onSubmit={submit} style={{ background: '#fff', border: '1px solid color-mix(in srgb, var(--theme-secondary) 26%, transparent)', borderRadius: 18, boxShadow: '0 20px 45px rgba(0,0,0,0.08)', padding: 24, display: 'grid', gap: 20 }}>
          {fields}
        </form>
      </section>
    </main>
  );
}

function choiceStyle(active: boolean): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '18px 14px',
    borderRadius: 14,
    border: `2px solid ${active ? 'var(--theme-primary)' : 'color-mix(in srgb, var(--theme-secondary) 28%, transparent)'}`,
    background: active ? 'color-mix(in srgb, var(--theme-primary) 10%, #fff)' : 'var(--theme-surface)',
    color: active ? 'var(--theme-primary)' : 'var(--theme-muted)',
    fontWeight: 700,
    cursor: 'pointer',
  };
}

const labelStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
  color: 'var(--theme-text)',
  fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid color-mix(in srgb, var(--theme-secondary) 36%, transparent)',
  background: '#fff',
  color: 'var(--theme-text)',
  font: 'inherit',
  fontWeight: 500,
  boxSizing: 'border-box',
};
