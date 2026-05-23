'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = true }: any) {
  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }} onClick={onCancel} />

      {/* Dialog */}
      <div style={{
        background: 'var(--adm-bg-card)', borderRadius: 16, width: '100%', maxWidth: 420,
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)', zIndex: 301, overflow: 'hidden', position: 'relative'
      }}>
        {/* Icon + Title */}
        <div style={{ padding: '1.5rem 1.5rem 0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: danger ? '#FEE2E2' : '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} color={danger ? '#DC2626' : '#2563EB'} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--adm-text-primary)' }}>{title}</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--adm-text-secondary)', lineHeight: 1.5 }}>{message}</p>
        </div>

        {/* Actions */}
        <div style={{ padding: '1rem 1.5rem 1.5rem', display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '0.6rem 1rem', borderRadius: 9999,
              background: 'transparent', border: '1px solid var(--adm-border)',
              color: 'var(--adm-text-secondary)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '0.6rem 1rem', borderRadius: 9999,
              background: danger ? '#DC2626' : 'var(--inv-rose)',
              border: 'none', color: 'white',
              fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer'
            }}
          >
            {danger ? 'Yes, Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
