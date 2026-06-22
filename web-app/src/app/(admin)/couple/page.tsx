/* eslint-disable @typescript-eslint/no-explicit-any */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbSelect } from '@/lib/supabase-db';
import { db, getAgendaEventsByWedding, getBudgetResponse } from '@/lib/store';
import DashboardClient from './DashboardClient';

interface WeddingRow {
  id: string;
  slug: string;
  groomFirstName: string;
  brideFirstName: string;
  eventDate: string | null;
  venueName: string | null;
  estimatedGuests: number | null;
  estimatedBudget: number | null;
}

/** Map a Supabase Wedding row into the shape the dashboard UI expects. */
function mapWedding(w: WeddingRow) {
  return {
    id: w.id,
    slug: w.slug,
    brideName: w.brideFirstName,
    groomName: w.groomFirstName,
    weddingTitle: `${w.brideFirstName} & ${w.groomFirstName}`,
    date: w.eventDate ? w.eventDate.slice(0, 10) : '',
    time: '',
    timezone: 'UTC',
    venueName: w.venueName || '',
    rsvpDeadline: '',
    estimatedGuests: w.estimatedGuests ?? null,
    estimatedBudget: w.estimatedBudget ?? null,
    sections: {},
    theme: {},
    music: null,
    notificationPreferences: {},
    contactEmail: '',
    contactWhatsApp: '',
    vendorPlan: null,
  };
}

export default async function CoupleDashboardPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const resolvedSearchParams = await searchParams;
  const stateParam = Array.isArray(resolvedSearchParams?.state) ? resolvedSearchParams?.state[0] : resolvedSearchParams?.state;
  const viewParam = Array.isArray(resolvedSearchParams?.view) ? resolvedSearchParams?.view[0] : resolvedSearchParams?.view;
  const emptyMode = stateParam === 'empty' || viewParam === 'empty';

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  // Load the logged-in couple's wedding from Supabase.
  let wedding: ReturnType<typeof mapWedding> | null = null;
  if (userId) {
    const rows = await dbSelect<WeddingRow>('Wedding', { userId: `eq.${userId}` }, '*', 1);
    if (rows[0]) wedding = mapWedding(rows[0]);
  }

  // Fallback: demo wedding from the file store (e.g. local dev / super admin preview).
  if (!wedding) {
    const demo = db.weddings.findUnique((w: any) => w.id === 'w_1');
    if (demo) wedding = demo as any;
  }

  if (!wedding) {
    return <div style={{ padding: 40 }}>No wedding found for this account.</div>;
  }

  // Per-wedding planning data still lives in the file store; new Supabase weddings
  // start empty until those modules are migrated.
  const fileStoreWedding = db.weddings.findUnique((w: any) => w.id === wedding!.id);
  const guests = emptyMode || !fileStoreWedding ? [] : db.guests.findMany((g: any) => g.weddingId === wedding!.id);
  const rsvps = emptyMode || !fileStoreWedding ? [] : db.rsvps.findMany((r: any) => r.weddingId === wedding!.id);
  const agenda = emptyMode || !fileStoreWedding ? [] : getAgendaEventsByWedding(wedding.id);
  const budget = emptyMode || !fileStoreWedding ? null : getBudgetResponse(wedding.id);
  const checklist = emptyMode || !fileStoreWedding ? [] : db.checklist.findMany((item: any) => item.weddingId === wedding!.id);

  return (
    <DashboardClient
      initialWedding={wedding}
      initialGuests={guests}
      initialRsvps={rsvps}
      initialAgenda={agenda}
      initialBudget={budget}
      initialChecklist={checklist}
    />
  );
}
