import { NextRequest, NextResponse } from 'next/server';
import {
  getVendorById,
  getVendorPortalData,
  unlockContact,
  createPointRequest,
  updateBookingStatus,
  updateAvailability,
  updateSettings,
  VendorBookingStatus,
} from '@/lib/vendorStore';
import { requireVendorAccess } from '@/lib/rbac';

// ─── GET /api/vendors/[id]/portal ─────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const access = await requireVendorAccess(id);
    if (access.response) return access.response;
    if (!getVendorById(id)) {
      return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 });
    }
    return NextResponse.json(getVendorPortalData(id));
  } catch (err) {
    console.error('[GET /api/vendors/[id]/portal]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// ─── PATCH /api/vendors/[id]/portal ───────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const access = await requireVendorAccess(id);
    if (access.response) return access.response;
    const vendor = getVendorById(id);
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found.' }, { status: 404 });
    }

    const body = await req.json();

    if (body.bookingStatus) {
      const bookingId = String(body.bookingStatus.bookingId || '');
      const status = String(body.bookingStatus.status || '') as VendorBookingStatus;
      if (!bookingId || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return NextResponse.json({ error: 'Valid bookingId and status are required.' }, { status: 400 });
      }
      if (!updateBookingStatus(id, bookingId, status)) {
        return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
      }
    }

    if (body.unlockContact) {
      const quoteRequestId = String(body.unlockContact.quoteRequestId || '');
      if (!quoteRequestId) {
        return NextResponse.json({ error: 'quoteRequestId is required.' }, { status: 400 });
      }
      const result = unlockContact(id, quoteRequestId);
      if (!result.ok) {
        return NextResponse.json({ error: result.error || 'Unlock failed.' }, { status: 402 });
      }
    }

    if (body.requestPoints) {
      const pointsRequested = Number(body.requestPoints.pointsRequested);
      const note = String(body.requestPoints.note || '').trim();
      if (!Number.isFinite(pointsRequested) || !Number.isInteger(pointsRequested) || pointsRequested < 1 || pointsRequested > 10000) {
        return NextResponse.json({ error: 'pointsRequested must be a positive number.' }, { status: 400 });
      }
      const vendorName = `${vendor.ownerFirstName || ''} ${vendor.ownerLastName || ''}`.trim() || vendor.businessName || id;
      createPointRequest(id, vendorName, pointsRequested, note);
    }

    if (body.availability) {
      updateAvailability(id, body.availability);
    }

    if (body.settings) {
      updateSettings(id, body.settings);
    }

    return NextResponse.json(getVendorPortalData(id));
  } catch (err) {
    console.error('[PATCH /api/vendors/[id]/portal]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
