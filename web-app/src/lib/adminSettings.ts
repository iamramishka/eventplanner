import fs from 'fs';
import path from 'path';

export type AdminPlan = {
  id: 'trial' | 'premium';
  name: string;
  price: string;
  billingPriceId?: string;
  billingCurrency?: string;
  billingInterval?: 'month' | 'year';
  description: string;
  entitlements: {
    maxGuests: number;
    digitalInvitations: boolean;
    customDomain: boolean;
    vendorShortlist: boolean;
    premiumTemplates: boolean;
  };
};

export type PlatformSettings = {
  branding: {
    siteName: string;
    logoUrl: string;
    primaryColor: string;
    publicTagline: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
    supportEmail: string;
  };
  publicSite: {
    heroTitle: string;
    heroSubtitle: string;
    ctaLabel: string;
    ctaHref: string;
    maintenanceMode: boolean;
  };
  trial: {
    defaultTrialDays: number;
  };
  cmsBlocks: {
    featuresIntro: string;
    templatesIntro: string;
    footerNote: string;
  };
  templates: Array<{
    id: string;
    name: string;
    status: 'active' | 'draft';
  }>;
};

export type AdminSettingsState = {
  settings: PlatformSettings;
  plans: AdminPlan[];
  updatedAt: string;
};

const DATA_FILE = path.join(process.cwd(), 'data', 'admin-settings.json');
const PLAN_IDS = ['trial', 'premium'] as const;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function cleanString(value: unknown, fallback: string, maxLength = 500) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : fallback;
}

function cleanOptionalString(value: unknown, fallback = '', maxLength = 1000) {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, maxLength);
}

function cleanColor(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  const color = value.trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
}

function cleanHref(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  const href = value.trim();
  if (!href) return fallback;
  if (href.startsWith('/') || href.startsWith('https://') || href.startsWith('http://')) return href.slice(0, 300);
  return fallback;
}

function cleanBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function cleanPositiveInt(value: unknown, fallback: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.floor(numeric));
}

function cleanTrialDays(value: unknown, fallback: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(365, Math.max(1, Math.floor(numeric)));
}

function cleanCurrency(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  const currency = value.trim().toLowerCase();
  return /^[a-z]{3}$/.test(currency) ? currency : fallback;
}

function cleanBillingInterval(value: unknown, fallback: 'month' | 'year') {
  return value === 'year' ? 'year' : fallback;
}

function cleanIsoString(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettingsState = {
  updatedAt: new Date(0).toISOString(),
  settings: {
    branding: {
      siteName: 'WedPlan',
      logoUrl: '',
      primaryColor: '#E24B6D',
      publicTagline: 'Beautiful digital wedding invitations and planning tools.',
    },
    contact: {
      phone: '+94 77 123 4567',
      whatsapp: '+94 77 123 4567',
      supportEmail: 'support@wedplan.test',
    },
    publicSite: {
      heroTitle: 'Create wedding websites, manage guests, and plan together',
      heroSubtitle: 'Beautiful invitation templates, RSVP management, vendor discovery, and collaborative planning tools in one place.',
      ctaLabel: 'Start Free Trial',
      ctaHref: '/register',
      maintenanceMode: false,
    },
    trial: {
      defaultTrialDays: 14,
    },
    cmsBlocks: {
      featuresIntro: 'Invitation templates, guest management, vendor discovery, and collaborative planning tools.',
      templatesIntro: 'Elegant, responsive invitation designs couples can customize for their celebration.',
      footerNote: 'Trusted by couples and vendors worldwide.',
    },
    templates: [
      { id: 'classic', name: 'Classic', status: 'active' },
      { id: 'modern', name: 'Modern', status: 'active' },
      { id: 'romantic', name: 'Romantic', status: 'active' },
    ],
  },
  plans: [
    {
      id: 'trial',
      name: 'Trial',
      price: 'Free',
      billingPriceId: '',
      billingCurrency: 'usd',
      billingInterval: 'month',
      description: 'Starter planning controls for small weddings.',
      entitlements: {
        maxGuests: 50,
        digitalInvitations: false,
        customDomain: false,
        vendorShortlist: true,
        premiumTemplates: false,
      },
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$49 / month',
      billingPriceId: '',
      billingCurrency: 'usd',
      billingInterval: 'month',
      description: 'Full planning, invitation, and vendor discovery access.',
      entitlements: {
        maxGuests: 1000,
        digitalInvitations: true,
        customDomain: true,
        vendorShortlist: true,
        premiumTemplates: true,
      },
    },
  ],
};

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_ADMIN_SETTINGS, null, 2));
  }
}

export function getAdminSettings(): AdminSettingsState {
  ensureDataFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as Partial<AdminSettingsState>;
    const mergedSettings = {
      ...DEFAULT_ADMIN_SETTINGS.settings,
      ...(asRecord(parsed.settings) || {}),
      branding: { ...DEFAULT_ADMIN_SETTINGS.settings.branding, ...asRecord(parsed.settings?.branding) },
      contact: { ...DEFAULT_ADMIN_SETTINGS.settings.contact, ...asRecord(parsed.settings?.contact) },
      publicSite: { ...DEFAULT_ADMIN_SETTINGS.settings.publicSite, ...asRecord(parsed.settings?.publicSite) },
      trial: { ...DEFAULT_ADMIN_SETTINGS.settings.trial, ...asRecord(parsed.settings?.trial) },
      cmsBlocks: { ...DEFAULT_ADMIN_SETTINGS.settings.cmsBlocks, ...asRecord(parsed.settings?.cmsBlocks) },
      templates: Array.isArray(parsed.settings?.templates) ? parsed.settings.templates : DEFAULT_ADMIN_SETTINGS.settings.templates,
    };
    const cleanedSettings = normalizeSettingsPatch(mergedSettings, DEFAULT_ADMIN_SETTINGS.settings);
    return {
      ...DEFAULT_ADMIN_SETTINGS,
      updatedAt: cleanIsoString(parsed.updatedAt, DEFAULT_ADMIN_SETTINGS.updatedAt),
      settings: {
        ...DEFAULT_ADMIN_SETTINGS.settings,
        ...cleanedSettings,
        branding: { ...DEFAULT_ADMIN_SETTINGS.settings.branding, ...(cleanedSettings.branding || {}) },
        contact: { ...DEFAULT_ADMIN_SETTINGS.settings.contact, ...(cleanedSettings.contact || {}) },
        publicSite: { ...DEFAULT_ADMIN_SETTINGS.settings.publicSite, ...(cleanedSettings.publicSite || {}) },
        trial: { ...DEFAULT_ADMIN_SETTINGS.settings.trial, ...(cleanedSettings.trial || {}) },
        cmsBlocks: { ...DEFAULT_ADMIN_SETTINGS.settings.cmsBlocks, ...(cleanedSettings.cmsBlocks || {}) },
        templates: cleanedSettings.templates || DEFAULT_ADMIN_SETTINGS.settings.templates,
      },
      plans: normalizePlans(Array.isArray(parsed.plans) ? parsed.plans : DEFAULT_ADMIN_SETTINGS.plans, DEFAULT_ADMIN_SETTINGS.plans),
    };
  } catch {
    return DEFAULT_ADMIN_SETTINGS;
  }
}

export function saveAdminSettings(next: Partial<PlatformSettings>) {
  const current = getAdminSettings();
  const cleaned = normalizeSettingsPatch(next, current.settings);
  const updated: AdminSettingsState = {
    ...current,
    updatedAt: new Date().toISOString(),
    settings: {
      ...current.settings,
      ...cleaned,
      branding: { ...current.settings.branding, ...(cleaned.branding || {}) },
      contact: { ...current.settings.contact, ...(cleaned.contact || {}) },
      publicSite: { ...current.settings.publicSite, ...(cleaned.publicSite || {}) },
      trial: { ...current.settings.trial, ...(cleaned.trial || {}) },
      cmsBlocks: { ...current.settings.cmsBlocks, ...(cleaned.cmsBlocks || {}) },
      templates: cleaned.templates || current.settings.templates,
    },
  };
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2));
  return updated;
}

export function saveAdminPlans(plans: AdminPlan[]) {
  const current = getAdminSettings();
  const normalized = normalizePlans(plans, current.plans);
  const updated = {
    ...current,
    plans: normalized,
    updatedAt: new Date().toISOString(),
  };
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2));
  return updated;
}

export function normalizeSettingsPatch(next: Partial<PlatformSettings>, current: PlatformSettings) {
  const input = asRecord(next);
  const patch: Partial<PlatformSettings> = {};

  if ('branding' in input) {
    const branding = asRecord(input.branding);
    patch.branding = {
      siteName: cleanString(branding.siteName, current.branding.siteName, 80),
      logoUrl: cleanOptionalString(branding.logoUrl, current.branding.logoUrl, 500),
      primaryColor: cleanColor(branding.primaryColor, current.branding.primaryColor),
      publicTagline: cleanString(branding.publicTagline, current.branding.publicTagline, 180),
    };
  }

  if ('contact' in input) {
    const contact = asRecord(input.contact);
    patch.contact = {
      phone: cleanOptionalString(contact.phone, current.contact.phone, 40),
      whatsapp: cleanOptionalString(contact.whatsapp, current.contact.whatsapp, 40),
      supportEmail: cleanString(contact.supportEmail, current.contact.supportEmail, 120),
    };
  }

  if ('publicSite' in input) {
    const publicSite = asRecord(input.publicSite);
    patch.publicSite = {
      heroTitle: cleanString(publicSite.heroTitle, current.publicSite.heroTitle, 120),
      heroSubtitle: cleanString(publicSite.heroSubtitle, current.publicSite.heroSubtitle, 280),
      ctaLabel: cleanString(publicSite.ctaLabel, current.publicSite.ctaLabel, 50),
      ctaHref: cleanHref(publicSite.ctaHref, current.publicSite.ctaHref),
      maintenanceMode: cleanBoolean(publicSite.maintenanceMode, current.publicSite.maintenanceMode),
    };
  }

  if ('trial' in input) {
    const trial = asRecord(input.trial);
    patch.trial = {
      defaultTrialDays: cleanTrialDays(trial.defaultTrialDays, current.trial.defaultTrialDays),
    };
  }

  if ('cmsBlocks' in input) {
    const cmsBlocks = asRecord(input.cmsBlocks);
    patch.cmsBlocks = {
      featuresIntro: cleanString(cmsBlocks.featuresIntro, current.cmsBlocks.featuresIntro, 500),
      templatesIntro: cleanString(cmsBlocks.templatesIntro, current.cmsBlocks.templatesIntro, 500),
      footerNote: cleanString(cmsBlocks.footerNote, current.cmsBlocks.footerNote, 240),
    };
  }

  if (Array.isArray(input.templates)) {
    patch.templates = input.templates
      .map((item, index) => {
        const template = asRecord(item);
        const status: 'active' | 'draft' = template.status === 'draft' ? 'draft' : 'active';
        return {
          id: cleanString(template.id, `template-${index + 1}`, 80).replace(/[^a-z0-9-]/gi, '-').toLowerCase(),
          name: cleanString(template.name, `Template ${index + 1}`, 80),
          status,
        };
      })
      .filter((template, index, all) => all.findIndex((item) => item.id === template.id) === index)
      .slice(0, 20);
  }

  return patch;
}

export function normalizePlans(plans: AdminPlan[], current: AdminPlan[]) {
  return PLAN_IDS.map((id) => {
    const existing = current.find((plan) => plan.id === id) || DEFAULT_ADMIN_SETTINGS.plans.find((plan) => plan.id === id)!;
    const input = asRecord(plans.find((plan) => plan.id === id));
    const entitlements = asRecord(input.entitlements);

    return {
      id,
      name: cleanString(input.name, existing.name, 80),
      price: cleanString(input.price, existing.price, 80),
      billingPriceId: cleanOptionalString(input.billingPriceId, existing.billingPriceId || '', 120),
      billingCurrency: cleanCurrency(input.billingCurrency, existing.billingCurrency || 'usd'),
      billingInterval: cleanBillingInterval(input.billingInterval, existing.billingInterval || 'month'),
      description: cleanString(input.description, existing.description, 240),
      entitlements: {
        maxGuests: cleanPositiveInt(entitlements.maxGuests, existing.entitlements.maxGuests),
        digitalInvitations: cleanBoolean(entitlements.digitalInvitations, existing.entitlements.digitalInvitations),
        customDomain: cleanBoolean(entitlements.customDomain, existing.entitlements.customDomain),
        vendorShortlist: cleanBoolean(entitlements.vendorShortlist, existing.entitlements.vendorShortlist),
        premiumTemplates: cleanBoolean(entitlements.premiumTemplates, existing.entitlements.premiumTemplates),
      },
    };
  });
}
