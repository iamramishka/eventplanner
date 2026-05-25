import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { sendEmailNotification, sendWhatsAppNotification, broadcastToGuests } from '@/lib/notifications';
import { requireSuperAdmin } from '@/lib/rbac';
import { auditLog } from '@/lib/audit';

type GuestRow = {
  id?: string;
  email?: string;
  whatsapp?: string;
  whatsappOptIn?: boolean;
};

function errorPayload(error: unknown) {
  if (error instanceof Error) return { error: error.message, stack: error.stack };
  return { error: String(error) };
}

export async function GET() {
  try {
    const access = await requireSuperAdmin();
    if (access.response) return access.response;
    const w = db.weddings.findMany()[0];
    const g1 = db.guests.findMany((g: GuestRow) => g.id === 'g_1')[0] as GuestRow | undefined;
    const g2 = db.guests.findMany((g: GuestRow) => g.id === 'g_2')[0] as GuestRow | undefined;

    if (g1) g1.email = 'nimal@test.com';
    if (g2) g2.email = 'fernando@test.com';

    const emailRes = await sendEmailNotification({
      weddingId: w.id,
      guestId: g1?.id,
      type: 'invite',
      imageUrl: 'https://cdn.wedinvite.lk/assets/invite_bg_1.jpg'
    });

    if (g1) g1.whatsappOptIn = false;
    const waResOptOut = await sendWhatsAppNotification({
      weddingId: w.id,
      guestId: g1?.id,
      type: 'invite',
    });

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

    const broadcastRes = await broadcastToGuests(w.id, 'reminder', 'email');

    await auditLog({
      action: 'admin-notification-test',
      targetId: w.id,
      data: {
        emailSuccess: Boolean(emailRes?.success),
        whatsappOptOutSuccess: Boolean(waResOptOut?.success),
        whatsappOptInSuccess: Boolean(waResOptIn?.success),
        broadcastSuccessCount: broadcastRes.filter((result) => result.success).length,
        broadcastTotal: broadcastRes.length,
      },
    });

    return NextResponse.json({
      emailRes,
      waResOptOut,
      waResOptIn,
      broadcastRes
    });
  } catch (error: unknown) {
    console.error('Test API Error:', error);
    return NextResponse.json(errorPayload(error), { status: 500 });
  }
}
