'use client';

import { useState } from 'react';
import QuoteRequestForm from '@/components/QuoteRequestForm';

interface QuoteButtonProps {
  vendorId: string;
  vendorName: string;
}

export default function QuoteButton({ vendorId, vendorName }: QuoteButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '.625rem 1.5rem',
          background: '#111827',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: '.9rem',
          cursor: 'pointer',
        }}
      >
        Get a Quote
      </button>
      {open && <QuoteRequestForm vendorId={vendorId} vendorName={vendorName} onClose={() => setOpen(false)} />}
    </>
  );
}
