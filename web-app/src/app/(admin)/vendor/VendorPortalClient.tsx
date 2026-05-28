'use client';

import React, { useState, useRef } from 'react';
import {
  LayoutDashboard, User, Package, CalendarCheck, Calendar,
  MessageSquare, BarChart2, Banknote, Settings, Menu, Bell,
  Eye, Clock, CheckCircle, Star, LogOut, Plus, Edit2, Trash2,
  ToggleLeft, ToggleRight, Upload, X, Save, AlertCircle,
  Globe, DollarSign, Image as ImageIcon, FileText,
  Search, ImageOff, RefreshCw, Check, Filter,
  Info
} from 'lucide-react';
import styles from './vendor.module.css';

// ─── Main Portal ────────────────────────────────────────────────
export default function VendorPortalClient({ vendor: initialVendor, listings: initialListings, portal: initialPortal }: any) {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);

  // Live state for vendor profile + listings (optimistic updates)
  const [vendor, setVendor] = useState(initialVendor);
  const [listings, setListings] = useState<any[]>(initialListings);
  const [portal, setPortal] = useState<any>(initialPortal || {});
  const [bookingRecords, setBookingRecords] = useState<any[]>(initialPortal?.bookings || []);
  const messageThreads = portal.messages || [];
  const payouts = portal.payouts || [];
  const availability = portal.availability;
  const vendorSettings = portal.settings;
  const analytics = portal.analytics || {};

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const navigateTo = (module: string) => {
    setActiveModule(module);
    setMobileMenuOpen(false);
    setAvatarDropdownOpen(false);
  };

  const activePct = listings.length ? Math.round((listings.filter((l: any) => l.active).length / listings.length) * 100) : 0;
  const unreadMessages = messageThreads.filter((thread: any) => thread.unread).length;

  return (
    <div className={`${styles.dashboardScreen} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
      {mobileMenuOpen && <div className={styles.sidebarOverlay} onClick={toggleMobileMenu} />}

      {/* ─ SIDEBAR ─────────────────────────────────────────── */}
      <aside className={`${styles.vndSidebar} ${mobileMenuOpen ? styles.mobileOpen : ''} ${sidebarCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarLogo}>
          <div className={styles.sidebarLogoIcon}><Package size={20} /></div>
          <div className={styles.sidebarLogoTextWrapper}>
            <div className={styles.sidebarLogoText}>WedPlan</div>
            <div className={styles.sidebarLogoSub}>Vendor Portal</div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.navLabel}>Main</div>
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" isActive={activeModule === 'dashboard'} onClick={() => navigateTo('dashboard')} />
          <NavItem icon={<User size={18} />} label="Profile & Portfolio" isActive={activeModule === 'profile'} onClick={() => navigateTo('profile')} />
          <NavItem icon={<Package size={18} />} label="My Listings" isActive={activeModule === 'listings'} onClick={() => navigateTo('listings')} />

          <div className={styles.navLabel}>Operations</div>
          <NavItem icon={<CalendarCheck size={18} />} label="Bookings" badge={bookingRecords.filter((b: any) => b.status === 'pending').length} isActive={activeModule === 'bookings'} onClick={() => navigateTo('bookings')} />
          <NavItem icon={<Calendar size={18} />} label="Availability" isActive={activeModule === 'availability'} onClick={() => navigateTo('availability')} />
          <NavItem icon={<MessageSquare size={18} />} label="Messages" badge={unreadMessages} isActive={activeModule === 'messages'} onClick={() => navigateTo('messages')} />

          <div className={styles.navLabel}>Business</div>
          <NavItem icon={<BarChart2 size={18} />} label="Analytics" isActive={activeModule === 'analytics'} onClick={() => navigateTo('analytics')} />
          <NavItem icon={<Banknote size={18} />} label="Payouts" isActive={activeModule === 'payouts'} onClick={() => navigateTo('payouts')} />
          <NavItem icon={<Settings size={18} />} label="Settings" isActive={activeModule === 'settings'} onClick={() => navigateTo('settings')} />
        </nav>

        <div className={styles.sidebarProgress}>
          <div className={styles.progressLabel}>
            <span>Listings Active</span>
            <span>{activePct}%</span>
          </div>
          <div className={styles.progressBarBg}>
            <div className={styles.progressBarFill} style={{ width: `${activePct}%` }} />
          </div>
        </div>
      </aside>

      {/* ─ MAIN CONTENT ────────────────────────────────────── */}
      <div className={styles.vndMain}>
        <header className={styles.vndHeader}>
          <button className={styles.headerToggle} onClick={toggleSidebar}><Menu size={18} /></button>
          <button className={`${styles.headerToggle} ${styles.mobileMenuBtn}`} onClick={toggleMobileMenu}><Menu size={18} /></button>

          <div className={styles.headerBrand}>
            <span className={styles.headerBrandName}>{vendor.businessName}</span>
            <span className={styles.headerBrandBadge}>
              <Star size={10} /><span>{vendor.category}</span>
            </span>
          </div>

          <div className={styles.headerActions}>
            <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}>
              <Eye size={14} /><span className={styles.hideMobile}>View Public Profile</span>
            </button>
            <button className={styles.headerBtn}><Bell size={18} /><span className={styles.notifDot} /></button>
            <div className={styles.avatarDropdown}>
              <div className={styles.avatarBtn} onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}>
                {vendor.businessName.charAt(0)}
              </div>
              {avatarDropdownOpen && (
                <div className={`${styles.dropdownMenu} ${styles.open}`}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownName}>{vendor.businessName}</div>
                    <div className={styles.dropdownEmail}>{vendor.email}</div>
                  </div>
                  <div className={styles.dropdownItem} onClick={() => navigateTo('profile')}><User size={16} /> My Profile</div>
                  <div className={styles.dropdownItem} onClick={() => navigateTo('settings')}><Settings size={16} /> Settings</div>
                  <div className={styles.dropdownDivider} />
                  <div className={`${styles.dropdownItem} ${styles.danger}`}><LogOut size={16} /> Log Out</div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles.vndContent}>
          {activeModule === 'dashboard' && <DashboardModule vendor={vendor} listings={listings} bookings={bookingRecords} onNavigate={navigateTo} />}
          {activeModule === 'profile' && <ProfileModule vendor={vendor} onVendorSaved={setVendor} />}
          {activeModule === 'listings' && <ListingsModule vendorId={vendor.id} listings={listings} onListingsChange={setListings} />}
          {activeModule === 'bookings' && <BookingsModule vendorId={vendor.id} bookings={bookingRecords} onBookingsChange={setBookingRecords} onPortalChange={setPortal} />}
          {activeModule === 'availability' && <AvailabilityModule vendorId={vendor.id} listings={listings} availability={availability} onPortalChange={setPortal} />}
          {activeModule === 'messages' && <MessagesModule vendor={vendor} threads={messageThreads} onPortalChange={setPortal} />}
          {activeModule === 'analytics' && <AnalyticsModule vendor={vendor} listings={listings} bookings={bookingRecords} analytics={analytics} />}
          {activeModule === 'payouts' && <PayoutsModule payouts={payouts} />}
          {activeModule === 'settings' && <SettingsModule vendor={vendor} settings={vendorSettings} onPortalChange={setPortal} />}
        </main>
      </div>
    </div>
  );
}

// ─── NavItem ──────────────────────────────────────────────────
function NavItem({ icon, label, isActive, onClick, badge }: any) {
  return (
    <div className={`${styles.navItem} ${isActive ? styles.active : ''}`} onClick={onClick} title={label}>
      <span className={styles.navIcon}>{icon}</span>
      <span className={styles.navText}>{label}</span>
      {badge > 0 && <span className={styles.navBadge}>{badge}</span>}
    </div>
  );
}

// ─── Dashboard Module ─────────────────────────────────────────
function DashboardModule({ vendor, listings, bookings, onNavigate }: any) {
  return (
    <section className={styles.moduleSection}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Welcome back, {vendor.ownerFirstName || vendor.businessName}! Here&apos;s an overview.</p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => onNavigate('listings')}>
          <Plus size={16} /> Add New Listing
        </button>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.purple}`}><Eye size={22} /></div>
          <div className={styles.kpiLabel}>Profile Views</div>
          <div className={styles.kpiValue}>234</div>
          <div className={styles.kpiSub}>This month</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.teal}`}><Package size={22} /></div>
          <div className={styles.kpiLabel}>Active Listings</div>
          <div className={styles.kpiValue}>{listings.filter((l: any) => l.active).length}</div>
          <div className={styles.kpiSub}>of {listings.length} total</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.warning}`}><Clock size={22} /></div>
          <div className={styles.kpiLabel}>Pending Bookings</div>
          <div className={styles.kpiValue}>{bookings.filter((b: any) => b.status === 'pending').length}</div>
          <div className={styles.kpiSub}>Awaiting response</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.success}`}><CheckCircle size={22} /></div>
          <div className={styles.kpiLabel}>Confirmed Bookings</div>
          <div className={styles.kpiValue}>{bookings.filter((b: any) => b.status === 'confirmed').length}</div>
          <div className={styles.kpiSub}>All time</div>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}><Clock size={18} className={styles.textTeal} /> Recent Requests</div>
          </div>
          <div className={styles.cardBody}>
            {bookings.map((b: any) => (
              <div key={b.id} className={styles.recentBookingItem}>
                <div>
                  <div className={styles.rbCouple}>{b.coupleName}</div>
                  <div className={styles.rbService}>{b.serviceName}</div>
                </div>
                <div>
                  <div className={styles.rbAmount}>LKR {b.amount.toLocaleString()}</div>
                  <span className={`${styles.badge} ${styles['badge' + b.status]}`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Profile Module ───────────────────────────────────────────
function ProfileModule({ vendor: initialVendor, onVendorSaved }: any) {
  const [vendor, setVendor] = useState(initialVendor);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'business' | 'media' | 'seo' | 'content'>('business');
  const [logoPreview, setLogoPreview] = useState<string | null>(vendor.logoBase64 || null);
  const [coverPreview, setCoverPreview] = useState<string | null>(vendor.coverImageBase64 || null);
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>(vendor.portfolioImages || []);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  const CATEGORIES = ['Photography', 'Videography', 'Catering', 'Venue', 'Decoration', 'Music & Entertainment', 'Cake & Desserts', 'Beauty & Makeup', 'Flowers & Floral', 'Jewellery', 'Wedding Planner', 'Transport', 'Stationery & Invitations', 'Lighting', 'Other'];
  const CURRENCIES = ['LKR', 'USD', 'EUR', 'GBP', 'AUD', 'SGD', 'INR'];

  const change = (field: string, value: any) => setVendor((v: any) => ({ ...v, [field]: value }));

  const imgToBase64 = (file: File): Promise<string> => new Promise((res, rej) => {
    if (file.size > 3 * 1024 * 1024) { rej(new Error('Image must be under 3 MB')); return; }
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await imgToBase64(file);
      setLogoPreview(b64);
      change('logoBase64', b64);
    } catch { setSaveMsg({ type: 'error', text: 'Logo must be under 3 MB.' }); }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await imgToBase64(file);
      setCoverPreview(b64);
      change('coverImageBase64', b64);
    } catch { setSaveMsg({ type: 'error', text: 'Cover image must be under 3 MB.' }); }
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - portfolioPreviews.length;
    if (remaining <= 0) { setSaveMsg({ type: 'error', text: 'Maximum 10 portfolio images allowed.' }); return; }
    const toProcess = files.slice(0, remaining);
    try {
      const converted = await Promise.all(toProcess.map(f => imgToBase64(f)));
      const next = [...portfolioPreviews, ...converted];
      setPortfolioPreviews(next);
      change('portfolioImages', next);
    } catch { setSaveMsg({ type: 'error', text: 'Each image must be under 3 MB.' }); }
  };

  const removePortfolioImage = (idx: number) => {
    const next = portfolioPreviews.filter((_, i) => i !== idx);
    setPortfolioPreviews(next);
    change('portfolioImages', next);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: vendor.businessName,
          category: vendor.category,
          subcategory: vendor.subcategory,
          description: vendor.description,
          yearsInBusiness: vendor.yearsInBusiness,
          website: vendor.website,
          location: vendor.location,
          serviceArea: vendor.serviceArea,
          phone: vendor.phone,
          logoBase64: vendor.logoBase64,
          coverImageBase64: vendor.coverImageBase64,
          portfolioImages: vendor.portfolioImages,
          basePrice: vendor.basePrice,
          currency: vendor.currency,
          pricingNotes: vendor.pricingNotes,
          packages: vendor.packages,
          seoTitle: vendor.seoTitle,
          seoDescription: vendor.seoDescription,
          seoKeywords: vendor.seoKeywords,
          aboutMarkdown: vendor.aboutMarkdown,
          faqMarkdown: vendor.faqMarkdown,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      setVendor((v: any) => ({ ...v, ...data.vendor }));
      onVendorSaved((v: any) => ({ ...v, ...data.vendor }));
      setSaveMsg({ type: 'success', text: 'Profile saved successfully!' });
    } catch (e: any) {
      setSaveMsg({ type: 'error', text: e.message || 'Save failed. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.moduleSection}>
      <style>{`
        .profTabs { display:flex; gap:.5rem; border-bottom:1px solid var(--adm-border); margin-bottom:2rem; padding-bottom:0; }
        .profTab { padding:.75rem 1.25rem; cursor:pointer; font-size:.9rem; font-weight:500; color:var(--adm-text-secondary); border-bottom:2px solid transparent; margin-bottom:-1px; transition:all .2s; border-radius:.375rem .375rem 0 0; }
        .profTab:hover { color:var(--adm-text-primary); background:var(--adm-bg-alt); }
        .profTab.active { color:var(--inv-rose); border-bottom-color:var(--inv-rose); font-weight:600; }
        .profGrid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
        .profField { display:flex; flex-direction:column; gap:.5rem; }
        .profField.full { grid-column:1/-1; }
        .profLabel { font-size:.85rem; font-weight:600; color:var(--adm-text-secondary); }
        .profInput { padding:.625rem .875rem; border:1px solid var(--adm-border); border-radius:.5rem; font-size:.9rem; background:white; color:var(--adm-text-primary); outline:none; transition:border .15s; width:100%; box-sizing:border-box; }
        .profInput:focus { border-color:var(--inv-rose); box-shadow:0 0 0 3px rgba(226,75,109,.1); }
        .profSelect { appearance:none; padding:.625rem 2rem .625rem .875rem; border:1px solid var(--adm-border); border-radius:.5rem; font-size:.9rem; background:white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right .75rem center; color:var(--adm-text-primary); outline:none; width:100%; cursor:pointer; }
        .profSelect:focus { border-color:var(--inv-rose); }
        .profTextarea { padding:.625rem .875rem; border:1px solid var(--adm-border); border-radius:.5rem; font-size:.9rem; background:white; color:var(--adm-text-primary); outline:none; transition:border .15s; width:100%; box-sizing:border-box; resize:vertical; font-family:inherit; line-height:1.6; }
        .profTextarea:focus { border-color:var(--inv-rose); box-shadow:0 0 0 3px rgba(226,75,109,.1); }
        .profTextareaCode { font-family:monospace; font-size:.82rem; }
        .profHint { font-size:.78rem; color:var(--adm-text-muted); }
        .profCard { background:white; border:1px solid var(--adm-border); border-radius:var(--radius-2xl); padding:1.75rem; margin-bottom:1.5rem; box-shadow:var(--shadow-sm); }
        .profCardTitle { font-size:1rem; font-weight:600; color:var(--adm-text-primary); margin-bottom:1.25rem; display:flex; align-items:center; gap:.5rem; }
        .imgUploadBox { border:2px dashed var(--adm-border); border-radius:.75rem; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.5rem; padding:2rem; cursor:pointer; transition:all .2s; color:var(--adm-text-muted); min-height:140px; position:relative; overflow:hidden; }
        .imgUploadBox:hover { border-color:var(--inv-rose); color:var(--inv-rose); background:#fff5f6; }
        .imgPreview { width:100%; height:140px; object-fit:cover; border-radius:.625rem; display:block; }
        .imgRemoveBtn { position:absolute; top:.5rem; right:.5rem; width:28px; height:28px; border-radius:50%; background:rgba(0,0,0,.55); color:white; display:flex; align-items:center; justify-content:center; cursor:pointer; border:none; font-size:14px; }
        .portfolioGrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:.75rem; }
        .portfolioThumb { position:relative; border-radius:.625rem; overflow:hidden; aspect-ratio:1; background:var(--adm-bg-alt); }
        .portfolioThumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .portfolioAdd { border:2px dashed var(--adm-border); border-radius:.625rem; aspect-ratio:1; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; color:var(--adm-text-muted); gap:.25rem; font-size:.75rem; transition:all .2s; }
        .portfolioAdd:hover { border-color:var(--inv-rose); color:var(--inv-rose); background:#fff5f6; }
        .pkgRow { display:grid; grid-template-columns:1fr 120px 1fr auto; gap:.75rem; align-items:center; padding:.875rem; background:var(--adm-bg-alt); border-radius:.5rem; margin-bottom:.625rem; }
        .pkgAddBtn { display:flex; align-items:center; gap:.5rem; padding:.5rem 1rem; border:1px dashed var(--adm-border); border-radius:.5rem; cursor:pointer; color:var(--adm-text-muted); font-size:.85rem; background:transparent; transition:all .2s; margin-top:.5rem; }
        .pkgAddBtn:hover { border-color:var(--inv-rose); color:var(--inv-rose); }
        .pkgDel { background:none; border:none; cursor:pointer; color:var(--adm-danger); padding:.25rem; border-radius:.375rem; }
        .pkgDel:hover { background:#FEF2F2; }
        .saveBar { position:sticky; bottom:0; background:white; border-top:1px solid var(--adm-border); padding:1rem 0; display:flex; align-items:center; gap:1rem; margin-top:2rem; z-index:10; }
        .saveMsg { display:flex; align-items:center; gap:.5rem; font-size:.85rem; padding:.5rem .875rem; border-radius:.5rem; }
        .saveMsg.success { background:#ECFDF5; color:#065F46; }
        .saveMsg.error { background:#FEF2F2; color:#9B1C1C; }
        .seoCharCount { float:right; font-size:.75rem; color:var(--adm-text-muted); }
        @media(max-width:768px) { .profGrid { grid-template-columns:1fr; } .profField.full { grid-column:1; } .pkgRow { grid-template-columns:1fr 1fr; } }
      `}</style>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Profile & Portfolio</h1>
          <p className={styles.pageSubtitle}>Manage your business information, media, and SEO settings.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="profTabs">
        {([['business', 'Business Info'], ['media', 'Media & Gallery'], ['seo', 'SEO'], ['content', 'Content']] as const).map(([key, label]) => (
          <div key={key} className={`profTab ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>{label}</div>
        ))}
      </div>

      {/* ── Business Info Tab ── */}
      {activeTab === 'business' && (
        <>
          <div className="profCard">
            <div className="profCardTitle"><User size={18} style={{ color: 'var(--inv-rose)' }} /> Business Details</div>
            <div className="profGrid">
              <div className="profField">
                <label className="profLabel">Business Name *</label>
                <input id="prof-businessName" className="profInput" value={vendor.businessName || ''} onChange={e => change('businessName', e.target.value)} placeholder="Lumina Studios" />
              </div>
              <div className="profField">
                <label className="profLabel">Category *</label>
                <select id="prof-category" className="profSelect" value={vendor.category || ''} onChange={e => change('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="profField">
                <label className="profLabel">Sub-category</label>
                <input id="prof-subcategory" className="profInput" value={vendor.subcategory || ''} onChange={e => change('subcategory', e.target.value)} placeholder="Wedding Photography" />
              </div>
              <div className="profField">
                <label className="profLabel">Years in Business</label>
                <input id="prof-years" className="profInput" type="number" min={0} max={100} value={vendor.yearsInBusiness ?? ''} onChange={e => change('yearsInBusiness', e.target.value ? Number(e.target.value) : null)} placeholder="5" />
              </div>
              <div className="profField full">
                <label className="profLabel">Business Description * <span style={{ color: 'var(--adm-text-muted)', fontWeight: 400 }}>(min 30 chars)</span></label>
                <textarea id="prof-description" className="profTextarea" rows={4} value={vendor.description || ''} onChange={e => change('description', e.target.value)} placeholder="Tell couples what makes your business special..." />
                <span className="profHint">{(vendor.description || '').length} characters</span>
              </div>
            </div>
          </div>

          <div className="profCard">
            <div className="profCardTitle"><Globe size={18} style={{ color: 'var(--inv-rose)' }} /> Location & Contact</div>
            <div className="profGrid">
              <div className="profField">
                <label className="profLabel">Primary Location *</label>
                <input id="prof-location" className="profInput" value={vendor.location || ''} onChange={e => change('location', e.target.value)} placeholder="Colombo, Sri Lanka" />
              </div>
              <div className="profField">
                <label className="profLabel">Service Area</label>
                <input id="prof-serviceArea" className="profInput" value={vendor.serviceArea || ''} onChange={e => change('serviceArea', e.target.value)} placeholder="Island-wide" />
              </div>
              <div className="profField">
                <label className="profLabel">Website</label>
                <input id="prof-website" className="profInput" type="url" value={vendor.website || ''} onChange={e => change('website', e.target.value)} placeholder="https://your-studio.com" />
              </div>
              <div className="profField">
                <label className="profLabel">Phone Number</label>
                <input id="prof-phone" className="profInput" type="tel" value={vendor.phone || ''} onChange={e => change('phone', e.target.value)} placeholder="+94 77 000 0000" />
              </div>
            </div>
          </div>

          <div className="profCard">
            <div className="profCardTitle"><DollarSign size={18} style={{ color: 'var(--inv-rose)' }} /> Pricing & Packages</div>
            <div className="profGrid">
              <div className="profField">
                <label className="profLabel">Starting Price *</label>
                <input id="prof-basePrice" className="profInput" type="number" min={0} value={vendor.basePrice ?? ''} onChange={e => change('basePrice', Number(e.target.value))} placeholder="75000" />
              </div>
              <div className="profField">
                <label className="profLabel">Currency</label>
                <select id="prof-currency" className="profSelect" value={vendor.currency || 'LKR'} onChange={e => change('currency', e.target.value)}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="profField full">
                <label className="profLabel">Pricing Notes</label>
                <textarea id="prof-pricingNotes" className="profTextarea" rows={2} value={vendor.pricingNotes || ''} onChange={e => change('pricingNotes', e.target.value)} placeholder="Prices vary by date, headcount, location..." />
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <label className="profLabel" style={{ display: 'block', marginBottom: '.75rem' }}>Service Packages <span className="profHint">(up to 5)</span></label>
              {(vendor.packages || []).map((pkg: any, i: number) => (
                <div key={i} className="pkgRow">
                  <input id={`prof-pkg-name-${i}`} className="profInput" placeholder="Package name" value={pkg.name || ''} onChange={e => {
                    const p = [...vendor.packages]; p[i] = { ...p[i], name: e.target.value }; change('packages', p);
                  }} />
                  <input id={`prof-pkg-price-${i}`} className="profInput" type="number" min={0} placeholder="Price" value={pkg.price ?? ''} onChange={e => {
                    const p = [...vendor.packages]; p[i] = { ...p[i], price: Number(e.target.value) }; change('packages', p);
                  }} />
                  <input id={`prof-pkg-desc-${i}`} className="profInput" placeholder="What's included" value={pkg.description || ''} onChange={e => {
                    const p = [...vendor.packages]; p[i] = { ...p[i], description: e.target.value }; change('packages', p);
                  }} />
                  <button className="pkgDel" onClick={() => { const p = vendor.packages.filter((_: any, j: number) => j !== i); change('packages', p); }} title="Remove package"><X size={15} /></button>
                </div>
              ))}
              {(vendor.packages || []).length < 5 && (
                <button className="pkgAddBtn" onClick={() => change('packages', [...(vendor.packages || []), { name: '', price: 0, description: '' }])}>
                  <Plus size={15} /> Add Package
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Media Tab ── */}
      {activeTab === 'media' && (
        <>
          <div className="profCard">
            <div className="profCardTitle"><ImageIcon size={18} style={{ color: 'var(--inv-rose)' }} /> Logo & Cover Image</div>
            <div className="profGrid">
              <div className="profField">
                <label className="profLabel">Business Logo <span className="profHint">(max 3 MB)</span></label>
                <div className="imgUploadBox" onClick={() => logoInputRef.current?.click()}>
                  {logoPreview ? (
                    <>
                      <img src={logoPreview} alt="Logo" className="imgPreview" />
                      <button className="imgRemoveBtn" onClick={e => { e.stopPropagation(); setLogoPreview(null); change('logoBase64', null); }}><X size={14} /></button>
                    </>
                  ) : (
                    <><Upload size={24} /><span style={{ fontSize: '.85rem' }}>Click to upload logo</span><span className="profHint">PNG, JPG, WEBP</span></>
                  )}
                </div>
                <input id="prof-logo-input" ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
              </div>
              <div className="profField">
                <label className="profLabel">Cover / Banner Image <span className="profHint">(max 3 MB)</span></label>
                <div className="imgUploadBox" onClick={() => coverInputRef.current?.click()}>
                  {coverPreview ? (
                    <>
                      <img src={coverPreview} alt="Cover" className="imgPreview" style={{ objectFit: 'cover' }} />
                      <button className="imgRemoveBtn" onClick={e => { e.stopPropagation(); setCoverPreview(null); change('coverImageBase64', null); }}><X size={14} /></button>
                    </>
                  ) : (
                    <><Upload size={24} /><span style={{ fontSize: '.85rem' }}>Click to upload cover image</span><span className="profHint">PNG, JPG, WEBP — 16:9 recommended</span></>
                  )}
                </div>
                <input id="prof-cover-input" ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
              </div>
            </div>
          </div>

          <div className="profCard">
            <div className="profCardTitle"><ImageIcon size={18} style={{ color: 'var(--inv-rose)' }} /> Portfolio Gallery <span className="profHint" style={{ fontWeight: 400, marginLeft: '.5rem' }}>({portfolioPreviews.length}/10 images)</span></div>
            <p className="profHint" style={{ marginBottom: '1rem' }}>Showcase your best work. These photos appear on your public profile.</p>
            <div className="portfolioGrid">
              {portfolioPreviews.map((src, i) => (
                <div key={i} className="portfolioThumb">
                  <img src={src} alt={`Portfolio ${i + 1}`} />
                  <button className="imgRemoveBtn" style={{ top: '.35rem', right: '.35rem' }} onClick={() => removePortfolioImage(i)} title="Remove"><X size={12} /></button>
                </div>
              ))}
              {portfolioPreviews.length < 10 && (
                <div className="portfolioAdd" onClick={() => portfolioInputRef.current?.click()}>
                  <Plus size={20} />
                  <span>Add Photo</span>
                </div>
              )}
            </div>
            <input id="prof-portfolio-input" ref={portfolioInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePortfolioUpload} />
          </div>
        </>
      )}

      {/* ── SEO Tab ── */}
      {activeTab === 'seo' && (
        <div className="profCard">
          <div className="profCardTitle"><Search size={18} style={{ color: 'var(--inv-rose)' }} /> Search Engine Optimisation</div>
          <p className="profHint" style={{ marginBottom: '1.5rem' }}>These fields improve how your profile appears in search results. Keep titles under 60 characters and descriptions under 160.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="profField">
              <label className="profLabel">
                SEO Title
                <span className="seoCharCount">{(vendor.seoTitle || '').length}/60</span>
              </label>
              <input id="prof-seoTitle" className="profInput" maxLength={60} value={vendor.seoTitle || ''} onChange={e => change('seoTitle', e.target.value)} placeholder={`${vendor.businessName} | ${vendor.category} in ${vendor.location}`} />
              <span className="profHint">Appears as the title in Google search results. If empty, we&apos;ll generate one from your business name.</span>
            </div>
            <div className="profField">
              <label className="profLabel">
                SEO Meta Description
                <span className="seoCharCount">{(vendor.seoDescription || '').length}/160</span>
              </label>
              <textarea id="prof-seoDesc" className="profTextarea" rows={3} maxLength={160} value={vendor.seoDescription || ''} onChange={e => change('seoDescription', e.target.value)} placeholder={`${vendor.description?.slice(0, 120) || 'Describe your business for search engines.'}`} />
              <span className="profHint">Appears in search result snippets. Aim for 120–160 characters.</span>
            </div>
            <div className="profField">
              <label className="profLabel">Keywords <span className="profHint">(comma-separated)</span></label>
              <input id="prof-seoKeywords" className="profInput" value={vendor.seoKeywords || ''} onChange={e => change('seoKeywords', e.target.value)} placeholder="wedding photography colombo, sri lanka photographer, candid wedding" />
              <span className="profHint">Optional. Helps with internal search discovery on the WedPlan platform.</span>
            </div>

            <div style={{ background: 'var(--adm-bg-alt)', borderRadius: '.75rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.75rem', fontWeight: 600, fontSize: '.9rem' }}>
                <Eye size={16} style={{ color: 'var(--inv-rose)' }} /> Search Preview
              </div>
              <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '560px' }}>
                <div style={{ color: '#1558d6', fontSize: '1rem', fontWeight: 400, lineHeight: 1.3, marginBottom: '.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {vendor.seoTitle || `${vendor.businessName} | ${vendor.category} in ${vendor.location}`}
                </div>
                <div style={{ color: '#006621', fontSize: '.8rem', marginBottom: '.2rem' }}>wedplan.lk/vendors/{vendor.id}</div>
                <div style={{ color: '#545454', fontSize: '.85rem', lineHeight: 1.5 }}>
                  {vendor.seoDescription || vendor.description?.slice(0, 150) || 'No description set.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Content Tab ── */}
      {activeTab === 'content' && (
        <div className="profCard">
          <div className="profCardTitle"><FileText size={18} style={{ color: 'var(--inv-rose)' }} /> Editable Content (Markdown)</div>
          <div style={{ background: '#FFF8E1', border: '1px solid #FDE68A', borderRadius: '.5rem', padding: '.75rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '.5rem', fontSize: '.85rem', color: '#92400E' }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            Use <strong>Markdown</strong> syntax for rich text. E.g. <code>**bold**</code>, <code>## Heading</code>, <code>- bullet</code>. These render on your public profile.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="profField">
              <label className="profLabel">About Your Business</label>
              <textarea id="prof-aboutMarkdown" className={`profTextarea profTextareaCode`} rows={10} value={vendor.aboutMarkdown || ''} onChange={e => change('aboutMarkdown', e.target.value)} placeholder={`## Our Story\n\nTell your brand story here...\n\n## Our Approach\n\nWhat makes you different?\n\n## Awards & Recognition\n\n- Award name — Year`} />
              <span className="profHint">{(vendor.aboutMarkdown || '').length} characters</span>
            </div>
            <div className="profField">
              <label className="profLabel">FAQ Section</label>
              <textarea id="prof-faqMarkdown" className={`profTextarea profTextareaCode`} rows={8} value={vendor.faqMarkdown || ''} onChange={e => change('faqMarkdown', e.target.value)} placeholder={`## Frequently Asked Questions\n\n**How far in advance should we book?**\nWe recommend booking 6–12 months in advance for peak season dates.\n\n**Do you travel outside Colombo?**\nYes, island-wide. Travel costs may apply for distant venues.`} />
              <span className="profHint">{(vendor.faqMarkdown || '').length} characters</span>
            </div>
          </div>
        </div>
      )}

      {/* Save Bar */}
      <div className="saveBar">
        <button id="prof-save-btn" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave} disabled={saving} style={{ minWidth: '140px' }}>
          {saving ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Save size={16} /> Save Changes</>}
        </button>
        {saveMsg && (
          <div className={`saveMsg ${saveMsg.type}`}>
            {saveMsg.type === 'success' ? <Check size={15} /> : <AlertCircle size={15} />}
            {saveMsg.text}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Listings Module ──────────────────────────────────────────
function ListingsModule({ vendorId, listings: initial, onListingsChange }: any) {
  const [listings, setListings] = useState<any[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editingListing, setEditingListing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const CATEGORIES = ['Photography', 'Videography', 'Catering', 'Venue', 'Decoration', 'Music & Entertainment', 'Cake & Desserts', 'Beauty & Makeup', 'Flowers & Floral', 'Jewellery', 'Wedding Planner', 'Transport', 'Stationery & Invitations', 'Lighting', 'Other'];
  const CURRENCIES = ['LKR', 'USD', 'EUR', 'GBP', 'AUD'];
  const PRICING_TYPES = [{ value: 'fixed', label: 'Fixed Price' }, { value: 'from', label: 'Starting From' }, { value: 'per_person', label: 'Per Person' }, { value: 'on_request', label: 'On Request' }];

  const defaultForm = {
    title: '', category: 'Photography', subcategory: '', description: '',
    price: '', currency: 'LKR', pricingType: 'fixed',
    coverImageBase64: null, galleryImages: [], tags: '',
    seoTitle: '', seoDescription: '', contentMarkdown: '', active: true,
  };
  const [form, setForm] = useState<any>(defaultForm);
  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const sync = (ls: any[]) => { setListings(ls); onListingsChange(ls); };

  const openNew = () => {
    setForm(defaultForm); setEditingListing(null);
    setCoverPreview(null); setGalleryPreviews([]); setSaveMsg(null); setShowForm(true);
  };

  const openEdit = (l: any) => {
    setForm({
      ...l, tags: (l.tags || []).join(', '),
      price: String(l.price || ''),
    });
    setEditingListing(l);
    setCoverPreview(l.coverImageBase64 || null);
    setGalleryPreviews(l.galleryImages || []);
    setSaveMsg(null); setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingListing(null); setSaveMsg(null); };

  const imgToBase64 = (file: File): Promise<string> => new Promise((res, rej) => {
    if (file.size > 5 * 1024 * 1024) { rej(new Error('Image must be under 5 MB')); return; }
    const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file);
  });

  const handleSave = async () => {
    setSaving(true); setSaveMsg(null);
    const payload = {
      ...form,
      price: Number(form.price || 0),
      tags: form.tags ? String(form.tags).split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      coverImageBase64: coverPreview || null,
      galleryImages: galleryPreviews,
    };

    try {
      let res: Response, data: any;
      if (editingListing) {
        res = await fetch(`/api/vendors/${vendorId}/listings/${editingListing.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Update failed.');
        sync(listings.map((l: any) => l.id === editingListing.id ? data.listing : l));
        setSaveMsg({ type: 'success', text: 'Listing updated!' });
      } else {
        res = await fetch(`/api/vendors/${vendorId}/listings`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Create failed.');
        sync([data.listing, ...listings]);
        setSaveMsg({ type: 'success', text: 'Listing created!' });
        setTimeout(closeForm, 1200);
      }
    } catch (e: any) {
      setSaveMsg({ type: 'error', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (l: any) => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}/listings/${l.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !l.active }),
      });
      const data = await res.json();
      if (!res.ok) return;
      sync(listings.map((x: any) => x.id === l.id ? data.listing : x));
    } catch { /* silent */ }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/vendors/${vendorId}/listings/${id}`, { method: 'DELETE' });
      if (!res.ok) return;
      sync(listings.filter((l: any) => l.id !== id));
      setDeleteId(null);
    } catch { /* silent */ }
  };

  const filtered = listings.filter((l: any) => {
    const matchFilter = filter === 'all' || (filter === 'active' && l.active) || (filter === 'inactive' && !l.active);
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.category.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <section className={styles.moduleSection}>
      <style>{`
        .lstToolbar { display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap; }
        .lstSearch { flex:1; min-width:180px; display:flex; align-items:center; gap:.5rem; background:white; border:1px solid var(--adm-border); border-radius:.5rem; padding:.5rem .875rem; }
        .lstSearch input { border:none; outline:none; flex:1; font-size:.875rem; color:var(--adm-text-primary); background:transparent; }
        .lstFilter { display:flex; border:1px solid var(--adm-border); border-radius:.5rem; overflow:hidden; }
        .lstFilterBtn { padding:.5rem 1rem; font-size:.8rem; font-weight:500; cursor:pointer; border:none; background:white; color:var(--adm-text-secondary); transition:all .15s; }
        .lstFilterBtn.active { background:var(--inv-rose); color:white; }
        .lstFilterBtn:hover:not(.active) { background:var(--adm-bg-alt); }
        .lstGrid { display:grid; gap:1rem; }
        .lstCard { background:white; border:1px solid var(--adm-border); border-radius:var(--radius-2xl); padding:1.25rem 1.5rem; display:grid; grid-template-columns:auto 1fr auto; gap:1rem; align-items:start; box-shadow:var(--shadow-sm); transition:box-shadow .2s; }
        .lstCard:hover { box-shadow:var(--shadow-md); }
        .lstCard.inactive { opacity:.65; }
        .lstCover { width:72px; height:72px; border-radius:.75rem; background:var(--adm-bg-alt); display:flex; align-items:center; justify-content:center; color:var(--adm-text-muted); overflow:hidden; flex-shrink:0; }
        .lstCover img { width:100%; height:100%; object-fit:cover; }
        .lstTitle { font-size:1rem; font-weight:600; color:var(--adm-text-primary); margin-bottom:.25rem; }
        .lstMeta { font-size:.8rem; color:var(--adm-text-muted); margin-bottom:.5rem; display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; }
        .lstMetaDot { width:4px; height:4px; border-radius:50%; background:var(--adm-border); }
        .lstPrice { font-size:1rem; font-weight:700; color:var(--inv-rose-dark); }
        .lstDesc { font-size:.85rem; color:var(--adm-text-secondary); line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .lstTags { display:flex; gap:.375rem; flex-wrap:wrap; margin-top:.5rem; }
        .lstTag { background:var(--adm-bg-alt); color:var(--adm-text-secondary); font-size:.72rem; padding:2px 8px; border-radius:9999px; }
        .lstActions { display:flex; flex-direction:column; align-items:flex-end; gap:.5rem; flex-shrink:0; }
        .lstToggle { display:flex; align-items:center; gap:.5rem; cursor:pointer; font-size:.78rem; font-weight:500; }
        .lstToggle.on { color:var(--adm-success); }
        .lstToggle.off { color:var(--adm-text-muted); }
        .lstActionBtns { display:flex; gap:.375rem; }
        .lstActionBtn { width:32px; height:32px; border-radius:.375rem; border:1px solid var(--adm-border); background:white; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--adm-text-secondary); transition:all .15s; }
        .lstActionBtn:hover { border-color:var(--inv-rose); color:var(--inv-rose); }
        .lstActionBtn.del:hover { border-color:var(--adm-danger); color:var(--adm-danger); background:#FEF2F2; }
        .lstEmpty { text-align:center; padding:4rem 2rem; color:var(--adm-text-muted); }
        .lstEmptyIcon { width:64px; height:64px; border-radius:50%; background:var(--adm-bg-alt); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; }
        .lstStatusBadge { font-size:.72rem; font-weight:600; padding:2px 8px; border-radius:9999px; }
        .lstStatusBadge.active { background:#ECFDF5; color:#065F46; }
        .lstStatusBadge.inactive { background:var(--adm-bg-alt); color:var(--adm-text-muted); }
        /* Form */
        .lstFormOverlay { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:200; display:flex; align-items:flex-start; justify-content:center; padding:2rem 1rem; overflow-y:auto; }
        .lstForm { background:white; border-radius:var(--radius-2xl); width:100%; max-width:720px; box-shadow:0 25px 50px rgba(0,0,0,.15); }
        .lstFormHeader { display:flex; align-items:center; justify-content:space-between; padding:1.5rem 2rem; border-bottom:1px solid var(--adm-border); }
        .lstFormTitle { font-size:1.2rem; font-weight:700; }
        .lstFormCloseBtn { width:36px; height:36px; border-radius:50%; border:1px solid var(--adm-border); background:white; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--adm-text-secondary); }
        .lstFormBody { padding:2rem; display:flex; flex-direction:column; gap:1.25rem; }
        .lstFormGrid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        .lstFormField { display:flex; flex-direction:column; gap:.4rem; }
        .lstFormField.full { grid-column:1/-1; }
        .lstFormLabel { font-size:.82rem; font-weight:600; color:var(--adm-text-secondary); }
        .lstFormInput { padding:.55rem .75rem; border:1px solid var(--adm-border); border-radius:.5rem; font-size:.875rem; background:white; color:var(--adm-text-primary); outline:none; width:100%; box-sizing:border-box; }
        .lstFormInput:focus { border-color:var(--inv-rose); box-shadow:0 0 0 3px rgba(226,75,109,.1); }
        .lstFormSelect { appearance:none; padding:.55rem 2rem .55rem .75rem; border:1px solid var(--adm-border); border-radius:.5rem; font-size:.875rem; background:white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right .75rem center; color:var(--adm-text-primary); outline:none; width:100%; cursor:pointer; box-sizing:border-box; }
        .lstFormSelect:focus { border-color:var(--inv-rose); }
        .lstFormTextarea { padding:.55rem .75rem; border:1px solid var(--adm-border); border-radius:.5rem; font-size:.875rem; background:white; color:var(--adm-text-primary); outline:none; width:100%; box-sizing:border-box; resize:vertical; font-family:inherit; line-height:1.5; }
        .lstFormTextarea:focus { border-color:var(--inv-rose); box-shadow:0 0 0 3px rgba(226,75,109,.1); }
        .lstFormTextareaCode { font-family:monospace; font-size:.8rem; }
        .lstFormHint { font-size:.75rem; color:var(--adm-text-muted); }
        .lstFormFooter { padding:1.25rem 2rem; border-top:1px solid var(--adm-border); display:flex; align-items:center; gap:1rem; flex-wrap:wrap; }
        .lstFormSection { font-size:.8rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--adm-text-muted); border-bottom:1px solid var(--adm-border-light); padding-bottom:.5rem; margin-bottom:.25rem; }
        .lstGalleryGrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(80px,1fr)); gap:.5rem; }
        .lstGalleryThumb { position:relative; border-radius:.5rem; overflow:hidden; aspect-ratio:1; background:var(--adm-bg-alt); }
        .lstGalleryThumb img { width:100%; height:100%; object-fit:cover; }
        .lstGalleryAdd { border:2px dashed var(--adm-border); border-radius:.5rem; aspect-ratio:1; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; color:var(--adm-text-muted); gap:.2rem; font-size:.7rem; transition:all .2s; }
        .lstGalleryAdd:hover { border-color:var(--inv-rose); color:var(--inv-rose); }
        .lstFormImgBox { border:2px dashed var(--adm-border); border-radius:.625rem; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.4rem; padding:1.25rem; cursor:pointer; color:var(--adm-text-muted); min-height:100px; position:relative; overflow:hidden; transition:all .2s; }
        .lstFormImgBox:hover { border-color:var(--inv-rose); color:var(--inv-rose); background:#fff5f6; }
        .lstFormImgPreview { width:100%; height:100px; object-fit:cover; border-radius:.5rem; }
        .lstFormImgRemove { position:absolute; top:.35rem; right:.35rem; width:24px; height:24px; border-radius:50%; background:rgba(0,0,0,.55); color:white; display:flex; align-items:center; justify-content:center; cursor:pointer; border:none; }
        .lstConfirmOverlay { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:300; display:flex; align-items:center; justify-content:center; padding:1rem; }
        .lstConfirmBox { background:white; border-radius:var(--radius-2xl); padding:2rem; max-width:400px; width:100%; box-shadow:0 25px 50px rgba(0,0,0,.2); text-align:center; }
        .lstConfirmIcon { width:56px; height:56px; border-radius:50%; background:#FEF2F2; color:var(--adm-danger); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; }
        .lstConfirmTitle { font-size:1.1rem; font-weight:700; margin-bottom:.5rem; }
        .lstConfirmText { color:var(--adm-text-secondary); font-size:.9rem; margin-bottom:1.5rem; }
        .lstConfirmBtns { display:flex; gap:.75rem; justify-content:center; }
        @media(max-width:600px) { .lstCard { grid-template-columns:1fr; } .lstCover { display:none; } .lstFormGrid { grid-template-columns:1fr; } .lstFormField.full { grid-column:1; } }
      `}</style>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Listings</h1>
          <p className={styles.pageSubtitle}>{listings.filter((l: any) => l.active).length} active · {listings.filter((l: any) => !l.active).length} inactive · {listings.length} total</p>
        </div>
        <button id="listings-add-btn" className={`${styles.btn} ${styles.btnPrimary}`} onClick={openNew}>
          <Plus size={16} /> New Listing
        </button>
      </div>

      {/* Toolbar */}
      <div className="lstToolbar">
        <div className="lstSearch">
          <Search size={16} color="var(--adm-text-muted)" />
          <input id="listings-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search listings…" />
          {search && <X size={14} style={{ cursor: 'pointer', color: 'var(--adm-text-muted)' }} onClick={() => setSearch('')} />}
        </div>
        <div className="lstFilter">
          {[['all', 'All'], ['active', 'Active'], ['inactive', 'Inactive']].map(([val, label]) => (
            <button key={val} id={`listings-filter-${val}`} className={`lstFilterBtn ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Listing Cards */}
      <div className="lstGrid">
        {filtered.length === 0 ? (
          <div className="lstEmpty">
            <div className="lstEmptyIcon"><ImageOff size={28} /></div>
            <p style={{ fontWeight: 600, marginBottom: '.5rem' }}>{search ? 'No listings match your search' : 'No listings yet'}</p>
            <p style={{ fontSize: '.875rem' }}>{search ? 'Try a different search term.' : 'Create your first listing to showcase your services.'}</p>
          </div>
        ) : filtered.map((l: any) => (
          <div key={l.id} className={`lstCard ${!l.active ? 'inactive' : ''}`}>
            <div className="lstCover">
              {l.coverImageBase64 ? <img src={l.coverImageBase64} alt={l.title} /> : <ImageOff size={24} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
                <div className="lstTitle">{l.title}</div>
                <span className={`lstStatusBadge ${l.active ? 'active' : 'inactive'}`}>{l.active ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="lstMeta">
                <span>{l.category}</span>
                {l.subcategory && <><span className="lstMetaDot" /><span>{l.subcategory}</span></>}
                <span className="lstMetaDot" />
                <span style={{ color: 'var(--inv-rose-dark)', fontWeight: 600 }}>
                  {l.currency} {Number(l.price).toLocaleString()}
                  {l.pricingType === 'from' && ' (from)'}
                  {l.pricingType === 'per_person' && ' /person'}
                  {l.pricingType === 'on_request' && ' (on request)'}
                </span>
                {l.galleryCount > 0 && <><span className="lstMetaDot" /><span>{l.galleryCount} photos</span></>}
              </div>
              {l.description && <div className="lstDesc">{l.description}</div>}
              {l.tags?.length > 0 && (
                <div className="lstTags">
                  {l.tags.slice(0, 5).map((t: string) => <span key={t} className="lstTag"># {t}</span>)}
                </div>
              )}
            </div>
            <div className="lstActions">
              <div className={`lstToggle ${l.active ? 'on' : 'off'}`} onClick={() => handleToggle(l)} title={l.active ? 'Click to deactivate' : 'Click to activate'}>
                {l.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                {l.active ? 'Live' : 'Off'}
              </div>
              <div className="lstActionBtns">
                <button id={`listing-edit-${l.id}`} className="lstActionBtn" title="Edit listing" onClick={() => openEdit(l)}><Edit2 size={15} /></button>
                <button id={`listing-delete-${l.id}`} className="lstActionBtn del" title="Delete listing" onClick={() => setDeleteId(l.id)}><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirm */}
      {deleteId && (
        <div className="lstConfirmOverlay" onClick={() => setDeleteId(null)}>
          <div className="lstConfirmBox" onClick={e => e.stopPropagation()}>
            <div className="lstConfirmIcon"><Trash2 size={24} /></div>
            <div className="lstConfirmTitle">Delete this listing?</div>
            <div className="lstConfirmText">This action cannot be undone. The listing will be permanently removed.</div>
            <div className="lstConfirmBtns">
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setDeleteId(null)}>Cancel</button>
              <button id="listing-confirm-delete" className={`${styles.btn} ${styles.btnPrimary}`} style={{ background: 'var(--adm-danger)', boxShadow: 'none' }} onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Listing Form Modal */}
      {showForm && (
        <div className="lstFormOverlay" onClick={closeForm}>
          <div className="lstForm" onClick={e => e.stopPropagation()}>
            <div className="lstFormHeader">
              <div className="lstFormTitle">{editingListing ? 'Edit Listing' : 'New Listing'}</div>
              <button className="lstFormCloseBtn" onClick={closeForm}><X size={18} /></button>
            </div>
            <div className="lstFormBody">
              <div className="lstFormSection">Basic Information</div>
              <div className="lstFormGrid">
                <div className="lstFormField full">
                  <label className="lstFormLabel">Listing Title *</label>
                  <input id="listing-form-title" className="lstFormInput" value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} placeholder="Full Day Wedding Photography" />
                </div>
                <div className="lstFormField">
                  <label className="lstFormLabel">Category *</label>
                  <select id="listing-form-category" className="lstFormSelect" value={form.category} onChange={e => setForm((f: any) => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="lstFormField">
                  <label className="lstFormLabel">Sub-category</label>
                  <input id="listing-form-subcategory" className="lstFormInput" value={form.subcategory} onChange={e => setForm((f: any) => ({ ...f, subcategory: e.target.value }))} placeholder="Wedding Photography" />
                </div>
                <div className="lstFormField full">
                  <label className="lstFormLabel">Description</label>
                  <textarea id="listing-form-description" className="lstFormTextarea" rows={3} value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} placeholder="Describe what couples will get with this service…" />
                </div>
              </div>

              <div className="lstFormSection">Pricing</div>
              <div className="lstFormGrid">
                <div className="lstFormField">
                  <label className="lstFormLabel">Price *</label>
                  <input id="listing-form-price" className="lstFormInput" type="number" min={0} value={form.price} onChange={e => setForm((f: any) => ({ ...f, price: e.target.value }))} placeholder="150000" />
                </div>
                <div className="lstFormField">
                  <label className="lstFormLabel">Currency</label>
                  <select id="listing-form-currency" className="lstFormSelect" value={form.currency} onChange={e => setForm((f: any) => ({ ...f, currency: e.target.value }))}>
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="lstFormField full">
                  <label className="lstFormLabel">Pricing Type</label>
                  <select id="listing-form-pricingType" className="lstFormSelect" value={form.pricingType} onChange={e => setForm((f: any) => ({ ...f, pricingType: e.target.value }))}>
                    {PRICING_TYPES.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="lstFormSection">Media</div>
              <div className="lstFormGrid">
                <div className="lstFormField">
                  <label className="lstFormLabel">Cover Image <span className="lstFormHint">(max 5 MB)</span></label>
                  <div className="lstFormImgBox" onClick={() => coverRef.current?.click()}>
                    {coverPreview ? (
                      <>
                        <img src={coverPreview} alt="Cover" className="lstFormImgPreview" />
                        <button className="lstFormImgRemove" onClick={e => { e.stopPropagation(); setCoverPreview(null); setForm((f: any) => ({ ...f, coverImageBase64: null })); }}><X size={12} /></button>
                      </>
                    ) : (
                      <><Upload size={20} /><span style={{ fontSize: '.8rem' }}>Upload cover image</span></>
                    )}
                  </div>
                  <input id="listing-form-cover-input" ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => {
                    const f = e.target.files?.[0]; if (!f) return;
                    try { const b64 = await imgToBase64(f); setCoverPreview(b64); setForm((frm: any) => ({ ...frm, coverImageBase64: b64 })); }
                    catch { setSaveMsg({ type: 'error', text: 'Cover image must be under 5 MB.' }); }
                  }} />
                </div>
                <div className="lstFormField">
                  <label className="lstFormLabel">Gallery Images <span className="lstFormHint">({galleryPreviews.length}/10)</span></label>
                  <div className="lstGalleryGrid">
                    {galleryPreviews.map((src, i) => (
                      <div key={i} className="lstGalleryThumb">
                        <img src={src} alt="" />
                        <button className="lstFormImgRemove" style={{ top: '.25rem', right: '.25rem' }} onClick={() => {
                          const n = galleryPreviews.filter((_, j) => j !== i);
                          setGalleryPreviews(n); setForm((f: any) => ({ ...f, galleryImages: n }));
                        }}><X size={10} /></button>
                      </div>
                    ))}
                    {galleryPreviews.length < 10 && (
                      <div className="lstGalleryAdd" onClick={() => galleryRef.current?.click()}>
                        <Plus size={16} /><span>Add</span>
                      </div>
                    )}
                  </div>
                  <input id="listing-form-gallery-input" ref={galleryRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={async e => {
                    const files = Array.from(e.target.files || []).slice(0, 10 - galleryPreviews.length);
                    try {
                      const converted = await Promise.all(files.map((f: File) => imgToBase64(f)));
                      const next = [...galleryPreviews, ...converted];
                      setGalleryPreviews(next); setForm((frm: any) => ({ ...frm, galleryImages: next }));
                    } catch { setSaveMsg({ type: 'error', text: 'Each image must be under 5 MB.' }); }
                  }} />
                </div>
              </div>

              <div className="lstFormSection">Tags & SEO</div>
              <div className="lstFormGrid">
                <div className="lstFormField full">
                  <label className="lstFormLabel">Tags <span className="lstFormHint">(comma-separated)</span></label>
                  <input id="listing-form-tags" className="lstFormInput" value={form.tags} onChange={e => setForm((f: any) => ({ ...f, tags: e.target.value }))} placeholder="photography, wedding, full-day, colombo" />
                </div>
                <div className="lstFormField">
                  <label className="lstFormLabel">SEO Title <span className="lstFormHint">(max 60 chars)</span></label>
                  <input id="listing-form-seoTitle" className="lstFormInput" maxLength={60} value={form.seoTitle} onChange={e => setForm((f: any) => ({ ...f, seoTitle: e.target.value }))} placeholder="Full Day Wedding Photography Sri Lanka" />
                </div>
                <div className="lstFormField">
                  <label className="lstFormLabel">SEO Description <span className="lstFormHint">(max 160 chars)</span></label>
                  <input id="listing-form-seoDesc" className="lstFormInput" maxLength={160} value={form.seoDescription} onChange={e => setForm((f: any) => ({ ...f, seoDescription: e.target.value }))} placeholder="Professional wedding photography covering…" />
                </div>
              </div>

              <div className="lstFormSection">Content (Markdown)</div>
              <div className="lstFormField">
                <label className="lstFormLabel">Detailed Content</label>
                <textarea id="listing-form-content" className={`lstFormTextarea lstFormTextareaCode`} rows={6} value={form.contentMarkdown} onChange={e => setForm((f: any) => ({ ...f, contentMarkdown: e.target.value }))} placeholder={`## What's Included\n\n- Item 1\n- Item 2\n\n## Timeline\n\nDetails here...`} />
                <span className="lstFormHint">Markdown supported. Renders on the public listing page.</span>
              </div>

              <div className="lstFormSection">Settings</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontSize: '.9rem', fontWeight: 500 }}>
                  <input id="listing-form-active" type="checkbox" checked={form.active} onChange={e => setForm((f: any) => ({ ...f, active: e.target.checked }))} style={{ width: 16, height: 16, accentColor: 'var(--inv-rose)' }} />
                  Publish this listing (visible to couples)
                </label>
              </div>
            </div>

            <div className="lstFormFooter">
              <button id="listing-form-save-btn" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave} disabled={saving} style={{ minWidth: '130px' }}>
                {saving ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Save size={15} /> {editingListing ? 'Update Listing' : 'Create Listing'}</>}
              </button>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={closeForm}>Cancel</button>
              {saveMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '.375rem', fontSize: '.82rem', color: saveMsg.type === 'success' ? '#065F46' : '#9B1C1C', background: saveMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2', padding: '.375rem .75rem', borderRadius: '.375rem' }}>
                  {saveMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}{saveMsg.text}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Operational Modules ──────────────────────────────────────
function OpsStyles() {
  return (
    <style>{`
      .opsGrid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:1rem; }
      .opsCard { background:white; border:1px solid var(--adm-border); border-radius:var(--radius-2xl); padding:1.25rem; box-shadow:var(--shadow-sm); }
      .opsCardHeader { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1rem; }
      .opsTitle { font-weight:700; color:var(--adm-text-primary); display:flex; align-items:center; gap:.5rem; }
      .opsMuted { color:var(--adm-text-muted); font-size:.85rem; }
      .opsList { display:flex; flex-direction:column; gap:.75rem; }
      .opsRow { display:flex; justify-content:space-between; gap:1rem; padding:.9rem; border:1px solid var(--adm-border-light); border-radius:var(--radius-lg); background:var(--adm-bg-alt); }
      .opsRowMain { min-width:0; }
      .opsRowTitle { font-weight:650; color:var(--adm-text-primary); margin-bottom:.2rem; }
      .opsRowMeta { color:var(--adm-text-secondary); font-size:.82rem; line-height:1.45; }
      .opsPills { display:flex; gap:.5rem; flex-wrap:wrap; margin-top:.65rem; }
      .opsPill { border:1px solid var(--adm-border); background:white; border-radius:999px; padding:.25rem .6rem; font-size:.75rem; color:var(--adm-text-secondary); }
      .opsStatus { display:inline-flex; align-items:center; gap:.35rem; border-radius:999px; padding:.3rem .65rem; font-size:.75rem; font-weight:700; text-transform:capitalize; white-space:nowrap; }
      .opsStatus.pending { background:var(--adm-warning-bg); color:#92400E; }
      .opsStatus.confirmed, .opsStatus.paid, .opsStatus.active { background:var(--adm-success-bg); color:#065F46; }
      .opsStatus.draft, .opsStatus.unread { background:var(--adm-info-bg); color:#1D4ED8; }
      .opsStatus.cancelled, .opsStatus.failed { background:var(--adm-danger-bg); color:#9B1C1C; }
      .opsToolbar { display:flex; gap:.75rem; align-items:center; flex-wrap:wrap; margin-bottom:1rem; }
      .opsSegment { display:flex; gap:.25rem; padding:.25rem; border:1px solid var(--adm-border); border-radius:999px; background:white; }
      .opsSegment button { border-radius:999px; padding:.45rem .8rem; color:var(--adm-text-secondary); }
      .opsSegment button.active { background:var(--adm-primary-bg); color:var(--adm-primary); font-weight:700; }
      .opsInput, .opsSelect { border:1px solid var(--adm-border); background:white; border-radius:var(--radius-lg); padding:.65rem .8rem; color:var(--adm-text-primary); }
      .opsEmpty { text-align:center; padding:3rem 1rem; color:var(--adm-text-muted); border:1px dashed var(--adm-border); border-radius:var(--radius-2xl); background:white; }
      .opsMetric { display:flex; flex-direction:column; gap:.25rem; }
      .opsMetricValue { font-size:1.55rem; font-weight:800; color:var(--adm-text-primary); }
      .opsMetricLabel { color:var(--adm-text-secondary); font-size:.82rem; }
      .opsBarTrack { height:8px; border-radius:999px; background:var(--adm-bg-alt); overflow:hidden; }
      .opsBarFill { height:100%; border-radius:999px; background:var(--inv-rose); }
      .opsCalendar { display:grid; grid-template-columns:repeat(7,1fr); gap:.5rem; }
      .opsDay { min-height:74px; border:1px solid var(--adm-border-light); border-radius:var(--radius-lg); padding:.55rem; background:white; }
      .opsDay.blocked { background:#FEF2F2; border-color:#FECACA; }
      .opsDay.open { background:#ECFDF5; border-color:#A7F3D0; }
      .opsToggleRow { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:.9rem 0; border-bottom:1px solid var(--adm-border-light); }
      .opsNotice { display:flex; align-items:center; gap:.5rem; border:1px solid #A7F3D0; background:#ECFDF5; color:#047857; border-radius:var(--radius-lg); padding:.75rem .9rem; margin-bottom:1rem; font-weight:650; font-size:.85rem; }
      .opsNotice.error { border-color:#FECACA; background:#FEF2F2; color:#9B1C1C; }
      .opsTextarea { min-height:96px; width:100%; resize:vertical; box-sizing:border-box; }
      @media(max-width:700px){ .opsRow { flex-direction:column; } .opsCalendar { grid-template-columns:repeat(2,1fr); } }
    `}</style>
  );
}

function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="opsEmpty">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '.75rem', color: 'var(--adm-text-muted)' }}>{icon}</div>
      <div style={{ fontWeight: 700, color: 'var(--adm-text-primary)', marginBottom: '.25rem' }}>{title}</div>
      <div>{desc}</div>
    </div>
  );
}

function BookingsModule({ vendorId, bookings, onBookingsChange, onPortalChange }: any) {
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(bookings[0]?.id || '');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState('');
  const visible = bookings.filter((b: any) => filter === 'all' || b.status === filter);
  const selected = bookings.find((b: any) => b.id === selectedId) || visible[0];

  async function updateStatus(id: string, status: string) {
    setSaving(id);
    setError('');
    setNotice('');
    try {
      const res = await fetch(`/api/vendors/${vendorId}/portal`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingStatus: { bookingId: id, status } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking update failed.');
      onPortalChange(data);
      onBookingsChange(data.bookings || []);
      setNotice(`Booking marked ${status}.`);
    } catch (err: any) {
      setError(err.message || 'Booking update failed.');
    } finally {
      setSaving('');
    }
  }

  return (
    <section className={styles.moduleSection}>
      <OpsStyles />
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Bookings</h1>
          <p className={styles.pageSubtitle}>Review enquiries, confirm dates, and track booking status.</p>
        </div>
      </div>
      <div className="opsToolbar">
        <div className="opsSegment">
          {['all', 'pending', 'confirmed', 'cancelled'].map(s => <button key={s} className={filter === s ? 'active' : ''} onClick={() => setFilter(s)}>{s}</button>)}
        </div>
      </div>
      {notice && <div className="opsNotice"><Check size={15} /> {notice}</div>}
      {error && <div className="opsNotice error"><AlertCircle size={15} /> {error}</div>}
      {bookings.length === 0 ? <EmptyState icon={<CalendarCheck size={30} />} title="No bookings yet" desc="New couple requests will appear here with pending, confirmed, or cancelled states." /> : (
        <div className="opsGrid">
          <div className="opsCard">
            <div className="opsCardHeader"><div className="opsTitle"><CalendarCheck size={18} /> Requests</div><span className="opsMuted">{visible.length} shown</span></div>
            {visible.length === 0 ? <EmptyState icon={<Filter size={28} />} title="No bookings in this state" desc="Switch filters or wait for new requests." /> : <div className="opsList">
              {visible.map((b: any) => (
                <button key={b.id} className="opsRow" style={{ textAlign: 'left', borderColor: selected?.id === b.id ? 'var(--inv-rose)' : undefined }} onClick={() => setSelectedId(b.id)}>
                  <div className="opsRowMain">
                    <div className="opsRowTitle">{b.coupleName}</div>
                    <div className="opsRowMeta">{b.serviceName} · {new Date(b.weddingDate).toLocaleDateString()}</div>
                  </div>
                  <span className={`opsStatus ${b.status}`}>{b.status}</span>
                </button>
              ))}
            </div>}
          </div>
          <div className="opsCard">
            {selected ? (
              <>
                <div className="opsCardHeader"><div className="opsTitle"><FileText size={18} /> Booking Detail</div><span className={`opsStatus ${selected.status}`}>{selected.status}</span></div>
                <div className="opsList">
                  <div className="opsRow"><span className="opsMuted">Couple</span><strong>{selected.coupleName}</strong></div>
                  <div className="opsRow"><span className="opsMuted">Service</span><strong>{selected.serviceName}</strong></div>
                  <div className="opsRow"><span className="opsMuted">Wedding date</span><strong>{new Date(selected.weddingDate).toLocaleDateString()}</strong></div>
                  <div className="opsRow"><span className="opsMuted">Estimate</span><strong>LKR {Number(selected.amount).toLocaleString()}</strong></div>
                </div>
                <div className="opsPills">
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => updateStatus(selected.id, 'confirmed')} disabled={saving === selected.id}><Check size={15} /> Confirm</button>
                  <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => updateStatus(selected.id, 'pending')} disabled={saving === selected.id}><RefreshCw size={15} /> Reopen</button>
                  <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => updateStatus(selected.id, 'cancelled')} disabled={saving === selected.id}><X size={15} /> Decline</button>
                </div>
              </>
            ) : <EmptyState icon={<Info size={28} />} title="Select a request" desc="Booking details and response actions show here." />}
          </div>
        </div>
      )}
    </section>
  );
}

function AvailabilityModule({ vendorId, listings, availability, onPortalChange }: any) {
  const [leadTime, setLeadTime] = useState(availability?.minLeadDays ?? 14);
  const [weekendsOnly, setWeekendsOnly] = useState(availability?.weekendsOnly ?? false);
  const [blockedDates, setBlockedDates] = useState<string[]>(availability?.blockedDates || []);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
  const blocked = new Set(blockedDates);
  const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

  function toggleBlocked(dateKey: string) {
    setBlockedDates(prev => prev.includes(dateKey) ? prev.filter(item => item !== dateKey) : [...prev, dateKey]);
    setNotice('Availability calendar updated. Save rules to publish changes.');
    setError('');
  }

  async function saveAvailability() {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch(`/api/vendors/${vendorId}/portal`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: { minLeadDays: leadTime, weekendsOnly, blockedDates } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Availability save failed.');
      onPortalChange(data);
      setNotice('Availability rules saved.');
    } catch (err: any) {
      setError(err.message || 'Availability save failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.moduleSection}>
      <OpsStyles />
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Availability</h1>
          <p className={styles.pageSubtitle}>Set enquiry rules and review upcoming open or blocked dates.</p>
        </div>
      </div>
      <div className="opsGrid">
        <div className="opsCard">
          <div className="opsCardHeader"><div className="opsTitle"><Settings size={18} /> Rules</div><span className="opsStatus active">Active</span></div>
          <div className="opsToggleRow"><div><strong>Minimum lead time</strong><div className="opsMuted">How soon couples can book.</div></div><input className="opsInput" type="number" min={0} value={leadTime} onChange={e => setLeadTime(Number(e.target.value))} style={{ width: 90 }} /></div>
          <div className="opsToggleRow"><div><strong>Weekend events only</strong><div className="opsMuted">Hide weekday dates from enquiries.</div></div><input type="checkbox" checked={weekendsOnly} onChange={e => setWeekendsOnly(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--inv-rose)' }} /></div>
          <div className="opsToggleRow"><div><strong>Services accepting bookings</strong><div className="opsMuted">{listings.filter((l: any) => l.active).length} active listings can receive enquiries.</div></div><span className="opsPill">{listings.length} total</span></div>
          {error && <div className="opsNotice error"><AlertCircle size={15} /> {error}</div>}
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={saveAvailability} disabled={saving}>
            {saving ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={15} /> Save rules</>}
          </button>
        </div>
        <div className="opsCard">
          <div className="opsCardHeader"><div className="opsTitle"><Calendar size={18} /> Next 14 Days</div><span className="opsMuted">Demo calendar</span></div>
          {notice && <div className="opsNotice"><Check size={15} /> {notice}</div>}
          <div className="opsCalendar">
            {days.map((day, i) => {
              const weekend = [0, 6].includes(day.getDay());
              const dateKey = toDateKey(day);
              const isBlocked = blocked.has(dateKey) || (weekendsOnly && !weekend);
              return (
                <button key={day.toISOString()} className={`opsDay ${isBlocked ? 'blocked' : 'open'}`} onClick={() => toggleBlocked(dateKey)} style={{ textAlign: 'left', cursor: 'pointer' }} title="Toggle blocked date">
                  <strong>{day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</strong>
                  <div className="opsMuted">{day.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                  <div className={`opsStatus ${isBlocked ? 'cancelled' : 'active'}`} style={{ marginTop: '.5rem' }}>{isBlocked ? 'Blocked' : 'Open'}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function MessagesModule({ vendor, threads: initialThreads = [], onPortalChange }: any) {
  const [activeId, setActiveId] = useState(initialThreads[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [readIds, setReadIds] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const threads = initialThreads.map((thread: any) => ({
    ...thread,
    unread: thread.unread && !readIds[thread.id],
    lastMessage: thread.messages?.[thread.messages.length - 1]?.body || 'No messages yet.',
  }));
  const active = threads.find((t: any) => t.id === activeId) || threads[0];

  async function patchPortal(payload: any) {
    const res = await fetch(`/api/vendors/${vendor.id}/portal`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Message update failed.');
    onPortalChange(data);
    return data;
  }

  async function openThread(id: string) {
    setActiveId(id);
    setReadIds(prev => ({ ...prev, [id]: true }));
    setError('');
    try {
      await patchPortal({ messageRead: { threadId: id } });
    } catch (err: any) {
      setError(err.message || 'Message update failed.');
    }
  }

  async function sendReply() {
    if (!active || !replyText.trim()) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await patchPortal({ messageReply: { threadId: active.id, message: replyText } });
      setReplyText('');
      setNotice('Reply sent.');
    } catch (err: any) {
      setError(err.message || 'Message send failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.moduleSection}>
      <OpsStyles />
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Messages</h1>
          <p className={styles.pageSubtitle}>Couple enquiry inbox for {vendor.businessName}.</p>
        </div>
      </div>
      {notice && <div className="opsNotice"><Check size={15} /> {notice}</div>}
      {error && <div className="opsNotice error"><AlertCircle size={15} /> {error}</div>}
      {threads.length === 0 ? <EmptyState icon={<MessageSquare size={30} />} title="No enquiries yet" desc="Messages from shortlisted couples and booking requests will appear here." /> : (
        <div className="opsGrid">
          <div className="opsCard">
            <div className="opsCardHeader"><div className="opsTitle"><MessageSquare size={18} /> Inbox</div><span className="opsMuted">{threads.filter((t: any) => t.unread).length} unread</span></div>
            <div className="opsList">
              {threads.map((thread: any) => (
                <button key={thread.id} className="opsRow" style={{ textAlign: 'left', borderColor: active?.id === thread.id ? 'var(--inv-rose)' : undefined }} onClick={() => openThread(thread.id)}>
                  <div className="opsRowMain">
                    <div className="opsRowTitle">{thread.coupleName}</div>
                    <div className="opsRowMeta">{thread.lastMessage}</div>
                  </div>
                  {thread.unread && <span className="opsStatus unread">Unread</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="opsCard">
            <div className="opsCardHeader"><div className="opsTitle"><User size={18} /> {active?.coupleName || 'Conversation'}</div><span className="opsMuted">{active?.subject}</span></div>
            <div className="opsList">
              {active?.messages?.map((message: any) => (
                <div key={message.id} className="opsRow" style={{ background: message.sender === 'vendor' ? 'white' : 'var(--adm-bg-alt)' }}>
                  <div className="opsRowMain">
                    <div className="opsRowTitle">{message.sender === 'vendor' ? vendor.businessName : active.coupleName}</div>
                    <div className="opsRowMeta">{message.body}</div>
                  </div>
                </div>
              ))}
              <textarea className="opsInput opsTextarea" rows={4} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." />
              <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ alignSelf: 'flex-start' }} onClick={sendReply} disabled={saving || !replyText.trim()}>
                {saving ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</> : <><MessageSquare size={15} /> Send reply</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function AnalyticsModule({ vendor, listings, bookings, analytics }: any) {
  const activeListings = listings.filter((l: any) => l.active).length;
  const confirmed = analytics.confirmedBookings ?? bookings.filter((b: any) => b.status === 'confirmed').length;
  const pending = analytics.pendingBookings ?? bookings.filter((b: any) => b.status === 'pending').length;
  const revenue = analytics.confirmedValue ?? bookings.filter((b: any) => b.status === 'confirmed').reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0);
  const profileScore = Math.min(100, 35 + activeListings * 15 + (vendor.portfolioImages?.length || 0) * 4 + (vendor.description ? 15 : 0));

  return (
    <section className={styles.moduleSection}>
      <OpsStyles />
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Analytics</h1>
          <p className={styles.pageSubtitle}>Meaningful health metrics calculated from current vendor data.</p>
        </div>
      </div>
      <div className="opsGrid">
        <div className="opsCard"><div className="opsMetric"><span className="opsMetricValue">{activeListings}</span><span className="opsMetricLabel">Active listings</span></div></div>
        <div className="opsCard"><div className="opsMetric"><span className="opsMetricValue">{pending}</span><span className="opsMetricLabel">Pending enquiries</span></div></div>
        <div className="opsCard"><div className="opsMetric"><span className="opsMetricValue">{confirmed}</span><span className="opsMetricLabel">Confirmed bookings</span></div></div>
        <div className="opsCard"><div className="opsMetric"><span className="opsMetricValue">LKR {revenue.toLocaleString()}</span><span className="opsMetricLabel">Confirmed value</span></div></div>
      </div>
      <div className="opsCard" style={{ marginTop: '1rem' }}>
        <div className="opsCardHeader"><div className="opsTitle"><BarChart2 size={18} /> Profile readiness</div><strong>{profileScore}%</strong></div>
        <div className="opsBarTrack"><div className="opsBarFill" style={{ width: `${profileScore}%` }} /></div>
        <div className="opsPills">
          <span className="opsPill">{listings.length} listings</span>
          <span className="opsPill">{vendor.portfolioImages?.length || 0} portfolio images</span>
          <span className="opsPill">{bookings.length} booking records</span>
        </div>
      </div>
    </section>
  );
}

function PayoutsModule({ payouts }: any) {
  const payoutRows = payouts || [];
  const totalDue = payoutRows.filter((p: any) => p.status === 'pending').reduce((sum: number, p: any) => sum + p.gross - p.fee, 0);

  return (
    <section className={styles.moduleSection}>
      <OpsStyles />
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Payouts</h1>
          <p className={styles.pageSubtitle}>Track payout estimates and billing history from confirmed bookings.</p>
        </div>
      </div>
      <div className="opsGrid">
        <div className="opsCard"><div className="opsMetric"><span className="opsMetricValue">LKR {totalDue.toLocaleString()}</span><span className="opsMetricLabel">Estimated pending payout</span></div></div>
        <div className="opsCard"><div className="opsMetric"><span className="opsMetricValue">{payoutRows.length}</span><span className="opsMetricLabel">Billing history items</span></div></div>
      </div>
      <div className="opsCard" style={{ marginTop: '1rem' }}>
        <div className="opsCardHeader"><div className="opsTitle"><Banknote size={18} /> Payout History</div><span className="opsMuted">5% platform fee estimate</span></div>
        {payoutRows.length === 0 ? <EmptyState icon={<DollarSign size={30} />} title="No payouts yet" desc="Confirmed bookings will generate payout history rows here." /> : (
          <div className="opsList">
            {payoutRows.map((p: any) => (
              <div key={p.id} className="opsRow">
                <div className="opsRowMain"><div className="opsRowTitle">{p.label}</div><div className="opsRowMeta">{new Date(p.payoutDate).toLocaleDateString()} · Fee {p.currency} {p.fee.toLocaleString()}</div></div>
                <div style={{ textAlign: 'right' }}><strong>{p.currency} {(p.gross - p.fee).toLocaleString()}</strong><div><span className={`opsStatus ${p.status}`}>{p.status}</span></div></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SettingsModule({ vendor, settings: initialSettings, onPortalChange }: any) {
  const [settings, setSettings] = useState({
    emailBookings: initialSettings?.emailBookings ?? true,
    emailMessages: initialSettings?.emailMessages ?? true,
    weeklyDigest: initialSettings?.weeklyDigest ?? true,
    smsUrgent: initialSettings?.smsUrgent ?? false,
    publicProfile: initialSettings?.publicProfile ?? vendor.status === 'approved',
  });
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (key: keyof typeof settings, value: boolean) => setSettings(s => ({ ...s, [key]: value }));

  async function saveSettings() {
    setSaving(true);
    setNotice('');
    setError('');
    try {
      const res = await fetch(`/api/vendors/${vendor.id}/portal`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Preference save failed.');
      onPortalChange(data);
      setNotice('Preferences saved.');
    } catch (err: any) {
      setError(err.message || 'Preference save failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.moduleSection}>
      <OpsStyles />
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Manage account visibility and notification preferences.</p>
        </div>
      </div>
      <div className="opsGrid">
        <div className="opsCard">
          <div className="opsCardHeader"><div className="opsTitle"><User size={18} /> Account</div><span className={`opsStatus ${vendor.status === 'approved' ? 'active' : 'pending'}`}>{vendor.status}</span></div>
          <div className="opsList">
            <div className="opsRow"><span className="opsMuted">Business</span><strong>{vendor.businessName}</strong></div>
            <div className="opsRow"><span className="opsMuted">Email</span><strong>{vendor.email}</strong></div>
            <div className="opsRow"><span className="opsMuted">Category</span><strong>{vendor.category}</strong></div>
          </div>
        </div>
        <div className="opsCard">
          <div className="opsCardHeader"><div className="opsTitle"><Bell size={18} /> Notifications</div><span className="opsMuted">Local preferences</span></div>
          {notice && <div className="opsNotice"><Check size={15} /> {notice}</div>}
          {error && <div className="opsNotice error"><AlertCircle size={15} /> {error}</div>}
          {[
            ['emailBookings', 'Booking request emails'],
            ['emailMessages', 'New message emails'],
            ['weeklyDigest', 'Weekly performance digest'],
            ['smsUrgent', 'SMS for urgent changes'],
            ['publicProfile', 'Public profile visible'],
          ].map(([key, label]) => (
            <div className="opsToggleRow" key={key}>
              <div><strong>{label}</strong><div className="opsMuted">{key === 'publicProfile' ? 'Controls whether couples can discover this vendor.' : 'Notification preference for this account.'}</div></div>
              <input type="checkbox" checked={settings[key as keyof typeof settings]} onChange={e => set(key as keyof typeof settings, e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--inv-rose)' }} />
            </div>
          ))}
          <button className={`${styles.btn} ${styles.btnPrimary}`} style={{ marginTop: '1rem' }} onClick={saveSettings} disabled={saving}>
            {saving ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Save size={15} /> Save preferences</>}
          </button>
        </div>
      </div>
    </section>
  );
}
