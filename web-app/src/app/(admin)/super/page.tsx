/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import SuperAdminClient from './SuperAdminClient';
import { db } from '../../../lib/store';
import { getAdminSettings } from '@/lib/adminSettings';
import { getAdminCouples } from '@/lib/adminCouples';
import { getAllVendors } from '@/lib/vendorStore';

function toAdminVendor(vendor: any) {
  return {
    id: vendor.id,
    businessName: vendor.businessName,
    category: vendor.category,
    contactName: `${vendor.ownerFirstName || ''} ${vendor.ownerLastName || ''}`.trim() || vendor.businessName,
    email: vendor.email,
    location: vendor.location,
    status: vendor.status,
    rating: 0,
    createdAt: vendor.createdAt,
    featured: Boolean(vendor.featured),
  };
}

export default async function SuperAdminPage() {
  const weddings = db.weddings.findMany();
  const adminSettings = getAdminSettings();
  const couples = getAdminCouples();
  const vendors = getAllVendors().map(toAdminVendor);

  return (
    <SuperAdminClient 
      initialWeddings={weddings} 
      initialCouples={couples} 
      initialVendors={vendors} 
      initialSettings={adminSettings.settings}
      initialPlans={adminSettings.plans}
    />
  );
}
