/* eslint-disable @typescript-eslint/no-explicit-any */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbSelect } from '@/lib/supabase-db';
import { db } from '@/lib/store';
import {
  listGuests, listRsvpsByWedding, listAgenda, listChecklist, getBudgetResponse,
} from '@/lib/wedding-data';
import DashboardClient from './DashboardClient';

interface WeddingRow {
  id: string;
  slug: string;
  groomFirstName: string;
  brideFirstName: string;
  eventDate: string | null;
  eventTime: string | null;
  venueName: string | null;
  venueAddress: string | null;
  venueMapLink: string | null;
  rsvpDeadline: string | null;
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
    time: w.eventTime || '',
    timezone: 'UTC',
    venueName: w.venueName || '',
    venueAddress: w.venueAddress || '',
    venueMapLink: w.venueMapLink || '',
    rsvpDeadline: w.rsvpDeadline ? w.rsvpDeadline.slice(0, 10) : '',
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
  let weddingRow: WeddingRow | null = null;
  if (userId) {
    const rows = await dbSelect<WeddingRow>('Wedding', { userId: `eq.${userId}` }, '*', 1);
    if (rows[0]) weddingRow = rows[0];
  }

  let wedding: ReturnType<typeof mapWedding> | null = weddingRow ? mapWedding(weddingRow) : null;

  // Fallback: demo wedding from the file store (e.g. local dev / super admin preview).
  if (!wedding) {
    const demo = db.weddings.findUnique((w: any) => w.id === 'w_1');
    if (demo) wedding = demo as any;
  }

  if (!wedding) {
    return <div style={{ padding: 40 }}>No wedding found for this account.</div>;
  }

  // Load planning data from Supabase for the real wedding; empty for the demo fallback.
  const useSupabase = !emptyMode && !!weddingRow;
  const [guests, rsvps, agenda, budget, checklist] = useSupabase
    ? await Promise.all([
        listGuests(wedding.id),
        listRsvpsByWedding(wedding.id),
        listAgenda(wedding.id),
        getBudgetResponse(wedding.id),
        listChecklist(wedding.id),
      ])
    : [[], [], [], null, []];

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
