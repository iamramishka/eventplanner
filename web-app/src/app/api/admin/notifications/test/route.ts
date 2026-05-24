import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { sendEmailNotification, sendWhatsAppNotification, broadcastToGuests } from '@/lib/notifications';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function errorStack(error: unknown) {
  return error instanceof Error ? error.stack : undefined;
}

export async function GET() {
  try {
    // Setup a mock guest for testing opt-in rules
    const w = db.weddings.findMany()[0];
    const g1 = db.guests.findMany(g => g.id === 'g_1')[0]; // Nimal Perera
    const g2 = db.guests.findMany(g => g.id === 'g_2')[0]; // Fernando Family

    // Make sure they have emails for testing email notifications
    if (g1) g1.email = 'nimal@test.com';
    if (g2) g2.email = 'fernando@test.com';
    
    // Test 1: Basic Email Invite (with asset placeholder)
    const emailRes = await sendEmailNotification({
      weddingId: w.id,
      guestId: g1?.id,
      type: 'invite',
      imageUrl: 'https://cdn.wedinvite.lk/assets/invite_bg_1.jpg'
    });

    // Test 2: Basic WhatsApp Invite (with opt-in check)
    // Ensure g1 has opted out
    if (g1) g1.whatsappOptIn = false;
    const waResOptOut = await sendWhatsAppNotification({
      weddingId: w.id,
      guestId: g1?.id,
      type: 'invite',
    });

    // Test 3: WhatsApp Invite (opted in)
    if (g2) {
      g2.whatsappOptIn = true;
      g2.whatsapp = '+94770000002';
    }
    const waResOptIn = await sendWhatsAppNotification({
      weddingId: w.id,
      guestId: g2?.id,
      type: 'invite',
      imageUrl: 'https://cdn.wedinvite.lk/assets/invite_bg_2.jpg'
    });

    // Test 4: Broadcast Reminder (Simulating trigger point)
    const broadcastRes = await broadcastToGuests(w.id, 'reminder', 'email');

    return NextResponse.json({
      emailRes,
      waResOptOut,
      waResOptIn,
      broadcastRes
    });
  } catch (error: unknown) {
    console.error('Test API Error:', error);
    return NextResponse.json({ error: errorMessage(error), stack: errorStack(error) }, { status: 500 });
  }
}
