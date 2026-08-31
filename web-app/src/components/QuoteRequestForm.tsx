'use client';

import { useState } from 'react';

interface QuoteRequestFormProps {
  vendorId: string;
  vendorName: string;
  onClose: () => void;
}

export default function QuoteRequestForm({ vendorId, vendorName, onClose }: QuoteRequestFormProps) {
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', eventType: '', eventDate: '', guestCount: '', budget: '', message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/vendors/${vendorId}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Submission failed.');
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .qrfOverlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .qrfModal { background: white; border-radius: 12px; padding: 2rem; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; }
        .qrfTitle { font-size: 1.2rem; font-weight: 700; margin: 0 0 .25rem; color: #111827; }
        .qrfSub { font-size: .875rem; color: #6B7280; margin: 0 0 1.5rem; }
        .qrfGrid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
        .qrfField { display: flex; flex-direction: column; gap: .25rem; }
        .qrfField.span2 { grid-column: span 2; }
        .qrfLabel { font-size: .8rem; font-weight: 600; color: #374151; }
        .qrfInput { padding: .5rem .75rem; border: 1px solid #D1D5DB; border-radius: 6px; font-size: .875rem; font-family: inherit; outline: none; width: 100%; box-sizing: border-box; }
        .qrfInput:focus { border-color: #6B7280; }
        .qrfTextarea { padding: .5rem .75rem; border: 1px solid #D1D5DB; border-radius: 6px; font-size: .875rem; font-family: inherit; outline: none; resize: vertical; width: 100%; box-sizing: border-box; }
        .qrfTextarea:focus { border-color: #6B7280; }
        .qrfActions { display: flex; gap: .75rem; margin-top: 1.25rem; justify-content: flex-end; }
        .qrfBtn { padding: .5rem 1.25rem; border-radius: 6px; font-size: .875rem; font-weight: 600; cursor: pointer; border: none; }
        .qrfBtnPrimary { background: #111827; color: white; }
        .qrfBtnPrimary:disabled { opacity: .5; cursor: not-allowed; }
        .qrfBtnSecondary { background: #F3F4F6; color: #374151; }
        .qrfError { color: #EF4444; font-size: .8rem; margin-top: .5rem; }
        .qrfSuccess { text-align: center; padding: 1.5rem 0; }
        .qrfSuccessTitle { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0 0 .5rem; }
        .qrfSuccessText { font-size: .875rem; color: #6B7280; margin: 0 0 1.25rem; }
      `}</style>

      <div className="qrfOverlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="qrfModal">
          {done ? (
            <div className="qrfSuccess">
              <div className="qrfSuccessTitle">Request sent!</div>
              <div className="qrfSuccessText">Your quote request has been sent to {vendorName}. They will be in touch with you soon.</div>
              <button className="qrfBtn qrfBtnPrimary" onClick={onClose}>Close</button>
            </div>
          ) : (
            <>
              <div className="qrfTitle">Get a Quote from {vendorName}</div>
              <div className="qrfSub">Fill in your details and we&apos;ll send your request directly to the vendor.</div>
              <form onSubmit={handleSubmit}>
                <div className="qrfGrid">
                  <div className="qrfField span2">
                    <label className="qrfLabel">Your Name *</label>
                    <input className="qrfInput" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" required />
                  </div>
                  <div className="qrfField">
                    <label className="qrfLabel">Email *</label>
                    <input className="qrfInput" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
                  </div>
                  <div className="qrfField">
                    <label className="qrfLabel">Mobile *</label>
                    <input className="qrfInput" type="tel" value={form.mobile} onChange={e => set('mobile', e.target.value)} placeholder="+94 77 000 0000" required />
                  </div>
                  <div className="qrfField">
                    <label className="qrfLabel">Event Type</label>
                    <select className="qrfInput" value={form.eventType} onChange={e => set('eventType', e.target.value)}>
                      <option value="">Select…</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Pre-shoot">Pre-shoot</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="qrfField">
                    <label className="qrfLabel">Event Date</label>
                    <input className="qrfInput" type="date" value={form.eventDate} onChange={e => set('eventDate', e.target.value)} />
                  </div>
                  <div className="qrfField">
                    <label className="qrfLabel">Guest Count</label>
                    <input className="qrfInput" value={form.guestCount} onChange={e => set('guestCount', e.target.value)} placeholder="e.g. 150" />
                  </div>
                  <div className="qrfField">
                    <label className="qrfLabel">Budget Range</label>
                    <input className="qrfInput" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="e.g. LKR 50,000–80,000" />
                  </div>
                  <div className="qrfField span2">
                    <label className="qrfLabel">Message</label>
                    <textarea className="qrfTextarea" rows={3} value={form.message} onChange={e => set('message', e.target.value)} placeholder="Tell the vendor about your event…" />
                  </div>
                </div>
                {error && <div className="qrfError">{error}</div>}
                <div className="qrfActions">
                  <button type="button" className="qrfBtn qrfBtnSecondary" onClick={onClose}>Cancel</button>
                  <button type="submit" className="qrfBtn qrfBtnPrimary" disabled={submitting}>
                    {submitting ? 'Sending…' : 'Send Request'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
