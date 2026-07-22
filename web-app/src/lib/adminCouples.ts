import fs from 'fs';
import path from 'path';

export type AdminCouple = {
  id: string;
  name: string;
  email: string;
  plan: 'trial' | 'premium';
  trialEnds?: string;
  createdAt: string;
  suspended: boolean;
  billingState?: 'active' | 'past_due' | 'canceled' | 'refunded';
  adminNotes?: string;
  guestLimit?: number;
};

const DATA_FILE = path.join(process.cwd(), 'data', 'admin-couples.json');
const BILLING_STATES = ['active', 'past_due', 'canceled', 'refunded'] as const;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function cleanString(value: unknown, fallback: string, maxLength = 160) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : fallback;
}

function cleanOptionalString(value: unknown, fallback = '', maxLength = 1000) {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, maxLength);
}

function cleanEmail(value: unknown, fallback: string) {
  const email = cleanString(value, fallback, 180).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : fallback;
}

function cleanIsoDate(value: unknown, fallback?: string) {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toISOString();
}

function cleanCouplePatch(current: AdminCouple, patch: Partial<AdminCouple>) {
  const input = asRecord(patch);
  const cleaned: AdminCouple = { ...current };

  if ('name' in input) cleaned.name = cleanString(input.name, current.name, 160);
  if ('email' in input) cleaned.email = cleanEmail(input.email, current.email);
  if ('plan' in input) cleaned.plan = input.plan === 'premium' ? 'premium' : 'trial';
  if ('trialEnds' in input) {
    const trialEnds = cleanIsoDate(input.trialEnds, current.trialEnds);
    if (trialEnds) cleaned.trialEnds = trialEnds;
    else delete cleaned.trialEnds;
  }
  if ('createdAt' in input) cleaned.createdAt = cleanIsoDate(input.createdAt, current.createdAt) || current.createdAt;
  if ('suspended' in input) cleaned.suspended = Boolean(input.suspended);
  if ('billingState' in input) {
    const billingState = input.billingState as AdminCouple['billingState'];
    cleaned.billingState = billingState && BILLING_STATES.includes(billingState)
      ? billingState
      : current.billingState || 'active';
  }
  if ('adminNotes' in input) {
    const adminNotes = cleanOptionalString(input.adminNotes, current.adminNotes || '', 2000);
    if (adminNotes) cleaned.adminNotes = adminNotes;
    else delete cleaned.adminNotes;
  }
  if ('guestLimit' in input) {
    const v = Number(input.guestLimit);
    if (input.guestLimit === null || input.guestLimit === '' || !Number.isFinite(v)) {
      delete cleaned.guestLimit;
    } else {
      cleaned.guestLimit = Math.max(0, Math.floor(v));
    }
  }

  return cleaned;
}

function cleanCoupleRecord(value: unknown, index: number) {
  const fallback = DEFAULT_ADMIN_COUPLES[index] || DEFAULT_ADMIN_COUPLES[0];
  const input = asRecord(value);
  const base: AdminCouple = {
    id: cleanString(input.id, fallback.id, 80).replace(/[^a-z0-9_-]/gi, '-'),
    name: fallback.name,
    email: fallback.email,
    plan: fallback.plan,
    trialEnds: fallback.trialEnds,
    createdAt: fallback.createdAt,
    suspended: fallback.suspended,
    billingState: fallback.billingState || 'active',
    adminNotes: fallback.adminNotes,
  };
  return cleanCouplePatch(base, input as Partial<AdminCouple>);
}

export const DEFAULT_ADMIN_COUPLES: AdminCouple[] = [
  { id: 'c1', name: 'Nimesha & Thilina', email: 'nimesha@test.com', plan: 'premium', createdAt: '2026-01-10T10:00:00Z', suspended: false, billingState: 'active' },
  { id: 'u_couple_1', name: 'Priya & Kasun', email: 'hello@priyakasun.com', plan: 'trial', trialEnds: '2026-10-10T10:00:00Z', createdAt: '2026-05-01T10:00:00Z', suspended: false, billingState: 'active' },
  { id: 'c3', name: 'Dilshan & Chamari', email: 'dilshan@test.com', plan: 'trial', trialEnds: '2026-04-10T10:00:00Z', createdAt: '2026-04-01T10:00:00Z', suspended: true, billingState: 'past_due' },
  { id: 'c4', name: 'Ashan & Nadeesha', email: 'ashan@test.com', plan: 'premium', createdAt: '2026-03-15T10:00:00Z', suspended: false, billingState: 'active' },
  { id: 'c5', name: 'Ruwan & Samantha', email: 'ruwan@test.com', plan: 'trial', trialEnds: '2026-12-01T10:00:00Z', createdAt: '2026-04-20T10:00:00Z', suspended: false, billingState: 'active' },
  { id: 'c6', name: 'Isuru & Tharaka', email: 'isuru@test.com', plan: 'trial', trialEnds: '2026-03-01T10:00:00Z', createdAt: '2026-02-10T10:00:00Z', suspended: false, billingState: 'canceled' },
  { id: 'c7', name: 'Nuwan & Malsha', email: 'nuwan@test.com', plan: 'premium', createdAt: '2026-05-05T10:00:00Z', suspended: false, billingState: 'active' },
  { id: 'c8', name: 'Lakshan & Hiruni', email: 'lakshan@test.com', plan: 'trial', trialEnds: '2026-11-30T10:00:00Z', createdAt: '2026-05-10T10:00:00Z', suspended: false, billingState: 'active' },
];

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_ADMIN_COUPLES, null, 2));
  }
}

function writeCouples(couples: AdminCouple[]) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(couples, null, 2));
}

export function getAdminCouples() {
  ensureDataFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as unknown;
    if (!Array.isArray(parsed)) return DEFAULT_ADMIN_COUPLES;
    const seen = new Set<string>();
    return parsed
      .map((item, index) => cleanCoupleRecord(item, index))
      .filter((couple) => {
        if (seen.has(couple.id)) return false;
        seen.add(couple.id);
        return true;
      });
  } catch {
    return DEFAULT_ADMIN_COUPLES;
  }
}

export function updateAdminCouple(id: string, patch: Partial<AdminCouple>) {
  const couples = getAdminCouples();
  const index = couples.findIndex((couple) => couple.id === id);
  if (index === -1) return null;

  const updated = cleanCouplePatch(couples[index], patch);
  updated.id = id;
  couples[index] = updated;
  writeCouples(couples);
  return updated;
}

export function upsertAdminCouple(couple: AdminCouple) {
  const couples = getAdminCouples();
  const index = couples.findIndex((item) => item.id === couple.id);
  const base = index >= 0 ? couples[index] : couple;
  const updated = cleanCouplePatch(base, couple);
  updated.id = couple.id;

  if (index >= 0) couples[index] = updated;
  else couples.push(updated);

  writeCouples(couples);
  return updated;
}

export function deleteAdminCouple(id: string) {
  const couples = getAdminCouples();
  const index = couples.findIndex((couple) => couple.id === id);
  if (index === -1) return null;

  const [removed] = couples.splice(index, 1);
  writeCouples(couples);
  return removed;
}
