import { NextRequest, NextResponse } from 'next/server';
import {
  appendVendorMessage,
  getVendorById,
  getVendorPortalData,
  markMessageThreadRead,
  updateBookingStatus,
  updateAvailability,
  updateSettings,
  VendorBookingStatus,
} from '@/lib/vendorStore';

// ─── GET /api/vendors/[id]/portal ─────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    if (!getVendorById(id)) {
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
    if (body.messageRead) {
      const threadId = String(body.messageRead.threadId || '');
      if (!threadId) return NextResponse.json({ error: 'threadId required.' }, { status: 400 });
      if (!markMessageThreadRead(id, threadId)) {
        return NextResponse.json({ error: 'Message thread not found.' }, { status: 404 });
      }
    }
    if (body.messageReply) {
      const threadId = String(body.messageReply.threadId || '');
      const message = String(body.messageReply.message || '');
      if (!threadId || !message.trim()) {
        return NextResponse.json({ error: 'threadId and message are required.' }, { status: 400 });
      }
      if (!appendVendorMessage(id, threadId, message)) {
        return NextResponse.json({ error: 'Message thread not found.' }, { status: 404 });
      }
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
