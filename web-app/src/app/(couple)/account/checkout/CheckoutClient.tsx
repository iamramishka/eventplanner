"use client";

import React, { useState } from 'react';

export default function CheckoutClient() {
  const [email, setEmail] = useState('test+couple@local');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerEmail: email }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError(data?.error || 'Unknown error');
    } catch (err: any) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleCheckout} style={{ maxWidth: 480 }}>
      <label style={{ display: 'block', marginBottom: 8 }}>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4 }} />
      </label>
      <button type="submit" disabled={loading} style={{ padding: '8px 12px' }}>
        {loading ? 'Creating session...' : 'Start subscription (test)'}
      </button>
      {error && <div style={{ marginTop: 12, color: 'red' }}>{error}</div>}
    </form>
  );
}
