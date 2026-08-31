/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, Users, Briefcase, LayoutTemplate, CreditCard, Trash2,
  Settings, ShieldCheck, ShieldOff, PanelLeftClose, User,
  Menu, ChevronRight, LogOut, TrendingUp, TrendingDown, Minus, Clock, AlertTriangle,
  Search, Plus, Save, Check, X, Star, Eye, RefreshCw, Scroll,
  UserPlus, Download, CheckCircle, Coins
} from 'lucide-react';
import styles from './admin.module.css';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CoupleDetailModal from '@/components/CoupleDetailModal';
import AnalyticsModule from './AnalyticsModule';

function cn(...classes: (string | undefined | null | false)[]) {
  return classes
    .filter(Boolean)
    .join(' ')
    .split(' ')
    .map(c => styles[c] || c)
    .join(' ');
}

export default function SuperAdminClient({ initialWeddings, initialCouples, initialVendors, initialSettings, initialPlans }: any) {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [platformSettings, setPlatformSettings] = useState(initialSettings || {});
  
  const handleNavClick = (mod: string) => {
    setActiveModule(mod);
    setIsMobileOpen(false);
  };
  
  const pendingVendors = initialVendors.filter((v: any) => v.status === 'pending' || v.status === 'pending_review').length;
  const [allPointRequests, setAllPointRequests] = useState<any[]>([]);
  const pendingPointRequests = allPointRequests.filter((r: any) => r.status === 'pending').length;

  useEffect(() => {
    fetch('/api/admin/points/requests')
      .then(r => r.json())
      .then(d => { if (d.requests) setAllPointRequests(d.requests); })
      .catch(() => {});
  }, []);

  const labels: Record<string, string> = {
    dashboard: 'Dashboard', couples: 'Couples', vendors: 'Vendors',
    templates: 'Templates', analytics: 'Analytics', plans: 'Plans', cleanup: 'Trial Cleanup',
    revenue: 'Revenue', cms: 'Content CMS', reports: 'Reports', settings: 'Settings', logs: 'Logs',
    points: 'Points'
  };
  
  return (
    <div className={cn("app")}>
      <aside className={cn("sidebar", isSidebarCollapsed && "collapsed", isMobileOpen && "mobile-open")}>
        <div className={cn("sidebar-header")}>
          <div className={cn("sidebar-logo")}>
            <div className={cn("sidebar-logo-icon")}>
              <ShieldCheck size={20} />
            </div>
            <div className={cn("sidebar-brand")}>
              <span className={cn("sidebar-brand-name")}>WedPlan</span>
              <span className={cn("sidebar-brand-role")}>Super Admin</span>
            </div>
          </div>
          <button className={cn("sidebar-toggle")} onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            <PanelLeftClose size={18} />
          </button>
        </div>

        <nav className={cn("sidebar-nav")}>
          <div className={cn("nav-section-label")}>Main</div>
          <NavItem id="dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeModule} onClick={handleNavClick} />
          <NavItem id="couples" icon={<Users size={18} />} label="Couples" active={activeModule} onClick={handleNavClick} />
          <NavItem id="vendors" icon={<Briefcase size={18} />} label="Vendors" active={activeModule} onClick={handleNavClick} badge={pendingVendors} />
          <NavItem id="points" icon={<Coins size={18} />} label="Points" active={activeModule} onClick={handleNavClick} badge={pendingPointRequests} />
          <NavItem id="templates" icon={<LayoutTemplate size={18} />} label="Templates" active={activeModule} onClick={handleNavClick} />
          <NavItem id="analytics" icon={<TrendingUp size={18} />} label="Analytics" active={activeModule} onClick={handleNavClick} />

          <div className={cn("nav-section-label")}>Commerce</div>
          <NavItem id="plans" icon={<CreditCard size={18} />} label="Plans" active={activeModule} onClick={handleNavClick} />
          <NavItem id="revenue" icon={<TrendingUp size={18} />} label="Revenue" active={activeModule} onClick={handleNavClick} />
          <NavItem id="cleanup" icon={<Trash2 size={18} />} label="Trial Cleanup" active={activeModule} onClick={handleNavClick} />
          
          <div className={cn("nav-section-label")}>System</div>
          <NavItem id="settings" icon={<Settings size={18} />} label="Settings" active={activeModule} onClick={handleNavClick} />
          <NavItem id="logs" icon={<Scroll size={18} />} label="Audit Logs" active={activeModule} onClick={handleNavClick} />
        </nav>

        <div className={cn("sidebar-footer")}>
          <div className={cn("sidebar-user")}>
            <div className={cn("sidebar-avatar")}><User size={16} /></div>
            <div className={cn("sidebar-user-info")}>
              <div className={cn("sidebar-user-name")}>Admin</div>
              <div className={cn("sidebar-user-role")}>Super Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {isMobileOpen && <div className={cn("sidebar-overlay")} onClick={() => setIsMobileOpen(false)}></div>}

      <div className={cn("main-wrapper")}>
        <header className={cn("top-header")}>
          <div className={cn("header-left")}>
            <button className={cn("mobile-menu-btn")} onClick={() => setIsMobileOpen(true)}><Menu size={20} /></button>
            <div className={cn("breadcrumb")}>
              <span className={cn("breadcrumb-root")}>Admin</span>
              <ChevronRight size={14} className={cn("breadcrumb-sep")} />
              <span className={cn("breadcrumb-current")}>{labels[activeModule] || activeModule}</span>
            </div>
          </div>
          <div className={cn("header-right")}>
            <div className={cn("header-badge")}>
              <ShieldCheck size={14} /> Super Admin
            </div>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <button className={cn("btn", "btn-ghost", "btn-sm")} onClick={() => signOut({ callbackUrl: '/login' })}>
                <LogOut size={16} /> <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className={cn("page-content")}>
          {activeModule === 'dashboard' && <DashboardModule couples={initialCouples} vendors={initialVendors} weddings={initialWeddings} loading={false} />}
          {activeModule === 'couples' && <CouplesModule couples={initialCouples} platformSettings={platformSettings} />}
          {activeModule === 'vendors' && <VendorsModule vendors={initialVendors} />}
          {activeModule === 'templates' && <TemplatesModule initialSettings={platformSettings} />}
          {activeModule === 'plans' && <PlansModule initialPlans={initialPlans} />}
          {activeModule === 'cleanup' && <CleanupModule />}
          {activeModule === 'revenue' && <RevenueModule />}
          {activeModule === 'settings' && <SettingsModule initialSettings={platformSettings} onSaved={setPlatformSettings} />}
          {activeModule === 'logs' && <LogsModule />}
          {activeModule === 'analytics' && <AnalyticsModule />}
          {activeModule === 'points' && <PointsModule requests={allPointRequests} onRequestsChange={setAllPointRequests} />}
        </main>
      </div>
    </div>
  );
}

function NavItem({ id, icon, label, active, onClick, badge }: any) {
  return (
    <a href="#" className={cn("nav-item", active === id && "active")} onClick={(e) => { e.preventDefault(); onClick(id); }}>
      <span className={cn("nav-icon")}>{icon}</span>
      <span className={cn("nav-label")}>{label}</span>
      {badge > 0 && <span className={cn("nav-badge")}>{badge}</span>}
    </a>
  );
}

function DashboardModule({ couples, vendors }: any) {
  const [signups, setSignups] = useState<{ date: string; count: number }[]>([]);
  const [rsvps, setRsvps] = useState<{ date: string; count: number }[]>([]);
  const [funnel, setFunnel] = useState<{ step: string; count: number; pct: number }[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    async function load() {
      setLoadingCharts(true);
      try {
        const [s, r, f, h, logs] = await Promise.all([
          fetch('/api/admin/analytics/signups').then(x => x.json()),
          fetch('/api/admin/analytics/rsvps').then(x => x.json()),
          fetch('/api/admin/analytics/onboarding').then(x => x.json()),
          fetch('/api/admin/analytics/health').then(x => x.json()),
          fetch('/api/admin/logs?limit=15').then(x => x.json()),
        ]);
        setSignups(s); setRsvps(r); setFunnel(f); setHealth(h);
        setActivity(Array.isArray(logs) ? logs : (logs.logs || []));
      } catch {}
      setLoadingCharts(false);
    }
    void load();
    const interval = setInterval(() => void load(), 60000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const activeTrials = couples.filter((c: any) => c.plan === 'trial' && new Date(c.trialEnds) >= now).length;
  const expiring7 = couples.filter((c: any) => {
    const end = new Date(c.trialEnds);
    const diff = (end.getTime() - now.getTime()) / 86400000;
    return c.plan === 'trial' && diff >= 0 && diff <= 7;
  }).length;
  const premium = couples.filter((c: any) => c.plan === 'premium').length;
  const pending = vendors.filter((v: any) => v.status === 'pending' || v.status === 'pending_review').length;
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const signupsToday = signups.find(s => s.date === todayStart.toISOString().slice(0,10))?.count ?? 0;
  const rsvpsToday = rsvps.find(s => s.date === todayStart.toISOString().slice(0,10))?.count ?? 0;

  const maxSignup = Math.max(1, ...signups.map(s => s.count));
  const maxRsvp = Math.max(1, ...rsvps.map(s => s.count));

  return (
    <section className={cn('module')}>
      <div className={cn('module-header')}>
        <div>
          <h1 className={cn('module-title')}>Dashboard Overview</h1>
          <p className={cn('module-desc')}>Platform health at a glance</p>
        </div>
        <div className={cn('module-actions')}>
          <button className={cn('btn','btn-ghost','btn-sm')} onClick={() => window.location.reload()}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Row 1 */}
      <div className={cn('kpi-grid')}>
        <KpiCard color="blue"   icon={<Users size={22}/>}         value={couples.length}   label="Total Couples"       trend={`+${signupsToday} today`} up={signupsToday > 0} />
        <KpiCard color="amber"  icon={<Clock size={22}/>}         value={activeTrials}     label="Active Trials"       trend={`${expiring7} expiring`} down={expiring7 > 0} />
        <KpiCard color="green"  icon={<CheckCircle size={22}/>}   value={premium}          label="Premium"             trend="subscribers" />
        <KpiCard color="purple" icon={<Briefcase size={22}/>}     value={vendors.length}   label="Total Vendors"       trend={`${pending} pending`} down={pending > 0} />
      </div>

      {/* KPI Row 2 */}
      <div className={cn('kpi-grid')} style={{ marginTop: 12 }}>
        <KpiCard color="teal"   icon={<UserPlus size={22}/>}      value={signupsToday}     label="Signups Today"       trend="new registrations" up={signupsToday > 0} />
        <KpiCard color="rose"   icon={<Check size={22}/>}         value={rsvpsToday}       label="RSVPs Today"         trend="responses received" up={rsvpsToday > 0} />
        <KpiCard color="red"    icon={<AlertTriangle size={22}/>} value={expiring7}        label="Expiring in 7 Days"  trend="need attention" down={expiring7 > 0} />
        <KpiCard color="slate"  icon={<ShieldCheck size={22}/>}   value={health?.db ? 1 : 0} label="DB Status"        trend={health?.db ? 'Connected' : 'Error'} up={health?.db} down={!health?.db} />
      </div>

      {/* Quick Actions */}
      <div className={cn('quick-actions-bar')}>
        <span className={cn('quick-actions-label')}>Quick Actions</span>
        {pending > 0 && (
          <button className={cn('btn','btn-sm','btn-outline')}>
            <Eye size={14} /> Review {pending} Pending Vendors
          </button>
        )}
        {expiring7 > 0 && (
          <button className={cn('btn','btn-sm','btn-outline')}>
            <AlertTriangle size={14} /> {expiring7} Trials Expiring Soon
          </button>
        )}
        <button className={cn('btn','btn-sm','btn-outline')}>
          <Download size={14} /> Download Monthly Report
        </button>
      </div>

      {/* Charts row */}
      <div className={cn('chart-grid-2')}>
        <div className={cn('chart-card')}>
          <div className={cn('chart-card-header')}>
            <h3 className={cn('chart-title')}>Couple Signups — Last 30 Days</h3>
            <div className={cn('chart-badge')}>Daily</div>
          </div>
          {loadingCharts ? (
            <div className={cn('chart-placeholder-loading')}>Loading...</div>
          ) : (
            <div className={cn('bar-chart-wrap')}>
              <svg viewBox={`0 0 ${signups.length * 14} 80`} className={cn('bar-chart-svg')}>
                {signups.map((s, i) => {
                  const h = s.count === 0 ? 2 : Math.max(4, (s.count / maxSignup) * 72);
                  return (
                    <rect key={i} x={i * 14 + 1} y={80 - h} width={11} height={h}
                      fill={s.date === todayStart.toISOString().slice(0,10) ? '#E24B6D' : '#93C5FD'}
                      rx={2}>
                      <title>{s.date}: {s.count}</title>
                    </rect>
                  );
                })}
              </svg>
              <div className={cn('chart-axis-labels')}>
                <span>{signups[0]?.date?.slice(5)}</span>
                <span>Today</span>
              </div>
            </div>
          )}
        </div>

        <div className={cn('chart-card')}>
          <div className={cn('chart-card-header')}>
            <h3 className={cn('chart-title')}>RSVP Submissions — Last 30 Days</h3>
            <div className={cn('chart-badge')}>Daily</div>
          </div>
          {loadingCharts ? (
            <div className={cn('chart-placeholder-loading')}>Loading...</div>
          ) : (
            <div className={cn('bar-chart-wrap')}>
              <svg viewBox={`0 0 ${rsvps.length * 14} 80`} className={cn('bar-chart-svg')}>
                {rsvps.map((s, i) => {
                  const h = s.count === 0 ? 2 : Math.max(4, (s.count / maxRsvp) * 72);
                  return (
                    <rect key={i} x={i * 14 + 1} y={80 - h} width={11} height={h}
                      fill={s.date === todayStart.toISOString().slice(0,10) ? '#10B981' : '#6EE7B7'}
                      rx={2}>
                      <title>{s.date}: {s.count}</title>
                    </rect>
                  );
                })}
              </svg>
              <div className={cn('chart-axis-labels')}>
                <span>{rsvps[0]?.date?.slice(5)}</span>
                <span>Today</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Funnel */}
      <div className={cn('chart-card')} style={{ marginTop: 16 }}>
        <div className={cn('chart-card-header')}>
          <h3 className={cn('chart-title')}>Couple Onboarding Funnel</h3>
          <div className={cn('chart-badge')}>All time</div>
        </div>
        <div className={cn('funnel-list')}>
          {funnel.map((step) => (
            <div key={step.step} className={cn('funnel-row')}>
              <span className={cn('funnel-label')}>{step.step}</span>
              <div className={cn('funnel-bar-track')}>
                <div className={cn('funnel-bar-fill')} style={{ width: `${step.pct}%` }} />
              </div>
              <span className={cn('funnel-pct')}>{step.pct}%</span>
              <span className={cn('funnel-count')}>{step.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className={cn('chart-card')} style={{ marginTop: 16 }}>
        <div className={cn('chart-card-header')}>
          <h3 className={cn('chart-title')}>Recent Activity</h3>
          <div className={cn('chart-badge')}>Live · auto-refresh 60s</div>
        </div>
        <div className={cn('activity-feed')}>
          {activity.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: 14, padding: '12px 0' }}>No recent activity.</p>
          ) : activity.slice(0, 12).map((log: any, i: number) => {
            const isError = log.action?.toLowerCase().includes('delete') || log.action?.toLowerCase().includes('error');
            const isWarning = log.action?.toLowerCase().includes('suspend') || log.action?.toLowerCase().includes('pending');
            const dot = isError ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981';
            const when = log.createdAt ? new Date(log.createdAt) : null;
            const ago = when ? getRelativeTime(when) : '';
            return (
              <div key={i} className={cn('activity-item')}>
                <div className={cn('activity-dot')} style={{ background: dot }} />
                <div className={cn('activity-content')}>
                  <div className={cn('activity-text')}>{log.action || log.details || 'System event'}</div>
                  <div className={cn('activity-time')}>{ago}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function getRelativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function KpiCard({ color, icon, value, label, trend, up, down, loading }: any) {
  const isEmpty = value === 0 || value === null && value !== undefined;

  if (loading) {
    return (
      <div className={cn('kpi-card', 'kpi-' + color)}>
        <div className={cn('kpi-icon')}>{icon}</div>
        <div className={cn('kpi-body')}>
          <div className={cn('kpi-value', 'skeleton')}></div>
          <div className={cn('kpi-label', 'skeleton', 'skeleton-sm')}></div>
        </div>
        <div style={{height:18, width:48}} className={cn('skeleton')}></div>
      </div>
    );
  }

  return (
    <div className={cn('kpi-card', 'kpi-' + color)}>
      <div className={cn('kpi-icon')}>{icon}</div>
      <div className={cn('kpi-body')}>
        <div className={cn('kpi-value')}>{value === null || value === undefined ? '—' : (value === 0 ? '—' : value)}</div>
        <div className={cn('kpi-label')}>{label}</div>
      </div>
      <div className={cn('kpi-trend', up ? 'up' : down ? 'down' : 'neutral')}>
        {up && <TrendingUp size={14} />}
        {down && <TrendingDown size={14} />}
        {!up && !down && <Minus size={14} />}
        {isEmpty ? <span style={{opacity:0.6}}>No data</span> : trend}
      </div>
    </div>
  );
}

function CouplesModule({ couples: initialCouples, platformSettings }: any) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [couples, setCouples] = useState(initialCouples || []);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  // Derived filtered list
  let filtered = couples;
  if (filter === 'trial') filtered = filtered.filter((c: any) => c.plan === 'trial' && new Date(c.trialEnds) >= new Date());
  if (filter === 'expired') filtered = filtered.filter((c: any) => c.plan === 'trial' && new Date(c.trialEnds) < new Date());
  if (filter === 'premium') filtered = filtered.filter((c: any) => c.plan === 'premium');
  if (search) filtered = filtered.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openDetail = (c: any) => { setSelected(c); setDetailOpen(true); };
  const handleSaved = (updated: any) => {
    setCouples((prev: any[]) => prev.map((p: any) => p.id === updated.id ? {...p, ...updated} : p));
  };

  const toggleSuspend = async (c: any) => {
    try {
      const res = await fetch(`/api/admin/couples/${c.id}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ suspended: !c.suspended }) });
      if (!res.ok) throw new Error('Failed');
      setCouples((prev: any[]) => prev.map((p: any) => p.id === c.id ? {...p, suspended: !p.suspended} : p));
    } catch (e) { console.error(e); alert('Action failed'); }
  };

  const confirmDelete = (id: string) => { setToDeleteId(id); setConfirmOpen(true); };

  const doDelete = async () => {
    if (!toDeleteId) return setConfirmOpen(false);
    try {
      const res = await fetch(`/api/admin/couples/${toDeleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setCouples((prev: any[]) => prev.filter((p: any) => p.id !== toDeleteId));
      setToDeleteId(null);
      setConfirmOpen(false);
    } catch (e) { console.error(e); alert('Delete failed'); }
  };

  return (
    <section className={cn("module")}>
      <div className={cn("module-header")}>
        <div>
          <h1 className={cn("module-title")}>Couple Management</h1>
          <p className={cn("module-desc")}>{total} couples registered</p>
        </div>
        <div className={cn("module-actions")}>
          <div className={cn("search-box")}>
            <Search size={16} className={cn("search-icon")} />
            <input type="text" className={cn("search-input")} placeholder="Search couples..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
      </div>

      <div className={cn("filter-tabs")}>
        <button className={cn("filter-tab", filter === 'all' && "active")} onClick={() => setFilter('all')}>All</button>
        <button className={cn("filter-tab", filter === 'trial' && "active")} onClick={() => setFilter('trial')}>Active Trial</button>
        <button className={cn("filter-tab", filter === 'expired' && "active")} onClick={() => setFilter('expired')}>Expired Trial</button>
        <button className={cn("filter-tab", filter === 'premium' && "active")} onClick={() => setFilter('premium')}>Premium</button>
      </div>

      <div className={cn("table-card")}>
        <div className={cn("table-responsive")}>
          <table className={cn("data-table")}>
            <thead>
              <tr>
                <th>Couple Names</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((c: any) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td><span className={cn("text-muted")}>{c.email}</span></td>
                  <td><span className={[styles['badge'], styles['badge-' + (c.plan === 'trial' ? (new Date(c.trialEnds) < new Date() ? 'expired' : 'trial') : 'premium')]].filter(Boolean).join(' ')}>
                    {c.plan}
                  </span></td>
                  <td>
                    {c.suspended ? <span className={cn("badge", "badge-rejected")}>Suspended</span> : <span className={cn("badge", "badge-approved")}>Active</span>}
                  </td>
                  <td><span className={cn("text-muted")}>{new Date(c.createdAt).toLocaleDateString()}</span></td>
                  <td>
                    <div className={cn("action-btns")}>
                      <button className={cn("action-btn")} onClick={() => openDetail(c)} title="View / Edit"><Eye size={14} /></button>
                      <button
                        className={cn("action-btn", c.suspended ? "action-approve" : "action-reject")}
                        onClick={() => toggleSuspend(c)}
                        title={c.suspended ? 'Unsuspend' : 'Suspend'}
                      >
                        {c.suspended ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                      </button>
                      <button className={cn("action-btn", "action-danger")} onClick={() => confirmDelete(c.id)} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && <tr><td colSpan={6} style={{textAlign:'center', padding:'2rem', color:'var(--adm-text-muted)'}}>No couples match this filter.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12, flexWrap:'wrap', gap:8}}>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <label style={{fontSize:12, color:'var(--adm-text-secondary)'}}>Page size:</label>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} style={{padding:'4px 8px', borderRadius:6, border:'1px solid var(--adm-border)', fontSize:12}}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span style={{fontSize:12, color:'var(--adm-text-muted)'}}>{total} total</span>
        </div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button className={cn("btn", "btn-ghost", "btn-sm")} onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>Prev</button>
          <div style={{fontSize:13, color:'var(--adm-text-secondary)'}}>Page {page} of {totalPages}</div>
          <button className={cn("btn", "btn-ghost", "btn-sm")} onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}>Next</button>
        </div>
      </div>

      <CoupleDetailModal
        open={detailOpen}
        couple={selected}
        defaultTrialDays={platformSettings?.trial?.defaultTrialDays || 14}
        onClose={() => setDetailOpen(false)}
        onSaved={handleSaved}
      />
      <ConfirmDialog open={confirmOpen} title="Delete Couple" message="Are you sure you want to permanently delete this couple?" onConfirm={doDelete} onCancel={() => setConfirmOpen(false)} />
    </section>
  );
}

function VendorsModule({ vendors: initialVendors }: any) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [vendorsState, setVendorsState] = useState(initialVendors || []);
  const [loading, setLoading] = useState(false);

  let vendors = vendorsState;
  if (filter === 'featured') vendors = vendors.filter((v: any) => v.featured);
  else if (filter === 'pending') vendors = vendors.filter((v: any) => v.status === 'pending' || v.status === 'pending_review');
  else if (filter !== 'all') vendors = vendors.filter((v: any) => v.status === filter);

  if (search) vendors = vendors.filter((v: any) => v.businessName.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase()));

  const pendingCount = (vendorsState || []).filter((v: any) => v.status === 'pending' || v.status === 'pending_review').length;

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    const notes = prompt(`Add notes for ${action} (optional):`) || undefined;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/vendors/${id}/review`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, notes, reviewedBy: 'superadmin' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Review failed');
      const updated = data.data?.vendor;
      if (updated) setVendorsState((prev: any[]) => prev.map(v => v.id === updated.id ? { ...v, ...updated, contactName: v.contactName, email: v.email, featured: updated.onboardingStep === 'live' } : v));
      alert(`Vendor ${action}ed successfully.`);
    } catch (e: any) {
      console.error(e);
      alert('Review failed: ' + (e.message || e));
    } finally { setLoading(false); }
  };

  const handleDeleteVendor = async (id: string) => {
    if (!confirm('Delete vendor? This cannot be undone.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Delete failed');
      setVendorsState((prev: any[]) => prev.filter(v => v.id !== id));
      alert('Vendor deleted');
    } catch (e: any) {
      console.error(e);
      alert('Delete failed');
    } finally { setLoading(false); }
  };

  const toggleFeatured = async (vendor: any) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/vendors/${vendor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !vendor.featured }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Update failed');
      const updated = data.data?.vendor;
      setVendorsState((prev: any[]) => prev.map(v => v.id === vendor.id ? { ...v, ...updated, contactName: v.contactName, email: v.email } : v));
    } catch (e: any) {
      console.error(e);
      alert('Featured update failed');
    } finally { setLoading(false); }
  };

  return (
    <section className={cn("module")}>
      <div className={cn("module-header")}>
        <div>
          <h1 className={cn("module-title")}>Vendor Management</h1>
          <p className={cn("module-desc")}>{vendors.length} vendors on the platform</p>
        </div>
        <div className={cn("module-actions")}>
          <div className={cn("search-box")}>
            <Search size={16} className={cn("search-icon")} />
            <input type="text" className={cn("search-input")} placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className={cn("filter-tabs")}>
        <button className={cn("filter-tab", filter === 'all' && "active")} onClick={() => setFilter('all')}>All</button>
        <button className={cn("filter-tab", filter === 'pending' && "active")} onClick={() => setFilter('pending')}>
          Pending {pendingCount > 0 && <span className={cn("tab-badge")}>{pendingCount}</span>}
        </button>
        <button className={cn("filter-tab", filter === 'approved' && "active")} onClick={() => setFilter('approved')}>Approved</button>
        <button className={cn("filter-tab", filter === 'rejected' && "active")} onClick={() => setFilter('rejected')}>Rejected</button>
        <button className={cn("filter-tab", filter === 'featured' && "active")} onClick={() => setFilter('featured')}>Featured</button>
      </div>

      <div className={cn("table-card")}>
        <div className={cn("table-responsive")}>
          <table className={cn("data-table")}>
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Category</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v: any) => (
                <tr key={v.id}>
                  <td>
                    <div style={{fontWeight:600}}>{v.businessName}</div>
                    {v.featured && <span className={cn("badge", "badge-featured")} style={{fontSize:9}}>Featured</span>}
                  </td>
                  <td><span className={cn("badge", "badge-info")}>{v.category}</span></td>
                  <td>
                    <div style={{fontSize:'var(--text-sm)'}}>{v.contactName}</div>
                    <div className={cn("text-muted")} style={{fontSize:11}}>{v.email}</div>
                  </td>
                  <td><span className={[styles['badge'], styles['badge-' + v.status]].filter(Boolean).join(' ')}>{v.status}</span></td>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:'0.25rem'}}>
                      <Star size={12} fill={v.rating > 0 ? "#F59E0B" : "none"} color={v.rating > 0 ? "#F59E0B" : "#CBD5E1"} />
                      <span style={{fontSize:11, color:'var(--adm-text-muted)'}}>{v.rating || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <div className={cn("action-btns")}>
                      {(v.status === 'pending' || v.status === 'pending_review') && (
                        <>
                          <button className={cn("action-btn", "action-approve")} onClick={async () => await handleReview(v.id, 'approve')} title="Approve"><Check size={14}/></button>
                          <button className={cn("action-btn", "action-reject")} onClick={async () => await handleReview(v.id, 'reject')} title="Reject"><X size={14}/></button>
                        </>
                      )}
                      <button className={cn("action-btn", "action-star", v.featured && "starred")} onClick={async () => await toggleFeatured(v)} disabled={loading} title={v.featured ? 'Remove featured' : 'Mark featured'}><Star size={14}/></button>
                      <button className={cn("action-btn", "action-danger")} onClick={async () => await handleDeleteVendor(v.id)}><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && <tr><td colSpan={6} style={{textAlign:'center', padding:'2rem'}}>No vendors found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function PlansModule({ initialPlans }: any) {
  const [plans, setPlans] = useState(initialPlans || []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const updatePlan = (index: number, patch: any) => {
    setPlans((prev: any[]) => prev.map((plan, i) => i === index ? { ...plan, ...patch } : plan));
  };

  const updateEntitlement = (index: number, key: string, value: any) => {
    setPlans((prev: any[]) => prev.map((plan, i) => i === index ? {
      ...plan,
      entitlements: { ...plan.entitlements, [key]: value },
    } : plan));
  };

  const savePlans = async (syncStripe = false) => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans, syncStripe }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to save plans');
      setPlans(data.data.plans);
      setMessage(data.data.stripeSynced ? 'Plans saved and Stripe billing synced.' : 'Plans saved.');
    } catch (e: any) {
      setMessage(e.message || 'Failed to save plans');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={cn("module")}>
      <div className={cn("module-header")}>
        <div>
          <h1 className={cn("module-title")}>Plans & Feature Gating</h1>
          <p className={cn("module-desc")}>Manage feature entitlements and platform pricing.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className={cn("btn", "btn-ghost")} onClick={() => savePlans(false)} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Plans'}
          </button>
          <button className={cn("btn", "btn-primary")} onClick={() => savePlans(true)} disabled={saving}>
            <CreditCard size={16} /> Save & Sync Billing
          </button>
        </div>
      </div>
      {message && <div style={{ marginTop: 12, color: message.includes('Failed') ? 'var(--adm-danger)' : 'var(--adm-success)' }}>{message}</div>}
      
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
        {plans.map((plan: any, index: number) => (
          <div key={plan.id} style={{ 
            flex: '1 1 300px', 
            background: 'var(--adm-bg-card)', 
            border: plan.id === 'premium' ? '2px solid var(--adm-primary)' : '1px solid var(--adm-border)', 
            borderRadius: '16px', 
            padding: '2rem' 
          }}>
            <input className={cn("input")} value={plan.name} onChange={e => updatePlan(index, { name: e.target.value })} style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 10 }} />
            <input className={cn("input")} value={plan.price} onChange={e => updatePlan(index, { price: e.target.value })} style={{ marginBottom: 10 }} />
            <input
              className={cn("input")}
              value={plan.billingPriceId || ''}
              onChange={e => updatePlan(index, { billingPriceId: e.target.value })}
              placeholder="Stripe price ID"
              style={{ marginBottom: 10 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <input
                className={cn("input")}
                value={plan.billingCurrency || 'usd'}
                onChange={e => updatePlan(index, { billingCurrency: e.target.value })}
                placeholder="Currency"
              />
              <select
                className={cn("input")}
                value={plan.billingInterval || 'month'}
                onChange={e => updatePlan(index, { billingInterval: e.target.value })}
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
            <textarea className={cn("input")} value={plan.description || ''} onChange={e => updatePlan(index, { description: e.target.value })} rows={2} style={{ marginBottom: '1.5rem' }} />
            
            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--adm-text-muted)', marginBottom: '1rem' }}>
              Entitlements Matrix
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span>Max Guests</span>
                <input type="number" className={cn("input")} value={plan.entitlements.maxGuests} onChange={e => updateEntitlement(index, 'maxGuests', Number(e.target.value))} style={{ width: 120 }} />
              </li>
              {['digitalInvitations', 'customDomain', 'vendorShortlist', 'premiumTemplates'].map(key => (
                <li key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--adm-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {plan.entitlements[key] ? <Check size={16} color="var(--adm-success)" /> : <X size={16} color="var(--adm-danger)" />}
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, char => char.toUpperCase())}
                  </span>
                  <input type="checkbox" checked={Boolean(plan.entitlements[key])} onChange={e => updateEntitlement(index, key, e.target.checked)} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function SettingsModule({ initialSettings, onSaved }: any) {
  const [settings, setSettings] = useState(initialSettings || {});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const updateSection = (section: string, key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [key]: value,
      },
    }));
  };

  const updateTemplate = (index: number, key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      templates: (prev.templates || []).map((template: any, i: number) => i === index ? { ...template, [key]: value } : template),
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to save settings');
      setSettings(data.data.settings);
      onSaved?.(data.data.settings);
      setMessage('Settings saved.');
    } catch (e: any) {
      setMessage(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={cn("module")}>
      <div className={cn("module-header")}>
        <div>
          <h1 className={cn("module-title")}>Platform Settings</h1>
          <p className={cn("module-desc")}>Persistent branding, contact, public-site, CMS, and template controls.</p>
        </div>
        <button className={cn("btn", "btn-primary")} onClick={saveSettings} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
      {message && <div style={{ marginTop: 12, color: message.includes('Failed') ? 'var(--adm-danger)' : 'var(--adm-success)' }}>{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
        <SettingsCard title="Branding">
          <TextField label="Site Name" value={settings.branding?.siteName} onChange={(value: string) => updateSection('branding', 'siteName', value)} />
          <TextField label="Logo URL" value={settings.branding?.logoUrl} onChange={(value: string) => updateSection('branding', 'logoUrl', value)} />
          <TextField label="Primary Color" value={settings.branding?.primaryColor} onChange={(value: string) => updateSection('branding', 'primaryColor', value)} />
          <TextField label="Public Tagline" value={settings.branding?.publicTagline} onChange={(value: string) => updateSection('branding', 'publicTagline', value)} />
        </SettingsCard>

        <SettingsCard title="Contact">
          <TextField label="Phone" value={settings.contact?.phone} onChange={(value: string) => updateSection('contact', 'phone', value)} />
          <TextField label="WhatsApp" value={settings.contact?.whatsapp} onChange={(value: string) => updateSection('contact', 'whatsapp', value)} />
          <TextField label="Support Email" value={settings.contact?.supportEmail} onChange={(value: string) => updateSection('contact', 'supportEmail', value)} />
        </SettingsCard>

        <SettingsCard title="Public Site">
          <TextField label="Hero Title" value={settings.publicSite?.heroTitle} onChange={(value: string) => updateSection('publicSite', 'heroTitle', value)} />
          <TextArea label="Hero Subtitle" value={settings.publicSite?.heroSubtitle} onChange={(value: string) => updateSection('publicSite', 'heroSubtitle', value)} />
          <TextField label="CTA Label" value={settings.publicSite?.ctaLabel} onChange={(value: string) => updateSection('publicSite', 'ctaLabel', value)} />
          <TextField label="CTA Link" value={settings.publicSite?.ctaHref} onChange={(value: string) => updateSection('publicSite', 'ctaHref', value)} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--adm-text-secondary)' }}>
            <input type="checkbox" checked={Boolean(settings.publicSite?.maintenanceMode)} onChange={e => updateSection('publicSite', 'maintenanceMode', e.target.checked)} />
            Maintenance Mode
          </label>
        </SettingsCard>

        <SettingsCard title="Trial Settings">
          <label style={{ display: 'grid', gap: 6, color: 'var(--adm-text-secondary)', fontSize: 13 }}>
            Default trial days for new couples
            <input
              type="number"
              min={1}
              max={365}
              className={cn("input")}
              value={settings.trial?.defaultTrialDays || 14}
              onChange={e => updateSection('trial', 'defaultTrialDays', Number(e.target.value))}
            />
          </label>
          <p style={{ margin: 0, color: 'var(--adm-text-muted)', fontSize: 12, lineHeight: 1.5 }}>
            New couple accounts receive this trial length automatically. Existing couples can still be adjusted one by one from Couple Management.
          </p>
        </SettingsCard>

        <SettingsCard title="CMS Blocks">
          <TextArea label="Features Intro" value={settings.cmsBlocks?.featuresIntro} onChange={(value: string) => updateSection('cmsBlocks', 'featuresIntro', value)} />
          <TextArea label="Templates Intro" value={settings.cmsBlocks?.templatesIntro} onChange={(value: string) => updateSection('cmsBlocks', 'templatesIntro', value)} />
          <TextArea label="Footer Note" value={settings.cmsBlocks?.footerNote} onChange={(value: string) => updateSection('cmsBlocks', 'footerNote', value)} />
        </SettingsCard>

        <SettingsCard title="Templates">
          {(settings.templates || []).map((template: any, index: number) => (
            <div key={template.id} style={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 8, alignItems: 'center' }}>
              <input className={cn("input")} value={template.name} onChange={e => updateTemplate(index, 'name', e.target.value)} />
              <select className={cn("input")} value={template.status} onChange={e => updateTemplate(index, 'status', e.target.value)}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          ))}
        </SettingsCard>
      </div>
    </section>
  );
}

function TemplatesModule({ initialSettings }: any) {
  const [templates, setTemplates] = useState(initialSettings?.templates || []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const updateTemplate = (index: number, key: string, value: string) => {
    setTemplates((prev: any[]) => prev.map((template, i) => i === index ? { ...template, [key]: value } : template));
  };

  const addTemplate = () => {
    setTemplates((prev: any[]) => [
      ...prev,
      { id: `template-${Date.now().toString(36)}`, name: 'New Template', status: 'draft' },
    ]);
  };

  const removeTemplate = (index: number) => {
    setTemplates((prev: any[]) => prev.filter((_, i) => i !== index));
  };

  const saveTemplates = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { templates } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to save templates');
      setTemplates(data.data.settings.templates || []);
      setMessage('Templates saved.');
    } catch (e: any) {
      setMessage(e.message || 'Failed to save templates');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={cn("module")}>
      <div className={cn("module-header")}>
        <div>
          <h1 className={cn("module-title")}>Template Controls</h1>
          <p className={cn("module-desc")}>Manage public template availability and labels.</p>
        </div>
        <div className={cn("module-actions")}>
          <button className={cn("btn", "btn-outline")} onClick={addTemplate}><Plus size={16} /> Add Template</button>
          <button className={cn("btn", "btn-primary")} onClick={saveTemplates} disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save Templates'}</button>
        </div>
      </div>
      {message && <div style={{ marginTop: 12, color: message.includes('Failed') ? 'var(--adm-danger)' : 'var(--adm-success)' }}>{message}</div>}
      <div className={cn("table-card")} style={{ marginTop: '1.5rem' }}>
        <div className={cn("table-responsive")}>
          <table className={cn("data-table")}>
            <thead>
              <tr>
                <th>Template ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template: any, index: number) => (
                <tr key={template.id}>
                  <td><input className={cn("input")} value={template.id} onChange={e => updateTemplate(index, 'id', e.target.value)} /></td>
                  <td><input className={cn("input")} value={template.name} onChange={e => updateTemplate(index, 'name', e.target.value)} /></td>
                  <td>
                    <select className={cn("input")} value={template.status} onChange={e => updateTemplate(index, 'status', e.target.value)}>
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                    </select>
                  </td>
                  <td>
                    <button className={cn("action-btn", "action-danger")} onClick={() => removeTemplate(index)} title="Remove template">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No templates configured.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function LogsModule() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/logs?lines=50');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load logs');
      setLogs(data.data.lines || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  React.useEffect(() => { loadLogs(); }, []);

  return (
    <section className={cn("module")}>
      <div className={cn("module-header")}>
        <div>
          <h1 className={cn("module-title")}>Audit Logs</h1>
          <p className={cn("module-desc")}>Recent sensitive Super Admin, billing, and webhook activity.</p>
        </div>
        <button className={cn("btn", "btn-outline")} onClick={loadLogs} disabled={loading}>
          <RefreshCw size={16} /> {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      {error && <div style={{ marginTop: 12, color: 'var(--adm-danger)' }}>{error}</div>}
      <div className={cn("table-card")} style={{ marginTop: '1.5rem' }}>
        <div className={cn("table-responsive")}>
          <table className={cn("data-table")}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={`${log.ts || index}-${index}`}>
                  <td><span className={cn("text-muted")}>{log.ts ? new Date(log.ts).toLocaleString() : '-'}</span></td>
                  <td>{log.action || log.event || log.raw || '-'}</td>
                  <td>{log.targetId || log.sessionId || log.customerId || '-'}</td>
                  <td><code style={{ whiteSpace: 'pre-wrap', fontSize: 11 }}>{JSON.stringify(log.data || log.rec || log.error || {}, null, 0)}</code></td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No audit records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function SettingsCard({ title, children }: any) {
  return (
    <div style={{ background: 'var(--adm-bg-card)', border: '1px solid var(--adm-border)', borderRadius: '16px', padding: '1.25rem', display: 'grid', gap: 12 }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--adm-text-primary)' }}>{title}</h2>
      {children}
    </div>
  );
}

function TextField({ label, value, onChange }: any) {
  return (
    <label style={{ display: 'grid', gap: 6, color: 'var(--adm-text-secondary)', fontSize: 13 }}>
      {label}
      <input className={cn("input")} value={value || ''} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange }: any) {
  return (
    <label style={{ display: 'grid', gap: 6, color: 'var(--adm-text-secondary)', fontSize: 13 }}>
      {label}
      <textarea className={cn("input")} value={value || ''} onChange={e => onChange(e.target.value)} rows={3} />
    </label>
  );
}

function CleanupModule() {
  const [retentionDays, setRetentionDays] = useState(30);
  const [summary, setSummary] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkDryRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/cleanup?retentionDays=${retentionDays}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch summary');
      setSummary(data.summary);
      setToken(data.confirmationToken);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const executeCleanup = async () => {
    if (!token) return;
    if (!confirm('Are you absolutely sure you want to execute destructive cleanup? This will permanently delete guests and RSVPs for expired trial weddings.')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/cleanup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execute', retentionDays, token, force: true })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');
      setResult(data);
      setSummary(null);
      setToken(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={cn("module")}>
      <div className={cn("module-header")}>
        <div>
          <h1 className={cn("module-title")}>Trial Data Cleanup</h1>
          <p className={cn("module-desc")}>Safely remove guests and RSVPs from expired trial accounts.</p>
        </div>
      </div>
      
      <div style={{ background: 'var(--adm-bg-card)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--adm-border)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--adm-text-primary)' }}>Retention Policy</h3>
        <p style={{ color: 'var(--adm-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          This cleanup job targets <strong>Trial Weddings</strong> that were created more than the specified retention days ago. 
          When executed, it will <strong>permanently delete</strong> all Guests and RSVPs associated with those weddings to save space. 
          The Wedding record itself is retained but marked as <code>trialExpired</code>.
          Premium weddings and active trials are <strong>protected</strong>.
        </p>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div style={{ flex: 1, maxWidth: 200 }}>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', color: 'var(--adm-text-secondary)', marginBottom: '0.5rem' }}>Retention Days</label>
            <input type="number" min="1" value={retentionDays} onChange={e => setRetentionDays(Number(e.target.value))} className={cn("input")} />
          </div>
          <button className={cn("btn", "btn-outline")} onClick={checkDryRun} disabled={loading}>
            {loading && !summary && !result ? 'Calculating...' : 'Calculate Dry-Run'}
          </button>
        </div>

        {error && <div style={{ background: 'var(--adm-danger-bg)', color: 'var(--adm-danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--adm-danger)' }}>{error}</div>}

        {summary && (
          <div style={{ background: 'var(--adm-bg-alt)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--adm-border)', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--adm-text-primary)' }}>Dry-Run Summary</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--adm-text-secondary)' }}>
              <li><strong>{summary.weddings}</strong> Trial weddings identified</li>
              <li><strong>{summary.guests}</strong> Guests to be deleted</li>
              <li><strong>{summary.rsvps}</strong> RSVPs to be deleted</li>
            </ul>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button className={cn("btn", "btn-primary")} style={{ background: 'var(--adm-danger)', color: 'white', border: 'none' }} onClick={executeCleanup} disabled={loading || (summary.guests === 0 && summary.rsvps === 0 && summary.weddings === 0)}>
                {loading ? 'Executing...' : 'Execute Destructive Cleanup'}
              </button>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--adm-text-muted)' }}>*This action cannot be undone.</span>
            </div>
          </div>
        )}

        {result && (
          <div style={{ background: 'var(--adm-success-bg)', color: 'var(--adm-success)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--adm-success)', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Cleanup Executed Successfully</h4>
            <p style={{ fontSize: 'var(--text-sm)', marginBottom: '0.5rem' }}>
              Marked <strong>{result.weddingCount}</strong> weddings as expired.
            </p>
            <p style={{ fontSize: 'var(--text-sm)' }}>
              Deleted <strong>{result.deleted.guests.length}</strong> guests and <strong>{result.deleted.rsvps.length}</strong> RSVPs.
            </p>
            {result.errors?.length > 0 && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,0,0,0.1)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Errors encountered:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                  {result.errors.map((e: string, i: number) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function PointsModule({ requests, onRequestsChange }: { requests: any[]; onRequestsChange: (r: any[]) => void }) {
  const [settings, setSettings] = useState<{ pointsPerUnlock: number } | null>(null);
  const [newCost, setNewCost] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/points/settings')
      .then(r => r.json())
      .then(d => { if (d.settings) { setSettings(d.settings); setNewCost(String(d.settings.pointsPerUnlock)); } })
      .catch(() => {});
  }, []);

  async function handleReview(requestId: string, action: 'approve' | 'reject') {
    setReviewing(requestId);
    setError('');
    try {
      const res = await fetch('/api/admin/points/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed.');
      const updated = await fetch('/api/admin/points/requests').then(r => r.json());
      if (updated.requests) onRequestsChange(updated.requests);
      setNotice(`Request ${action}d.`);
    } catch (err: any) {
      setError(err.message || 'Failed.');
    } finally {
      setReviewing(null);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(newCost);
    if (!n || n < 1) { setError('Cost must be at least 1.'); return; }
    setSavingSettings(true);
    setError('');
    try {
      const res = await fetch('/api/admin/points/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pointsPerUnlock: n }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed.');
      setSettings(json.settings);
      setNotice('Settings saved.');
    } catch (err: any) {
      setError(err.message || 'Failed.');
    } finally {
      setSavingSettings(false);
    }
  }

  const pending = requests.filter(r => r.status === 'pending');
  const reviewed = requests.filter(r => r.status !== 'pending');
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div>
      <style>{`
        .ptSection { margin-bottom: 2rem; }
        .ptSectionTitle { font-size: 1rem; font-weight: 700; color: #111827; margin: 0 0 .75rem; padding-bottom: .5rem; border-bottom: 1px solid #E5E7EB; }
        .ptCard { background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: .875rem 1rem; margin-bottom: .5rem; display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
        .ptVendorName { font-weight: 600; font-size: .9rem; color: #111827; flex: 1; min-width: 140px; }
        .ptMeta { font-size: .8rem; color: #6B7280; }
        .ptActions { display: flex; gap: .5rem; }
        .ptApprove { padding: .3rem .8rem; background: #065F46; color: white; border: none; border-radius: 6px; font-size: .8rem; font-weight: 600; cursor: pointer; }
        .ptApprove:disabled { opacity: .5; }
        .ptReject { padding: .3rem .8rem; background: #FEE2E2; color: #991B1B; border: none; border-radius: 6px; font-size: .8rem; font-weight: 600; cursor: pointer; }
        .ptReject:disabled { opacity: .5; }
        .ptBadge { display: inline-block; padding: .15rem .45rem; border-radius: 4px; font-size: .75rem; font-weight: 600; }
        .ptBadgePending { background: #FEF3C7; color: #92400E; }
        .ptBadgeApproved { background: #D1FAE5; color: #065F46; }
        .ptBadgeRejected { background: #FEE2E2; color: #991B1B; }
        .ptSettingsForm { display: flex; gap: .75rem; align-items: flex-end; flex-wrap: wrap; }
        .ptSettingsInput { padding: .45rem .7rem; border: 1px solid #D1D5DB; border-radius: 6px; font-size: .875rem; width: 80px; font-family: inherit; outline: none; }
        .ptSettingsSave { padding: .45rem 1rem; background: #111827; color: white; border: none; border-radius: 6px; font-size: .875rem; font-weight: 600; cursor: pointer; }
        .ptSettingsSave:disabled { opacity: .5; }
        .ptNotice { color: #16A34A; font-size: .85rem; margin-bottom: .5rem; }
        .ptError { color: #DC2626; font-size: .85rem; margin-bottom: .5rem; }
        .ptEmpty { color: #9CA3AF; font-size: .875rem; padding: .75rem 0; }
      `}</style>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 1.5rem', color: '#111827' }}>Points Management</h2>

      {notice && <div className="ptNotice">{notice}</div>}
      {error && <div className="ptError">{error}</div>}

      <div className="ptSection">
        <div className="ptSectionTitle">Unlock Cost Setting</div>
        {settings ? (
          <form className="ptSettingsForm" onSubmit={handleSaveSettings}>
            <div>
              <div style={{ fontSize: '.8rem', color: '#6B7280', marginBottom: 3 }}>Points per unlock</div>
              <input className="ptSettingsInput" type="number" min={1} value={newCost} onChange={e => setNewCost(e.target.value)} />
            </div>
            <button type="submit" className="ptSettingsSave" disabled={savingSettings}>
              {savingSettings ? 'Saving…' : 'Save'}
            </button>
          </form>
        ) : (
          <div className="ptEmpty">Loading…</div>
        )}
      </div>

      <div className="ptSection">
        <div className="ptSectionTitle">Pending Requests ({pending.length})</div>
        {pending.length === 0 ? (
          <div className="ptEmpty">No pending requests.</div>
        ) : (
          pending.map(r => (
            <div key={r.id} className="ptCard">
              <div className="ptVendorName">{r.vendorName}</div>
              <div className="ptMeta">{r.pointsRequested} points · {fmt(r.createdAt)}{r.note ? ` · "${r.note}"` : ''}</div>
              <div className="ptActions">
                <button className="ptApprove" disabled={reviewing === r.id} onClick={() => handleReview(r.id, 'approve')}>
                  {reviewing === r.id ? '…' : 'Approve'}
                </button>
                <button className="ptReject" disabled={reviewing === r.id} onClick={() => handleReview(r.id, 'reject')}>
                  {reviewing === r.id ? '…' : 'Reject'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="ptSection">
        <div className="ptSectionTitle">Reviewed</div>
        {reviewed.length === 0 ? (
          <div className="ptEmpty">No reviewed requests yet.</div>
        ) : (
          reviewed.slice(0, 20).map(r => (
            <div key={r.id} className="ptCard">
              <div className="ptVendorName">{r.vendorName}</div>
              <div className="ptMeta">{r.pointsRequested} pts · {fmt(r.createdAt)}</div>
              <span className={`ptBadge ptBadge${r.status.charAt(0).toUpperCase() + r.status.slice(1)}`}>{r.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RevenueModule() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [txPage, setTxPage] = useState(1);
  const TX_PAGE = 10;

  useEffect(() => {
    fetch('/api/admin/analytics/revenue')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const txs = data?.transactions || [];
  const totalTxPages = Math.ceil(txs.length / TX_PAGE) || 1;
  const pagedTxs = txs.slice((txPage - 1) * TX_PAGE, txPage * TX_PAGE);

  const fmt = (n: number) => `LKR ${Number(n).toLocaleString()}`;

  return (
    <section className={cn('module')}>
      <div className={cn('module-header')}>
        <div>
          <h1 className={cn('module-title')}>Revenue</h1>
          <p className={cn('module-desc')}>Financial overview and transactions</p>
        </div>
      </div>

      <div className={cn('kpi-grid')}>
        <KpiCard loading={loading} color="green"  icon={<TrendingUp size={22} />}  value={loading ? null : fmt(data?.mrr || 0)}       label="MRR"           trend="monthly" />
        <KpiCard loading={loading} color="blue"   icon={<CreditCard size={22} />} value={loading ? null : fmt(data?.total || 0)}      label="Total Revenue"  trend="all time" />
        <KpiCard loading={loading} color="purple" icon={<TrendingUp size={22} />} value={loading ? null : fmt(data?.thisMonth || 0)}  label="This Month"     trend="current month" />
      </div>

      <div className={cn('table-card')} style={{ marginTop: 24 }}>
        <div className={cn('table-card-header')}>
          <h3 className={cn('table-title')}>Recent Activity</h3>
        </div>
        <div className={cn('table-responsive')}>
          <table className={cn('data-table')}>
            <thead>
              <tr>
                <th>Couple</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94A3B8', padding: 24 }}>Loading...</td></tr>
              ) : pagedTxs.map((tx: any, i: number) => (
                <tr key={i}>
                  <td>{tx.coupleName}</td>
                  <td><span className={cn('badge', tx.plan === 'premium' ? 'badge-green' : 'badge-gray')}>{tx.plan}</span></td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(tx.amount)}</td>
                  <td>{tx.date}</td>
                  <td><span className={cn('badge', tx.status === 'paid' ? 'badge-green' : 'badge-gray')}>{tx.status}</span></td>
                </tr>
              ))}
              {!loading && pagedTxs.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94A3B8', padding: 24 }}>No transactions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalTxPages > 1 && (
          <div className={cn('pagination')}>
            <button className={cn('page-btn')} disabled={txPage === 1} onClick={() => setTxPage(p => p - 1)}>&#8249;</button>
            <span className={cn('page-info')}>Page {txPage} of {totalTxPages}</span>
            <button className={cn('page-btn')} disabled={txPage === totalTxPages} onClick={() => setTxPage(p => p + 1)}>&#8250;</button>
          </div>
        )}
      </div>
    </section>
  );
}
