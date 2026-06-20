'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  TrendingUp, Users, Briefcase, CreditCard,
  UserCheck, RefreshCw, Calendar,
  ArrowUp, Check, X as XIcon, Clock,
} from 'lucide-react';
import styles from './admin.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

function cn(...classes: (string | undefined | null | false)[]) {
  return classes
    .filter(Boolean)
    .join(' ')
    .split(' ')
    .map(c => styles[c] || c)
    .join(' ');
}

const RANGE_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

const CHART_COLORS = {
  rose: 'rgba(244, 63, 94, 1)',
  roseFill: 'rgba(244, 63, 94, 0.12)',
  purple: 'rgba(139, 92, 246, 1)',
  purpleFill: 'rgba(139, 92, 246, 0.12)',
  green: 'rgba(16, 185, 129, 1)',
  greenFill: 'rgba(16, 185, 129, 0.12)',
  amber: 'rgba(245, 158, 11, 1)',
  slate: 'rgba(148, 163, 184, 1)',
  slateFill: 'rgba(148, 163, 184, 0.12)',
};

const chartBaseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: 'index' as const, intersect: false } },
  scales: {
    x: { grid: { display: false }, ticks: { maxTicksLimit: 8, font: { size: 11 }, color: '#94A3B8' } },
    y: { grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { font: { size: 11 }, color: '#94A3B8', precision: 0 } },
  },
};

function formatLKR(n: number) {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(n);
}

function StatCard({ icon, label, value, sub, color = 'blue' }: any) {
  return (
    <div className={cn('kpi-card', 'kpi-' + color)} style={{ flex: '1 1 160px' }}>
      <div className={cn('kpi-icon')}>{icon}</div>
      <div className={cn('kpi-body')}>
        <div className={cn('kpi-value')} style={{ fontSize: '1.5rem' }}>{value}</div>
        <div className={cn('kpi-label')}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--adm-text-muted)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function ActivityDot({ type }: { type: string }) {
  const color = type.startsWith('couple') ? '#10B981'
    : type.includes('pending') ? '#F59E0B'
    : type.includes('approved') ? '#10B981'
    : type.includes('rejected') ? '#EF4444'
    : '#94A3B8';
  return (
    <div style={{
      width: 8, height: 8, borderRadius: '50%',
      background: color, flexShrink: 0, marginTop: 5,
    }} />
  );
}

export default function AnalyticsModule() {
  const [range, setRange] = useState(30);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (r = range) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/analytics?range=${r}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load analytics');
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(range); }, []);

  const handleRange = (r: number) => {
    setRange(r);
    load(r);
  };

  // ── Chart datasets ─────────────────────────────────────────
  const growthLabels = data?.coupleGrowth?.map((d: any) => {
    const dt = new Date(d.date);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }) || [];

  const growthData = {
    labels: growthLabels,
    datasets: [
      {
        label: 'New Couples',
        data: data?.coupleGrowth?.map((d: any) => d.count) || [],
        borderColor: CHART_COLORS.rose,
        backgroundColor: CHART_COLORS.roseFill,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Total Couples',
        data: data?.coupleGrowth?.map((d: any) => d.cumulative) || [],
        borderColor: CHART_COLORS.purple,
        backgroundColor: 'transparent',
        borderDash: [4, 4],
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: 'y',
      },
    ],
  };

  const rsvpLabels = data?.rsvpActivity?.map((d: any) => {
    const dt = new Date(d.date);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }) || [];

  const rsvpData = {
    labels: rsvpLabels,
    datasets: [
      {
        label: 'Confirmed',
        data: data?.rsvpActivity?.map((d: any) => d.confirmed) || [],
        backgroundColor: CHART_COLORS.green,
      },
      {
        label: 'Declined',
        data: data?.rsvpActivity?.map((d: any) => d.declined) || [],
        backgroundColor: CHART_COLORS.rose,
      },
      {
        label: 'Pending',
        data: data?.rsvpActivity?.map((d: any) => d.pending) || [],
        backgroundColor: CHART_COLORS.slate,
      },
    ],
  };

  const pipelineData = {
    labels: ['Pending', 'Approved', 'Rejected', 'Suspended'],
    datasets: [{
      data: data ? [
        data.vendorPipeline.pending,
        data.vendorPipeline.approved,
        data.vendorPipeline.rejected,
        data.vendorPipeline.suspended,
      ] : [0, 0, 0, 0],
      backgroundColor: [CHART_COLORS.amber, CHART_COLORS.green, CHART_COLORS.rose, CHART_COLORS.slate],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const planData = {
    labels: ['Trial', 'Premium'],
    datasets: [{
      data: data ? [data.planDistribution.trial, data.planDistribution.premium] : [0, 0],
      backgroundColor: [CHART_COLORS.slate, CHART_COLORS.purple],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  return (
    <section className={cn('module')}>
      <div className={cn('module-header')}>
        <div>
          <h1 className={cn('module-title')}>Platform Analytics</h1>
          <p className={cn('module-desc')}>Growth, revenue, and engagement metrics</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'var(--adm-bg-alt)', borderRadius: 8, padding: 3, gap: 2, border: '1px solid var(--adm-border)' }}>
            {RANGE_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => handleRange(o.value)}
                style={{
                  padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 500, transition: 'all 0.15s',
                  background: range === o.value ? 'var(--adm-bg-card)' : 'transparent',
                  color: range === o.value ? 'var(--adm-text-primary)' : 'var(--adm-text-muted)',
                  boxShadow: range === o.value ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
          <button className={cn('btn', 'btn-ghost', 'btn-sm')} onClick={() => load(range)} disabled={loading}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--adm-danger-bg)', color: 'var(--adm-danger)', padding: '1rem', borderRadius: 8, marginBottom: 16, border: '1px solid var(--adm-danger)', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* ── KPI Row ─────────────────────────────────────────── */}
      <div className={cn('kpi-grid')} style={{ marginBottom: '1.5rem' }}>
        <StatCard color="green" icon={<TrendingUp size={22} />}
          label="Monthly Recurring Revenue"
          value={loading ? '—' : formatLKR(data?.kpis.mrr || 0)}
          sub={loading ? '' : `${data?.kpis.premiumCouples} premium × ${formatLKR(data?.kpis.premiumPrice)}`}
        />
        <StatCard color="blue" icon={<Users size={22} />}
          label="Total Couples"
          value={loading ? '—' : data?.kpis.totalCouples}
          sub={loading ? '' : `${data?.kpis.conversionRate}% converted to premium`}
        />
        <StatCard color="purple" icon={<Briefcase size={22} />}
          label="Total Vendors"
          value={loading ? '—' : data?.kpis.totalVendors}
          sub={loading ? '' : `${data?.kpis.vendorPipeline?.pending || 0} pending review`}
        />
        <StatCard color="amber" icon={<UserCheck size={22} />}
          label="RSVPs Received"
          value={loading ? '—' : data?.kpis.totalRsvps}
          sub={loading ? '' : `${data?.kpis.confirmedRsvps} confirmed`}
        />
      </div>

      {/* ── Charts Row 1 ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>

        {/* Couple Growth */}
        <div className={cn('chart-card')}>
          <div className={cn('chart-card-header')}>
            <h3 className={cn('chart-title')}>Couple Signup Growth</h3>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <LegendDot color={CHART_COLORS.rose} label="New" />
              <LegendDot color={CHART_COLORS.purple} label="Cumulative" dashed />
              <div className={cn('chart-badge')}><Calendar size={11} /> {range}d</div>
            </div>
          </div>
          <div style={{ height: 180 }}>
            {loading ? <ChartSkeleton /> : (
              <Line data={growthData} options={chartBaseOptions} />
            )}
          </div>
        </div>

        {/* RSVP Activity */}
        <div className={cn('chart-card')}>
          <div className={cn('chart-card-header')}>
            <h3 className={cn('chart-title')}>RSVP Activity</h3>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <LegendDot color={CHART_COLORS.green} label="Confirmed" />
              <LegendDot color={CHART_COLORS.rose} label="Declined" />
              <LegendDot color={CHART_COLORS.slate} label="Pending" />
            </div>
          </div>
          <div style={{ height: 180 }}>
            {loading ? <ChartSkeleton /> : (
              <Bar data={rsvpData} options={{
                ...chartBaseOptions,
                plugins: { ...chartBaseOptions.plugins, legend: { display: false } },
                scales: { ...chartBaseOptions.scales, x: { ...chartBaseOptions.scales.x, stacked: true }, y: { ...chartBaseOptions.scales.y, stacked: true } },
              }} />
            )}
          </div>
        </div>
      </div>

      {/* ── Charts Row 2 ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>

        {/* Vendor Pipeline */}
        <div className={cn('chart-card')}>
          <div className={cn('chart-card-header')}>
            <h3 className={cn('chart-title')}>Vendor Pipeline</h3>
          </div>
          <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading ? <ChartSkeleton /> : (
              <Doughnut data={pipelineData} options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'right' as const, labels: { font: { size: 11 }, color: '#94A3B8', boxWidth: 12 } }, tooltip: { mode: 'index' as const, intersect: false } },
                cutout: '68%',
              }} />
            )}
          </div>
          {!loading && data && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, justifyContent: 'center' }}>
              <PipelineStat label="Pending" value={data.vendorPipeline.pending} color={CHART_COLORS.amber} />
              <PipelineStat label="Approved" value={data.vendorPipeline.approved} color={CHART_COLORS.green} />
              <PipelineStat label="Rejected" value={data.vendorPipeline.rejected} color={CHART_COLORS.rose} />
            </div>
          )}
        </div>

        {/* Plan Distribution */}
        <div className={cn('chart-card')}>
          <div className={cn('chart-card-header')}>
            <h3 className={cn('chart-title')}>Plan Distribution</h3>
          </div>
          <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading ? <ChartSkeleton /> : (
              <Doughnut data={planData} options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'right' as const, labels: { font: { size: 11 }, color: '#94A3B8', boxWidth: 12 } }, tooltip: { mode: 'index' as const, intersect: false } },
                cutout: '68%',
              }} />
            )}
          </div>
          {!loading && data && (
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
              <PipelineStat label="Trial" value={data.planDistribution.trial} color={CHART_COLORS.slate} />
              <PipelineStat label="Premium" value={data.planDistribution.premium} color={CHART_COLORS.purple} />
            </div>
          )}
        </div>

        {/* Conversion summary */}
        <div className={cn('chart-card')}>
          <div className={cn('chart-card-header')}>
            <h3 className={cn('chart-title')}>Conversion Summary</h3>
          </div>
          {loading ? <ChartSkeleton /> : data && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              <ConvRow icon={<ArrowUp size={16} color={CHART_COLORS.green} />} label="Conversion rate" value={`${data.kpis.conversionRate}%`} />
              <ConvRow icon={<Check size={16} color={CHART_COLORS.green} />} label="Premium couples" value={data.kpis.premiumCouples} />
              <ConvRow icon={<Clock size={16} color={CHART_COLORS.amber} />} label="Active trials" value={data.kpis.trialActive} />
              <ConvRow icon={<XIcon size={16} color={CHART_COLORS.rose} />} label="Expired trials" value={data.kpis.trialExpired} />
              <ConvRow icon={<CreditCard size={16} color={CHART_COLORS.purple} />} label="MRR" value={formatLKR(data.kpis.mrr)} />
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Activity ───────────────────────────────────── */}
      <div className={cn('chart-card')}>
        <div className={cn('chart-card-header')}>
          <h3 className={cn('chart-title')}>Recent Activity</h3>
          <div className={cn('chart-badge')}>Live</div>
        </div>
        {loading ? <ChartSkeleton /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {(data?.recentActivity || []).slice(0, 10).map((item: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 4px', borderBottom: '1px solid var(--adm-border)' }}>
                <ActivityDot type={item.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--adm-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.description}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--adm-text-muted)', flexShrink: 0 }}>{item.ago}</div>
              </div>
            ))}
            {(!data?.recentActivity?.length) && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--adm-text-muted)', fontSize: 13 }}>No recent activity</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function LegendDot({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 24, height: 2, background: dashed ? 'transparent' : color, borderTop: dashed ? `2px dashed ${color}` : 'none', flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: 'var(--adm-text-muted)' }}>{label}</span>
    </div>
  );
}

function PipelineStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--adm-text-muted)' }}>{label}</div>
    </div>
  );
}

function ConvRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {icon}
      <span style={{ fontSize: 13, color: 'var(--adm-text-secondary)', flex: 1 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--adm-text-primary)' }}>{value}</span>
    </div>
  );
}

function ChartSkeleton() {
  const heights = [42, 68, 51, 76, 58, 84, 47, 70, 63, 88, 55, 73];

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: '100%', padding: '8px 0' }}>
      {heights.map((height, i) => (
        <div key={i} className={cn('skeleton')} style={{ flex: 1, height: `${height}%`, borderRadius: 4, opacity: 0.6 }} />
      ))}
    </div>
  );
}
