import Link from 'next/link';
import { getGuestByToken, getRsvpByGuestId, getWeddingRow } from '@/lib/wedding-data';
import RsvpTokenForm from './RsvpTokenForm';

export default async function RsvpTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const guest = await getGuestByToken(token);
  const weddingRow = guest ? await getWeddingRow(guest.weddingId) : null;
  const wedding = weddingRow
    ? {
        id: weddingRow.id,
        slug: weddingRow.slug,
        brideName: weddingRow.brideFirstName,
        groomName: weddingRow.groomFirstName,
        weddingTitle: `${weddingRow.brideFirstName} & ${weddingRow.groomFirstName}`,
        date: weddingRow.eventDate ? weddingRow.eventDate.slice(0, 10) : '',
        time: '',
        venueName: weddingRow.venueName || '',
        venueAddress: '',
        rsvpDeadline: '',
        theme: {},
      }
    : null;

  if (!guest || !wedding) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#FCF8F6' }}>
        <section style={{ width: 'min(560px, 100%)', background: '#fff', border: '1px solid #E8D5A3', borderRadius: 18, padding: 28, textAlign: 'center', boxShadow: '0 20px 45px rgba(0,0,0,0.08)' }}>
          <p style={{ margin: '0 0 8px', color: '#A07C50', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', fontSize: 12 }}>RSVP link</p>
          <h1 style={{ margin: '0 0 12px', fontFamily: 'var(--font-serif)', color: '#2D1520' }}>This invitation link is not valid.</h1>
          <p style={{ margin: '0 0 20px', color: '#7D6F6A', lineHeight: 1.6 }}>
            Please check the link you received or contact the couple for a fresh RSVP link.
          </p>
          <Link href="/" style={{ color: '#C45A74', fontWeight: 700 }}>Back to WedPlan</Link>
        </section>
      </main>
    );
  }

  const rsvp = await getRsvpByGuestId(guest.id);

  return (
    <RsvpTokenForm
      token={token}
      context={{
        wedding,
        guest: {
          name: guest.name,
          maxMembers: Number(guest.maxAllowedMembers) || 1,
          rsvpStatus: rsvp ? ((rsvp.status || '').toLowerCase() === 'attending' ? 'Confirmed' : 'Declined') : 'Pending',
        },
        rsvp: rsvp
          ? {
              attending: (rsvp.status || '').toLowerCase() === 'attending',
              memberCount: Number(rsvp.attendingCount) || 0,
              mealPreference: rsvp.mealPreference || '',
              liquorPreference: rsvp.liquorPreference || '',
              notes: rsvp.specialNote || '',
              updatedAt: rsvp.updatedAt || undefined,
            }
          : null,
      }}
    />
  );
}
