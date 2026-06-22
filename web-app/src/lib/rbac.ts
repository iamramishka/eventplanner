import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, getRsvpById } from '@/lib/store';
import { dbSelect } from '@/lib/supabase-db';
import { getListingById, getVendorById } from '@/lib/vendorStore';

export type AppRole = 'COUPLE' | 'VENDOR' | 'SUPER_ADMIN';

export type AuthContext = {
  userId: string;
  email: string;
  role: AppRole;
};

export type GuardResult = {
  auth?: AuthContext;
  response?: NextResponse;
};

type SessionUser = {
  id?: unknown;
  email?: unknown;
  role?: unknown;
};

type OwnedRow = {
  id?: unknown;
  userId?: unknown;
  weddingId?: unknown;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function requireRole(roles: AppRole[]): Promise<GuardResult> {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  const role = user?.role as AppRole | undefined;

  if (!user?.id || !role) {
    return { response: jsonError('Authentication required', 401) };
  }

  if (!roles.includes(role)) {
    return { response: jsonError('Forbidden', 403) };
  }

  return {
    auth: {
      userId: String(user.id),
      email: String(user.email || '').toLowerCase(),
      role,
    },
  };
}

export async function requireSuperAdmin() {
  return requireRole(['SUPER_ADMIN']);
}

export async function requireWeddingAccess(weddingId: string): Promise<GuardResult> {
  const guard = await requireRole(['COUPLE', 'SUPER_ADMIN']);
  if (guard.response) return guard;
  if (guard.auth?.role === 'SUPER_ADMIN') return guard;

  const rows = await dbSelect<{ userId: string }>('Wedding', { id: `eq.${weddingId}` }, 'userId', 1);
  const wedding = rows[0];
  if (!wedding) return { response: jsonError('Wedding not found', 404) };
  if (String(wedding.userId || '') !== guard.auth?.userId) {
    return { response: jsonError('Forbidden', 403) };
  }

  return guard;
}

export async function requireGuestAccess(guestId: string): Promise<GuardResult> {
  const guest = db.guests.findMany((g: OwnedRow) => g.id === guestId)[0] as OwnedRow | undefined;
  if (!guest) return { response: jsonError('Guest not found', 404) };
  return requireWeddingAccess(String(guest.weddingId || ''));
}

export async function requireRsvpAccess(rsvpId: string): Promise<GuardResult> {
  const rsvp = getRsvpById(rsvpId) as OwnedRow | null;
  if (!rsvp) return { response: jsonError('RSVP not found', 404) };
  return requireWeddingAccess(String(rsvp.weddingId || ''));
}

export async function requireBudgetItemAccess(itemId: string): Promise<GuardResult> {
  const item = db.budget.findUnique((row: OwnedRow) => row.id === itemId) as OwnedRow | null;
  if (!item) return { response: jsonError('Budget item not found', 404) };
  return requireWeddingAccess(String(item.weddingId || ''));
}

export async function requireChecklistItemAccess(itemId: string): Promise<GuardResult> {
  const item = db.checklist.findUnique((row: OwnedRow) => row.id === itemId) as OwnedRow | null;
  if (!item) return { response: jsonError('Checklist item not found', 404) };
  return requireWeddingAccess(String(item.weddingId || ''));
}

export async function requireAgendaAccess(eventId: string): Promise<GuardResult> {
  const event = db.agenda.findMany((row: OwnedRow) => row.id === eventId)[0] as OwnedRow | undefined;
  if (!event) return { response: jsonError('Agenda event not found', 404) };
  return requireWeddingAccess(String(event.weddingId || ''));
}

export async function requireGalleryAccess(imageId: string): Promise<GuardResult> {
  const rows = await dbSelect<{ weddingId: string }>('GalleryImage', { id: `eq.${imageId}` }, 'weddingId', 1);
  const image = rows[0];
  if (!image) return { response: jsonError('Gallery image not found', 404) };
  return requireWeddingAccess(String(image.weddingId || ''));
}

export async function requireVendorAccess(vendorId: string): Promise<GuardResult> {
  const guard = await requireRole(['VENDOR', 'SUPER_ADMIN']);
  if (guard.response) return guard;
  if (guard.auth?.role === 'SUPER_ADMIN') return guard;

  const vendor = getVendorById(vendorId);
  if (!vendor) return { response: jsonError('Vendor not found', 404) };
  if (vendor.email.toLowerCase() !== guard.auth?.email) {
    return { response: jsonError('Forbidden', 403) };
  }

  return guard;
}

export async function requireVendorListingAccess(vendorId: string, listingId: string): Promise<GuardResult> {
  const listing = getListingById(listingId);
  if (!listing || listing.vendorId !== vendorId) {
    return { response: jsonError('Listing not found', 404) };
  }
  return requireVendorAccess(vendorId);
}
