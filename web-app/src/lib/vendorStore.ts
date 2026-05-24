// src/lib/vendorStore.ts
// In-memory vendor store — Task 8.1 (registration) + Task 8.3 (profile & listings)
// In production, replace with Prisma/PostgreSQL.

export type VendorStatus = 'pending_review' | 'approved' | 'rejected' | 'suspended';

export type OnboardingStep = 'submitted' | 'under_review' | 'documents_verified' | 'profile_complete' | 'live';

export type VendorPackage = {
  name: string;
  price: number;
  description: string;
};

// ─── Listing Types ────────────────────────────────────────────
export type PricingType = 'fixed' | 'from' | 'per_person' | 'on_request';

export type VendorListing = {
  id: string;
  vendorId: string;
  // Core
  title: string;
  category: string;
  subcategory: string;
  description: string;
  // Pricing
  price: number;
  currency: string;
  pricingType: PricingType;
  // Media
  coverImageBase64: string | null;
  galleryImages: string[]; // up to 10 base64 images
  // SEO
  seoTitle: string;
  seoDescription: string;
  // Tags
  tags: string[];
  // Editable Markdown content
  contentMarkdown: string;
  // State
  active: boolean;
  // Timestamps
  createdAt: string;
  updatedAt: string;
};

// ─── Vendor Registration Type ──────────────────────────────────
export type VendorRegistration = {
  id: string;
  // Account
  ownerFirstName: string;
  ownerLastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  // Business profile
  businessName: string;
  category: string;
  subcategory: string;
  description: string;
  yearsInBusiness: number | null;
  website: string;
  location: string;
  serviceArea: string;
  // Uploads
  logoBase64: string | null;
  coverImageBase64?: string | null;
  portfolioImages: string[];
  // Verification docs
  businessRegNumber: string;
  taxIdNumber: string;
  businessRegDocBase64: string | null;
  // Pricing
  basePrice: number;
  currency: string;
  pricingNotes: string;
  packages: VendorPackage[];
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  // Editable Markdown content
  aboutMarkdown?: string;
  faqMarkdown?: string;
  // Status & lifecycle
  status: VendorStatus;
  onboardingStep: OnboardingStep;
  verificationNotes: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  // Timestamps
  createdAt: string;
  updatedAt: string;
};

// ─── Singleton store ───────────────────────────────────────────
type VendorStoreShape = {
  vendors: VendorRegistration[];
  listings: VendorListing[];
};

const globalStore = globalThis as typeof globalThis & { __wedInviteVendorStore?: VendorStoreShape };

const vendorStore = globalStore.__wedInviteVendorStore ||= {
  vendors: [],
  listings: [],
};

// Fix HMR cache issue where older store shape didn't have listings
if (!vendorStore.listings) {
  vendorStore.listings = [];
}

// Seed one demo vendor so the portal has data to show
function initVendorStore() {
  if (vendorStore.vendors.length === 0) {
    vendorStore.vendors.push({
      id: 'vnd_seed_001',
      ownerFirstName: 'Kasun',
      ownerLastName: 'Perera',
      email: 'hello@luminastudios.lk',
      phone: '+94 77 123 4567',
      passwordHash: '[hashed:placeholder]',
      businessName: 'Lumina Studios',
      category: 'Photography',
      subcategory: 'Wedding Photography',
      description: 'Premium wedding photography and cinematic videography. We capture your love story with artistic vision and technical excellence.',
      yearsInBusiness: 5,
      website: 'https://luminastudios.lk',
      location: 'Colombo, Sri Lanka',
      serviceArea: 'Island-wide',
      logoBase64: null,
      portfolioImages: [],
      businessRegNumber: 'PV123456',
      taxIdNumber: '987654321V',
      businessRegDocBase64: null,
      basePrice: 150000,
      currency: 'LKR',
      pricingNotes: 'Prices vary by date, venue, and coverage hours.',
      packages: [
        { name: 'Essential Package', price: 75000, description: 'Half-day coverage, 200+ edited photos' },
        { name: 'Signature Package', price: 150000, description: 'Full day coverage, 400+ edited photos + highlight reel' },
        { name: 'Luxury Package', price: 250000, description: 'Full day + pre-wedding shoot + cinematic film + same-day slideshow' },
      ],
      status: 'approved',
      onboardingStep: 'live',
      verificationNotes: 'Documents verified. Business registration confirmed.',
      reviewedBy: 'admin',
      reviewedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    });
  }

  // Seed listings for the demo vendor if missing
  if (vendorStore.listings.length === 0) {
    vendorStore.listings.push(
      {
        id: 'lst_seed_001',
        vendorId: 'vnd_seed_001',
        title: 'Full Day Wedding Photography',
        category: 'Photography',
        subcategory: 'Wedding Photography',
        description: 'Complete coverage of your wedding day from preparations to reception. Includes 500+ hand-edited images delivered in 4 weeks.',
        price: 150000,
        currency: 'LKR',
        pricingType: 'fixed',
        coverImageBase64: null,
        galleryImages: [],
        tags: ['photography', 'full-day', 'wedding', 'colombo'],
        seoTitle: 'Full Day Wedding Photography Colombo | Lumina Studios',
        seoDescription: 'Professional full-day wedding photography in Colombo, Sri Lanka. 500+ edited images, cinematic style, island-wide coverage.',
        contentMarkdown: `## What\'s Included\n\n- 10 hours of coverage\n- 2 photographers\n- 500+ hand-edited images\n- Online gallery\n- High-resolution downloads\n\n## Timeline\n\nDelivery within 4–6 weeks of your wedding date.\n\n## Why Choose Us\n\nWith 5+ years of experience, we specialise in natural, emotional storytelling photography.`,
        active: true,
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 'lst_seed_002',
        vendorId: 'vnd_seed_001',
        title: 'Pre-Wedding Shoot',
        category: 'Photography',
        subcategory: 'Pre-Wedding Shoots',
        description: 'Relaxed 3-hour outdoor or studio shoot for couples. Perfect for save-the-date cards and social announcements.',
        price: 35000,
        currency: 'LKR',
        pricingType: 'fixed',
        coverImageBase64: null,
        galleryImages: [],
        tags: ['pre-wedding', 'couples', 'outdoor', 'studio'],
        seoTitle: 'Pre-Wedding Photography Sri Lanka | Lumina Studios',
        seoDescription: 'Affordable pre-wedding photography packages in Sri Lanka. Outdoor and studio shoots available island-wide.',
        contentMarkdown: `## Session Details\n\n- 3 hours of shooting\n- 2 outfit changes\n- 100+ edited images\n- Location scouting assistance\n\n## Popular Locations\n\nGalle Fort, Negombo Beach, Botanical Gardens, Custom locations on request.`,
        active: true,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'lst_seed_003',
        vendorId: 'vnd_seed_001',
        title: 'Cinematic Wedding Film',
        category: 'Videography',
        subcategory: 'Drone Footage',
        description: 'A cinematic 5–8 minute highlight film of your wedding day. Shot in 4K with aerial drone footage where permitted.',
        price: 80000,
        currency: 'LKR',
        pricingType: 'from',
        coverImageBase64: null,
        galleryImages: [],
        tags: ['videography', 'cinematic', 'drone', '4k'],
        seoTitle: 'Cinematic Wedding Films Sri Lanka | Lumina Studios',
        seoDescription: 'Cinematic wedding films shot in 4K with drone footage. Island-wide coverage, 5–8 min highlight reels.',
        contentMarkdown: `## Film Details\n\n- 5–8 minute highlight film\n- Full ceremony edit\n- 4K resolution\n- Drone footage (where permitted)\n- Delivered within 6–8 weeks`,
        active: false,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      }
    );
  }
}

initVendorStore();

// ─── CRUD helpers ──────────────────────────────────────────────

export function getAllVendors(): VendorRegistration[] {
  return vendorStore.vendors.slice();
}

export function getVendorById(id: string): VendorRegistration | null {
  return vendorStore.vendors.find(v => v.id === id) || null;
}

export function getVendorByEmail(email: string): VendorRegistration | null {
  return vendorStore.vendors.find(v => v.email === email.toLowerCase()) || null;
}

export function getVendorsByStatus(status: VendorStatus): VendorRegistration[] {
  return vendorStore.vendors.filter(v => v.status === status);
}

export function getPendingVendors(): VendorRegistration[] {
  return getVendorsByStatus('pending_review');
}

export function addVendorRegistration(
  data: Omit<VendorRegistration, 'id' | 'status' | 'onboardingStep' | 'verificationNotes' | 'reviewedBy' | 'reviewedAt' | 'createdAt' | 'updatedAt'>
): VendorRegistration {
  const id = `vnd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  const vendor: VendorRegistration = {
    id,
    ...data,
    status: 'pending_review',
    onboardingStep: 'submitted',
    verificationNotes: '',
    reviewedBy: null,
    reviewedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  vendorStore.vendors.push(vendor);
  return vendor;
}

export function updateVendor(
  id: string,
  data: Partial<Omit<VendorRegistration, 'id' | 'createdAt'>>
): VendorRegistration | null {
  const idx = vendorStore.vendors.findIndex(v => v.id === id);
  if (idx === -1) return null;
  const updated: VendorRegistration = {
    ...vendorStore.vendors[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  vendorStore.vendors[idx] = updated;
  return updated;
}

export function approveVendor(id: string, reviewedBy: string, notes?: string): VendorRegistration | null {
  return updateVendor(id, {
    status: 'approved',
    onboardingStep: 'profile_complete',
    verificationNotes: notes || 'Approved by admin.',
    reviewedBy,
    reviewedAt: new Date().toISOString(),
  });
}

export function rejectVendor(id: string, reviewedBy: string, notes?: string): VendorRegistration | null {
  return updateVendor(id, {
    status: 'rejected',
    onboardingStep: 'submitted',
    verificationNotes: notes || 'Rejected by admin.',
    reviewedBy,
    reviewedAt: new Date().toISOString(),
  });
}

export function suspendVendor(id: string, notes?: string): VendorRegistration | null {
  return updateVendor(id, {
    status: 'suspended',
    verificationNotes: notes || 'Account suspended.',
  });
}

export function deleteVendor(id: string): VendorRegistration | null {
  const idx = vendorStore.vendors.findIndex(v => v.id === id);
  if (idx === -1) return null;
  const [removed] = vendorStore.vendors.splice(idx, 1);
  return removed;
}

/**
 * Safe public representation of a vendor (no password, no raw docs)
 */
export function toPublicVendor(v: VendorRegistration) {
  return {
    id: v.id,
    businessName: v.businessName,
    category: v.category,
    subcategory: v.subcategory,
    description: v.description,
    yearsInBusiness: v.yearsInBusiness,
    website: v.website,
    location: v.location,
    serviceArea: v.serviceArea,
    basePrice: v.basePrice,
    currency: v.currency,
    packages: v.packages,
    status: v.status,
    onboardingStep: v.onboardingStep,
    createdAt: v.createdAt,
  };
}

/**
 * Onboarding checklist progress for a given vendor.
 * Returns which steps are complete based on their profile data.
 */
export function getOnboardingProgress(vendor: VendorRegistration) {
  const steps = [
    { key: 'account_created', label: 'Account Created', done: true },
    { key: 'business_profile', label: 'Business Profile Complete', done: !!(vendor.businessName && vendor.category && vendor.description && vendor.location) },
    { key: 'documents_uploaded', label: 'Documents Uploaded', done: !!(vendor.businessRegNumber && vendor.businessRegDocBase64) },
    { key: 'pricing_set', label: 'Pricing & Packages Set', done: vendor.basePrice > 0 },
    { key: 'logo_added', label: 'Logo / Portfolio Added', done: !!(vendor.logoBase64 || vendor.portfolioImages.length > 0) },
    { key: 'admin_approved', label: 'Admin Verification', done: vendor.status === 'approved' || vendor.status === 'suspended' },
    { key: 'profile_live', label: 'Profile Live & Searchable', done: vendor.onboardingStep === 'live' },
  ];
  const completed = steps.filter(s => s.done).length;
  const total = steps.length;
  const pct = Math.round((completed / total) * 100);
  return { steps, completed, total, pct };
}

// ════════════════════════════════════════════════════════════════
// LISTING CRUD HELPERS
// ════════════════════════════════════════════════════════════════

export function getListingsByVendor(vendorId: string): VendorListing[] {
  return vendorStore.listings
    .filter(l => l.vendorId === vendorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getListingById(id: string): VendorListing | null {
  return vendorStore.listings.find(l => l.id === id) || null;
}

export function getActiveListingsByVendor(vendorId: string): VendorListing[] {
  return getListingsByVendor(vendorId).filter(l => l.active);
}

export function addListing(
  data: Omit<VendorListing, 'id' | 'createdAt' | 'updatedAt'>
): VendorListing {
  if (!data.vendorId) throw new Error('vendorId required');
  if (!String(data.title || '').trim()) throw new Error('title required');
  if (!data.category) throw new Error('category required');
  const price = Number(data.price);
  if (!Number.isFinite(price) || price < 0) throw new Error('price must be non-negative');
  if (Array.isArray(data.galleryImages) && data.galleryImages.length > 10) {
    throw new Error('maximum 10 gallery images allowed');
  }

  const now = new Date().toISOString();
  const listing: VendorListing = {
    id: `lst_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    vendorId: data.vendorId,
    title: String(data.title).trim(),
    category: String(data.category),
    subcategory: String(data.subcategory || ''),
    description: String(data.description || '').trim(),
    price,
    currency: String(data.currency || 'LKR'),
    pricingType: data.pricingType || 'fixed',
    coverImageBase64: data.coverImageBase64 ?? null,
    galleryImages: Array.isArray(data.galleryImages) ? data.galleryImages.slice(0, 10) : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    seoTitle: String(data.seoTitle || '').trim(),
    seoDescription: String(data.seoDescription || '').trim(),
    contentMarkdown: String(data.contentMarkdown || '').trim(),
    active: data.active !== false,
    createdAt: now,
    updatedAt: now,
  };

  vendorStore.listings.push(listing);
  return listing;
}

export function updateListing(
  id: string,
  data: Partial<Omit<VendorListing, 'id' | 'vendorId' | 'createdAt'>>
): VendorListing | null {
  const idx = vendorStore.listings.findIndex(l => l.id === id);
  if (idx === -1) return null;
  const updated: VendorListing = {
    ...vendorStore.listings[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  if (Array.isArray(updated.galleryImages) && updated.galleryImages.length > 10) {
    throw new Error('maximum 10 gallery images allowed');
  }
  vendorStore.listings[idx] = updated;
  return updated;
}

export function toggleListingActive(
  id: string,
  active?: boolean
): VendorListing | null {
  const listing = vendorStore.listings.find(l => l.id === id);
  if (!listing) return null;
  return updateListing(id, { active: typeof active === 'boolean' ? active : !listing.active });
}

export function deleteListing(id: string): VendorListing | null {
  const idx = vendorStore.listings.findIndex(l => l.id === id);
  if (idx === -1) return null;
  const [removed] = vendorStore.listings.splice(idx, 1);
  return removed;
}

/**
 * Returns a safe public listing (no coverImageBase64 / galleryImages raw data to reduce payload).
 * Used when listing is displayed publicly — images are served separately in a real app.
 */
export function toPublicListing(l: VendorListing) {
  return {
    id: l.id,
    vendorId: l.vendorId,
    title: l.title,
    category: l.category,
    subcategory: l.subcategory,
    description: l.description,
    price: l.price,
    currency: l.currency,
    pricingType: l.pricingType,
    hasImage: !!l.coverImageBase64,
    galleryCount: l.galleryImages.length,
    tags: l.tags,
    seoTitle: l.seoTitle,
    seoDescription: l.seoDescription,
    contentMarkdown: l.contentMarkdown,
    active: l.active,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  };
}
