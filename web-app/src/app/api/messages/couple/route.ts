import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { dbSelect } from '@/lib/supabase-db';
import { getAllVendors, getMessageThreadsByVendor } from '@/lib/vendorStore';

interface WeddingRow {
  brideFirstName: string;
  groomFirstName: string;
}

export async function GET() {
  const guard = await requireRole(['COUPLE', 'SUPER_ADMIN']);
  if (guard.response) return guard.response;

  // Derive the couple name server-side from the authenticated session's wedding record.
  // Never accept coupleName from the client — that would allow any couple to read any thread.
  let coupleName = '';

  if (guard.auth?.role === 'COUPLE') {
    const rows = await dbSelect<WeddingRow>(
      'Wedding',
      { userId: `eq.${guard.auth.userId}` },
      'brideFirstName,groomFirstName',
      1
    );
    const w = rows[0];
    if (w) {
      const bride = (w.brideFirstName || '').trim();
      const groom = (w.groomFirstName || '').trim();
      coupleName = bride && groom ? `${bride} & ${groom}` : bride || groom;
    }
  }
  // SUPER_ADMIN has no wedding record — return empty list unless a specific admin context is added later.
  if (!coupleName) {
    return NextResponse.json({ threads: [] });
  }

  const vendors = getAllVendors();
  const results: {
    id: string;
    vendorId: string;
    vendorName: string;
    vendorCategory: string;
    subject: string;
    lastMessageAt: string;
    messageCount: number;
    lastReply: { id: string; sender: string; body: string; createdAt: string } | null;
  }[] = [];

  for (const vendor of vendors) {
    const threads = getMessageThreadsByVendor(vendor.id).filter(
      t => t.coupleName.toLowerCase() === coupleName.toLowerCase()
    );
    for (const t of threads) {
      results.push({
        id: t.id,
        vendorId: vendor.id,
        vendorName: vendor.businessName,
        vendorCategory: vendor.category,
        subject: t.subject,
        lastMessageAt: t.lastMessageAt,
        messageCount: t.messages.length,
        lastReply: t.messages.length > 1
          ? t.messages[t.messages.length - 1]
          : null,
      });
    }
  }

  results.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  return NextResponse.json({ threads: results });
}
