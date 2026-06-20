'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  Tooltip, Legend, PointElement, LineElement, Filler,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Users, CheckCircle, Clock, X, TrendingUp,
  RefreshCw, Calendar, Wallet, ListChecks, Heart,
  AlertTriangle,
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, PointElement, LineElement, Filler);

const ROSE   = 'rgba(244, 63, 94, 1)';
const ROSE_F = 'rgba(244, 63, 94, 0.15)';
const GREEN  = 'rgba(16, 185, 129, 1)';
const GREEN_F= 'rgba(16, 185, 129, 0.15)';
const AMBER  = 'rgba(245, 158, 11, 1)';
const SLATE  = 'rgba(148, 163, 184, 1)';
const SLATE_F= 'rgba(148, 163, 184, 0.15)';
const PURPLE = 'rgba(139, 92, 246, 1)';

function formatLKR(n: number) {
  if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `LKR ${(n / 1_000).toFixed(0)}K`;
  return `LKR ${n.toLocaleString()}`;
}

function Skeleton({ height = 16, width = '100%' }: { height?: number; width?: string | number }) {
  return <div style={{ height, width, borderRadius: 6, background: 'var(--color-surface-raised, #f1f5f9)', animation: 'pulse 1.5s ease-in-out infinite' }} />;
}

function SectionCard({ title, icon, children, action }: any) {
  return (
    <div style={{ background: 'var(--color-surface, #fff)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--color-primary, #f43f5e)' }}>{icon}</span>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-text, #1e293b)' }}>{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatRow({ label, value, pct, color }: { label: string; value: number | string; pct?: number; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text, #1e293b)' }}>{value}</span>
      </div>
      {typeof pct === 'number' && (
        <div style={{ height: 6, borderRadius: 99, background: 'var(--color-border, #e2e8f0)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, width: `${Math.min(100, pct)}%`, background: color || ROSE, transition: 'width 0.4s ease' }} />
        </div>
      )}
    </div>
  );
}

export default function CoupleAnalyticsModule({ weddingId }: { weddingId: string }) {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`/api/weddings/${weddingId}/analytics`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load analytics');
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [weddingId]);

  const g  = data?.guests     || {};
  const at = data?.attendance  || {};
  const b  = data?.budget      || {};
  const cl = data?.checklist   || {};
  const cd = data?.countdown   || {};

  // ── RSVP Timeline chart ──────────────────────────────────────
  const timelineLabels = (data?.rsvpTimeline || []).map((d: any) => {
    const dt = new Date(d.date);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  const timelineData = {
    labels: timelineLabels,
    datasets: [
      { label: 'Confirmed', data: (data?.rsvpTimeline || []).map((d: any) => d.confirmed), backgroundColor: GREEN },
      { label: 'Declined',  data: (data?.rsvpTimeline || []).map((d: any) => d.declined),  backgroundColor: ROSE },
    ],
  };

  // ── Budget doughnut ──────────────────────────────────────────
  const budgetDonut = {
    labels: ['Paid', 'Reserved', 'Planned', 'Remaining'],
    datasets: [{
      data: [b.paid || 0, b.reserved || 0, b.planned || 0, Math.max(0, b.remaining || 0)],
      backgroundColor: [GREEN, AMBER, PURPLE, SLATE],
      borderWidth: 0, hoverOffset: 4,
    }],
  };

  // ── RSVP doughnut ────────────────────────────────────────────
  const rsvpDonut = {
    labels: ['Confirmed', 'Declined', 'No Response'],
    datasets: [{
      data: [g.confirmed || 0, g.declined || 0, g.noResponse || 0],
      backgroundColor: [GREEN, ROSE, SLATE],
      borderWidth: 0, hoverOffset: 4,
    }],
  };

  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false, cutout: '68%',
    plugins: {
      legend: { position: 'right' as const, labels: { font: { size: 11 }, boxWidth: 12, color: '#64748b' } },
      tooltip: { mode: 'index' as const, intersect: false },
    },
  };

  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index' as const, intersect: false } },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { maxTicksLimit: 8, font: { size: 10 }, color: '#94A3B8' } },
      y: { stacked: true, grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { font: { size: 10 }, color: '#94A3B8', precision: 0 } },
    },
  };

  return (
    <section className="module" aria-label="Wedding Analytics">
      <div className="module-header">
        <div>
          <h1 className="module-title">Wedding Analytics</h1>
          <p className="module-subtitle">RSVP funnel, attendance predictions, budget health, and planning progress</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border, #e2e8f0)', background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-secondary, #64748b)' }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #fecaca', fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* ── Countdown banner ────────────────────────────────── */}
      {!loading && cd.daysUntil !== null && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(244,63,94,0.08) 0%, rgba(139,92,246,0.08) 100%)',
          border: '1px solid rgba(244,63,94,0.2)', borderRadius: 14, padding: '1rem 1.5rem',
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4,
        }}>
          <Heart size={20} style={{ color: ROSE, flexShrink: 0 }} />
          <div>
            {cd.daysUntil > 0
              ? <><strong style={{ fontSize: 16, color: '#1e293b' }}>{cd.daysUntil} days</strong> <span style={{ color: '#64748b', fontSize: 14 }}>until your wedding</span></>
              : cd.daysUntil === 0
              ? <strong style={{ fontSize: 16, color: ROSE }}>Your wedding is TODAY!</strong>
              : <span style={{ color: '#64748b', fontSize: 14 }}>Wedding was {Math.abs(cd.daysUntil)} days ago</span>
            }
          </div>
          {cd.eventDate && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94a3b8' }}>{new Date(cd.eventDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>}
        </div>
      )}

      {/* ── KPI row ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { icon: <Users size={18} />, label: 'Total Guests', value: loading ? '—' : g.total, color: '#3b82f6' },
          { icon: <CheckCircle size={18} />, label: 'Confirmed', value: loading ? '—' : g.confirmed, color: '#10b981' },
          { icon: <Clock size={18} />, label: 'No Response', value: loading ? '—' : g.noResponse, color: '#f59e0b' },
          { icon: <X size={18} />, label: 'Declined', value: loading ? '—' : g.declined, color: '#ef4444' },
          { icon: <TrendingUp size={18} />, label: 'Response Rate', value: loading ? '—' : `${g.responseRate}%`, color: '#8b5cf6' },
          { icon: <Heart size={18} />, label: 'Expected Attend.', value: loading ? '—' : at.totalExpected, color: '#f43f5e' },
        ].map((k, i) => (
          <div key={i} style={{ background: 'var(--color-surface, #fff)', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: 12, padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ color: k.color }}>{k.icon}</span>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text, #1e293b)' }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary, #64748b)' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* ── Row 1: Funnel + Timeline ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>

        {/* RSVP Funnel */}
        <SectionCard title="RSVP Funnel" icon={<TrendingUp size={16} />}>
          {loading ? <Skeleton height={160} /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <FunnelBar label="Guests Invited" value={g.total} max={g.total} color={ROSE} pct={100} />
              <FunnelBar label="Responded" value={g.responded} max={g.total} color={PURPLE} pct={g.responseRate} />
              <FunnelBar label="Confirmed" value={g.confirmed} max={g.total} color={GREEN} pct={g.confirmRate} />
              <FunnelBar label="Declined" value={g.declined} max={g.total} color={AMBER} pct={g.declineRate} />
            </div>
          )}
          {!loading && (
            <div style={{ display: 'flex', gap: 16, paddingTop: 4, borderTop: '1px solid var(--color-border, #e2e8f0)' }}>
              <MiniStat label="Bride side" value={g.brideSide || 0} />
              <MiniStat label="Groom side" value={g.groomSide || 0} />
              <MiniStat label="Avg response" value={`${g.responseRate || 0}%`} />
            </div>
          )}
        </SectionCard>

        {/* RSVP Doughnut */}
        <SectionCard title="RSVP Breakdown" icon={<Users size={16} />}>
          <div style={{ height: 160 }}>
            {loading ? <Skeleton height={160} /> : <Doughnut data={rsvpDonut} options={doughnutOpts} />}
          </div>
          {!loading && Object.keys(at.mealPrefs || {}).length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 8, borderTop: '1px solid var(--color-border, #e2e8f0)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meal Preferences</div>
              {Object.entries(at.mealPrefs || {}).map(([label, count]: any) => (
                <StatRow key={label} label={label} value={count} pct={at.totalExpected > 0 ? Math.round((count / at.totalExpected) * 100) : 0} color={PURPLE} />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Row 2: RSVP Timeline ─────────────────────────────── */}
      <SectionCard title="RSVP Activity — Last 30 Days" icon={<Calendar size={16} />}>
        <div style={{ height: 160 }}>
          {loading ? <Skeleton height={160} /> : (
            <Bar data={timelineData} options={{
              ...barOpts,
              plugins: {
                ...barOpts.plugins,
                legend: { display: true, position: 'top' as const, labels: { font: { size: 11 }, boxWidth: 12, color: '#64748b' } },
              },
            }} />
          )}
        </div>
      </SectionCard>

      {/* ── Row 3: Budget + Checklist ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>

        {/* Budget Health */}
        <SectionCard title="Budget Health" icon={<Wallet size={16} />}>
          {loading ? <Skeleton height={160} /> : (
            <>
              <div style={{ height: 160 }}>
                <Doughnut data={budgetDonut} options={doughnutOpts} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <StatRow label="Total Budget" value={formatLKR(b.total || 0)} />
                <StatRow label="Paid" value={formatLKR(b.paid || 0)} pct={b.paidPct} color={GREEN} />
                <StatRow label="Reserved" value={formatLKR(b.reserved || 0)} pct={b.total > 0 ? Math.round((b.reserved / b.total) * 100) : 0} color={AMBER} />
                <StatRow label="Remaining" value={formatLKR(b.remaining || 0)} />
              </div>
            </>
          )}
          {!loading && b.categories?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 8, borderTop: '1px solid var(--color-border, #e2e8f0)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Categories</div>
              {b.categories.slice(0, 5).map((cat: any) => (
                <StatRow key={cat.name} label={cat.name} value={formatLKR(cat.estimated)} pct={b.total > 0 ? Math.round((cat.estimated / b.total) * 100) : 0} color={ROSE} />
              ))}
            </div>
          )}
        </SectionCard>

        {/* Checklist Progress */}
        <SectionCard title="Planning Progress" icon={<ListChecks size={16} />}>
          {loading ? <Skeleton height={200} /> : (
            <>
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: cl.completionPct >= 80 ? '#10b981' : cl.completionPct >= 40 ? '#f59e0b' : '#f43f5e' }}>
                  {cl.completionPct}%
                </div>
                <div style={{ fontSize: 13, color: '#64748b' }}>tasks completed</div>
              </div>
              <div style={{ height: 10, borderRadius: 99, background: 'var(--color-border, #e2e8f0)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${cl.completionPct}%`, background: cl.completionPct >= 80 ? GREEN : cl.completionPct >= 40 ? AMBER : ROSE, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                <MiniStatCard label="Completed" value={cl.completed || 0} color={GREEN} icon={<CheckCircle size={14} />} />
                <MiniStatCard label="Pending" value={(cl.pending || 0)} color={SLATE} icon={<Clock size={14} />} />
                <MiniStatCard label="Due Soon" value={cl.dueSoon || 0} color={AMBER} icon={<Calendar size={14} />} />
                <MiniStatCard label="Overdue" value={cl.overdue || 0} color={ROSE} icon={<AlertTriangle size={14} />} />
              </div>
              {cl.byGroup?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>By Group</div>
                  {cl.byGroup.slice(0, 5).map((g: any) => (
                    <StatRow key={g.group} label={g.group} value={`${g.completed}/${g.total}`} pct={g.total > 0 ? Math.round((g.completed / g.total) * 100) : 0} color={GREEN} />
                  ))}
                </div>
              )}
            </>
          )}
        </SectionCard>
      </div>
    </section>
  );
}

function FunnelBar({ label, value, max, color, pct }: { label: string; value: number; max: number; color: string; pct: number }) {
  const width = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 100, flexShrink: 0, fontSize: 12, color: '#64748b', textAlign: 'right' }}>{label}</div>
      <div style={{ flex: 1, height: 22, borderRadius: 6, background: 'var(--color-border, #e2e8f0)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 6, width: `${width}%`, background: color, opacity: 0.85, transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ width: 60, flexShrink: 0, textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        {value} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({pct}%)</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{value}</div>
      <div style={{ fontSize: 10, color: '#94a3b8' }}>{label}</div>
    </div>
  );
}

function MiniStatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, background: 'var(--color-surface-raised, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)' }}>
      <span style={{ color }}>{icon}</span>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{value}</div>
        <div style={{ fontSize: 10, color: '#94a3b8' }}>{label}</div>
      </div>
    </div>
  );
}
