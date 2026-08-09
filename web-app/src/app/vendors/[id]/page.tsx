/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from 'next/navigation';
import { getVendorById, getListingsByVendor, toPublicVendor } from '@/lib/vendorStore';

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/\son\w+=[^\s>]*/gi, '')
    .replace(/href=["']\s*javascript:[^"']*/gi, 'href="#"')
    .replace(/href=["']\s*data:[^"']*/gi, 'href="#"');
}

const richContentCss = `
  .richContent h2 { font-size: 1.15rem; font-weight: 700; margin: 1rem 0 .4rem; }
  .richContent h3 { font-size: 1rem; font-weight: 600; margin: .9rem 0 .35rem; }
  .richContent ul, .richContent ol { padding-left: 1.4rem; margin: .4rem 0; }
  .richContent li { margin: .2rem 0; }
  .richContent a { color: #2563EB; text-decoration: underline; }
  .richContent mark { background: #FEF08A; border-radius: 2px; padding: 0 2px; }
  .richContent p { margin: .3rem 0; }
  .richContent strong { font-weight: 600; }
  .faqAccordion { display: flex; flex-direction: column; gap: .5rem; margin-top: .5rem; }
  .faqItem { border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; }
  .faqItem summary.faqQ { padding: .75rem 1rem; cursor: pointer; font-weight: 600; font-size: .95rem; list-style: none; display: flex; justify-content: space-between; align-items: center; }
  .faqItem summary.faqQ::-webkit-details-marker { display: none; }
  .faqItem summary.faqQ::after { content: '+'; font-size: 1.1rem; color: #9CA3AF; }
  .faqItem[open] summary.faqQ::after { content: '−'; }
  .faqItem .faqA { padding: .75rem 1rem; font-size: .9rem; color: #374151; line-height: 1.6; border-top: 1px solid #F3F4F6; white-space: pre-wrap; }
  .sectionHeading { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0 0 .75rem; }
`;

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const raw = getVendorById(id);
  if (!raw || raw.status !== 'approved') notFound();

  const vendor = toPublicVendor(raw);
  const listings = getListingsByVendor(id).filter((l: any) => l.active);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      <style>{richContentCss}</style>

      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '2rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <a href="/vendors" style={{ color: '#6b7280', fontSize: '.9rem', textDecoration: 'none' }}>← Back to vendors</a>
          <h1 style={{ margin: '.5rem 0 .25rem', fontSize: '1.75rem', color: '#111827' }}>{vendor.businessName}</h1>
          <p style={{ margin: 0, color: '#6b7280' }}>{vendor.category}{vendor.subcategory ? ` · ${vendor.subcategory}` : ''}{vendor.location ? ` · ${vendor.location}` : ''}</p>
          {vendor.description && <p style={{ marginTop: '.75rem', color: '#374151', lineHeight: 1.6 }}>{vendor.description}</p>}
        </div>
      </header>

      {/* About + FAQ */}
      {(vendor.aboutMarkdown || vendor.faqMarkdown) && (
        <section style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {vendor.aboutMarkdown && (
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.5rem' }}>
              <h2 className="sectionHeading">About</h2>
              <div
                className="richContent"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(vendor.aboutMarkdown) }}
              />
            </div>
          )}
          {vendor.faqMarkdown && (() => {
            let faqs: { id: string; q: string; a: string }[] = [];
            try { faqs = JSON.parse(vendor.faqMarkdown).filter((i: any) => i.q); } catch { /* skip */ }
            if (faqs.length === 0) return null;
            return (
              <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.5rem' }}>
                <h2 className="sectionHeading">Frequently Asked Questions</h2>
                <div className="faqAccordion">
                  {faqs.map((faq) => (
                    <details key={faq.id} className="faqItem">
                      <summary className="faqQ">{faq.q}</summary>
                      <p className="faqA">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* Listings */}
      <main style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1.5rem' }}>
        {listings.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No active listings from this vendor.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {listings.map((listing: any) => (
              <article key={listing.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1.5rem' }}>
                <h2 style={{ margin: '0 0 .25rem', fontSize: '1.2rem', color: '#111827' }}>{listing.title}</h2>
                {listing.description && <p style={{ margin: '0 0 1rem', color: '#6b7280', fontSize: '.95rem' }}>{listing.description}</p>}
                {listing.contentMarkdown && (
                  <div
                    className="richContent"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(listing.contentMarkdown) }}
                  />
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
