/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from './store';
import { sendEmail, renderInviteEmail, renderRsvpConfirmationEmail, renderReminderEmail } from './email';

export type NotificationType = 'invite' | 'rsvp_confirmation' | 'reminder';

export interface NotificationOptions {
  guestId?: string;
  weddingId: string;
  type: NotificationType;
  customMessage?: string;
  imageUrl?: string;
}

export interface NotificationResult {
  success: boolean;
  channel: 'email' | 'whatsapp';
  messageId?: string;
  error?: string;
  attempts?: number;
  /** WhatsApp channel only — open this URL in browser to share via wa.me */
  whatsappShareUrl?: string;
}

const TEMPLATES = {
  whatsapp: {
    invite: (weddingName: string, guestName: string, link: string, imagePlaceholder: string) => 
      `Dear ${guestName}, you're invited to ${weddingName}'s Wedding! ${imagePlaceholder} RSVP: ${link}`,
    rsvp_confirmation: (weddingName: string, guestName: string) => 
      `Thank you, ${guestName}! Your RSVP for ${weddingName} is confirmed.`,
    reminder: (weddingName: string, guestName: string, link: string) => 
      `Hi ${guestName}, a quick reminder to RSVP for ${weddingName}: ${link}`,
  }
};

// Build a wa.me share URL — opens WhatsApp with a pre-filled message on the recipient's device.
function buildWhatsAppUrl(phone: string, body: string): string {
  const normalized = phone.replace(/\D/g, '');
  return `https://wa.me/${normalized}?text=${encodeURIComponent(body)}`;
}

export async function sendEmailNotification(options: NotificationOptions): Promise<NotificationResult> {
  const wedding = db.weddings.findMany((w: any) => w.id === options.weddingId)[0];
  if (!wedding) return { success: false, channel: 'email', error: 'Wedding not found' };

  let guestName = 'Guest';
  let guestEmail = '';
  let rsvpLink = `https://wedplan.lk/${wedding.slug}`;

  if (options.guestId) {
    const guest = db.guests.findMany((g: any) => g.id === options.guestId)[0];
    if (!guest) return { success: false, channel: 'email', error: 'Guest not found' };
    guestName = guest.name;
    guestEmail = guest.email || '';
    rsvpLink = `https://wedplan.lk/${wedding.slug}?token=${guest.token}`;
  } else {
    guestEmail = wedding.contactEmail; // Fallback to couple for testing
  }

  if (!guestEmail) {
    return { success: false, channel: 'email', error: 'No email address available' };
  }

  let emailPayload: { subject: string; html: string; text: string };
  if (options.type === 'invite') {
    emailPayload = renderInviteEmail(wedding.weddingTitle, guestName, rsvpLink, options.imageUrl);
  } else if (options.type === 'rsvp_confirmation') {
    emailPayload = renderRsvpConfirmationEmail(wedding.weddingTitle, guestName);
  } else {
    emailPayload = renderReminderEmail(wedding.weddingTitle, guestName, rsvpLink);
  }

  const result = await sendEmail({ to: guestEmail, ...emailPayload });
  if (!result.success) {
    return { success: false, channel: 'email', error: result.error || 'Delivery failed' };
  }
  return { success: true, channel: 'email', messageId: result.messageId, attempts: 1 };
}

export async function sendWhatsAppNotification(options: NotificationOptions): Promise<NotificationResult> {
  const wedding = db.weddings.findMany((w: any) => w.id === options.weddingId)[0];
  if (!wedding) return { success: false, channel: 'whatsapp', error: 'Wedding not found' };

  let guestName = 'Guest';
  let guestPhone = '';
  let rsvpLink = `https://wedplan.lk/${wedding.slug}`;

  if (options.guestId) {
    const guest = db.guests.findMany((g: any) => g.id === options.guestId)[0];
    if (!guest) return { success: false, channel: 'whatsapp', error: 'Guest not found' };
    
    // Opt-in rule check
    if (guest.whatsappOptIn === false) {
      return { success: false, channel: 'whatsapp', error: 'Guest opted out of WhatsApp' };
    }

    guestName = guest.name;
    guestPhone = guest.whatsapp || guest.phone || '';
    rsvpLink = `https://wedplan.lk/${wedding.slug}?token=${guest.token}`;
  } else {
    guestPhone = wedding.contactWhatsApp;
  }

  if (!guestPhone) {
    return { success: false, channel: 'whatsapp', error: 'No phone number available' };
  }

  const imagePlaceholder = options.imageUrl ? `[Attached: ${options.imageUrl}] ` : '';
  const body = options.customMessage || TEMPLATES.whatsapp[options.type](wedding.weddingTitle, guestName, rsvpLink, imagePlaceholder);

  const shareUrl = buildWhatsAppUrl(guestPhone, body);
  console.log(`[WhatsApp] Share URL for ${guestPhone}: ${shareUrl}`);

  return { success: true, channel: 'whatsapp', messageId: `wa_${Date.now()}`, attempts: 1, whatsappShareUrl: shareUrl };
}

export async function broadcastToGuests(weddingId: string, type: NotificationType, channel: 'email'|'whatsapp'|'both', options: Partial<NotificationOptions> = {}) {
  const guests = db.guests.findMany((g: any) => g.id ? g.weddingId === weddingId : false);
  const results = [];

  for (const guest of guests) {
    const payload = { ...options, weddingId, type, guestId: guest.id };
    if (channel === 'email' || channel === 'both') {
      results.push(await sendEmailNotification(payload));
    }
    if (channel === 'whatsapp' || channel === 'both') {
      results.push(await sendWhatsAppNotification(payload));
    }
  }

  return results;
}
