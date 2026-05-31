'use client';

import React, { useEffect, useState, useMemo } from 'react';
import VendorCard from '@/components/vendor/VendorCard';
import VendorCompareModal from '@/components/vendor/VendorCompareModal';
import useShortlist from '@/lib/useShortlist';
import { Search, Heart, X, Filter } from 'lucide-react';

export default function VendorsPage() {
  const [q, setQ] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('All');
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [showShortlistOnly, setShowShortlistOnly] = useState(false);

  const { list, isSaved } = useShortlist();

  const CATEGORIES = ['All', 'Photography', 'Videography', 'Catering', 'Venue', 'Decoration', 'Beauty & Makeup', 'Music & Entertainment'];

  // Fetch vendors whenever the query or category changes
  useEffect(() => {
    let mounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    (async () => {
      try {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (category && category !== 'All') params.set('category', category);
        const res = await fetch('/api/vendors?' + params.toString());
        const json = await res.json();
        if (!mounted) return;
        setVendors(json.vendors || []);
      } catch {
        if (mounted) setVendors([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [q, category]);

  // Submit search from input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQ(searchInput);
  };

  const handleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return prev.length < 3 ? [...prev, id] : prev;
    });
    setCompareOpen(true);
  };

  const clearCompare = () => setCompareIds([]);

  // Client-side filter for shortlist
  const displayedVendors = useMemo(() => {
    return showShortlistOnly ? vendors.filter(v => isSaved(v.id)) : vendors;
  }, [vendors, showShortlistOnly, isSaved]);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', color: '#111827', fontFamily: 'system-ui, sans-serif' }}>
      {/* ── HEADER & SEARCH HERO ── */}
      <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '2.5rem', color: '#1f2937' }}>Find Your Perfect Vendors</h1>
        <p style={{ margin: '0 0 2rem 0', color: '#6b7280', fontSize: '1.1rem' }}>Discover top-rated professionals for your big day.</p>
        
        <form onSubmit={handleSearch} style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input 
              value={searchInput} 
              onChange={e => setSearchInput(e.target.value)} 
              placeholder="Search by name, service, or keyword..." 
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: 999, border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>
          <button type="submit" style={{ padding: '0 2rem', borderRadius: 999, background: '#e24b6d', color: 'white', border: 'none', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', flex: '0 0 auto' }}>
            Search
          </button>
        </form>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', gap: '2rem', flexDirection: 'column' }}>
        
        {/* Toolbar: Categories & Shortlist Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: 4 }}>
            {CATEGORIES.map(c => (
              <button 
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: 999, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 500, transition: 'all 0.2s',
                  background: category === c ? '#111827' : 'white',
                  color: category === c ? 'white' : '#4b5563',
                  boxShadow: category === c ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setShowShortlistOnly(!showShortlistOnly)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #d1d5db', background: showShortlistOnly ? '#fee2e2' : 'white', color: showShortlistOnly ? '#dc2626' : '#374151', cursor: 'pointer', fontWeight: 500 }}
            >
              <Heart size={18} fill={showShortlistOnly ? '#dc2626' : 'none'} color={showShortlistOnly ? '#dc2626' : 'currentColor'} />
              My Shortlist ({list.length})
            </button>
          </div>
        </div>

        {/* Floating Compare Bar */}
        {compareIds.length > 0 && (
          <div style={{ background: '#111827', color: 'white', padding: '1rem 1.5rem', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 16, zIndex: 50, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <div>
              <span style={{ fontWeight: 600 }}>{compareIds.length} vendor(s) selected</span>
              <span style={{ color: '#9ca3af', marginLeft: 8, fontSize: '0.9rem' }}>(Max 3)</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setCompareOpen(true)} style={{ background: 'white', color: '#111827', border: 'none', padding: '0.5rem 1rem', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Compare Now</button>
              <button onClick={clearCompare} style={{ background: 'transparent', color: '#9ca3af', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>Loading vendors...</div>
          ) : displayedVendors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', background: 'white', borderRadius: 16, border: '1px dashed #d1d5db' }}>
              <Filter size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>No vendors found</h3>
              <p style={{ margin: 0, color: '#6b7280' }}>
                {showShortlistOnly ? "You haven't saved any vendors to your shortlist yet." : "Try adjusting your search or category filters."}
              </p>
              {showShortlistOnly && <button onClick={() => setShowShortlistOnly(false)} style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: 8, background: '#f3f4f6', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Browse all vendors</button>}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {displayedVendors.map(v => (
                <VendorCard 
                  key={v.id} 
                  vendor={v} 
                  onCompare={(id: string) => handleCompare(id)} 
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Compare Modal */}
      <VendorCompareModal open={compareOpen} onClose={() => setCompareOpen(false)} ids={compareIds} />
    </div>
  );
}
