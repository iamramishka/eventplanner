import Link from 'next/link';
import { db } from '@/lib/store';
import FindTableClient from './FindTableClient';

export default async function FindTablePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const wedding = db.weddings.findUnique((item: any) => item.slug === slug);
  const tokenParam = Array.isArray(resolvedSearchParams?.token) ? resolvedSearchParams?.token[0] : resolvedSearchParams?.token;

  if (!wedding) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#FCF8F6' }}>
        <section style={{ width: 'min(560px, 100%)', background: '#fff', border: '1px solid #E8D5A3', borderRadius: 18, padding: 28, textAlign: 'center', boxShadow: '0 20px 45px rgba(0,0,0,0.08)' }}>
          <p style={{ margin: '0 0 8px', color: '#A07C50', fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', fontSize: 12 }}>Find My Table</p>
          <h1 style={{ margin: '0 0 12px', fontFamily: 'var(--font-serif)', color: '#2D1520' }}>This table finder link is not valid.</h1>
          <p style={{ margin: '0 0 20px', color: '#7D6F6A', lineHeight: 1.6 }}>
            Please check the link you received or contact the couple for help.
          </p>
          <Link href="/" style={{ color: '#C45A74', fontWeight: 700 }}>Back to WedPlan</Link>
        </section>
      </main>
    );
  }

  return <FindTableClient wedding={wedding} initialToken={String(tokenParam || '')} />;
}
