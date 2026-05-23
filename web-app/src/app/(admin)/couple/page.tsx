/* eslint-disable @typescript-eslint/no-explicit-any */

import { db, getAgendaEventsByWedding, getBudgetResponse } from '@/lib/store';
import DashboardClient from './DashboardClient';

export default async function CoupleDashboardPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const wedding = db.weddings.findUnique((w: any) => w.id === 'w_1');
  const resolvedSearchParams = await searchParams;

  const stateParam = Array.isArray(resolvedSearchParams?.state) ? resolvedSearchParams?.state[0] : resolvedSearchParams?.state;
  const viewParam = Array.isArray(resolvedSearchParams?.view) ? resolvedSearchParams?.view[0] : resolvedSearchParams?.view;
  const emptyMode = stateParam === 'empty' || viewParam === 'empty';
  
  if (!wedding) {
    return <div>No wedding found.</div>;
  }
  
  const guests = emptyMode ? [] : db.guests.findMany((g: any) => g.weddingId === wedding.id);
  const rsvps = emptyMode ? [] : db.rsvps.findMany((r: any) => r.weddingId === wedding.id);
  const agenda = emptyMode ? [] : getAgendaEventsByWedding(wedding.id);
  const budget = emptyMode ? null : getBudgetResponse(wedding.id);
  const checklist = emptyMode ? [] : db.checklist.findMany((item: any) => item.weddingId === wedding.id);

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
