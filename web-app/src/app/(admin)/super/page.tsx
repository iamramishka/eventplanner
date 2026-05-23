import React from 'react';
import SuperAdminClient from './SuperAdminClient';
import { db } from '../../../lib/store';

export default async function SuperAdminPage() {
  const weddings = db.weddings.findMany();
  
  // Mock data as provided in original admin.js
  const couples = [
    { id: 'c1', name: 'Nimesha & Thilina', email: 'nimesha@test.com', plan: 'premium', createdAt: '2026-01-10T10:00:00Z', suspended: false },
    { id: 'u_couple_1', name: 'Priya & Kasun', email: 'hello@priyakasun.com', plan: 'trial', trialEnds: '2026-10-10T10:00:00Z', createdAt: '2026-05-01T10:00:00Z', suspended: false },
    { id: 'c3', name: 'Dilshan & Chamari', email: 'dilshan@test.com', plan: 'trial', trialEnds: '2026-04-10T10:00:00Z', createdAt: '2026-04-01T10:00:00Z', suspended: true },
    { id: 'c4', name: 'Ashan & Nadeesha', email: 'ashan@test.com', plan: 'premium', createdAt: '2026-03-15T10:00:00Z', suspended: false },
    { id: 'c5', name: 'Ruwan & Samantha', email: 'ruwan@test.com', plan: 'trial', trialEnds: '2026-12-01T10:00:00Z', createdAt: '2026-04-20T10:00:00Z', suspended: false },
    { id: 'c6', name: 'Isuru & Tharaka', email: 'isuru@test.com', plan: 'trial', trialEnds: '2026-03-01T10:00:00Z', createdAt: '2026-02-10T10:00:00Z', suspended: false },
    { id: 'c7', name: 'Nuwan & Malsha', email: 'nuwan@test.com', plan: 'premium', createdAt: '2026-05-05T10:00:00Z', suspended: false },
    { id: 'c8', name: 'Lakshan & Hiruni', email: 'lakshan@test.com', plan: 'trial', trialEnds: '2026-11-30T10:00:00Z', createdAt: '2026-05-10T10:00:00Z', suspended: false },
  ];
  
  const vendors = [
    { id: 'v1', businessName: 'SweetBites Bakery', category: 'Cake', contactName: 'Mala', email: 'mala@sb.com', location: 'Colombo', status: 'pending', rating: 0, createdAt: '2026-05-19T10:00:00Z', featured: false },
    { id: 'v2', businessName: 'Avishka Photography', category: 'Photography', contactName: 'Avishka', email: 'avi@photo.com', location: 'Kandy', status: 'approved', rating: 4.8, createdAt: '2026-02-10T10:00:00Z', featured: true },
    { id: 'v3', businessName: 'Flora Decor', category: 'Decor', contactName: 'Nimali', email: 'nimali@flora.com', location: 'Galle', status: 'rejected', rating: 0, createdAt: '2026-05-01T10:00:00Z', featured: false }
  ];

  return (
    <SuperAdminClient 
      initialWeddings={weddings} 
      initialCouples={couples} 
      initialVendors={vendors} 
    />
  );
}
