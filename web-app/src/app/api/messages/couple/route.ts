import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { getAllVendors, getMessageThreadsByVendor } from '@/lib/vendorStore';

export async function GET(req: NextRequest) {
  const guard = await requireRole(['COUPLE', 'SUPER_ADMIN']);
  if (guard.response) return guard.response;

  const { searchParams } = req.nextUrl;
  const coupleName = searchParams.get('coupleName') || '';
  if (!coupleName) {
    return NextResponse.json({ threads: [] });
  }

  const vendors = getAllVendors();
  const results: { id: string; vendorId: string; vendorName: string; vendorCategory: string; subject: string; lastMessageAt: string; messageCount: number; lastReply: { id: string; sender: string; body: string; createdAt: string } | null }[] = [];

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
