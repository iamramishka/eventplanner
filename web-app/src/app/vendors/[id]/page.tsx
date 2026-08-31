import { notFound } from 'next/navigation';
import { getVendorById, toPublicVendor } from '@/lib/vendorStore';
import QuoteButton from './QuoteButton';

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const raw = getVendorById(id);
  if (!raw || raw.status !== 'approved') notFound();
  const vendor = toPublicVendor(raw);

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1.5rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 .25rem' }}>{vendor.businessName}</h1>
        <p style={{ color: '#6B7280', margin: '0 0 1rem' }}>{vendor.category}</p>
        <QuoteButton vendorId={vendor.id} vendorName={vendor.businessName} />
      </header>
    </div>
  );
}
