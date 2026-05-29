'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Calendar, ShieldOff, ShieldCheck } from 'lucide-react';

const field: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 4,
};
const label: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.05em', color: 'var(--adm-text-muted)',
};
const input: React.CSSProperties = {
  padding: '0.5rem 0.75rem', border: '1px solid var(--adm-border)',
  borderRadius: 8, fontSize: '0.9rem', background: 'var(--adm-bg-alt)',
  color: 'var(--adm-text-primary)', outline: 'none', width: '100%',
};
const select: React.CSSProperties = { ...input };
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '0.55rem 1.1rem', borderRadius: 9999,
  background: 'var(--inv-rose)', color: 'white', border: 'none',
  fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '0.55rem 1.1rem', borderRadius: 9999,
  background: 'transparent', color: 'var(--adm-text-secondary)',
  border: '1px solid var(--adm-border)', fontWeight: 600,
  fontSize: '0.875rem', cursor: 'pointer',
};

export default function CoupleDetailModal({ open, couple, onClose, onSaved }: any) {
  const [form, setForm] = useState<any>(couple || {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(couple || {});
    setSaved(false);
  }, [couple]);

  if (!open || !couple) return null;

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/couples/${couple.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Save failed');
      onSaved?.(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const trialExpired = couple.plan === 'trial' && couple.trialEnds && new Date(couple.trialEnds) < new Date();

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }} onClick={onClose} />

      {/* Modal */}
      <div style={{
        background: 'var(--adm-bg-card)', borderRadius: 16, width: '100%', maxWidth: 560,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)', zIndex: 201, overflow: 'hidden', position: 'relative'
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--adm-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--adm-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--adm-primary)' }}>
              <User size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--adm-text-primary)' }}>{couple.name}</div>
              <div style={{ fontSize: 12, color: 'var(--adm-text-muted)' }}>ID: {couple.id}</div>
            </div>
          </div>
          <button style={btnGhost} onClick={onClose}><X size={16} /></button>
        </div>

        {/* Status pills */}
        <div style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid var(--adm-border-light)', background: 'var(--adm-bg-alt)' }}>
          <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: couple.plan === 'premium' ? '#EDE9FE' : trialExpired ? '#FEE2E2' : '#FEF9C3', color: couple.plan === 'premium' ? '#6D28D9' : trialExpired ? '#DC2626' : '#92400E' }}>
            {couple.plan === 'premium' ? 'Premium' : trialExpired ? 'Trial Expired' : 'Active Trial'}
          </span>
          {couple.suspended && (
            <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldOff size={12} /> Suspended
            </span>
          )}
          {!couple.suspended && (
            <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={12} /> Active
            </span>
          )}
          {couple.trialEnds && (
            <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, color: 'var(--adm-text-muted)', background: 'var(--adm-bg-card)', border: '1px solid var(--adm-border)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} /> Trial ends {new Date(couple.trialEnds).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Form */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={field}>
            <span style={label}><User size={11} style={{ display: 'inline', marginRight: 3 }} />Name</span>
            <input style={input} value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div style={field}>
            <span style={label}><Mail size={11} style={{ display: 'inline', marginRight: 3 }} />Email</span>
            <input style={input} value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div style={field}>
            <span style={label}>Plan</span>
            <select style={select} value={form.plan || 'trial'} onChange={e => setForm({ ...form, plan: e.target.value })}>
              <option value="trial">Trial</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div style={field}>
            <span style={label}>Trial Ends</span>
            <input type="date" style={input} value={form.trialEnds ? form.trialEnds.substring(0, 10) : ''} onChange={e => setForm({ ...form, trialEnds: e.target.value + 'T00:00:00Z' })} />
          </div>
          <div style={field}>
            <span style={label}>Billing State</span>
            <select style={select} value={form.billingState || 'active'} onChange={e => setForm({ ...form, billingState: e.target.value })}>
              <option value="active">Active</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div style={{ ...field, gridColumn: '1 / -1' }}>
            <span style={label}>Admin / Support Notes</span>
            <textarea 
              style={{ ...input, minHeight: 80, resize: 'vertical' }} 
              placeholder="Internal notes regarding plan overrides, refunds, etc." 
              value={form.adminNotes || ''} 
              onChange={e => setForm({ ...form, adminNotes: e.target.value })} 
            />
          </div>
          <div style={{ ...field, gridColumn: '1 / -1' }}>
            <span style={label}>Suspended</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem', color: 'var(--adm-text-secondary)' }}>
              <input type="checkbox" checked={!!form.suspended} onChange={e => setForm({ ...form, suspended: e.target.checked })} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              {form.suspended ? 'Account is currently suspended' : 'Account is active — check to suspend'}
            </label>
          </div>
        </div>

        {/* Info row */}
        <div style={{ padding: '0 1.5rem 1rem', fontSize: 12, color: 'var(--adm-text-muted)', display: 'flex', gap: 16 }}>
          <span>Joined: {couple.createdAt ? new Date(couple.createdAt).toLocaleDateString() : '—'}</span>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--adm-border)', display: 'flex', justifyContent: 'flex-end', gap: 8, background: 'var(--adm-bg-alt)' }}>
          <button style={btnGhost} onClick={onClose}>Cancel</button>
          <button style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }} onClick={save} disabled={saving}>
            <Save size={15} />
            {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
