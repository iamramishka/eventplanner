"use client";

import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
};

export default function Input({ label, error, className = '', ...props }: Props) {
  return (
    <label style={{ display: 'block', marginBottom: '0.75rem' }}>
      {label && (
        <div style={{ marginBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--adm-text-secondary)' }}>{label}</div>
      )}
      <input className={`input ${error ? 'input-error' : ''} ${className}`} {...props} />
      {error && <div style={{ color: 'var(--adm-danger)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{error}</div>}
    </label>
  );
}
