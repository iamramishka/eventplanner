import { db } from './store';

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
}

const TEMPLATES = {
  email: {
    invite: (weddingName: string, guestName: string, link: string, imagePlaceholder: string) => 
      `Subject: You're invited to ${weddingName}'s Wedding!\n\nDear ${guestName},\n\nWe would be honored to have you at our wedding. ${imagePlaceholder}\n\nPlease RSVP here: ${link}`,
    rsvp_confirmation: (weddingName: string, guestName: string) => 
      `Subject: RSVP Confirmed for ${weddingName}\n\nThank you, ${guestName}! Your RSVP has been received.`,
    reminder: (weddingName: string, guestName: string, link: string) => 
      `Subject: Reminder: RSVP for ${weddingName}\n\nHi ${guestName}, please don't forget to RSVP for our upcoming wedding! ${link}`,
  },
  whatsapp: {
    invite: (weddingName: string, guestName: string, link: string, imagePlaceholder: string) => 
      `Dear ${guestName}, you're invited to ${weddingName}'s Wedding! ${imagePlaceholder} RSVP: ${link}`,
    rsvp_confirmation: (weddingName: string, guestName: string) => 
      `Thank you, ${guestName}! Your RSVP for ${weddingName} is confirmed.`,
    reminder: (weddingName: string, guestName: string, link: string) => 
      `Hi ${guestName}, a quick reminder to RSVP for ${weddingName}: ${link}`,
  }
};

/**
 * Simulates an external API call with retries and potential random failures.
 */
async function simulateExternalDelivery(payload: any, maxRetries = 3): Promise<boolean> {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    // Simulate network delay
    await new Promise(r => setTimeout(r, 100));
    // 80% chance of success
    if (Math.random() > 0.2) {
      return true;
    }
    console.warn(`[Notifications] Delivery attempt ${attempt} failed, retrying...`);
  }
  return false;
}

export async function sendEmailNotification(options: NotificationOptions): Promise<NotificationResult> {
  const wedding = db.weddings.findMany((w: any) => w.id === options.weddingId)[0];
  if (!wedding) return { success: false, channel: 'email', error: 'Wedding not found' };

  let guestName = 'Guest';
  let guestEmail = '';
  let rsvpLink = `https://wedinvite.lk/${wedding.slug}`;

  if (options.guestId) {
    const guest = db.guests.findMany((g: any) => g.id === options.guestId)[0];
    if (!guest) return { success: false, channel: 'email', error: 'Guest not found' };
    guestName = guest.name;
    guestEmail = guest.email || '';
    rsvpLink = `https://wedinvite.lk/${wedding.slug}?token=${guest.token}`;
  } else {
    guestEmail = wedding.contactEmail; // Fallback to couple for testing
  }

  if (!guestEmail) {
    return { success: false, channel: 'email', error: 'No email address available' };
  }

  const imagePlaceholder = options.imageUrl ? `\n[Image: ${options.imageUrl}]\n` : '';
  const body = options.customMessage || TEMPLATES.email[options.type](wedding.weddingTitle, guestName, rsvpLink, imagePlaceholder);

  console.log(`[Email] Sending to ${guestEmail}: ${body}`);
  const delivered = await simulateExternalDelivery({ to: guestEmail, body });

  if (!delivered) {
    return { success: false, channel: 'email', error: 'Delivery failed after retries' };
  }

  return { success: true, channel: 'email', messageId: `email_${Date.now()}`, attempts: 1 };
}

export async function sendWhatsAppNotification(options: NotificationOptions): Promise<NotificationResult> {
  const wedding = db.weddings.findMany((w: any) => w.id === options.weddingId)[0];
  if (!wedding) return { success: false, channel: 'whatsapp', error: 'Wedding not found' };

  let guestName = 'Guest';
  let guestPhone = '';
  let rsvpLink = `https://wedinvite.lk/${wedding.slug}`;

  if (options.guestId) {
    const guest = db.guests.findMany((g: any) => g.id === options.guestId)[0];
    if (!guest) return { success: false, channel: 'whatsapp', error: 'Guest not found' };
    
    // Opt-in rule check
    if (guest.whatsappOptIn === false) {
      return { success: false, channel: 'whatsapp', error: 'Guest opted out of WhatsApp' };
    }

    guestName = guest.name;
    guestPhone = guest.whatsapp || guest.phone || '';
    rsvpLink = `https://wedinvite.lk/${wedding.slug}?token=${guest.token}`;
  } else {
    guestPhone = wedding.contactWhatsApp;
  }

  if (!guestPhone) {
    return { success: false, channel: 'whatsapp', error: 'No phone number available' };
  }

  const imagePlaceholder = options.imageUrl ? `[Attached: ${options.imageUrl}] ` : '';
  const body = options.customMessage || TEMPLATES.whatsapp[options.type](wedding.weddingTitle, guestName, rsvpLink, imagePlaceholder);

  console.log(`[WhatsApp] Sending to ${guestPhone}: ${body}`);
  const delivered = await simulateExternalDelivery({ to: guestPhone, body });

  if (!delivered) {
    return { success: false, channel: 'whatsapp', error: 'Delivery failed after retries' };
  }

  return { success: true, channel: 'whatsapp', messageId: `wa_${Date.now()}`, attempts: 1 };
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
