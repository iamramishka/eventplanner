/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, Settings, Users, CheckSquare,
  Menu, Bell, Heart, CheckCircle, UserPlus,
  Save, Users as UsersIcon, Clock, ArrowUp, ArrowDown,
  CalendarDays, Image as ImageIcon, ClipboardList,
  Palette, Music, Grid3x3, Wallet, ListChecks, Store,
  MapPin, Mail, TrendingUp, ExternalLink,
  ChevronRight, Send, Edit3, Calendar, DollarSign,
  Eye, AlertCircle, X, Check, Plus,
  UserCircle, LogOut, HelpCircle, Diamond, RefreshCw,
  Home, Upload, Download, Trash2, GripVertical, Printer, Copy, FileText,
  BarChart2,
} from 'lucide-react';
import './dashboard.css';
import InvitationEditorModule, { InvitationPreview } from './InvitationEditorModule';
import TablesModule from './TablesModule';
import CoupleAnalyticsModule from './CoupleAnalyticsModule';
import {
  FONT_PRESETS,
  InvitationTheme,
  PALETTE_PRESETS,
  normalizeInvitationTheme,
} from '@/lib/invitation-content';

/* ─── Types ─── */
interface NavItem {
  id: string;
  icon: any;
  label: string;
  badge?: number;
}

type GalleryImageRecord = {
  id: string;
  weddingId: string;
  imageType: string;
  imageUrl: string;
  altText: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  sortOrder: number;
  createdAt: string;
};

type BudgetStatus = 'planned' | 'reserved' | 'paid';

type BudgetItemRecord = {
  id: string;
  weddingId: string;
  category: string;
  name: string;
  estimated: number;
  actual: number;
  status: BudgetStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type BudgetCategoryTotal = {
  category: string;
  estimated: number;
  actual: number;
  remaining: number;
  plannedCount: number;
  reservedCount: number;
  paidCount: number;
  itemCount: number;
};

type BudgetTotals = {
  estimatedTotal: number;
  actualTotal: number;
  reservedTotal: number;
  paidTotal: number;
  plannedTotal: number;
  remaining: number;
};

type BudgetResponse = {
  weddingId: string;
  scenarioNote: string;
  items: BudgetItemRecord[];
  categories: string[];
  statuses: BudgetStatus[];
  categoryTotals: BudgetCategoryTotal[];
  totals: BudgetTotals;
};

type AgendaEventRecord = {
  id: string;
  weddingId: string;
  icon: string;
  title: string;
  startTime: string;
  endTime: string;
  timezone: string;
  location: string;
  description: string;
  sortOrder: number;
};

type ChecklistState = 'pending' | 'due-soon' | 'overdue' | 'completed';

type ChecklistItemRecord = {
  id: string;
  weddingId: string;
  group: string;
  title: string;
  description: string;
  state: ChecklistState;
  isCompleted: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  reminderAt: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
};

type ChecklistTemplateRecord = {
  id: string;
  name: string;
  description: string;
  taskCount: number;
};

/* ─── Sidebar Navigation Config ─── */
const NAV_ITEMS: NavItem[] = [
  { id: 'overview',     icon: LayoutDashboard, label: 'Overview' },
  { id: 'settings',     icon: Settings,         label: 'Wedding Settings' },
  { id: 'guests',       icon: Users,            label: 'Guests' },
  { id: 'rsvps',        icon: CheckSquare,      label: 'RSVPs' },
  { id: 'analytics',   icon: BarChart2,         label: 'Analytics' },
  { id: 'invitation',   icon: Edit3,            label: 'Invitation Editor' },
  { id: 'theme',        icon: Palette,          label: 'Theme & Design' },
  { id: 'gallery',      icon: Grid3x3,          label: 'Gallery' },
  { id: 'music',        icon: Music,            label: 'Music' },
  { id: 'agenda',       icon: CalendarDays,     label: 'Agenda' },
  { id: 'tables',       icon: Home,             label: 'Tables & Seating' },
  { id: 'budget',       icon: Wallet,           label: 'Budget' },
  { id: 'checklist',    icon: ListChecks,       label: 'Checklist' },
  { id: 'vendors',      icon: Store,            label: 'Vendors' },
  { id: 'notifications', icon: Bell,            label: 'Notifications' },
  { id: 'account',      icon: UserCircle,       label: 'Account' },
];

/* ─── Helpers ─── */
function getInitials(name: string) {
  return name?.split(' ').slice(0, 2).map((n: string) => n[0]?.toUpperCase()).join('') || 'PK';
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now    = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string) {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateShort(dateStr: string) {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatClockDisplay(timeStr: string) {
  if (!timeStr) return 'TBD';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m || 0).padStart(2, '0')} ${ampm}`;
}

function formatAgendaRangeDisplay(event: Partial<AgendaEventRecord> & Record<string, any>) {
  const start = event.startTime || event.time || '';
  const end = event.endTime || '';
  if (start && end && start !== end) return `${formatClockDisplay(start)} - ${formatClockDisplay(end)}`;
  return formatClockDisplay(start);
}

const BUDGET_CATEGORY_OPTIONS = ['Venue', 'Catering', 'Photography', 'Decor', 'Attire', 'Entertainment', 'Other'];
const BUDGET_STATUS_OPTIONS: BudgetStatus[] = ['planned', 'reserved', 'paid'];
const CHECKLIST_GROUP_OPTIONS = ['4 months before', '3 months before', '2 months before', '1 month before', '1 week before', 'Wedding Day', 'After Wedding'];
const CHECKLIST_PRIORITY_OPTIONS = ['high', 'medium', 'low'] as const;
const CHECKLIST_TEMPLATE_FALLBACKS: ChecklistTemplateRecord[] = [
  { id: 'essential-planning', name: 'Essential Planning', description: 'Core planning tasks every couple needs to track.', taskCount: 3 },
  { id: 'venue-vendors', name: 'Venue & Vendors', description: 'Booking and confirmation tasks for major suppliers.', taskCount: 3 },
  { id: 'wedding-week', name: 'Wedding Week', description: 'Final checks for the last few days.', taskCount: 3 },
];

const lkrFormatter = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return lkrFormatter.format(Number(value || 0));
}

async function patchWeddingRecord(weddingId: string, payload: Record<string, any>) {
  const res = await fetch(`/api/weddings/${weddingId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || 'Unable to save wedding changes.');
  return json;
}

function calculateClientBudget(items: BudgetItemRecord[], categories: string[] = BUDGET_CATEGORY_OPTIONS): Pick<BudgetResponse, 'categoryTotals' | 'totals'> {
  const categoryTotals = categories.map(category => {
    const rows = items.filter(item => item.category === category);
    const estimated = rows.reduce((sum, item) => sum + Number(item.estimated || 0), 0);
    const actual = rows.reduce((sum, item) => sum + Number(item.actual || 0), 0);
    return {
      category,
      estimated,
      actual,
      remaining: estimated - actual,
      plannedCount: rows.filter(item => item.status === 'planned').length,
      reservedCount: rows.filter(item => item.status === 'reserved').length,
      paidCount: rows.filter(item => item.status === 'paid').length,
      itemCount: rows.length,
    };
  });
  const estimatedTotal = items.reduce((sum, item) => sum + Number(item.estimated || 0), 0);
  const actualTotal = items.reduce((sum, item) => sum + Number(item.actual || 0), 0);
  const reservedTotal = items.filter(item => item.status === 'reserved').reduce((sum, item) => sum + Number(item.actual || 0), 0);
  const paidTotal = items.filter(item => item.status === 'paid').reduce((sum, item) => sum + Number(item.actual || 0), 0);
  const plannedTotal = items.filter(item => item.status === 'planned').reduce((sum, item) => sum + Number(item.estimated || 0), 0);
  return {
    categoryTotals,
    totals: {
      estimatedTotal,
      actualTotal,
      reservedTotal,
      paidTotal,
      plannedTotal,
      remaining: estimatedTotal - actualTotal,
    },
  };
}

function getChecklistState(item: ChecklistItemRecord): ChecklistState {
  if (item.isCompleted) return 'completed';
  if (!item.dueDate) return item.state || 'pending';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${item.dueDate}T00:00:00`);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 7) return 'due-soon';
  return item.state || 'pending';
}

function getChecklistStats(items: ChecklistItemRecord[]) {
  const normalized = items.map(item => ({ ...item, state: getChecklistState(item) }));
  const completed = normalized.filter(item => item.isCompleted).length;
  const dueSoon = normalized.filter(item => item.state === 'due-soon').length;
  const overdue = normalized.filter(item => item.state === 'overdue').length;
  const pending = normalized.filter(item => !item.isCompleted && item.state !== 'due-soon' && item.state !== 'overdue').length;
  const total = normalized.length;
  return {
    completed,
    dueSoon,
    overdue,
    pending,
    total,
    pct: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/* ─── Root Component ─── */
export default function DashboardClient({ initialWedding, initialGuests, initialRsvps, initialAgenda, initialBudget, initialChecklist }: any) {
  const [activeModule, setActiveModule]         = useState('overview');
  const [sidebarOpen, setSidebarOpen]           = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const [wedding, setWedding] = useState(initialWedding);
  const [guests, setGuests]   = useState(initialGuests);
  const [rsvps]               = useState(initialRsvps);
  const [agenda, setAgenda]   = useState(initialAgenda);
  const [budget, setBudget]   = useState<BudgetResponse | null>(initialBudget || null);
  const [checklist, setChecklist] = useState<ChecklistItemRecord[]>(initialChecklist || []);

  const initials = getInitials(`${wedding?.brideName} ${wedding?.groomName}`);
  const daysLeft = wedding?.date ? getDaysUntil(wedding.date) : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.user-dropdown-wrap')) setUserDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNavigate = (module: string) => {
    setActiveModule(module);
    setSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Heart style={{ color: 'var(--brand-mark)', width: 20, height: 20 }} />
            <span className="brand-name">WedPlan</span>
          </div>
        </div>

        {/* Wedding info / avatar */}
        <div className="sidebar-wedding-info">
          <div className="wedding-avatar">{initials}</div>
          <div className="wedding-names">{wedding?.brideName} &amp; {wedding?.groomName}</div>
          {wedding?.date && <div className="wedding-date">{formatDateShort(wedding.date)}</div>}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <ul>
            {NAV_ITEMS.map(item => (
              <li key={item.id}>
                <a
                  href="#"
                  className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
                  onClick={e => { e.preventDefault(); handleNavigate(item.id); }}
                  title={item.label}
                >
                  <item.icon size={17} />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Trial upgrade card */}
        <div className="sidebar-upgrade-card">
          <div className="upgrade-card-icon"><Diamond size={20} /></div>
          <div className="upgrade-card-copy">
            <strong>Premium Plan</strong>
            <span>Trial ends in 12 days</span>
          </div>
          <button className="btn btn-upgrade">Upgrade Now</button>
        </div>

        {/* Help */}
        <div className="sidebar-help">
          <HelpCircle size={16} />
          <div>
            <strong>Need help?</strong>
            <span>We&apos;re here for you</span>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <main className="main-content">
        {/* Top bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
              <Menu size={20} />
            </button>
            <div className="top-bar-wedding">
              <h2 className="top-bar-title">
                Hi, {wedding?.brideName} &amp; {wedding?.groomName} 💐
              </h2>
              {daysLeft !== null && (
                <span className="top-bar-subtitle">
                  {formatDate(wedding?.date)} &nbsp;·&nbsp; {daysLeft > 0 ? `${daysLeft} days to go` : daysLeft === 0 ? 'Today!' : 'Wedding was'} <Heart size={13} style={{ color: '#E24B6D', display: 'inline', verticalAlign: 'middle' }} />
                </span>
              )}
            </div>
          </div>
          <div className="top-bar-right">
            {/* Trial badge */}
            <div className="trial-badge">
              Trial &nbsp;<span>12 days left</span>
            </div>
            {/* Notifications */}
            <button className="icon-btn" aria-label="Notifications" onClick={() => handleNavigate('notifications')}>
              <Bell size={18} />
              <span className="notif-dot" />
            </button>
            {/* User avatar */}
            <div className="user-dropdown-wrap">
              <button
                id="user-menu-btn"
                className="user-avatar-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-haspopup="true"
                aria-expanded={userDropdownOpen}
              >
                <div className="wedding-avatar" style={{ width: 36, height: 36, margin: 0, fontSize: '0.75rem' }}>{initials}</div>
              </button>
              {userDropdownOpen && (
                <div className="user-dropdown" role="menu">
                  <div className="user-dropdown-header">
                    <div className="wedding-avatar" style={{ width: 40, height: 40, margin: '0 auto 0.5rem', fontSize: '0.8rem' }}>{initials}</div>
                    <div className="user-dropdown-name">{wedding?.brideName} &amp; {wedding?.groomName}</div>
                    <div className="user-dropdown-email">{wedding?.contactEmail || 'hello@wedplan.lk'}</div>
                  </div>
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item" onClick={() => { handleNavigate('settings'); setUserDropdownOpen(false); }}>
                    <Settings size={15} /> Wedding Settings
                  </button>
                  <button className="user-dropdown-item" onClick={() => { handleNavigate('account'); setUserDropdownOpen(false); }}>
                    <UserCircle size={15} /> Account
                  </button>
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item user-dropdown-item-danger" onClick={() => signOut({ callbackUrl: '/login' })}>
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
            {/* Preview button */}
            <button className="btn btn-preview" onClick={() => window.open(`/invitation/${wedding?.slug}`, '_blank')}>
              <Eye size={15} /> Preview Invitation
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="page-content">
          {activeModule === 'overview'  && <OverviewModule  wedding={wedding} guests={guests} rsvps={rsvps} agenda={agenda} budget={budget} checklist={checklist} onNavigate={handleNavigate} />}
          {activeModule === 'settings'  && <SettingsModule  wedding={wedding} setWedding={setWedding} />}
          {activeModule === 'invitation' && <InvitationEditorModule wedding={wedding} setWedding={setWedding} />}
          {activeModule === 'theme'      && <ThemeDesignModule wedding={wedding} setWedding={setWedding} />}
          {activeModule === 'gallery'    && <GalleryModule wedding={wedding} />}
          {activeModule === 'music'      && <MusicModule wedding={wedding} setWedding={setWedding} />}
          {activeModule === 'agenda'     && <AgendaModule wedding={wedding} agenda={agenda} setAgenda={setAgenda} />}
          {activeModule === 'budget'     && <BudgetModule wedding={wedding} initialBudget={budget} setBudget={setBudget} />}
          {activeModule === 'checklist'  && <ChecklistModule wedding={wedding} checklist={checklist} setChecklist={setChecklist} />}
          {activeModule === 'guests'    && <GuestsModule    wedding={wedding} guests={guests} setGuests={setGuests} rsvps={rsvps} onNavigate={handleNavigate} />}
          {activeModule === 'rsvps'     && <RsvpsModule     guests={guests} rsvps={rsvps} onNavigate={handleNavigate} />}
          {activeModule === 'analytics' && <CoupleAnalyticsModule weddingId={wedding?.id} />}
          {activeModule === 'tables'    && <TablesModule    wedding={wedding} guests={guests} />}
          {activeModule === 'vendors'   && <VendorsModule   wedding={wedding} setWedding={setWedding} />}
          {activeModule === 'notifications' && <NotificationsModule wedding={wedding} guests={guests} rsvps={rsvps} checklist={checklist} budget={budget} setWedding={setWedding} onNavigate={handleNavigate} />}
          {activeModule === 'account'   && <AccountModule   wedding={wedding} onNavigate={handleNavigate} />}
        </div>
      </main>
    </div>
  );
}

/* ════════════════════════════════════════
   OVERVIEW MODULE
════════════════════════════════════════ */
function OverviewModule({ wedding, guests, rsvps, agenda, budget, checklist, onNavigate }: any) {
  const totalGuests  = guests.length;
  const confirmed    = rsvps.filter((r: any) => r.attending === true).length;
  const declined     = rsvps.filter((r: any) => r.attending === false).length;
  const pending      = totalGuests - rsvps.length;
  const attending    = rsvps.filter((r: any) => r.attending).reduce((acc: number, r: any) => acc + (r.memberCount || 1), 0);
  const responseRate = totalGuests > 0 ? Math.round((rsvps.length / totalGuests) * 100) : 0;
  const avgPerGuest  = confirmed > 0 ? (attending / confirmed).toFixed(2) : '—';

  const isEmpty      = totalGuests === 0;

  const checklistStats = getChecklistStats(checklist || []);
  const checklistRecent = [...(checklist || [])]
    .sort((a: ChecklistItemRecord, b: ChecklistItemRecord) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)))
    .slice(0, 4);

  const liveBudgetTotals = budget?.totals;
  const budgetTotal = liveBudgetTotals?.estimatedTotal || 250000;
  const budgetSpent = liveBudgetTotals?.paidTotal || 125000;
  const budgetReserved = liveBudgetTotals?.reservedTotal || 25000;
  const budgetRemaining = liveBudgetTotals?.remaining ?? (budgetTotal - budgetSpent - budgetReserved);
  const safeBudgetTotal = Math.max(1, budgetTotal);
  const agendaPreview = [...(agenda || [])].sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)).slice(0, 4);

  /* Recent activity from rsvps */
  const recentActivity = rsvps.slice(-4).reverse().map((r: any) => {
    const g = guests.find((g: any) => g.id === r.guestId);
    return {
      name: g?.name || 'Guest',
      status: r.attending ? 'RSVP Confirmed' : 'RSVP Declined',
      detail: r.attending ? `${r.memberCount || 1} member${(r.memberCount || 1) !== 1 ? 's' : ''}` : '',
      type: r.attending ? 'confirmed' : 'declined',
      time: '2 hours ago',
    };
  });

  const quickActions = [
    { icon: UserPlus,     label: 'Add Guest',       action: 'guests' },
    { icon: Send,         label: 'Send Invitations', action: 'guests' },
    { icon: Edit3,        label: 'Edit Invitation',  action: 'invitation' },
    { icon: Calendar,     label: 'Add Agenda',       action: 'agenda' },
    { icon: DollarSign,   label: 'Add Expense',      action: 'budget' },
    { icon: Home,         label: 'Create Table',     action: 'tables' },
    { icon: Eye,          label: 'Preview Website',  action: 'preview' },
  ];

  return (
    <section className="module overview-module" aria-label="Dashboard Overview">

      {/* ── KPI Row ── */}
      <div className="kpi-grid6">
        <KpiCard
          icon={<UsersIcon size={20} />}
          colorClass="kpi-rose"
          value={totalGuests}
          label="Total Guests"
          sub={totalGuests > 0 ? <><a href="#" onClick={e => { e.preventDefault(); onNavigate('guests'); }} className="kpi-link">View all guests <ChevronRight size={12} /></a></> : 'No guests yet'}
        />
        <KpiCard
          icon={<CheckCircle size={20} />}
          colorClass="kpi-green"
          value={confirmed}
          label="Confirmed"
          sub={totalGuests > 0 ? `${responseRate}% of total` : '0% of total'}
        />
        <KpiCard
          icon={<Clock size={20} />}
          colorClass="kpi-amber"
          value={pending}
          label="Pending"
          sub={totalGuests > 0 ? `${100 - responseRate}% of total` : 'Awaiting responses'}
        />
        <KpiCard
          icon={<X size={20} />}
          colorClass="kpi-red"
          value={declined}
          label="Declined"
          sub={totalGuests > 0 ? `${Math.round((declined / totalGuests) * 100)}% of total` : '—'}
        />
        <KpiCard
          icon={<UsersIcon size={20} />}
          colorClass="kpi-purple"
          value={attending}
          label="Total Headcount"
          sub="People attending"
        />
        <KpiCard
          icon={<Home size={20} />}
          colorClass="kpi-orange"
          value={0}
          label="Tables Created"
          sub={<a href="#" onClick={e => { e.preventDefault(); onNavigate('tables'); }} className="kpi-link">View seating <ChevronRight size={12} /></a>}
        />
      </div>

      {/* ── Main 3-col Grid ── */}
      <div className="overview-grid3">

        {/* Wedding at a Glance */}
        <div className="card overview-glance-panel">
          <div className="panel-header">
            <h3>Wedding at a Glance</h3>
            <button className="btn-ghost-sm" onClick={() => onNavigate('settings')}>
              <Edit3 size={14} /> Edit
            </button>
          </div>

          {/* Couple image placeholder */}
          <div className="glance-photo-wrap">
            <div className="glance-photo-placeholder">
              <ImageIcon size={32} style={{ color: '#C45A74', opacity: 0.5 }} />
              <span>Add couple photo</span>
            </div>
          </div>

          <div className="glance-details">
            <div className="glance-detail-row">
              <CalendarDays size={16} className="glance-icon" />
              <div>
                <div className="glance-detail-label">Wedding Date</div>
                <div className="glance-detail-value">{formatDateShort(wedding?.date)}</div>
              </div>
            </div>
            <div className="glance-detail-row">
              <MapPin size={16} className="glance-icon" />
              <div>
                <div className="glance-detail-label">Venue</div>
                <div className="glance-detail-value">{wedding?.venueName || <em className="text-muted">Not set</em>}</div>
              </div>
            </div>
            <div className="glance-detail-row">
              <Clock size={16} className="glance-icon" />
              <div>
                <div className="glance-detail-label">Time</div>
                <div className="glance-detail-value">{wedding?.time || <em className="text-muted">Not set</em>}</div>
              </div>
            </div>
            <div className="glance-detail-row">
              <ClipboardList size={16} className="glance-icon" />
              <div>
                <div className="glance-detail-label">RSVP Deadline</div>
                <div className="glance-detail-value">{wedding?.rsvpDeadline ? formatDateShort(wedding.rsvpDeadline) : <em className="text-muted">Not set</em>}</div>
              </div>
            </div>
          </div>

          <button className="btn btn-outline btn-full" style={{ marginTop: '1rem' }} onClick={() => onNavigate('settings')}>
            Edit Wedding Details
          </button>
        </div>

        {/* RSVP Overview */}
        <div className="card overview-rsvp-panel">
          <div className="panel-header">
            <h3>RSVP Overview</h3>
            <button className="btn-ghost-sm" onClick={() => onNavigate('rsvps')}>View All</button>
          </div>

          {isEmpty ? (
            <EmptyStatePanel
              icon={<CheckSquare size={32} />}
              title="No RSVPs yet"
              description="Once guests receive their invites and respond, their RSVP status will appear here."
              cta="Add Guests to Start"
              onCta={() => onNavigate('guests')}
            />
          ) : (
            <>
              {/* SVG Donut Chart */}
              <div className="donut-chart-wrap">
                <DonutChart
                  confirmed={confirmed}
                  pending={pending}
                  declined={declined}
                  total={totalGuests}
                />
              </div>
              <div className="rsvp-legend">
                <div className="rsvp-legend-item">
                  <span className="rsvp-dot rsvp-dot-confirmed" />
                  <div>
                    <strong>Confirmed</strong>
                    <span>{confirmed} ({totalGuests > 0 ? Math.round((confirmed / totalGuests) * 100) : 0}%)</span>
                  </div>
                </div>
                <div className="rsvp-legend-item">
                  <span className="rsvp-dot rsvp-dot-pending" />
                  <div>
                    <strong>Pending</strong>
                    <span>{pending} ({totalGuests > 0 ? Math.round((pending / totalGuests) * 100) : 0}%)</span>
                  </div>
                </div>
                <div className="rsvp-legend-item">
                  <span className="rsvp-dot rsvp-dot-declined" />
                  <div>
                    <strong>Declined</strong>
                    <span>{declined} ({totalGuests > 0 ? Math.round((declined / totalGuests) * 100) : 0}%)</span>
                  </div>
                </div>
              </div>
              <div className="rsvp-headcount-row">
                <div className="rsvp-headcount-item">
                  <UsersIcon size={18} style={{ color: '#C45A74' }} />
                  <div>
                    <strong>Total Headcount</strong>
                    <span>{attending} People</span>
                  </div>
                </div>
                <div className="rsvp-headcount-item">
                  <TrendingUp size={18} style={{ color: '#C45A74' }} />
                  <div>
                    <strong>Avg. Members / Guest</strong>
                    <span>{avgPerGuest}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Checklist Progress */}
        <div className="card overview-checklist-panel">
          <div className="panel-header">
            <h3>Checklist Progress</h3>
            <button className="btn-ghost-sm" onClick={() => onNavigate('checklist')}>View All</button>
          </div>

          {/* Ring */}
          <div className="checklist-ring-wrap">
            <RingProgress pct={checklistStats.pct} />
          </div>

          <div className="checklist-legend">
            <div className="checklist-legend-item">
              <span className="cl-dot" style={{ background: '#10B981' }} /> Completed <strong>{checklistStats.completed}</strong>
            </div>
            <div className="checklist-legend-item">
              <span className="cl-dot" style={{ background: '#F59E0B' }} /> Due Soon <strong>{checklistStats.dueSoon}</strong>
            </div>
            <div className="checklist-legend-item">
              <span className="cl-dot" style={{ background: '#E5E7EB' }} /> Pending <strong>{checklistStats.pending}</strong>
            </div>
          </div>

          <div className="panel-subheader">Recent Tasks</div>
          <div className="checklist-mini-list">
            {checklistRecent.length === 0 ? (
              <MiniTask label="No checklist tasks yet" status="Empty" statusClass="status-muted" />
            ) : checklistRecent.map((task: ChecklistItemRecord) => {
              const state = getChecklistState(task);
              return (
                <MiniTask
                  key={task.id}
                  done={task.isCompleted}
                  label={task.title}
                  status={state === 'completed' ? 'Done' : state === 'due-soon' ? 'Due Soon' : state === 'overdue' ? 'Overdue' : 'Pending'}
                  statusClass={state === 'due-soon' ? 'status-amber' : state === 'overdue' ? 'status-danger' : 'status-muted'}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom 2-col ── */}
      <div className="overview-grid2">

        {/* Recent Guest Activity */}
        <div className="card overview-activity-panel">
          <div className="panel-header">
            <h3>Recent Guest Activity</h3>
            <button className="btn-ghost-sm" onClick={() => onNavigate('rsvps')}>View All</button>
          </div>

          {isEmpty || recentActivity.length === 0 ? (
            <EmptyStatePanel
              icon={<UsersIcon size={32} />}
              title="No guest activity yet"
              description="Add your first guests and share invite links to start seeing RSVP updates here."
              cta="Add Your First Guest"
              onCta={() => onNavigate('guests')}
            />
          ) : (
            <div className="activity-list">
              {recentActivity.map((item: any, i: number) => (
                <div className="activity-row" key={i}>
                  <div className="activity-avatar">{getInitials(item.name)}</div>
                  <div className="activity-info">
                    <strong>{item.name}</strong>
                    <span className={`activity-status ${item.type === 'confirmed' ? 'status-confirmed' : 'status-declined'}`}>
                      {item.type === 'confirmed' ? <Check size={11} /> : <X size={11} />}
                      {item.status} {item.detail && `· ${item.detail}`}
                    </span>
                  </div>
                  <div className="activity-time">{item.time}</div>
                </div>
              ))}
              {/* Padding rows if empty */}
              {recentActivity.length < 4 && (
                <div className="activity-row activity-placeholder">
                  <div className="activity-avatar activity-avatar-empty" />
                  <div className="activity-info">
                    <span className="text-muted">Waiting for more RSVPs…</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Budget Summary */}
        <div className="card overview-budget-panel">
          <div className="panel-header">
            <h3>Budget Summary</h3>
            <button className="btn-ghost-sm" onClick={() => onNavigate('budget')}>View Details</button>
          </div>

          <div className="budget-donut-wrap">
            <BudgetDonut spent={budgetSpent} reserved={budgetReserved} remaining={budgetRemaining} total={budgetTotal} />
          </div>

          <div className="budget-legend">
            <div className="budget-legend-item">
              <span className="budget-dot" style={{ background: '#E24B6D' }} />
              <div>
                <span>Spent</span>
                <strong>{formatCurrency(budgetSpent)} ({Math.round(budgetSpent / safeBudgetTotal * 100)}%)</strong>
              </div>
            </div>
            <div className="budget-legend-item">
              <span className="budget-dot" style={{ background: '#9CA3AF' }} />
              <div>
                <span>Remaining</span>
                <strong>{formatCurrency(budgetRemaining)} ({Math.round(budgetRemaining / safeBudgetTotal * 100)}%)</strong>
              </div>
            </div>
            <div className="budget-legend-item">
              <span className="budget-dot" style={{ background: '#F59E0B' }} />
              <div>
                <span>Reserved</span>
                <strong>{formatCurrency(budgetReserved)} ({Math.round(budgetReserved / safeBudgetTotal * 100)}%)</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="card overview-agenda-panel" data-testid="dashboard-agenda-preview">
          <div className="panel-header">
            <h3>Agenda Preview</h3>
            <button className="btn-ghost-sm" onClick={() => onNavigate('agenda')}>View Timeline</button>
          </div>

          {agendaPreview.length === 0 ? (
            <EmptyStatePanel
              icon={<CalendarDays size={32} />}
              title="No agenda items yet"
              description="Add ceremony and reception moments to mirror them on the public invitation."
              cta="Open Agenda"
              onCta={() => onNavigate('agenda')}
            />
          ) : (
            <div className="overview-agenda-list">
              {agendaPreview.map((event: any) => (
                <div className="overview-agenda-row" key={event.id} data-testid="dashboard-agenda-item" data-agenda-id={event.id}>
                  <div className="overview-agenda-time" data-testid="dashboard-agenda-time">{formatAgendaRangeDisplay(event)}</div>
                  <div className="overview-agenda-copy">
                    <strong data-testid="dashboard-agenda-title">{event.title}</strong>
                    <span>{event.location || wedding.venueName || 'Venue TBD'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.05rem' }}>Quick Actions</h3>
        <div className="quick-actions-grid">
          {quickActions.map((qa, i) => (
            <button
              key={i}
              className="quick-action-btn"
              onClick={() => {
                if (qa.action === 'preview') {
                  window.open(`/invitation/${wedding?.slug}`, '_blank');
                  return;
                }
                onNavigate(qa.action);
              }}
              title={qa.label}
              id={`qa-${qa.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="quick-action-icon">
                <qa.icon size={22} />
              </div>
              <span>{qa.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Countdown Banner ── */}
      {wedding?.date && (
        <div className="countdown-banner">
          <Heart size={18} style={{ color: '#C45A74' }} />
          <div>
            <strong>Counting down to your wedding day ✨</strong>
            <span>{formatDate(wedding.date)}</span>
          </div>
          <div className="countdown-pill">
            {getDaysUntil(wedding.date) > 0 ? `${getDaysUntil(wedding.date)} days to go` : 'Today is the day! 🎉'}
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── KPI Card ─── */
function KpiCard({ icon, colorClass, value, label, sub }: any) {
  return (
    <div className={`kpi-card ${colorClass}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-info">
        <div className="kpi-value">{value}</div>
        <div className="kpi-label">{label}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  );
}

/* ─── Donut Chart (SVG) ─── */
function DonutChart({ confirmed, pending, declined, total }: any) {
  const r = 70, cx = 90, cy = 90;
  const circ = 2 * Math.PI * r;

  const confPct = total > 0 ? confirmed / total : 0;
  const pendPct = total > 0 ? pending    / total : 0;
  const declPct = total > 0 ? declined   / total : 0;

  const segments = [
    { pct: confPct, color: '#10B981', offset: 0 },
    { pct: pendPct, color: '#F59E0B', offset: confPct },
    { pct: declPct, color: '#E24B6D', offset: confPct + pendPct },
  ];

  return (
    <svg viewBox="0 0 180 180" className="donut-svg">
      {/* Background ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="22" />
      {/* Segments */}
      {segments.map((seg, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={seg.color}
          strokeWidth="22"
          strokeDasharray={`${seg.pct * circ} ${circ}`}
          strokeDashoffset={-seg.offset * circ}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="round"
        />
      ))}
      {/* Center text */}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="24" fontWeight="700" fill="#1E1618">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="12" fill="#9A8E92">Total Guests</text>
    </svg>
  );
}

/* ─── Budget Donut ─── */
function BudgetDonut({ spent, reserved, remaining, total }: any) {
  const r = 60, cx = 80, cy = 80;
  const circ = 2 * Math.PI * r;
  const safeTotal = Math.max(1, Number(total || 0));
  const spentPct = Math.max(0, spent) / safeTotal;
  const resPct   = Math.max(0, reserved) / safeTotal;
  const remPct   = Math.max(0, remaining) / safeTotal;

  const segs = [
    { pct: spentPct, color: '#E24B6D', offset: 0 },
    { pct: resPct,   color: '#F59E0B', offset: spentPct },
    { pct: remPct,   color: '#D1D5DB', offset: spentPct + resPct },
  ];

  return (
    <svg viewBox="0 0 160 160" className="budget-donut-svg">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="20" />
      {segs.map((seg, i) => (
        <circle
          key={i}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={seg.color}
          strokeWidth="20"
          strokeDasharray={`${seg.pct * circ} ${circ}`}
          strokeDashoffset={-seg.offset * circ}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      ))}
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="10" fill="#9A8E92">Total Budget</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1E1618">{formatCurrency(total).replace('LKR', '').trim()}</text>
    </svg>
  );
}

/* ─── Ring Progress ─── */
function RingProgress({ pct }: { pct: number }) {
  const r = 50, cx = 60, cy = 60;
  const circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 120 120" className="ring-svg">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="14" />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#10B981"
        strokeWidth="14"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeDashoffset={circ / 4}
        transform={`rotate(-90 ${cx} ${cy})`}
        strokeLinecap="round"
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="700" fill="#1E1618">{pct}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#9A8E92">Completed</text>
    </svg>
  );
}

/* ─── Mini Task Item ─── */
function MiniTask({ done, label, status, statusClass }: any) {
  return (
    <div className="mini-task">
      <div className={`mini-task-check ${done ? 'mini-task-done' : ''}`}>
        {done && <Check size={10} />}
      </div>
      <span className={`mini-task-label ${done ? 'mini-task-strikethrough' : ''}`}>{label}</span>
      <span className={`mini-task-status ${statusClass || (done ? 'status-done' : '')}`}>{status}</span>
    </div>
  );
}

/* ─── Empty State Panel ─── */
function EmptyStatePanel({ icon, title, description, cta, onCta }: any) {
  return (
    <div className="empty-state-panel">
      <div className="empty-state-icon-wrap">{icon}</div>
      <h4>{title}</h4>
      <p>{description}</p>
      {cta && <button className="btn btn-primary" onClick={onCta}><UserPlus size={15} /> {cta}</button>}
    </div>
  );
}

/* ════════════════════════════════════════
   THEME & DESIGN MODULE
════════════════════════════════════════ */
function ThemeDesignModule({ wedding, setWedding }: any) {
  const [theme, setTheme] = useState<InvitationTheme>(() => normalizeInvitationTheme(wedding.theme));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const selectPalette = (presetId: string) => {
    const preset = PALETTE_PRESETS.find(item => item.id === presetId);
    if (!preset) return;
    setTheme(prev => ({
      ...prev,
      palettePreset: preset.id,
      ...preset.colors,
    }));
    setSaved(false);
  };

  const selectFont = (presetId: string) => {
    const preset = FONT_PRESETS.find(item => item.id === presetId);
    if (!preset) return;
    setTheme(prev => ({
      ...prev,
      fontPreset: preset.id,
      headingFont: preset.headingFont,
      bodyFont: preset.bodyFont,
    }));
    setSaved(false);
  };

  const previewWedding = {
    ...wedding,
    theme,
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/weddings/${wedding.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme }),
      });
      if (!res.ok) throw new Error('Failed to save theme');
      const updated = await res.json();
      setWedding(updated);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err?.message || 'Unable to save theme changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const spec = buildThemeSpecMarkdown(wedding, theme);
    const blob = new Blob([spec], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${wedding.slug || 'wedding'}-theme-spec.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="module">
      <div className="module-header">
        <div>
          <p className="eyebrow">Invitation Styling</p>
          <h1 className="module-title">Theme &amp; Design</h1>
          <p className="module-subtitle">Choose invitation palettes and font pairings, preview the result, and export a shareable design spec.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={handleExport}>
            <Download size={16} /> Export Spec
          </button>
          <button className="btn btn-primary" onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Saving...' : saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Theme</>}
          </button>
        </div>
      </div>

      {(saved || error) && (
        <div className="success-banner" style={error ? { color: 'var(--adm-danger)', borderColor: 'var(--adm-danger-bg)', background: 'var(--adm-danger-bg)' } : undefined}>
          {error || <><Check size={16} /> Theme saved successfully.</>}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 20 }}>
          <div className="card settings-card">
            <div className="settings-section-header">
              <Palette size={18} style={{ color: 'var(--adm-primary)' }} /><h3>Palette Presets</h3>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {PALETTE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  className={`theme-preset-btn ${theme.palettePreset === preset.id ? 'active' : ''}`}
                  onClick={() => selectPalette(preset.id)}
                >
                  <span className="theme-preset-copy">
                    <strong>{preset.name}</strong>
                    <span>{preset.description}</span>
                  </span>
                  <span className="theme-swatches" aria-hidden="true">
                    {Object.values(preset.colors).slice(0, 4).map(color => (
                      <span key={color} className="theme-swatch" style={{ background: color }} />
                    ))}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="card settings-card">
            <div className="settings-section-header">
              <TypeSampleIcon /><h3>Font Pairings</h3>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {FONT_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  className={`theme-preset-btn ${theme.fontPreset === preset.id ? 'active' : ''}`}
                  onClick={() => selectFont(preset.id)}
                >
                  <span className="theme-preset-copy">
                    <strong style={{ fontFamily: preset.headingFont }}>{preset.name}</strong>
                    <span>{preset.description}</span>
                  </span>
                  <span className="theme-font-sample" style={{ fontFamily: preset.headingFont }}>Aa</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card settings-card" style={{ background: theme.surfaceColor }}>
          <div className="settings-section-header">
            <Eye size={18} style={{ color: theme.primaryColor }} /><h3>Live Preview</h3>
          </div>
          <InvitationPreview wedding={previewWedding} />
        </div>
      </div>
    </section>
  );
}

function TypeSampleIcon() {
  return <span style={{ color: 'var(--adm-primary)', fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 18 }}>Aa</span>;
}

function buildThemeSpecMarkdown(wedding: any, theme: InvitationTheme) {
  const palette = PALETTE_PRESETS.find(item => item.id === theme.palettePreset);
  const font = FONT_PRESETS.find(item => item.id === theme.fontPreset);
  const title = wedding.weddingTitle || `${wedding.brideName || 'Bride'} & ${wedding.groomName || 'Groom'}`;

  return `# ${title} Theme Spec

Generated from WedPlan Theme & Design on ${new Date().toLocaleString()}.

## Selected Presets

- Palette: ${palette?.name || theme.palettePreset}
- Font pairing: ${font?.name || theme.fontPreset}

## Palette

| Token | Value |
| --- | --- |
| Primary | ${theme.primaryColor} |
| Secondary | ${theme.secondaryColor} |
| Accent | ${theme.accentColor} |
| Surface | ${theme.surfaceColor} |
| Text | ${theme.textColor} |
| Muted text | ${theme.mutedTextColor} |

## Fonts

| Role | Stack |
| --- | --- |
| Headings | ${theme.headingFont} |
| Body | ${theme.bodyFont} |

## Usage Notes

- Hero: use primary for invitation labels and secondary for romantic highlights.
- Cards: use surface backgrounds with primary-tinted borders and soft shadows.
- Buttons: use primary backgrounds for the main RSVP action and secondary accents for supporting details.
- Labels: use secondary or primary in uppercase microcopy for section headers.
- Public invitation sections: keep spacing and responsive layout unchanged when applying theme tokens.
`;
}

/* ════════════════════════════════════════
   AGENDA MODULE
════════════════════════════════════════ */
const AGENDA_ICON_OPTIONS = [
  { value: 'CalendarDays', label: 'Calendar' },
  { value: 'Ring', label: 'Ceremony' },
  { value: 'GlassWater', label: 'Toast' },
  { value: 'Music', label: 'Music' },
  { value: 'MapPin', label: 'Venue' },
  { value: 'PartyPopper', label: 'Party' },
];

function AgendaModule({ wedding, agenda, setAgenda }: any) {
  const [events, setEvents] = useState<AgendaEventRecord[]>(agenda || []);
  const [draft, setDraft] = useState(() => createAgendaDraft(wedding));
  const [editingId, setEditingId] = useState('');
  const [draggingId, setDraggingId] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadAgenda() {
      try {
        const res = await fetch(`/api/weddings/${wedding.id}/agenda`);
        if (!res.ok) throw new Error('Failed to load agenda');
        const data = await res.json();
        if (!mounted) return;
        setEvents(data);
        setAgenda(data);
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Unable to load agenda.');
      }
    }
    void loadAgenda();
    return () => { mounted = false; };
  }, [wedding.id, setAgenda]);

  const validation = validateAgendaEvents(events, wedding);
  const draftError = validateAgendaDraft(draft);
  const printableMarkdown = buildAgendaMarkdown(wedding, events);

  const showMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2400);
  };

  const persistOrder = async (orderedEvents: AgendaEventRecord[]) => {
    const normalized = orderedEvents.map((event, sortOrder) => ({ ...event, sortOrder }));
    setEvents(normalized);
    setAgenda(normalized);
    try {
      const res = await fetch(`/api/weddings/${wedding.id}/agenda`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: normalized.map(event => event.id) }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setEvents(updated);
      setAgenda(updated);
      showMessage('Timeline order saved.');
    } catch (err: any) {
      setError(err?.message || 'Unable to save agenda order.');
    }
  };

  const moveEvent = (eventId: string, direction: -1 | 1) => {
    const index = events.findIndex(event => event.id === eventId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= events.length) return;
    const ordered = [...events];
    const [moved] = ordered.splice(index, 1);
    ordered.splice(nextIndex, 0, moved);
    void persistOrder(ordered);
  };

  const onDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    const from = events.findIndex(event => event.id === draggingId);
    const to = events.findIndex(event => event.id === targetId);
    if (from < 0 || to < 0) return;
    const ordered = [...events];
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    setDraggingId('');
    void persistOrder(ordered);
  };

  const saveEvent = async (payload: any, id?: string) => {
    const validationError = validateAgendaDraft(payload);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await fetch(id ? `/api/agenda/${id}` : `/api/weddings/${wedding.id}/agenda`, {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      const nextEvents = id
        ? events.map(event => event.id === id ? saved : event)
        : [...events, saved];
      setEvents(nextEvents.sort((a, b) => a.sortOrder - b.sortOrder));
      setAgenda(nextEvents.sort((a, b) => a.sortOrder - b.sortOrder));
      setDraft(createAgendaDraft(wedding));
      setEditingId('');
      showMessage(id ? 'Timeline item updated.' : 'Timeline item added.');
    } catch (err: any) {
      setError(err?.message || 'Unable to save timeline item.');
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Delete this timeline item?')) return;
    setError('');
    try {
      const res = await fetch(`/api/agenda/${eventId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      const nextEvents = events.filter(event => event.id !== eventId).map((event, sortOrder) => ({ ...event, sortOrder }));
      setEvents(nextEvents);
      setAgenda(nextEvents);
      showMessage('Timeline item deleted.');
    } catch (err: any) {
      setError(err?.message || 'Unable to delete timeline item.');
    }
  };

  const copySchedule = async () => {
    try {
      await navigator.clipboard.writeText(printableMarkdown);
      showMessage('Printable schedule copied.');
    } catch {
      setError('Copy failed. Use Download Schedule instead.');
    }
  };

  const downloadSchedule = () => {
    const blob = new Blob([printableMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${wedding.slug || 'wedding'}-schedule.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="module agenda-module">
      <div className="module-header">
        <div>
          <p className="eyebrow">Planning</p>
          <h1 className="module-title">Agenda &amp; Timeline</h1>
          <p className="module-subtitle">Build the wedding day order, validate time ranges and timezone consistency, then print or share a clean schedule.</p>
        </div>
        <div className="agenda-actions">
          <button className="btn btn-outline" onClick={copySchedule}><Copy size={16} /> Copy</button>
          <button className="btn btn-outline" onClick={downloadSchedule}><FileText size={16} /> Download</button>
          <button className="btn btn-primary" onClick={() => window.print()}><Printer size={16} /> Print</button>
        </div>
      </div>

      {(message || error || validation.messages.length > 0) && (
        <div className="agenda-alert-stack">
          {(message || error) && (
            <div className="success-banner" style={error ? { color: 'var(--adm-danger)', borderColor: 'var(--adm-danger-bg)', background: 'var(--adm-danger-bg)' } : undefined}>
              {error || <><Check size={16} /> {message}</>}
            </div>
          )}
          {validation.messages.map((item: string) => (
            <div key={item} className="agenda-warning"><AlertCircle size={16} /> {item}</div>
          ))}
        </div>
      )}

      <div className="agenda-layout">
        <div className="card settings-card agenda-form-card">
          <div className="settings-section-header">
            <CalendarDays size={18} style={{ color: 'var(--adm-primary)' }} /><h3>Add Timeline Item</h3>
          </div>
          <AgendaEditor
            value={draft}
            saving={saving}
            submitLabel="Add Item"
            error={draftError}
            onChange={setDraft}
            onSubmit={() => void saveEvent(draft)}
          />
        </div>

        <div className="agenda-stack">
          <div className="agenda-status-row">
            <span className={`badge ${validation.isValid ? 'badge-green' : 'badge-amber'}`}>
              {validation.isValid ? 'Schedule valid' : `${validation.messages.length} issue${validation.messages.length === 1 ? '' : 's'}`}
            </span>
            <span className="agenda-timezone-chip">{wedding.timezone || 'No wedding timezone'}</span>
          </div>

          {events.length === 0 ? (
            <div className="card">
              <EmptyStatePanel
                icon={<CalendarDays size={40} />}
                title="No agenda items yet"
                description="Add the ceremony, reception, photos, speeches, and vendor handoff moments to create a usable day-of schedule."
              />
            </div>
          ) : (
            <div className="agenda-list">
              {events.map((event, index) => {
                const isEditing = editingId === event.id;
                return (
                  <article
                    key={event.id}
                    className={`agenda-item ${draggingId === event.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => setDraggingId(event.id)}
                    onDragEnd={() => setDraggingId('')}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => onDrop(event.id)}
                  >
                    <div className="agenda-drag-handle" title="Drag to reorder"><GripVertical size={18} /></div>
                    <div className="agenda-time-block">
                      <strong>{event.startTime}</strong>
                      <span>{event.endTime}</span>
                    </div>
                    <div className="agenda-item-body">
                      {isEditing ? (
                        <AgendaEditor
                          value={event}
                          saving={saving}
                          submitLabel="Save Item"
                          error={validateAgendaDraft(event)}
                          onChange={(next: AgendaEventRecord) => setEvents(prev => prev.map(item => item.id === event.id ? { ...item, ...next } : item))}
                          onSubmit={() => void saveEvent(event, event.id)}
                          onCancel={() => setEditingId('')}
                        />
                      ) : (
                        <>
                          <div className="agenda-item-title-row">
                            <h3><span aria-hidden="true">{agendaIconText(event.icon)}</span>{event.title}</h3>
                            <span className="badge badge-slate">{formatAgendaDuration(event)}</span>
                          </div>
                          <div className="agenda-meta">
                            <span><Clock size={14} /> {event.startTime}-{event.endTime}</span>
                            <span><MapPin size={14} /> {event.location || wedding.venueName || 'Venue TBD'}</span>
                            <span><CalendarDays size={14} /> {event.timezone || wedding.timezone}</span>
                          </div>
                          {event.description && <p className="agenda-description">{event.description}</p>}
                        </>
                      )}
                    </div>
                    {!isEditing && (
                      <div className="agenda-item-actions">
                        <button className="table-action-btn" title="Move item up" disabled={index === 0} onClick={() => moveEvent(event.id, -1)}><ArrowUp size={14} /></button>
                        <button className="table-action-btn" title="Move item down" disabled={index === events.length - 1} onClick={() => moveEvent(event.id, 1)}><ArrowDown size={14} /></button>
                        <button className="table-action-btn" title="Edit item" onClick={() => setEditingId(event.id)}><Edit3 size={14} /></button>
                        <button className="table-action-btn" title="Delete item" onClick={() => void deleteEvent(event.id)}><Trash2 size={14} /></button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          <div className="card agenda-print-preview">
            <div className="settings-section-header">
              <Printer size={18} style={{ color: 'var(--adm-primary)' }} /><h3>Printable Schedule</h3>
            </div>
            <pre>{printableMarkdown}</pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function AgendaEditor({ value, saving, submitLabel, error, onChange, onSubmit, onCancel }: any) {
  const update = (patch: Record<string, string>) => onChange({ ...value, ...patch });
  return (
    <form className="agenda-editor" onSubmit={event => { event.preventDefault(); onSubmit(); }}>
      <div className="form-grid-3">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" value={value.title || ''} onChange={event => update({ title: event.target.value })} placeholder="Ceremony" required />
        </div>
        <div className="form-group">
          <label className="form-label">Start</label>
          <input className="form-input" type="time" value={value.startTime || ''} onChange={event => update({ startTime: event.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">End</label>
          <input className="form-input" type="time" value={value.endTime || ''} onChange={event => update({ endTime: event.target.value })} required />
        </div>
      </div>
      <div className="form-grid-3">
        <div className="form-group">
          <label className="form-label">Timezone</label>
          <input className="form-input" value={value.timezone || ''} onChange={event => update({ timezone: event.target.value })} placeholder="Asia/Colombo" required />
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="form-input" value={value.location || ''} onChange={event => update({ location: event.target.value })} placeholder="Garden lawn" />
        </div>
        <div className="form-group">
          <label className="form-label">Icon</label>
          <select className="form-input" value={value.icon || 'CalendarDays'} onChange={event => update({ icon: event.target.value })}>
            {AGENDA_ICON_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-input" rows={3} value={value.description || ''} onChange={event => update({ description: event.target.value })} placeholder="Vendor cues, guest instructions, or family notes" />
      </div>
      {error && <div className="agenda-inline-error"><AlertCircle size={14} /> {error}</div>}
      <div className="agenda-editor-actions">
        {onCancel && <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>}
        <button type="submit" className="btn btn-primary" disabled={saving || !!error}>
          {saving ? 'Saving...' : <><Save size={16} /> {submitLabel}</>}
        </button>
      </div>
    </form>
  );
}

function createAgendaDraft(wedding: any) {
  const startTime = wedding.time || '16:00';
  return {
    title: '',
    startTime,
    endTime: addMinutesToClock(startTime, 30),
    timezone: wedding.timezone || 'UTC',
    location: wedding.venueName || '',
    description: '',
    icon: 'CalendarDays',
  };
}

function validateAgendaDraft(event: any) {
  const start = String(event.startTime || '');
  const end = String(event.endTime || '');
  if (!String(event.title || '').trim()) return 'Title is required.';
  if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) return 'Start and end times are required.';
  if (clockMinutes(end) <= clockMinutes(start)) return 'End time must be after start time.';
  if (!isBrowserValidTimezone(String(event.timezone || ''))) return 'Use a valid IANA timezone such as Asia/Colombo.';
  return '';
}

function validateAgendaEvents(events: AgendaEventRecord[], wedding: any) {
  const messages: string[] = [];
  events.forEach((event, index) => {
    const itemError = validateAgendaDraft(event);
    if (itemError) messages.push(`${event.title || `Item ${index + 1}`}: ${itemError}`);
    if (wedding.timezone && event.timezone !== wedding.timezone) {
      messages.push(`${event.title}: timezone ${event.timezone} differs from wedding timezone ${wedding.timezone}.`);
    }
    const prev = events[index - 1];
    if (prev && clockMinutes(event.startTime) < clockMinutes(prev.endTime)) {
      messages.push(`${event.title} starts before ${prev.title} ends.`);
    }
  });
  return { isValid: messages.length === 0, messages };
}

function isBrowserValidTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function clockMinutes(value: string) {
  const [hours, minutes] = String(value || '00:00').split(':').map(Number);
  return (hours * 60) + minutes;
}

function addMinutesToClock(value: string, minutesToAdd: number) {
  const total = Math.min(1439, Math.max(0, clockMinutes(value) + minutesToAdd));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function formatAgendaDuration(event: AgendaEventRecord) {
  const total = Math.max(0, clockMinutes(event.endTime) - clockMinutes(event.startTime));
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

function agendaIconText(icon: string) {
  const map: Record<string, string> = {
    CalendarDays: 'Cal',
    Ring: 'Cer',
    GlassWater: 'Tst',
    Music: 'Mus',
    MapPin: 'Map',
    PartyPopper: 'Fun',
  };
  return map[icon] || 'Cal';
}

function buildAgendaMarkdown(wedding: any, events: AgendaEventRecord[]) {
  const title = wedding.weddingTitle || `${wedding.brideName || 'Wedding'} & ${wedding.groomName || 'Celebration'}`;
  const lines = [
    `# ${title} Schedule`,
    '',
    `Date: ${wedding.date || 'TBD'}`,
    `Timezone: ${wedding.timezone || events[0]?.timezone || 'TBD'}`,
    `Venue: ${wedding.venueName || 'TBD'}`,
    '',
    '| Time | Event | Location | Notes |',
    '| --- | --- | --- | --- |',
    ...events.map(event => `| ${event.startTime}-${event.endTime} | ${event.title} | ${event.location || '-'} | ${(event.description || '-').replace(/\|/g, '/')} |`),
  ];
  return lines.join('\n');
}

/* ════════════════════════════════════════
   GALLERY MODULE
════════════════════════════════════════ */
function GalleryModule({ wedding }: any) {
  const [images, setImages] = useState<GalleryImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [coupleUploading, setCoupleUploading] = useState(false);
  const [savingId, setSavingId] = useState('');
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [specialNoteText, setSpecialNoteText] = useState<string>(wedding.specialNoteText || '');
  const [noteSaving, setNoteSaving] = useState(false);

  const heroImage = images.find(img => (img as any).imageType === 'hero');
  const couplePhoto = images.find(img => (img as any).imageType === 'couple');
  const galleryOnly = images.filter(img => (img as any).imageType !== 'hero' && (img as any).imageType !== 'couple');

  useEffect(() => {
    let mounted = true;
    async function loadGallery() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/weddings/${wedding.id}/gallery`);
        if (!res.ok) throw new Error('Failed to load gallery');
        const data = await res.json();
        if (!mounted) return;
        setImages(data);
        setAltDrafts(Object.fromEntries(data.map((image: GalleryImageRecord) => [image.id, image.altText || ''])));
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Unable to load gallery images.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void loadGallery();
    return () => { mounted = false; };
  }, [wedding.id]);

  const showMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2400);
  };

  const saveNoteText = async () => {
    setNoteSaving(true);
    try {
      await patchWeddingRecord(wedding.id, { specialNoteText });
      showMessage('Special note saved.');
    } catch {
      setError('Unable to save special note.');
    } finally {
      setNoteSaving(false);
    }
  };

  const handleCouplePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB.'); return; }
    setCoupleUploading(true);
    try {
      const compressed = await compressGalleryImage(file);
      const res = await fetch(`/api/weddings/${wedding.id}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: compressed.dataUrl, imageType: 'couple', fileName: file.name, width: compressed.width, height: compressed.height }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      setImages(prev => [created, ...prev.filter(img => (img as any).imageType !== 'couple')]);
      showMessage('Couple photo saved.');
    } catch (err: any) {
      setError(err?.message || 'Unable to upload couple photo.');
    } finally {
      setCoupleUploading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    setMessage('');
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressGalleryImage(file);
      const res = await fetch(`/api/weddings/${wedding.id}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: compressed.dataUrl,
          altText: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
          fileName: file.name,
          width: compressed.width,
          height: compressed.height,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      setImages(prev => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
      setAltDrafts(prev => ({ ...prev, [created.id]: created.altText || '' }));
      showMessage('Gallery image uploaded.');
    } catch (err: any) {
      setError(err?.message || 'Unable to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleHeroUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    setMessage('');
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }

    setHeroUploading(true);
    try {
      const compressed = await compressGalleryImage(file);
      const res = await fetch(`/api/weddings/${wedding.id}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: compressed.dataUrl,
          imageType: 'hero',
          fileName: file.name,
          width: compressed.width,
          height: compressed.height,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      // Replace any existing hero, then keep gallery images as-is.
      setImages(prev => [created, ...prev.filter(img => (img as any).imageType !== 'hero')]);
      showMessage('Hero image saved.');
    } catch (err: any) {
      setError(err?.message || 'Unable to upload hero image.');
    } finally {
      setHeroUploading(false);
    }
  };

  const saveAltText = async (imageId: string) => {
    setSavingId(imageId);
    setError('');
    try {
      const res = await fetch(`/api/gallery/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ altText: altDrafts[imageId] || '' }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setImages(prev => prev.map(image => image.id === updated.id ? updated : image));
      showMessage('Alt text saved.');
    } catch (err: any) {
      setError(err?.message || 'Unable to save alt text.');
    } finally {
      setSavingId('');
    }
  };

  const reorder = async (imageId: string, direction: -1 | 1) => {
    const index = images.findIndex(image => image.id === imageId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= images.length) return;

    const ordered = [...images];
    const [moved] = ordered.splice(index, 1);
    ordered.splice(nextIndex, 0, moved);
    setImages(ordered.map((image, sortOrder) => ({ ...image, sortOrder })));

    try {
      const res = await fetch(`/api/weddings/${wedding.id}/gallery`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: ordered.map(image => image.id) }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setImages(updated);
      showMessage('Gallery order saved.');
    } catch (err: any) {
      setError(err?.message || 'Unable to reorder gallery.');
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm('Delete this gallery image?')) return;
    setError('');
    try {
      const res = await fetch(`/api/gallery/${imageId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      setImages(prev => prev.filter(image => image.id !== imageId).map((image, sortOrder) => ({ ...image, sortOrder })));
      setAltDrafts(prev => {
        const next = { ...prev };
        delete next[imageId];
        return next;
      });
      showMessage('Gallery image deleted.');
    } catch (err: any) {
      setError(err?.message || 'Unable to delete image.');
    }
  };

  return (
    <section className="module">
      <div className="module-header">
        <div>
          <p className="eyebrow">Media Library</p>
          <h1 className="module-title">Gallery</h1>
          <p className="module-subtitle">Upload compressed gallery images, manage alt text, and control display order for the invitation gallery.</p>
        </div>
        <label className="btn btn-primary" style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
          <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Image'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {(message || error) && (
        <div className="success-banner" style={error ? { color: 'var(--adm-danger)', borderColor: 'var(--adm-danger-bg)', background: 'var(--adm-danger-bg)' } : undefined}>
          {error || <><Check size={16} /> {message}</>}
        </div>
      )}

      {/* Hero Section Image */}
      <div className="card settings-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Thumbnail */}
          <div style={{ position: 'relative', width: 120, height: 80, borderRadius: 10, overflow: 'hidden', background: '#f8ebe4', flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage?.imageUrl || '/images/default-hero.jpg'}
              alt={heroImage ? 'Invitation hero' : 'Default invitation hero'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {heroImage && (
              <button
                className="table-action-btn"
                title="Remove hero image"
                aria-label="Remove hero image"
                onClick={() => void deleteImage(heroImage.id)}
                style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(255,255,255,0.9)', padding: 3 }}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
          {/* Text + action */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="eyebrow">Invitation Hero</p>
            <h2 className="module-title" style={{ fontSize: '1rem', margin: '2px 0 2px' }}>Hero Section Image</h2>
            <p className="module-subtitle" style={{ margin: '0 0 10px', fontSize: '0.82rem' }}>
              {heroImage ? 'Your hero image' : 'Default image shown'} — full-screen background on the invitation.
            </p>
            <label className="btn btn-primary" style={{ cursor: heroUploading ? 'not-allowed' : 'pointer', fontSize: '0.82rem', padding: '7px 14px' }}>
              <Upload size={14} /> {heroUploading ? 'Uploading...' : heroImage ? 'Replace' : 'Upload Hero'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleHeroUpload} disabled={heroUploading} />
            </label>
          </div>
        </div>
      </div>

      {/* Special Note Section */}
      <div className="card settings-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          {/* Couple photo thumbnail */}
          <div style={{ position: 'relative', width: 120, height: 80, borderRadius: 10, overflow: 'hidden', background: '#f8ebe4', flexShrink: 0 }}>
            {couplePhoto ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={couplePhoto.imageUrl} alt="Couple photo" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <button className="table-action-btn" title="Remove couple photo" onClick={() => void deleteImage(couplePhoto.id)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(255,255,255,0.9)', padding: 3 }}>
                  <Trash2 size={12} />
                </button>
              </>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--adm-text-secondary)', fontSize: '0.72rem', textAlign: 'center', padding: 4 }}>No photo</div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <p className="eyebrow">Special Note</p>
            <h2 className="module-title" style={{ fontSize: '1rem', margin: '2px 0 2px' }}>Message to Guests</h2>
            <p className="module-subtitle" style={{ margin: '0 0 10px', fontSize: '0.82rem' }}>Shown on the invitation with a photo of you two.</p>
            <label className="btn btn-primary" style={{ cursor: coupleUploading ? 'not-allowed' : 'pointer', fontSize: '0.82rem', padding: '7px 14px' }}>
              <Upload size={14} /> {coupleUploading ? 'Uploading…' : couplePhoto ? 'Replace Photo' : 'Upload Couple Photo'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCouplePhotoUpload} disabled={coupleUploading} />
            </label>
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Message text</label>
          <textarea
            className="form-input"
            rows={4}
            style={{ resize: 'vertical', fontFamily: 'inherit' }}
            value={specialNoteText}
            onChange={e => setSpecialNoteText(e.target.value)}
            placeholder="Write a personal message to your guests…"
          />
        </div>
        <button className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '7px 18px' }} onClick={() => void saveNoteText()} disabled={noteSaving}>
          <Save size={14} /> {noteSaving ? 'Saving…' : 'Save Note'}
        </button>
      </div>

      {loading ? (
        <div className="card">
          <p className="module-subtitle" style={{ margin: 0 }}>Loading gallery images...</p>
        </div>
      ) : galleryOnly.length === 0 ? (
        <div className="card">
          <EmptyStatePanel
            icon={<Grid3x3 size={40} />}
            title="No gallery images yet"
            description="Upload a few favorite photos now. Public gallery rendering will be connected in the next task."
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {galleryOnly.map((image, index) => (
            <article key={image.id} className="card settings-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: 110, background: '#f8ebe4' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.imageUrl}
                  alt={image.altText || 'Wedding gallery image'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <span className="badge badge-slate" style={{ position: 'absolute', top: 6, left: 6, fontSize: '0.68rem', padding: '2px 8px' }}>#{index + 1}</span>
              </div>
              <div style={{ padding: 10, display: 'grid', gap: 6 }}>
                <input
                  className="form-input"
                  style={{ fontSize: '0.78rem', padding: '5px 8px' }}
                  value={altDrafts[image.id] || ''}
                  onChange={event => setAltDrafts(prev => ({ ...prev, [image.id]: event.target.value }))}
                  onBlur={() => void saveAltText(image.id)}
                  placeholder="Alt text"
                />
                <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {image.width || '?'}×{image.height || '?'} · {formatBytes(image.sizeBytes)}
                </div>
                <div className="table-actions" style={{ justifyContent: 'space-between' }}>
                  <div className="table-actions" style={{ gap: 4 }}>
                    <button className="table-action-btn" title="Move up" aria-label="Move image up" disabled={index === 0} onClick={() => void reorder(image.id, -1)}>
                      <ArrowUp size={12} />
                    </button>
                    <button className="table-action-btn" title="Move down" aria-label="Move image down" disabled={index === galleryOnly.length - 1} onClick={() => void reorder(image.id, 1)}>
                      <ArrowDown size={12} />
                    </button>
                  </div>
                  <div className="table-actions" style={{ gap: 4 }}>
                    <button className="table-action-btn" title="Save alt text" aria-label="Save alt text" disabled={savingId === image.id} onClick={() => void saveAltText(image.id)}>
                      <Save size={12} />
                    </button>
                    <button className="table-action-btn" title="Delete image" aria-label="Delete image" onClick={() => void deleteImage(image.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function compressGalleryImage(file: File): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Could not load image for compression.'));
      image.onload = () => {
        const maxSide = 1600;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Image compression is unavailable in this browser.'));
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve({ dataUrl, width, height });
      };
      image.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes?: number) {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

/* ════════════════════════════════════════
   BUDGET MODULE
════════════════════════════════════════ */
function BudgetModule({ wedding, initialBudget, setBudget: setParentBudget }: { wedding: any; initialBudget: BudgetResponse | null; setBudget: (budget: BudgetResponse | null) => void }) {
  const [items, setItems] = useState<BudgetItemRecord[]>(initialBudget?.items || []);
  const [categories, setCategories] = useState<string[]>(initialBudget?.categories || BUDGET_CATEGORY_OPTIONS);
  const [scenarioNote, setScenarioNote] = useState(initialBudget?.scenarioNote || '');
  const [loading, setLoading] = useState(!initialBudget);
  const [savingId, setSavingId] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [newItem, setNewItem] = useState({
    category: 'Other',
    name: '',
    estimated: 0,
    actual: 0,
    status: 'planned' as BudgetStatus,
    notes: '',
  });

  const summary = useMemo(() => calculateClientBudget(items, categories), [items, categories]);
  const budgetResponse = useMemo<BudgetResponse>(() => ({
    weddingId: wedding.id,
    scenarioNote,
    items,
    categories,
    statuses: BUDGET_STATUS_OPTIONS,
    ...summary,
  }), [wedding.id, scenarioNote, items, categories, summary]);

  useEffect(() => {
    setParentBudget(budgetResponse);
  }, [budgetResponse, setParentBudget]);

  useEffect(() => {
    let mounted = true;
    async function loadBudget() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/weddings/${wedding.id}/budget`);
        if (!res.ok) throw new Error(await res.text());
        const data: BudgetResponse = await res.json();
        if (!mounted) return;
        setItems(data.items || []);
        setCategories(data.categories || BUDGET_CATEGORY_OPTIONS);
        setScenarioNote(data.scenarioNote || '');
        setParentBudget(data);
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Unable to load budget.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void loadBudget();
    return () => { mounted = false; };
  }, [wedding.id, setParentBudget]);

  const showMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2400);
  };

  const updateDraftItem = (id: string, patch: Partial<BudgetItemRecord>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
  };

  const addItem = async () => {
    setError('');
    setMessage('');
    try {
      const res = await fetch(`/api/weddings/${wedding.id}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      setItems(prev => [...prev, created]);
      setNewItem({ category: 'Other', name: '', estimated: 0, actual: 0, status: 'planned', notes: '' });
      showMessage('Budget item added.');
    } catch (err: any) {
      setError(err?.message || 'Unable to add budget item.');
    }
  };

  const saveItem = async (item: BudgetItemRecord) => {
    setSavingId(item.id);
    setError('');
    try {
      const res = await fetch(`/api/budget/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: item.category,
          name: item.name,
          estimated: item.estimated,
          actual: item.actual,
          status: item.status,
          notes: item.notes,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setItems(prev => prev.map(row => row.id === updated.id ? updated : row));
      showMessage('Budget item saved.');
    } catch (err: any) {
      setError(err?.message || 'Unable to save budget item.');
    } finally {
      setSavingId('');
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this budget item?')) return;
    setError('');
    try {
      const res = await fetch(`/api/budget/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      setItems(prev => prev.filter(item => item.id !== id));
      showMessage('Budget item deleted.');
    } catch (err: any) {
      setError(err?.message || 'Unable to delete budget item.');
    }
  };

  const saveScenarioNote = async () => {
    setSavingNote(true);
    setError('');
    try {
      const res = await fetch(`/api/weddings/${wedding.id}/budget/note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioNote }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setScenarioNote(data.scenarioNote || '');
      showMessage('Scenario note saved.');
    } catch (err: any) {
      setError(err?.message || 'Unable to save scenario note.');
    } finally {
      setSavingNote(false);
    }
  };

  const exportUrl = `/api/weddings/${wedding.id}/budget/export`;

  return (
    <section className="module budget-module">
      <div className="module-header">
        <div>
          <p className="eyebrow">Planning Tools</p>
          <h1 className="module-title">Budget Planner</h1>
          <p className="module-subtitle">Track category budgets, line items, live totals, and planning scenarios in Sri Lankan rupees.</p>
        </div>
        <a className="btn btn-primary" href={exportUrl}>
          <Download size={16} /> Export CSV
        </a>
      </div>

      {(message || error) && (
        <div className="success-banner" style={error ? { color: 'var(--adm-danger)', borderColor: 'var(--adm-danger-bg)', background: 'var(--adm-danger-bg)' } : undefined}>
          {error || <><Check size={16} /> {message}</>}
        </div>
      )}

      {loading ? (
        <div className="card">
          <p className="module-subtitle" style={{ margin: 0 }}>Loading budget planner...</p>
        </div>
      ) : (
        <>
          <div className="budget-total-grid">
            <div className="card budget-total-card">
              <span>Estimated</span>
              <strong>{formatCurrency(summary.totals.estimatedTotal)}</strong>
            </div>
            <div className="card budget-total-card">
              <span>Actual</span>
              <strong>{formatCurrency(summary.totals.actualTotal)}</strong>
            </div>
            <div className="card budget-total-card">
              <span>Paid</span>
              <strong>{formatCurrency(summary.totals.paidTotal)}</strong>
            </div>
            <div className={`card budget-total-card ${summary.totals.remaining < 0 ? 'budget-overrun' : ''}`}>
              <span>{summary.totals.remaining < 0 ? 'Overrun' : 'Remaining'}</span>
              <strong>{formatCurrency(Math.abs(summary.totals.remaining))}</strong>
            </div>
          </div>

          <div className="budget-category-grid">
            {summary.categoryTotals.map(category => (
              <article key={category.category} className="card budget-category-card">
                <div className="budget-category-head">
                  <h3>{category.category}</h3>
                  <span>{category.itemCount} item{category.itemCount === 1 ? '' : 's'}</span>
                </div>
                <div className="budget-category-amounts">
                  <span>Estimated <strong>{formatCurrency(category.estimated)}</strong></span>
                  <span>Actual <strong>{formatCurrency(category.actual)}</strong></span>
                  <span>{category.remaining < 0 ? 'Over' : 'Left'} <strong>{formatCurrency(Math.abs(category.remaining))}</strong></span>
                </div>
                <div className="budget-status-row">
                  <span>Planned {category.plannedCount}</span>
                  <span>Reserved {category.reservedCount}</span>
                  <span>Paid {category.paidCount}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="card budget-add-card">
            <div className="settings-section-header">
              <Plus size={18} style={{ color: 'var(--adm-primary)' }} />
              <h3>Add line item</h3>
            </div>
            <div className="budget-add-grid">
              <select className="form-input" value={newItem.category} onChange={event => setNewItem(prev => ({ ...prev, category: event.target.value }))}>
                {categories.map(category => <option key={category} value={category}>{category}</option>)}
              </select>
              <input className="form-input" value={newItem.name} onChange={event => setNewItem(prev => ({ ...prev, name: event.target.value }))} placeholder="Item name" />
              <input className="form-input" type="number" min="0" value={newItem.estimated} onChange={event => setNewItem(prev => ({ ...prev, estimated: Number(event.target.value || 0) }))} placeholder="Estimated" />
              <input className="form-input" type="number" min="0" value={newItem.actual} onChange={event => setNewItem(prev => ({ ...prev, actual: Number(event.target.value || 0) }))} placeholder="Actual" />
              <select className="form-input" value={newItem.status} onChange={event => setNewItem(prev => ({ ...prev, status: event.target.value as BudgetStatus }))}>
                {BUDGET_STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
              <button className="btn btn-primary" onClick={() => void addItem()}>
                <Plus size={16} /> Add
              </button>
            </div>
            <textarea className="form-input budget-notes-input" value={newItem.notes} onChange={event => setNewItem(prev => ({ ...prev, notes: event.target.value }))} placeholder="Optional item note" />
          </div>

          <div className="card table-card">
            <div className="table-wrapper">
              <table className="data-table budget-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Item</th>
                    <th>Estimated</th>
                    <th>Actual</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <select className="form-input" value={item.category} onChange={event => updateDraftItem(item.id, { category: event.target.value })}>
                          {categories.map(category => <option key={category} value={category}>{category}</option>)}
                        </select>
                      </td>
                      <td><input className="form-input" value={item.name} onChange={event => updateDraftItem(item.id, { name: event.target.value })} /></td>
                      <td><input className="form-input" type="number" min="0" value={item.estimated} onChange={event => updateDraftItem(item.id, { estimated: Number(event.target.value || 0) })} /></td>
                      <td><input className="form-input" type="number" min="0" value={item.actual} onChange={event => updateDraftItem(item.id, { actual: Number(event.target.value || 0) })} /></td>
                      <td>
                        <select className="form-input" value={item.status} onChange={event => updateDraftItem(item.id, { status: event.target.value as BudgetStatus })}>
                          {BUDGET_STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                      <td><textarea className="form-input budget-line-note" value={item.notes || ''} onChange={event => updateDraftItem(item.id, { notes: event.target.value })} /></td>
                      <td>
                        <div className="table-actions">
                          <button className="table-action-btn" title="Save budget item" aria-label="Save budget item" disabled={savingId === item.id} onClick={() => void saveItem(item)}>
                            <Save size={14} />
                          </button>
                          <button className="table-action-btn" title="Delete budget item" aria-label="Delete budget item" onClick={() => void deleteItem(item.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <EmptyStatePanel icon={<Wallet size={40} />} title="No budget items yet" description="Add your first planned cost to start tracking estimated and actual totals." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card settings-card">
            <div className="settings-section-header">
              <FileText size={18} style={{ color: 'var(--adm-primary)' }} />
              <h3>Scenario notes</h3>
            </div>
            <textarea
              className="form-input budget-scenario-note"
              value={scenarioNote}
              onChange={event => setScenarioNote(event.target.value)}
              placeholder="Capture budget scenarios, tradeoffs, or payment assumptions."
            />
            <div style={{ marginTop: 12 }}>
              <button className="btn btn-secondary" disabled={savingNote} onClick={() => void saveScenarioNote()}>
                <Save size={16} /> {savingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

/* ════════════════════════════════════════
   SETTINGS MODULE
════════════════════════════════════════ */
function SettingsModule({ wedding, setWedding }: any) {
  const [formData, setFormData] = useState(wedding);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const updated = await patchWeddingRecord(wedding.id, formData);
      setWedding(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setSaveError(err?.message || 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="module">
      <div className="module-header">
        <div>
          <p className="eyebrow">Configuration</p>
          <h1 className="module-title">Wedding Settings</h1>
          <p className="module-subtitle">Manage your wedding details, venue, and contact information.</p>
        </div>
        <button className="btn btn-primary" onClick={() => void handleSave()} id="save-settings-btn" disabled={saving}>
          {saving ? 'Saving…' : saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      {saved && (
        <div className="success-banner">
          <Check size={16} /> Settings saved successfully.
        </div>
      )}
      {saveError && (
        <div className="success-banner" style={{ color: 'var(--adm-danger)', borderColor: 'var(--adm-danger-bg)', background: 'var(--adm-danger-bg)' }}>
          {saveError}
        </div>
      )}

      <div className="card settings-card">
        <div className="settings-section-header">
          <Heart size={18} style={{ color: 'var(--adm-primary)' }} /><h3>Basic Info</h3>
        </div>
        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">Groom&apos;s Name</label>
            <input type="text" className="form-input" name="groomName" value={formData.groomName || ''} onChange={handleChange} placeholder="Enter name" />
          </div>
          <div className="form-group">
            <label className="form-label">Bride&apos;s Name</label>
            <input type="text" className="form-input" name="brideName" value={formData.brideName || ''} onChange={handleChange} placeholder="Enter name" />
          </div>
          <div className="form-group">
            <label className="form-label">Wedding Title</label>
            <input type="text" className="form-input" name="weddingTitle" value={formData.weddingTitle || ''} onChange={handleChange} placeholder="E.g. Priya & Kasun" />
          </div>
        </div>
      </div>

      <div className="card settings-card">
        <div className="settings-section-header">
          <CalendarDays size={18} style={{ color: 'var(--adm-primary)' }} /><h3>Event Details</h3>
        </div>
        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" name="date" value={formData.date || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Time</label>
            <input type="time" className="form-input" name="time" value={formData.time || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">RSVP Deadline</label>
            <input type="date" className="form-input" name="rsvpDeadline" value={formData.rsvpDeadline || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Venue Name</label>
            <input type="text" className="form-input" name="venueName" value={formData.venueName || ''} onChange={handleChange} placeholder="Enter venue" />
          </div>
          <div className="form-group">
            <label className="form-label">Venue Address</label>
            <input type="text" className="form-input" name="venueAddress" value={formData.venueAddress || ''} onChange={handleChange} placeholder="Full address" />
          </div>
          <div className="form-group">
            <label className="form-label">Google Maps Link</label>
            <input type="url" className="form-input" name="venueMapLink" value={formData.venueMapLink || ''} onChange={handleChange} placeholder="https://maps.google.com/..." />
          </div>
        </div>
      </div>

      <div className="card settings-card">
        <div className="settings-section-header">
          <Mail size={18} style={{ color: 'var(--adm-primary)' }} /><h3>Contact &amp; Slug</h3>
        </div>
        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">Contact Email</label>
            <input type="email" className="form-input" name="contactEmail" value={formData.contactEmail || ''} onChange={handleChange} placeholder="hello@yourwedding.com" />
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp Number</label>
            <input type="tel" className="form-input" name="contactWhatsApp" value={formData.contactWhatsApp || ''} onChange={handleChange} placeholder="+94771234567" />
          </div>
          <div className="form-group">
            <label className="form-label">Public Slug</label>
            <input type="text" className="form-input" name="slug" value={formData.slug || ''} onChange={handleChange} placeholder="priya-and-kasun" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════
   GUESTS MODULE
════════════════════════════════════════ */
function GuestsModule({ wedding, guests, setGuests, rsvps }: any) {
  const [filter, setFilter] = useState<'all' | 'bride' | 'groom' | 'confirmed' | 'pending' | 'declined'>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', side: 'Groom', whatsapp: '', type: 'Individual', maxMembers: 1, notes: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null);

  function copyInviteLink(guestToken: string, guestId: string) {
    const link = `${window.location.origin}/invitation/${wedding?.slug}?token=${guestToken}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedGuestId(guestId);
      setTimeout(() => setCopiedGuestId(null), 2000);
      // Mark the invite as sent so status column reflects it
      fetch(`/api/guests/${guestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteSentAt: new Date().toISOString() }),
      }).then(async res => {
        if (res.ok) {
          const updated = await res.json();
          setGuests((prev: any[]) => prev.map((g: any) => g.id === guestId ? { ...g, ...updated } : g));
        }
      }).catch(() => {/* non-blocking */});
    });
  }

  const filtered = guests.filter((g: any) => {
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase());
    const rsvp = rsvps.find((r: any) => r.guestId === g.id);
    let matchFilter = true;
    if (filter === 'bride')     matchFilter = g.side === 'Bride';
    if (filter === 'groom')     matchFilter = g.side === 'Groom';
    if (filter === 'confirmed') matchFilter = rsvp?.attending === true;
    if (filter === 'pending')   matchFilter = !rsvp;
    if (filter === 'declined')  matchFilter = rsvp?.attending === false;
    return matchSearch && matchFilter;
  });

  const openModal = (guest?: any) => {
    setErrorMsg('');
    if (guest) {
      setEditingGuest(guest);
      setFormData({ name: guest.name, side: guest.side, whatsapp: guest.whatsapp, type: guest.type, maxMembers: guest.maxMembers, notes: guest.notes || '' });
    } else {
      setEditingGuest(null);
      setFormData({ name: '', side: 'Groom', whatsapp: '', type: 'Individual', maxMembers: 1, notes: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGuest(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.maxMembers < 1 || formData.maxMembers > 20) {
      setErrorMsg('Max members must be between 1 and 20.');
      return;
    }
    setIsSaving(true);
    setErrorMsg('');

    try {
      if (editingGuest) {
        const res = await fetch(`/api/guests/${editingGuest.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error(await res.text());
        const updated = await res.json();
        setGuests(guests.map((g: any) => g.id === updated.id ? updated : g));
      } else {
        const res = await fetch('/api/guests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, weddingId: 'w_1' })
        });
        if (!res.ok) throw new Error(await res.text());
        const created = await res.json();
        setGuests([...guests, created]);
      }
      closeModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save guest.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return;
    try {
      const res = await fetch(`/api/guests/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setGuests(guests.filter((g: any) => g.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const res = await fetch('/api/guests/import', {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: text
      });
      if (!res.ok) throw new Error('Failed to import');
      const data = await res.json();
      setGuests([...guests, ...data.created]);
      alert(`Imported ${data.createdCount} guests successfully.`);
    } catch (err: any) {
      alert(err.message);
    }
    e.target.value = '';
  };

  const handleExport = () => {
    window.location.href = '/api/guests/export?weddingId=w_1';
  };

  return (
    <section className="module">
      <div className="module-header">
        <div>
          <p className="eyebrow">Management</p>
          <h1 className="module-title">Guest Management</h1>
          <p className="module-subtitle">Add, edit, and manage your wedding guest list.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={handleExport} title="Export CSV">
            <Download size={16} /> Export
          </button>
          <label className="btn btn-outline" style={{ cursor: 'pointer' }} title="Import CSV">
            <Upload size={16} /> Import
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
          </label>
          <button className="btn btn-primary" id="add-guest-btn" onClick={() => openModal()}>
            <UserPlus size={16} /> Add Guest
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-tabs">
          {(['all', 'bride', 'groom', 'confirmed', 'pending', 'declined'] as const).map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <input
          type="search"
          className="form-input search-input"
          placeholder="Search guests…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 220 }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyStatePanel
            icon={<UsersIcon size={40} />}
            title={guests.length === 0 ? "No guests added yet" : "No guests match your filter"}
            description={guests.length === 0
              ? "Start building your guest list. Each guest gets a unique invite link you can share via WhatsApp."
              : "Try adjusting your search or filter."}
            cta={guests.length === 0 ? "Add Your First Guest" : undefined}
            onCta={guests.length === 0 ? () => openModal() : undefined}
          />
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-wrapper">
            <table className="data-table" id="guests-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Side</th>
                  <th>WhatsApp</th>
                  <th>Type</th>
                  <th>Max Members</th>
                  <th>Invite</th>
                  <th>RSVP</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g: any) => {
                  const rsvp = rsvps.find((r: any) => r.guestId === g.id);
                  return (
                    <tr key={g.id}>
                      <td>
                        <strong>{g.name}</strong>
                        {g.notes && <div style={{ fontSize: '0.7rem', color: 'var(--adm-text-muted)', marginTop: '0.15rem' }}>{g.notes}</div>}
                      </td>
                      <td><span className={`badge ${g.side === 'Bride' ? 'badge-rose' : 'badge-indigo'}`}>{g.side}</span></td>
                      <td>{g.whatsapp}</td>
                      <td><span className="badge badge-slate">{g.type}</span></td>
                      <td>{g.maxMembers}</td>
                      <td>
                        {g.inviteSentAt ? (
                          <span className="badge badge-green" title={`Sent ${new Date(g.inviteSentAt).toLocaleDateString()}`}>Sent</span>
                        ) : (
                          <span className="badge badge-slate">Not sent</span>
                        )}
                      </td>
                      <td>
                        {rsvp ? (
                          <span className={`badge ${rsvp.attending ? 'badge-green' : 'badge-red'}`}>
                            {rsvp.attending ? 'Confirmed' : 'Declined'}
                          </span>
                        ) : (
                          <span className="badge badge-amber">Pending</span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="table-action-btn"
                            title={copiedGuestId === g.id ? 'Copied!' : 'Copy invite link'}
                            onClick={() => copyInviteLink(g.token, g.id)}
                            style={copiedGuestId === g.id ? { color: '#16a34a' } : undefined}
                          >
                            {copiedGuestId === g.id ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                          {g.whatsapp && (
                            <button className="table-action-btn" title="Send invite via WhatsApp" onClick={() => {
                              const inviteUrl = `${window.location.origin}/invitation/${wedding?.slug}?token=${g.token}`;
                              const message = `Hi ${g.name}, you're invited to ${wedding?.weddingTitle || `${wedding?.brideName} & ${wedding?.groomName}`}! Please RSVP here: ${inviteUrl}`;
                              window.open(`https://wa.me/${g.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                              // Mark invite sent
                              fetch(`/api/guests/${g.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ inviteSentAt: new Date().toISOString() }),
                              }).then(async res => {
                                if (res.ok) {
                                  const updated = await res.json();
                                  setGuests((prev: any[]) => prev.map((gg: any) => gg.id === g.id ? { ...gg, ...updated } : gg));
                                }
                              }).catch(() => {/* non-blocking */});
                            }}>
                              <Send size={14} />
                            </button>
                          )}
                          <button className="table-action-btn" title="Edit guest" onClick={() => openModal(g)}>
                            <Edit3 size={14} />
                          </button>
                          <button className="table-action-btn" title="Delete guest" onClick={() => handleDelete(g.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guest Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingGuest ? 'Edit Guest' : 'Add Guest'}</h2>
              <button className="btn-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {errorMsg && <div className="error-banner" style={{ color: 'red', marginBottom: '1rem', background: '#FEF2F2', padding: '0.5rem', borderRadius: '8px', border: '1px solid #FECACA', fontSize: '0.85rem' }}>{errorMsg}</div>}
              <form id="guest-form" onSubmit={handleSave}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Name</label>
                  <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="form-grid-3" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Side</label>
                    <select className="form-input" value={formData.side} onChange={e => setFormData({ ...formData, side: e.target.value })}>
                      <option value="Groom">Groom</option>
                      <option value="Bride">Bride</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-input" value={formData.type} onChange={e => {
                      const type = e.target.value;
                      setFormData({ ...formData, type, maxMembers: type === 'Family' ? 4 : 1 });
                    }}>
                      <option value="Individual">Individual</option>
                      <option value="Family">Family</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Members</label>
                    <input type="number" className="form-input" min="1" max="20" required value={formData.maxMembers} onChange={e => setFormData({ ...formData, maxMembers: parseInt(e.target.value) || 1 })} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">WhatsApp</label>
                  <input type="tel" className="form-input" required value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="+94770000000" />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Tags / Notes</label>
                  <input type="text" className="form-input" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="e.g. VIP, Work Friends" />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeModal} type="button">Cancel</button>
              <button className="btn btn-primary" type="submit" form="guest-form" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Guest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ════════════════════════════════════════
   CHECKLIST MODULE
════════════════════════════════════════ */
function ChecklistModule({ wedding, checklist, setChecklist }: { wedding: any; checklist: ChecklistItemRecord[]; setChecklist: (items: ChecklistItemRecord[]) => void }) {
  const [filter, setFilter] = useState<'all' | ChecklistState>('all');
  const [templates, setTemplates] = useState<ChecklistTemplateRecord[]>(CHECKLIST_TEMPLATE_FALLBACKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ChecklistItemRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    group: '3 months before',
    priority: 'medium',
    dueDate: '',
    reminderAt: '',
    description: '',
  });

  const stats = getChecklistStats(checklist);
  const visibleTasks = useMemo(() => {
    return checklist.filter(task => filter === 'all' || getChecklistState(task) === filter);
  }, [checklist, filter]);

  useEffect(() => {
    let mounted = true;
    async function loadTemplates() {
      try {
        const res = await fetch(`/api/checklist?weddingId=${wedding.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data.templates)) setTemplates(data.templates);
      } catch {
        // Starter template labels can fall back to local metadata.
      }
    }
    void loadTemplates();
    return () => { mounted = false; };
  }, [wedding.id]);

  const showMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2400);
  };

  const openModal = (task?: ChecklistItemRecord) => {
    setError('');
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        group: task.group,
        priority: task.priority || 'medium',
        dueDate: task.dueDate || '',
        reminderAt: task.reminderAt || '',
        description: task.description || '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        group: '3 months before',
        priority: 'medium',
        dueDate: '',
        reminderAt: '',
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        weddingId: wedding.id,
      };
      const res = await fetch(editingTask ? `/api/checklist/${editingTask.id}` : '/api/checklist', {
        method: editingTask ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      setChecklist(editingTask
        ? checklist.map(task => task.id === saved.id ? saved : task)
        : [...checklist, saved]);
      closeModal();
      showMessage(editingTask ? 'Task updated.' : 'Task created.');
    } catch (err: any) {
      setError(err?.message || 'Unable to save task.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (task: ChecklistItemRecord) => {
    try {
      const res = await fetch(`/api/checklist/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', isCompleted: !task.isCompleted }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setChecklist(checklist.map(item => item.id === updated.id ? updated : item));
    } catch (err: any) {
      setError(err?.message || 'Unable to update task.');
    }
  };

  const handleDelete = async (task: ChecklistItemRecord) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      const res = await fetch(`/api/checklist/${task.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      setChecklist(checklist.filter(item => item.id !== task.id));
      showMessage('Task deleted.');
    } catch (err: any) {
      setError(err?.message || 'Unable to delete task.');
    }
  };

  const applyTemplate = async (templateId: string) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/checklist/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weddingId: wedding.id, templateId }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setChecklist(data.items || checklist);
      showMessage(data.created?.length ? `Added ${data.created.length} starter tasks.` : 'Template already applied.');
    } catch (err: any) {
      setError(err?.message || 'Unable to apply starter template.');
    } finally {
      setSaving(false);
    }
  };

  const groupedTasks = CHECKLIST_GROUP_OPTIONS
    .map(group => ({ group, tasks: visibleTasks.filter(task => task.group === group) }))
    .filter(section => section.tasks.length > 0);

  return (
    <section className="module checklist-module">
      <div className="module-header">
        <div>
          <p className="eyebrow">Planning</p>
          <h1 className="module-title">Wedding Checklist</h1>
          <p className="module-subtitle">{stats.completed} of {stats.total} tasks completed.</p>
        </div>
        <button className="btn btn-primary" id="add-checklist-task-btn" onClick={() => openModal()}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      {(message || error) && (
        <div className={`success-banner ${error ? 'success-banner-error' : ''}`}>
          {error ? <AlertCircle size={16} /> : <Check size={16} />} {error || message}
        </div>
      )}

      <div className="checklist-summary-grid">
        <div className="card checklist-summary-card">
          <div className="checklist-ring-wrap"><RingProgress pct={stats.pct} /></div>
          <div className="checklist-summary-copy">
            <strong>{stats.pct}% complete</strong>
            <span>{stats.completed} done, {stats.pending} pending, {stats.dueSoon} due soon, {stats.overdue} overdue</span>
          </div>
        </div>
        <div className="card checklist-template-panel">
          <div className="panel-header">
            <h3>Starter Templates</h3>
          </div>
          <div className="checklist-template-grid">
            {templates.map(template => (
              <button key={template.id} className="template-btn" onClick={() => applyTemplate(template.id)} disabled={saving}>
                <FileText size={16} />
                <span>
                  <strong>{template.name}</strong>
                  <small>{template.description}</small>
                </span>
                <span className="badge badge-slate">{template.taskCount}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-tabs">
          {(['all', 'pending', 'due-soon', 'overdue', 'completed'] as const).map(item => (
            <button key={item} className={`filter-tab ${filter === item ? 'active' : ''}`} onClick={() => setFilter(item)}>
              {item === 'due-soon' ? 'Due Soon' : item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {checklist.length === 0 ? (
        <div className="card">
          <EmptyStatePanel
            icon={<ListChecks size={40} />}
            title="No checklist tasks yet"
            description="Create your first task or apply a starter template to begin tracking wedding planning."
            cta="Create First Task"
            onCta={() => openModal()}
          />
        </div>
      ) : groupedTasks.length === 0 ? (
        <div className="card">
          <EmptyStatePanel
            icon={<ListChecks size={40} />}
            title="No tasks match this filter"
            description="Try another task state or create a new task."
          />
        </div>
      ) : (
        <div className="checklist-group-stack">
          {groupedTasks.map(section => (
            <div className="card checklist-group-card" key={section.group}>
              <div className="checklist-group-heading">
                <span><CalendarDays size={16} /> {section.group}</span>
                <span className="badge badge-slate">{section.tasks.filter(task => task.isCompleted).length}/{section.tasks.length}</span>
              </div>
              <div className="checklist-task-list">
                {section.tasks.map(task => {
                  const state = getChecklistState(task);
                  return (
                    <div className={`checklist-task-row checklist-state-${state}`} key={task.id}>
                      <button className={`checklist-check ${task.isCompleted ? 'checked' : ''}`} onClick={() => handleToggle(task)} aria-label={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}>
                        {task.isCompleted && <Check size={14} />}
                      </button>
                      <div className="checklist-task-main">
                        <strong>{task.title}</strong>
                        {task.description && <p>{task.description}</p>}
                        <div className="checklist-task-meta">
                          <span className={`priority-chip priority-${task.priority}`}>{task.priority}</span>
                          {task.dueDate && <span><Calendar size={13} /> Due {formatDateShort(task.dueDate)}</span>}
                          {task.reminderAt && <span><Bell size={13} /> Reminder {formatDateShort(task.reminderAt)}</span>}
                          <span className={`state-chip state-${state}`}>{state === 'due-soon' ? 'due soon' : state}</span>
                        </div>
                      </div>
                      <div className="table-actions">
                        <button className="table-action-btn" title="Edit task" onClick={() => openModal(task)}><Edit3 size={14} /></button>
                        <button className="table-action-btn" title="Delete task" onClick={() => handleDelete(task)}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'Create Task'}</h2>
              <button className="btn-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {error && <div className="error-banner">{error}</div>}
              <form id="checklist-form" onSubmit={handleSave}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Task Title</label>
                  <input className="form-input" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Confirm florist arrival time" />
                </div>
                <div className="form-grid-3" style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Timeline</label>
                    <select className="form-input" value={formData.group} onChange={e => setFormData({ ...formData, group: e.target.value })}>
                      {CHECKLIST_GROUP_OPTIONS.map(group => <option key={group} value={group}>{group}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-input" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                      {CHECKLIST_PRIORITY_OPTIONS.map(priority => <option key={priority} value={priority}>{priority}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-input" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Reminder</label>
                  <input type="datetime-local" className="form-input" value={formData.reminderAt} onChange={e => setFormData({ ...formData, reminderAt: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Notes, vendor details, or what must be checked before completion." />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeModal} type="button">Cancel</button>
              <button className="btn btn-primary" type="submit" form="checklist-form" disabled={saving}>
                {saving ? 'Saving...' : 'Save Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ════════════════════════════════════════
   VENDORS MODULE
════════════════════════════════════════ */
function VendorsModule({ wedding, setWedding }: any) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<any>(wedding.vendorPlan || { savedVendorIds: [], customVendors: [] });
  const [customForm, setCustomForm] = useState({ businessName: '', category: 'Photography', contact: '', quote: '', notes: '' });

  useEffect(() => {
    let mounted = true;
    fetch('/api/vendors')
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Unable to load vendor marketplace.')))
      .then(json => { if (mounted) setVendors(json.vendors || []); })
      .catch(err => { if (mounted) setError(err.message || 'Unable to load vendors.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const categories = ['All', ...Array.from(new Set(vendors.map(v => v.category).filter(Boolean)))];
  const savedIds: string[] = plan.savedVendorIds || [];
  const customVendors: any[] = plan.customVendors || [];
  const filteredVendors = vendors.filter(v => {
    const q = query.toLowerCase();
    const matchesQuery = !q || [v.businessName, v.category, v.location, v.description].some(value => String(value || '').toLowerCase().includes(q));
    const matchesCategory = category === 'All' || v.category === category;
    return matchesQuery && matchesCategory;
  });

  async function savePlan(nextPlan: any, successText: string) {
    setSaving(true);
    setError('');
    try {
      const updated = await patchWeddingRecord(wedding.id, { vendorPlan: nextPlan });
      setWedding(updated);
      setPlan(nextPlan);
      setMessage(successText);
    } catch (err: any) {
      setError(err.message || 'Unable to save vendor plan.');
    } finally {
      setSaving(false);
    }
  }

  function toggleSaved(vendorId: string) {
    const nextIds = savedIds.includes(vendorId) ? savedIds.filter(id => id !== vendorId) : [...savedIds, vendorId];
    savePlan({ ...plan, savedVendorIds: nextIds }, savedIds.includes(vendorId) ? 'Vendor removed from shortlist.' : 'Vendor saved to shortlist.');
  }

  function addCustomVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!customForm.businessName.trim()) return;
    const nextVendor = {
      id: `custom_${Date.now()}`,
      ...customForm,
      status: 'researching',
      createdAt: new Date().toISOString(),
    };
    savePlan({ ...plan, customVendors: [nextVendor, ...customVendors] }, 'Custom vendor added.');
    setCustomForm({ businessName: '', category: 'Photography', contact: '', quote: '', notes: '' });
  }

  function updateCustomVendor(id: string, patch: any) {
    const next = customVendors.map(v => v.id === id ? { ...v, ...patch } : v);
    savePlan({ ...plan, customVendors: next }, 'Vendor details updated.');
  }

  const savedMarketplace = vendors.filter(v => savedIds.includes(v.id));
  const bookedCount = customVendors.filter(v => v.status === 'booked').length;

  return (
    <section className="module">
      <div className="module-header">
        <div>
          <p className="eyebrow">Planning</p>
          <h1 className="module-title">Vendor Management</h1>
          <p className="module-subtitle">Browse approved vendors, shortlist options, and track custom quotes without entering the vendor portal.</p>
        </div>
      </div>

      {(message || error) && <div className={`module-alert ${error ? 'module-alert-error' : 'module-alert-success'}`}>{error || <><Check size={16} /> {message}</>}</div>}

      <div className="kpi-grid6">
        <KpiCard icon={<Store size={20} />} colorClass="kpi-rose" value={vendors.length} label="Marketplace" sub="Approved vendors" />
        <KpiCard icon={<Heart size={20} />} colorClass="kpi-green" value={savedIds.length} label="Shortlisted" sub="Saved from marketplace" />
        <KpiCard icon={<ClipboardList size={20} />} colorClass="kpi-purple" value={customVendors.length} label="Custom Vendors" sub="Your private tracker" />
        <KpiCard icon={<CheckCircle size={20} />} colorClass="kpi-amber" value={bookedCount} label="Booked" sub="Marked confirmed" />
      </div>

      <div className="vendor-workspace-grid">
        <div className="card">
          <div className="panel-header">
            <h3>Marketplace Browse</h3>
            {saving && <span className="text-muted">Saving...</span>}
          </div>
          <div className="module-toolbar">
            <input className="form-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search vendor, category, location" />
            <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(item => <option key={item}>{item}</option>)}
            </select>
          </div>
          {loading ? (
            <div className="empty-hint">Loading vendors...</div>
          ) : filteredVendors.length === 0 ? (
            <EmptyStatePanel icon={<Store size={36} />} title="No vendors match" description="Try a broader search or add a custom vendor below." />
          ) : (
            <div className="vendor-card-list">
              {filteredVendors.map(v => (
                <div className="vendor-card" key={v.id}>
                  <div>
                    <strong>{v.businessName}</strong>
                    <span>{v.category} · {v.location || 'Location TBD'}</span>
                    <p>{v.description}</p>
                  </div>
                  <div className="vendor-card-actions">
                    <span className="badge badge-slate">{formatCurrency(v.basePrice || 0)}</span>
                    {v.website && <a className="btn-ghost-sm" href={v.website} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Site</a>}
                    <button className="btn btn-outline" onClick={() => toggleSaved(v.id)} disabled={saving}>
                      {savedIds.includes(v.id) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="panel-header"><h3>Shortlist</h3><span className="text-muted">{savedMarketplace.length} saved</span></div>
          {savedMarketplace.length === 0 ? (
            <EmptyStatePanel icon={<Heart size={34} />} title="No saved vendors" description="Save marketplace vendors to compare them here." />
          ) : (
            <div className="compact-list">
              {savedMarketplace.map(v => (
                <div className="compact-row" key={v.id}>
                  <div><strong>{v.businessName}</strong><span>{v.category}</span></div>
                  <button className="table-action-btn" title="Remove" onClick={() => toggleSaved(v.id)}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="panel-header"><h3>Private Vendor Tracker</h3><span className="text-muted">Quotes, notes, and booking status</span></div>
        <form className="vendor-custom-form" onSubmit={addCustomVendor}>
          <input className="form-input" value={customForm.businessName} onChange={e => setCustomForm(f => ({ ...f, businessName: e.target.value }))} placeholder="Business name" />
          <select className="form-input" value={customForm.category} onChange={e => setCustomForm(f => ({ ...f, category: e.target.value }))}>
            {['Venue', 'Catering', 'Photography', 'Decor', 'Makeup', 'Music', 'Cake', 'Jewelry', 'Transport', 'Other'].map(item => <option key={item}>{item}</option>)}
          </select>
          <input className="form-input" value={customForm.contact} onChange={e => setCustomForm(f => ({ ...f, contact: e.target.value }))} placeholder="Phone, email, or URL" />
          <input className="form-input" value={customForm.quote} onChange={e => setCustomForm(f => ({ ...f, quote: e.target.value }))} placeholder="Quote / estimate" />
          <button className="btn btn-primary" disabled={saving || !customForm.businessName.trim()}><Plus size={14} /> Add</button>
        </form>

        {customVendors.length === 0 ? (
          <div className="empty-hint">Add vendors you are considering outside the marketplace.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Vendor</th><th>Category</th><th>Status</th><th>Quote</th><th>Notes</th><th>Contact</th></tr></thead>
              <tbody>
                {customVendors.map(v => (
                  <tr key={v.id}>
                    <td><strong>{v.businessName}</strong></td>
                    <td>{v.category}</td>
                    <td>
                      <select className="form-input compact-input" value={v.status} onChange={e => updateCustomVendor(v.id, { status: e.target.value })}>
                        <option value="researching">Researching</option>
                        <option value="quoted">Quoted</option>
                        <option value="booked">Booked</option>
                        <option value="declined">Declined</option>
                      </select>
                    </td>
                    <td>{v.quote || '-'}</td>
                    <td><input className="form-input compact-input" value={v.notes || ''} onChange={e => updateCustomVendor(v.id, { notes: e.target.value })} placeholder="Notes" /></td>
                    <td>{v.contact ? <a href={v.contact.startsWith('http') ? v.contact : `mailto:${v.contact}`}>{v.contact}</a> : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════
   MUSIC MODULE
════════════════════════════════════════ */
function MusicModule({ wedding, setWedding }: any) {
  const [form, setForm] = useState({
    enabled: wedding.music?.enabled !== false && wedding.sections?.music !== false,
    track: wedding.music?.track || '',
    sourceUrl: wedding.music?.sourceUrl || '',
    muteDefault: wedding.music?.muteDefault !== false,
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function saveMusic(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const music = { ...form };
      const updated = await patchWeddingRecord(wedding.id, { music, sections: { ...(wedding.sections || {}), music: form.enabled } });
      setWedding(updated);
      setMessage('Music settings saved.');
    } catch (err: any) {
      setError(err.message || 'Unable to save music settings.');
    } finally {
      setSaving(false);
    }
  }

  function previewTrack() {
    if (!form.sourceUrl) {
      setMessage('Add an MP3 URL to preview. The invitation will still show the selected track name.');
      return;
    }
    const audio = new Audio(form.sourceUrl);
    audio.volume = 0.45;
    audio.play().catch(() => setError('Browser blocked playback. Click preview again or check the audio URL.'));
  }

  return (
    <section className="module">
      <div className="module-header">
        <div>
          <p className="eyebrow">Invitation Experience</p>
          <h1 className="module-title">Music Settings</h1>
          <p className="module-subtitle">Control background music for the public invitation. Playback only starts after a guest interacts with the invitation.</p>
        </div>
      </div>
      {(message || error) && <div className={`module-alert ${error ? 'module-alert-error' : 'module-alert-success'}`}>{error || <><Check size={16} /> {message}</>}</div>}
      <form className="card music-settings-card" onSubmit={saveMusic}>
        <label className="toggle-row">
          <span><strong>Enable music section</strong><small>Show the floating music control on the invitation.</small></span>
          <input type="checkbox" checked={form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))} />
        </label>
        <label className="form-field">
          <span>Track title</span>
          <input className="form-input" value={form.track} onChange={e => setForm(f => ({ ...f, track: e.target.value }))} placeholder="A Thousand Years" />
        </label>
        <label className="form-field">
          <span>MP3 URL</span>
          <input className="form-input" value={form.sourceUrl} onChange={e => setForm(f => ({ ...f, sourceUrl: e.target.value }))} placeholder="https://cdn.example.com/song.mp3" />
        </label>
        <label className="toggle-row">
          <span><strong>Mute by default</strong><small>Recommended so guests choose when audio starts.</small></span>
          <input type="checkbox" checked={form.muteDefault} onChange={e => setForm(f => ({ ...f, muteDefault: e.target.checked }))} />
        </label>
        <div className="module-actions">
          <button className="btn btn-outline" type="button" onClick={previewTrack}><Music size={15} /> Preview</button>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Music'}</button>
        </div>
      </form>
    </section>
  );
}

/* ════════════════════════════════════════
   NOTIFICATIONS MODULE
════════════════════════════════════════ */
function NotificationsModule({ wedding, guests, rsvps, checklist, budget, setWedding, onNavigate }: any) {
  const pending = Math.max(0, guests.length - rsvps.length);
  const dueSoon = getChecklistStats(checklist || []).dueSoon;
  const overBudget = (budget?.totals?.remaining || 0) < 0;
  const [prefs, setPrefs] = useState(wedding.notificationPreferences || { email: true, whatsapp: true, planningReminders: true });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const alerts = [
    pending > 0 && { id: 'pending-rsvps', icon: Clock, title: `${pending} RSVP${pending === 1 ? '' : 's'} pending`, detail: 'Send reminders from the Guests module.', action: 'guests' },
    dueSoon > 0 && { id: 'due-soon', icon: AlertCircle, title: `${dueSoon} checklist item${dueSoon === 1 ? '' : 's'} due soon`, detail: 'Review upcoming planning tasks.', action: 'checklist' },
    overBudget && { id: 'budget', icon: Wallet, title: 'Budget needs attention', detail: 'Actuals are above the estimated total.', action: 'budget' },
    !(wedding.sections?.music) && { id: 'music-off', icon: Music, title: 'Invitation music is disabled', detail: 'Turn it on from Music Settings if needed.', action: 'music' },
  ].filter(Boolean) as any[];

  async function savePrefs() {
    setSaving(true);
    setError('');
    try {
      const updated = await patchWeddingRecord(wedding.id, { notificationPreferences: prefs });
      setWedding(updated);
      setMessage('Notification preferences saved.');
    } catch (err: any) {
      setError(err.message || 'Unable to save notification preferences.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="module">
      <div className="module-header">
        <div>
          <p className="eyebrow">Feedback</p>
          <h1 className="module-title">Notifications</h1>
          <p className="module-subtitle">A couple-facing notification center for planning alerts and RSVP follow-up prompts.</p>
        </div>
      </div>
      {(message || error) && <div className={`module-alert ${error ? 'module-alert-error' : 'module-alert-success'}`}>{error || <><Check size={16} /> {message}</>}</div>}
      <div className="notifications-grid">
        <div className="card">
          <div className="panel-header"><h3>Action Center</h3><span className="text-muted">{alerts.length} active</span></div>
          {alerts.length === 0 ? (
            <EmptyStatePanel icon={<Bell size={36} />} title="All clear" description="No urgent planning notifications right now." />
          ) : (
            <div className="compact-list">
              {alerts.map(item => (
                <button className="notification-row" key={item.id} onClick={() => onNavigate(item.action)}>
                  <item.icon size={18} />
                  <span><strong>{item.title}</strong><small>{item.detail}</small></span>
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="panel-header"><h3>Preferences</h3><span className="text-muted">Local v1</span></div>
          {[
            ['email', 'Email updates', 'Receive account and planning notices by email.'],
            ['whatsapp', 'WhatsApp reminders', 'Use WhatsApp where guest opt-in data is available.'],
            ['planningReminders', 'Planning reminders', 'Surface checklist, RSVP, and budget prompts.'],
          ].map(([key, title, copy]) => (
            <label className="toggle-row" key={key}>
              <span><strong>{title}</strong><small>{copy}</small></span>
              <input type="checkbox" checked={!!prefs[key]} onChange={e => setPrefs((p: any) => ({ ...p, [key]: e.target.checked }))} />
            </label>
          ))}
          <button className="btn btn-primary" onClick={savePrefs} disabled={saving}>{saving ? 'Saving...' : 'Save Preferences'}</button>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════
   ACCOUNT MODULE
════════════════════════════════════════ */
function AccountModule({ wedding, onNavigate }: any) {
  const [billing, setBilling] = useState<any>(null);
  const [billingConfig, setBillingConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const email = wedding.contactEmail || 'test+couple@local';

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch('/api/payments/subscriptions').then(res => res.ok ? res.json() : null).catch(() => null),
      fetch(`/api/payments/billing/${encodeURIComponent(email)}`).then(res => res.ok ? res.json() : null).catch(() => null),
    ]).then(([config, record]) => {
      if (!mounted) return;
      setBillingConfig(config);
      setBilling(record);
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [email]);

  const status = billing?.status || 'trial';
  const planLabel = status === 'active' ? 'Premium active' : 'Trial / free workspace';

  return (
    <section className="module">
      <div className="module-header">
        <div>
          <p className="eyebrow">Account</p>
          <h1 className="module-title">Account & Subscription</h1>
          <p className="module-subtitle">Review account details, subscription status, limits, and support links.</p>
        </div>
      </div>
      <div className="account-grid">
        <div className="card">
          <div className="panel-header"><h3>Couple Account</h3><span className="badge badge-slate">{planLabel}</span></div>
          <div className="settings-list">
            <div><span>Wedding</span><strong>{wedding.weddingTitle || `${wedding.brideName} & ${wedding.groomName}`}</strong></div>
            <div><span>Email</span><strong>{email}</strong></div>
            <div><span>WhatsApp</span><strong>{wedding.contactWhatsApp || 'Not set'}</strong></div>
            <div><span>Public slug</span><strong>{wedding.slug}</strong></div>
          </div>
          <div className="module-actions">
            <button className="btn btn-outline" onClick={() => onNavigate('settings')}><Settings size={15} /> Wedding Settings</button>
            <button className="btn btn-outline" onClick={() => window.open(`/invitation/${wedding.slug}`, '_blank')}><Eye size={15} /> Preview</button>
          </div>
        </div>
        <div className="card">
          <div className="panel-header"><h3>Subscription</h3>{loading && <span className="text-muted">Loading...</span>}</div>
          <div className="settings-list">
            <div><span>Status</span><strong>{status}</strong></div>
            <div><span>Customer</span><strong>{billing?.customerId || 'Not attached'}</strong></div>
            <div><span>Subscription</span><strong>{billing?.subscriptionId || 'No active subscription'}</strong></div>
            <div><span>Billing config</span><strong>{billingConfig?.priceId ? 'Configured' : 'Sandbox mode'}</strong></div>
          </div>
          <div className="module-actions">
            <a className="btn btn-primary" href={`/account/checkout?email=${encodeURIComponent(email)}`}>Manage Upgrade</a>
            <a className="btn btn-outline" href="mailto:support@wedplan.lk"><HelpCircle size={15} /> Support</a>
          </div>
        </div>
        <div className="card">
          <div className="panel-header"><h3>Feature Limits</h3><span className="text-muted">v1 guidance</span></div>
          <div className="compact-list">
            <div className="compact-row"><div><strong>Guests</strong><span>Unlimited in this demo workspace</span></div><CheckCircle size={16} /></div>
            <div className="compact-row"><div><strong>Invitation editor</strong><span>Enabled for all couples</span></div><CheckCircle size={16} /></div>
            <div className="compact-row"><div><strong>Premium media uploads</strong><span>Use hosted URLs until storage is connected</span></div><AlertCircle size={16} /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════
   RSVPs MODULE
════════════════════════════════════════ */
function RsvpsModule({ guests, rsvps, onNavigate }: any) {
  const confirmed = rsvps.filter((r: any) => r.attending === true).length;
  const declined  = rsvps.filter((r: any) => r.attending === false).length;
  const pending   = guests.length - rsvps.length;
  const attending = rsvps.filter((r: any) => r.attending).reduce((acc: number, r: any) => acc + (r.memberCount || 1), 0);
  const withLiquor = rsvps.filter((r: any) => r.liquorPreference === 'Yes').length;

  return (
    <section className="module">
      <div className="module-header">
        <div>
          <p className="eyebrow">Tracking</p>
          <h1 className="module-title">RSVP Management</h1>
          <p className="module-subtitle">Track and manage guest responses and preferences.</p>
        </div>
      </div>

      {/* Summary chips */}
      <div className="rsvp-summary-bar">
        <div className="rsvp-chip rsvp-chip-green"><CheckCircle size={15} /> Confirmed: <strong>{confirmed}</strong></div>
        <div className="rsvp-chip rsvp-chip-amber"><Clock size={15} /> Pending: <strong>{pending}</strong></div>
        <div className="rsvp-chip rsvp-chip-red"><X size={15} /> Declined: <strong>{declined}</strong></div>
        <div className="rsvp-chip rsvp-chip-purple"><UsersIcon size={15} /> Attending: <strong>{attending}</strong></div>
        <div className="rsvp-chip rsvp-chip-blue"><RefreshCw size={15} /> Liquor Yes: <strong>{withLiquor}</strong></div>
      </div>

      {/* RSVP rate bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>RSVP Response Rate</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--adm-text-secondary)' }}>
            {guests.length > 0 ? Math.round((rsvps.length / guests.length) * 100) : 0}%
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${guests.length > 0 ? (rsvps.length / guests.length) * 100 : 0}%` }} />
        </div>
      </div>

      {guests.length === 0 ? (
        <div className="card">
          <EmptyStatePanel
            icon={<CheckSquare size={40} />}
            title="No RSVPs yet"
            description="Add guests first to start tracking RSVPs. Once guests respond, their preferences will appear here."
            cta="Go to Guests"
            onCta={() => onNavigate('guests')}
          />
        </div>
      ) : (
        <div className="card table-card">
          <div className="table-wrapper">
            <table className="data-table" id="rsvps-table">
              <thead>
                <tr>
                  <th>Guest Name</th>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Meal</th>
                  <th>Liquor</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guests.map((g: any) => {
                  const rsvp = rsvps.find((r: any) => r.guestId === g.id);
                  return (
                    <tr key={g.id}>
                      <td><strong>{g.name}</strong></td>
                      <td>
                        {rsvp ? (
                          <span className={`badge ${rsvp.attending ? 'badge-green' : 'badge-red'}`}>
                            {rsvp.attending ? 'Confirmed' : 'Declined'}
                          </span>
                        ) : (
                          <span className="badge badge-amber">Pending</span>
                        )}
                      </td>
                      <td>{rsvp?.memberCount || '—'}</td>
                      <td>{rsvp?.mealPreference || '—'}</td>
                      <td>{rsvp?.liquorPreference || '—'}</td>
                      <td>{rsvp?.notes || '—'}</td>
                      <td>
                        <div className="table-actions">
                          <button className="table-action-btn" title="Contact guest">
                            <Send size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── Badge helpers (used inline) ─── */
// Exported via CSS classes: badge-rose, badge-indigo, badge-green, badge-red, badge-amber, badge-slate
