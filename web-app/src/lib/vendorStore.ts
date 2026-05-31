// src/lib/vendorStore.ts
// JSON-backed vendor store — Task 8.1 (registration) + Task 8.3 (profile & listings)
// In production, replace with Prisma/PostgreSQL.

import fs from 'fs';
import path from 'path';

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

// ─── Vendor Operations Types ──────────────────────────────────
export type VendorBookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type VendorBooking = {
  id: string;
  vendorId: string;
  coupleName: string;
  coupleEmail: string;
  serviceName: string;
  listingId: string | null;
  status: VendorBookingStatus;
  amount: number;
  currency: string;
  weddingDate: string;
  venue: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type VendorAvailability = {
  vendorId: string;
  minLeadDays: number;
  weekendsOnly: boolean;
  blockedDates: string[];
  weeklyOpenDays: number[];
  updatedAt: string;
};

export type VendorMessageThread = {
  id: string;
  vendorId: string;
  bookingId: string | null;
  coupleName: string;
  subject: string;
  unread: boolean;
  lastMessageAt: string;
  messages: {
    id: string;
    sender: 'couple' | 'vendor';
    body: string;
    createdAt: string;
  }[];
};

export type VendorPayout = {
  id: string;
  vendorId: string;
  bookingId: string;
  label: string;
  gross: number;
  fee: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  payoutDate: string;
};

export type VendorSettings = {
  vendorId: string;
  emailBookings: boolean;
  emailMessages: boolean;
  weeklyDigest: boolean;
  smsUrgent: boolean;
  publicProfile: boolean;
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
  featured?: boolean;
  // Timestamps
  createdAt: string;
  updatedAt: string;
};

// ─── Singleton store ───────────────────────────────────────────
type VendorStoreShape = {
  vendors: VendorRegistration[];
  listings: VendorListing[];
  bookings: VendorBooking[];
  availability: VendorAvailability[];
  messageThreads: VendorMessageThread[];
  payouts: VendorPayout[];
  settings: VendorSettings[];
};

const DATA_FILE = path.join(process.cwd(), 'data', 'vendors.json');

const globalStore = globalThis as typeof globalThis & { __wedInviteVendorStore?: VendorStoreShape };
const VENDOR_STATUSES: VendorStatus[] = ['pending_review', 'approved', 'rejected', 'suspended'];
const ONBOARDING_STEPS: OnboardingStep[] = ['submitted', 'under_review', 'documents_verified', 'profile_complete', 'live'];
const PRICING_TYPES: PricingType[] = ['fixed', 'from', 'per_person', 'on_request'];

const vendorStore = globalStore.__wedInviteVendorStore ||= {
  vendors: [],
  listings: [],
  bookings: [],
  availability: [],
  messageThreads: [],
  payouts: [],
  settings: [],
};

// Fix HMR cache issue where older store shape didn't have listings
if (!vendorStore.listings) {
  vendorStore.listings = [];
}
if (!vendorStore.bookings) vendorStore.bookings = [];
if (!vendorStore.availability) vendorStore.availability = [];
if (!vendorStore.messageThreads) vendorStore.messageThreads = [];
if (!vendorStore.payouts) vendorStore.payouts = [];
if (!vendorStore.settings) vendorStore.settings = [];

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadPersistedVendorStore() {
  if (!fs.existsSync(DATA_FILE)) return false;
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as Partial<VendorStoreShape>;
    const seenVendors = new Set<string>();
    vendorStore.vendors = (Array.isArray(parsed.vendors) ? parsed.vendors : [])
      .map((vendor, index) => cleanVendorRecord(vendor, index))
      .filter((vendor) => {
        if (seenVendors.has(vendor.id)) return false;
        seenVendors.add(vendor.id);
        return true;
      });

    const vendorIds = new Set(vendorStore.vendors.map((vendor) => vendor.id));
    const seenListings = new Set<string>();
    vendorStore.listings = (Array.isArray(parsed.listings) ? parsed.listings : [])
      .map((listing, index) => cleanListingRecord(listing, index))
      .filter((listing) => {
        if (!vendorIds.has(listing.vendorId) || seenListings.has(listing.id)) return false;
        seenListings.add(listing.id);
        return true;
      });
    return true;
  } catch {
    return false;
  }
}

function persistVendorStore() {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    vendors: vendorStore.vendors,
    listings: vendorStore.listings,
  }, null, 2));
}

function cleanString(value: unknown, fallback = '', maxLength = 1000) {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, maxLength);
}

function cleanId(value: unknown, fallback: string) {
  const cleaned = cleanString(value, fallback, 120).replace(/[^a-z0-9_-]/gi, '-');
  return cleaned || fallback;
}

function cleanEmail(value: unknown, fallback: string) {
  const email = cleanString(value, fallback, 180).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : fallback;
}

function cleanIsoString(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
}

function cleanNullableString(value: unknown, fallback: string | null = null, maxLength = 1000) {
  if (value === null) return null;
  if (typeof value !== 'string') return fallback;
  const cleaned = value.trim().slice(0, maxLength);
  return cleaned || fallback;
}

function cleanNonNegativeNumber(value: unknown, fallback: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : fallback;
}

function cleanOptionalNonNegativeNumber(value: unknown, fallback: number | null) {
  if (value === null || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : fallback;
}

function cleanStringArray(value: unknown, fallback: string[], maxItems: number, maxLength = 300) {
  if (!Array.isArray(value)) return fallback;
  return value
    .map((item) => cleanString(item, '', maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function cleanPackages(value: unknown, fallback: VendorPackage[]) {
  if (!Array.isArray(value)) return fallback;
  return value
    .map((item) => {
      const record = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      return {
        name: cleanString(record.name, '', 120),
        price: cleanNonNegativeNumber(record.price, 0),
        description: cleanString(record.description, '', 300),
      };
    })
    .filter((item) => item.name)
    .slice(0, 10);
}

function cleanVendorRecord(value: unknown, index: number): VendorRegistration {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const now = new Date(0).toISOString();
  const base: VendorRegistration = {
    id: cleanId(input.id, `vnd_import_${index + 1}`),
    ownerFirstName: 'Vendor',
    ownerLastName: 'Owner',
    email: cleanEmail(input.email, `vendor-${index + 1}@example.invalid`),
    phone: '',
    passwordHash: cleanString(input.passwordHash, '[imported]', 240),
    businessName: `Vendor ${index + 1}`,
    category: 'General',
    subcategory: '',
    description: 'Imported vendor profile.',
    yearsInBusiness: null,
    website: '',
    location: '',
    serviceArea: '',
    logoBase64: null,
    portfolioImages: [],
    businessRegNumber: '',
    taxIdNumber: '',
    businessRegDocBase64: null,
    basePrice: 0,
    currency: 'LKR',
    pricingNotes: '',
    packages: [],
    status: 'pending_review',
    onboardingStep: 'submitted',
    verificationNotes: '',
    reviewedBy: null,
    reviewedAt: null,
    featured: false,
    createdAt: cleanIsoString(input.createdAt, now),
    updatedAt: cleanIsoString(input.updatedAt, now),
  };
  const cleaned = cleanVendorPatch(base, input as Partial<Omit<VendorRegistration, 'id' | 'createdAt'>>);
  cleaned.id = base.id;
  cleaned.email = base.email;
  cleaned.passwordHash = base.passwordHash;
  cleaned.createdAt = base.createdAt;
  cleaned.updatedAt = cleanIsoString(input.updatedAt, base.updatedAt);
  return cleaned;
}

function cleanListingRecord(value: unknown, index: number): VendorListing {
  const input = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const now = new Date(0).toISOString();
  const base: VendorListing = {
    id: cleanId(input.id, `lst_import_${index + 1}`),
    vendorId: cleanId(input.vendorId, ''),
    title: `Listing ${index + 1}`,
    category: 'General',
    subcategory: '',
    description: '',
    price: 0,
    currency: 'LKR',
    pricingType: 'fixed',
    coverImageBase64: null,
    galleryImages: [],
    seoTitle: '',
    seoDescription: '',
    tags: [],
    contentMarkdown: '',
    active: true,
    createdAt: cleanIsoString(input.createdAt, now),
    updatedAt: cleanIsoString(input.updatedAt, now),
  };
  const cleaned = cleanListingPatch(base, input as Partial<Omit<VendorListing, 'id' | 'vendorId' | 'createdAt'>>);
  cleaned.id = base.id;
  cleaned.vendorId = base.vendorId;
  cleaned.createdAt = base.createdAt;
  cleaned.updatedAt = cleanIsoString(input.updatedAt, base.updatedAt);
  return cleaned;
}

function cleanVendorPatch(current: VendorRegistration, data: Partial<Omit<VendorRegistration, 'id' | 'createdAt'>>) {
  const updated = { ...current };
  if ('ownerFirstName' in data) updated.ownerFirstName = cleanString(data.ownerFirstName, current.ownerFirstName, 80);
  if ('ownerLastName' in data) updated.ownerLastName = cleanString(data.ownerLastName, current.ownerLastName, 80);
  if ('phone' in data) updated.phone = cleanString(data.phone, current.phone, 40);
  if ('businessName' in data) updated.businessName = cleanString(data.businessName, current.businessName, 180);
  if ('category' in data) updated.category = cleanString(data.category, current.category, 120);
  if ('subcategory' in data) updated.subcategory = cleanString(data.subcategory, current.subcategory, 120);
  if ('description' in data) updated.description = cleanString(data.description, current.description, 1000);
  if ('yearsInBusiness' in data) updated.yearsInBusiness = cleanOptionalNonNegativeNumber(data.yearsInBusiness, current.yearsInBusiness);
  if ('website' in data) updated.website = cleanString(data.website, current.website, 300);
  if ('location' in data) updated.location = cleanString(data.location, current.location, 180);
  if ('serviceArea' in data) updated.serviceArea = cleanString(data.serviceArea, current.serviceArea, 180);
  if ('logoBase64' in data) updated.logoBase64 = cleanNullableString(data.logoBase64, current.logoBase64, 250000);
  if ('coverImageBase64' in data) updated.coverImageBase64 = cleanNullableString(data.coverImageBase64, current.coverImageBase64 || null, 250000);
  if ('portfolioImages' in data) updated.portfolioImages = cleanStringArray(data.portfolioImages, current.portfolioImages, 10, 250000);
  if ('businessRegNumber' in data) updated.businessRegNumber = cleanString(data.businessRegNumber, current.businessRegNumber, 120);
  if ('taxIdNumber' in data) updated.taxIdNumber = cleanString(data.taxIdNumber, current.taxIdNumber, 120);
  if ('businessRegDocBase64' in data) updated.businessRegDocBase64 = cleanNullableString(data.businessRegDocBase64, current.businessRegDocBase64, 250000);
  if ('basePrice' in data) updated.basePrice = cleanNonNegativeNumber(data.basePrice, current.basePrice);
  if ('currency' in data) updated.currency = cleanString(data.currency, current.currency, 12);
  if ('pricingNotes' in data) updated.pricingNotes = cleanString(data.pricingNotes, current.pricingNotes, 500);
  if ('packages' in data) updated.packages = cleanPackages(data.packages, current.packages);
  if ('seoTitle' in data) updated.seoTitle = cleanString(data.seoTitle, current.seoTitle || '', 160);
  if ('seoDescription' in data) updated.seoDescription = cleanString(data.seoDescription, current.seoDescription || '', 300);
  if ('seoKeywords' in data) updated.seoKeywords = cleanString(data.seoKeywords, current.seoKeywords || '', 240);
  if ('aboutMarkdown' in data) updated.aboutMarkdown = cleanString(data.aboutMarkdown, current.aboutMarkdown || '', 10000);
  if ('faqMarkdown' in data) updated.faqMarkdown = cleanString(data.faqMarkdown, current.faqMarkdown || '', 10000);
  if ('status' in data && VENDOR_STATUSES.includes(data.status as VendorStatus)) updated.status = data.status as VendorStatus;
  if ('onboardingStep' in data && ONBOARDING_STEPS.includes(data.onboardingStep as OnboardingStep)) updated.onboardingStep = data.onboardingStep as OnboardingStep;
  if ('verificationNotes' in data) updated.verificationNotes = cleanString(data.verificationNotes, current.verificationNotes, 1000);
  if ('reviewedBy' in data) updated.reviewedBy = cleanNullableString(data.reviewedBy, current.reviewedBy, 120);
  if ('reviewedAt' in data) updated.reviewedAt = cleanNullableString(data.reviewedAt, current.reviewedAt, 80);
  if ('featured' in data) updated.featured = Boolean(data.featured);
  return updated;
}

function cleanListingPatch(current: VendorListing, data: Partial<Omit<VendorListing, 'id' | 'vendorId' | 'createdAt'>>) {
  const updated = { ...current };
  if ('title' in data) updated.title = cleanString(data.title, current.title, 180);
  if ('category' in data) updated.category = cleanString(data.category, current.category, 120);
  if ('subcategory' in data) updated.subcategory = cleanString(data.subcategory, current.subcategory, 120);
  if ('description' in data) updated.description = cleanString(data.description, current.description, 1000);
  if ('price' in data) updated.price = cleanNonNegativeNumber(data.price, current.price);
  if ('currency' in data) updated.currency = cleanString(data.currency, current.currency, 12);
  if ('pricingType' in data && PRICING_TYPES.includes(data.pricingType as PricingType)) updated.pricingType = data.pricingType as PricingType;
  if ('coverImageBase64' in data) updated.coverImageBase64 = cleanNullableString(data.coverImageBase64, current.coverImageBase64, 250000);
  if ('galleryImages' in data) updated.galleryImages = cleanStringArray(data.galleryImages, current.galleryImages, 10, 250000);
  if ('tags' in data) updated.tags = cleanStringArray(data.tags, current.tags, 20, 80);
  if ('seoTitle' in data) updated.seoTitle = cleanString(data.seoTitle, current.seoTitle, 160);
  if ('seoDescription' in data) updated.seoDescription = cleanString(data.seoDescription, current.seoDescription, 300);
  if ('contentMarkdown' in data) updated.contentMarkdown = cleanString(data.contentMarkdown, current.contentMarkdown, 10000);
  if ('active' in data) updated.active = data.active !== false;
  return updated;
}

// Seed one demo vendor so the portal has data to show
function initVendorStore() {
  if (loadPersistedVendorStore()) return;

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
      reviewedAt: '2026-05-17T10:00:00.000Z',
      featured: true,
      createdAt: '2026-05-14T10:00:00.000Z',
      updatedAt: '2026-05-17T10:00:00.000Z',
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
        createdAt: '2026-05-16T10:00:00.000Z',
        updatedAt: '2026-05-21T10:00:00.000Z',
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
        createdAt: '2026-05-17T10:00:00.000Z',
        updatedAt: '2026-05-22T10:00:00.000Z',
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
        createdAt: '2026-05-19T10:00:00.000Z',
        updatedAt: '2026-05-23T10:00:00.000Z',
      }
    );
  }

  if (vendorStore.bookings.length === 0) {
    vendorStore.bookings.push(
      {
        id: 'bk_seed_001',
        vendorId: 'vnd_seed_001',
        coupleName: 'Priya & Kasun',
        coupleEmail: 'priya.kasun@example.com',
        serviceName: 'Full Day Wedding Photography',
        listingId: 'lst_seed_001',
        status: 'pending',
        amount: 150000,
        currency: 'LKR',
        weddingDate: '2026-08-15',
        venue: 'Galle Face Hotel, Colombo',
        notes: 'Interested in full-day coverage with a short evening reel.',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'bk_seed_002',
        vendorId: 'vnd_seed_001',
        coupleName: 'Nadeesha & Tharaka',
        coupleEmail: 'nadeesha.tharaka@example.com',
        serviceName: 'Pre-Wedding Shoot',
        listingId: 'lst_seed_002',
        status: 'confirmed',
        amount: 35000,
        currency: 'LKR',
        weddingDate: '2026-09-20',
        venue: 'Galle Fort',
        notes: 'Confirmed outdoor pre-wedding shoot with two outfit changes.',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      }
    );
  }

  if (vendorStore.availability.length === 0) {
    vendorStore.availability.push({
      vendorId: 'vnd_seed_001',
      minLeadDays: 14,
      weekendsOnly: false,
      blockedDates: ['2026-08-02', '2026-08-08', '2026-08-21'],
      weeklyOpenDays: [0, 1, 2, 3, 4, 5, 6],
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    });
  }

  if (vendorStore.messageThreads.length === 0) {
    vendorStore.messageThreads.push(
      {
        id: 'msg_seed_001',
        vendorId: 'vnd_seed_001',
        bookingId: 'bk_seed_001',
        coupleName: 'Priya & Kasun',
        subject: 'Availability for August 15',
        unread: true,
        lastMessageAt: new Date(Date.now() - 6 * 3600000).toISOString(),
        messages: [
          {
            id: 'msg_seed_001_a',
            sender: 'couple',
            body: 'Can you confirm if August 15 is still available for full-day coverage?',
            createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
          },
          {
            id: 'msg_seed_001_b',
            sender: 'vendor',
            body: 'Yes, that date is currently open. I can hold it while we confirm package details.',
            createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
          },
        ],
      },
      {
        id: 'msg_seed_002',
        vendorId: 'vnd_seed_001',
        bookingId: 'bk_seed_002',
        coupleName: 'Nadeesha & Tharaka',
        subject: 'Pre-wedding shoot details',
        unread: false,
        lastMessageAt: new Date(Date.now() - 20 * 3600000).toISOString(),
        messages: [
          {
            id: 'msg_seed_002_a',
            sender: 'couple',
            body: 'Thank you, we are excited to work with you.',
            createdAt: new Date(Date.now() - 20 * 3600000).toISOString(),
          },
        ],
      }
    );
  }

  if (vendorStore.payouts.length === 0) {
    vendorStore.payouts.push({
      id: 'po_seed_001',
      vendorId: 'vnd_seed_001',
      bookingId: 'bk_seed_002',
      label: 'Pre-Wedding Shoot',
      gross: 35000,
      fee: 1750,
      currency: 'LKR',
      status: 'pending',
      payoutDate: '2026-09-27',
    });
  }

  if (vendorStore.settings.length === 0) {
    vendorStore.settings.push({
      vendorId: 'vnd_seed_001',
      emailBookings: true,
      emailMessages: true,
      weeklyDigest: true,
      smsUrgent: false,
      publicProfile: true,
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    });
  }

  persistVendorStore();
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
  persistVendorStore();
  return vendor;
}

export function updateVendor(
  id: string,
  data: Partial<Omit<VendorRegistration, 'id' | 'createdAt'>>
): VendorRegistration | null {
  const idx = vendorStore.vendors.findIndex(v => v.id === id);
  if (idx === -1) return null;
  const updated: VendorRegistration = {
    ...cleanVendorPatch(vendorStore.vendors[idx], data),
    updatedAt: new Date().toISOString(),
  };
  vendorStore.vendors[idx] = updated;
  persistVendorStore();
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
  vendorStore.listings = vendorStore.listings.filter(l => l.vendorId !== id);
  persistVendorStore();
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
    featured: Boolean(v.featured),
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
  persistVendorStore();
  return listing;
}

export function updateListing(
  id: string,
  data: Partial<Omit<VendorListing, 'id' | 'vendorId' | 'createdAt'>>
): VendorListing | null {
  const idx = vendorStore.listings.findIndex(l => l.id === id);
  if (idx === -1) return null;
  const updated: VendorListing = {
    ...cleanListingPatch(vendorStore.listings[idx], data),
    updatedAt: new Date().toISOString(),
  };
  if (Array.isArray(updated.galleryImages) && updated.galleryImages.length > 10) {
    throw new Error('maximum 10 gallery images allowed');
  }
  vendorStore.listings[idx] = updated;
  persistVendorStore();
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
  persistVendorStore();
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

// ════════════════════════════════════════════════════════════════
// VENDOR PORTAL OPERATION HELPERS
// ════════════════════════════════════════════════════════════════

export function getBookingsByVendor(vendorId: string): VendorBooking[] {
  return vendorStore.bookings
    .filter(b => b.vendorId === vendorId)
    .sort((a, b) => new Date(a.weddingDate).getTime() - new Date(b.weddingDate).getTime());
}

export function updateBookingStatus(
  vendorId: string,
  bookingId: string,
  status: VendorBookingStatus
): VendorBooking | null {
  const idx = vendorStore.bookings.findIndex(b => b.vendorId === vendorId && b.id === bookingId);
  if (idx === -1) return null;
  const updated: VendorBooking = {
    ...vendorStore.bookings[idx],
    status,
    updatedAt: new Date().toISOString(),
  };
  vendorStore.bookings[idx] = updated;
  return updated;
}

export function getAvailabilityByVendor(vendorId: string): VendorAvailability {
  const existing = vendorStore.availability.find(a => a.vendorId === vendorId);
  if (existing) return existing;
  const now = new Date().toISOString();
  const availability: VendorAvailability = {
    vendorId,
    minLeadDays: 14,
    weekendsOnly: false,
    blockedDates: [],
    weeklyOpenDays: [0, 1, 2, 3, 4, 5, 6],
    updatedAt: now,
  };
  vendorStore.availability.push(availability);
  return availability;
}

export function updateAvailability(
  vendorId: string,
  patch: Partial<Omit<VendorAvailability, 'vendorId' | 'updatedAt'>>
): VendorAvailability {
  const current = getAvailabilityByVendor(vendorId);
  const updated: VendorAvailability = {
    ...current,
    ...patch,
    minLeadDays: Math.max(0, Number(patch.minLeadDays ?? current.minLeadDays)),
    blockedDates: Array.isArray(patch.blockedDates) ? patch.blockedDates.slice(0, 50) : current.blockedDates,
    weeklyOpenDays: Array.isArray(patch.weeklyOpenDays) ? patch.weeklyOpenDays.filter(d => d >= 0 && d <= 6) : current.weeklyOpenDays,
    updatedAt: new Date().toISOString(),
  };
  const idx = vendorStore.availability.findIndex(a => a.vendorId === vendorId);
  vendorStore.availability[idx] = updated;
  return updated;
}

export function getMessageThreadsByVendor(vendorId: string): VendorMessageThread[] {
  return vendorStore.messageThreads
    .filter(t => t.vendorId === vendorId)
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export function markMessageThreadRead(vendorId: string, threadId: string): VendorMessageThread | null {
  const idx = vendorStore.messageThreads.findIndex(t => t.vendorId === vendorId && t.id === threadId);
  if (idx === -1) return null;
  const updated: VendorMessageThread = {
    ...vendorStore.messageThreads[idx],
    unread: false,
  };
  vendorStore.messageThreads[idx] = updated;
  return updated;
}

export function appendVendorMessage(vendorId: string, threadId: string, body: string): VendorMessageThread | null {
  const idx = vendorStore.messageThreads.findIndex(t => t.vendorId === vendorId && t.id === threadId);
  if (idx === -1) return null;
  const text = String(body || '').trim();
  if (!text) throw new Error('message body required');
  const now = new Date().toISOString();
  const updated: VendorMessageThread = {
    ...vendorStore.messageThreads[idx],
    unread: false,
    lastMessageAt: now,
    messages: [
      ...vendorStore.messageThreads[idx].messages,
      {
        id: `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        sender: 'vendor',
        body: text,
        createdAt: now,
      },
    ],
  };
  vendorStore.messageThreads[idx] = updated;
  return updated;
}

export function getPayoutsByVendor(vendorId: string): VendorPayout[] {
  return vendorStore.payouts
    .filter(p => p.vendorId === vendorId)
    .sort((a, b) => new Date(b.payoutDate).getTime() - new Date(a.payoutDate).getTime());
}

export function getSettingsByVendor(vendorId: string): VendorSettings {
  const existing = vendorStore.settings.find(s => s.vendorId === vendorId);
  if (existing) return existing;
  const settings: VendorSettings = {
    vendorId,
    emailBookings: true,
    emailMessages: true,
    weeklyDigest: true,
    smsUrgent: false,
    publicProfile: false,
    updatedAt: new Date().toISOString(),
  };
  vendorStore.settings.push(settings);
  return settings;
}

export function updateSettings(
  vendorId: string,
  patch: Partial<Omit<VendorSettings, 'vendorId' | 'updatedAt'>>
): VendorSettings {
  const current = getSettingsByVendor(vendorId);
  const updated: VendorSettings = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  const idx = vendorStore.settings.findIndex(s => s.vendorId === vendorId);
  vendorStore.settings[idx] = updated;
  return updated;
}

export function getVendorPortalData(vendorId: string) {
  const bookings = getBookingsByVendor(vendorId);
  const messages = getMessageThreadsByVendor(vendorId);
  const payouts = getPayoutsByVendor(vendorId);
  const confirmedValue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, booking) => sum + booking.amount, 0);

  return {
    bookings,
    availability: getAvailabilityByVendor(vendorId),
    messages,
    payouts,
    settings: getSettingsByVendor(vendorId),
    analytics: {
      bookingCount: bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      confirmedValue,
      unreadMessages: messages.filter(m => m.unread).length,
      pendingPayoutValue: payouts
        .filter(p => p.status === 'pending')
        .reduce((sum, payout) => sum + payout.gross - payout.fee, 0),
    },
  };
}
