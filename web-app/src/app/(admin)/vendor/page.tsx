import React from 'react';
import VendorPortalClient from './VendorPortalClient';
import { getVendorById, toPublicVendor, getListingsByVendor } from '@/lib/vendorStore';
import styles from './vendor.module.css';

export default async function VendorPage() {
  // In a real app this would use the authenticated vendor's ID from the session.
  // For dev/demo mode, use the seeded vendor.
  const DEMO_VENDOR_ID = 'vnd_seed_001';
  const vendor = getVendorById(DEMO_VENDOR_ID);

  // Fallback if seed not loaded yet (HMR edge case)
  const vendorData = vendor
    ? { ...toPublicVendor(vendor), ownerFirstName: vendor.ownerFirstName, ownerLastName: vendor.ownerLastName, phone: vendor.phone, email: vendor.email, logoBase64: vendor.logoBase64, coverImageBase64: vendor.coverImageBase64 ?? null, portfolioImages: vendor.portfolioImages, packages: vendor.packages, pricingNotes: vendor.pricingNotes, seoTitle: vendor.seoTitle ?? '', seoDescription: vendor.seoDescription ?? '', seoKeywords: vendor.seoKeywords ?? '', aboutMarkdown: vendor.aboutMarkdown ?? '', faqMarkdown: vendor.faqMarkdown ?? '' }
    : {
        id: DEMO_VENDOR_ID,
        businessName: 'Lumina Studios',
        category: 'Photography',
        subcategory: 'Wedding Photography',
        description: 'Premium wedding photography and cinematic videography.',
        yearsInBusiness: 5,
        website: 'https://luminastudios.lk',
        location: 'Colombo, Sri Lanka',
        serviceArea: 'Island-wide',
        ownerFirstName: 'Kasun',
        ownerLastName: 'Perera',
        email: 'hello@luminastudios.lk',
        phone: '+94 77 123 4567',
        basePrice: 150000,
        currency: 'LKR',
        pricingNotes: 'Prices vary by date, venue, and coverage hours.',
        packages: [],
        logoBase64: null,
        coverImageBase64: null,
        portfolioImages: [],
        status: 'approved',
        onboardingStep: 'live',
        seoTitle: '',
        seoDescription: '',
        seoKeywords: '',
        aboutMarkdown: '',
        faqMarkdown: '',
        createdAt: new Date().toISOString(),
      };

  // Listings from the store (already filtered by vendor, sorted newest first)
  const rawListings = getListingsByVendor(DEMO_VENDOR_ID);
  const listingsData = rawListings.map(l => ({
    id: l.id,
    vendorId: l.vendorId,
    title: l.title,
    category: l.category,
    subcategory: l.subcategory,
    description: l.description,
    price: l.price,
    currency: l.currency,
    pricingType: l.pricingType,
    coverImageBase64: l.coverImageBase64,
    galleryImages: l.galleryImages,
    galleryCount: l.galleryImages.length,
    tags: l.tags,
    seoTitle: l.seoTitle,
    seoDescription: l.seoDescription,
    contentMarkdown: l.contentMarkdown,
    active: l.active,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  }));

  const mockBookings = [
    { id: 'bk001', coupleName: 'Priya & Kasun', serviceName: 'Full Day Photography', status: 'pending', amount: 150000, weddingDate: '2026-08-15' },
    { id: 'bk002', coupleName: 'Nadeesha & Tharaka', serviceName: 'Pre-Wedding Shoot', status: 'confirmed', amount: 35000, weddingDate: '2026-09-20' },
  ];

  return (
    <div className={styles.vndApp}>
      <VendorPortalClient
        vendor={vendorData}
        listings={listingsData}
        bookings={mockBookings}
      />
    </div>
  );
}
