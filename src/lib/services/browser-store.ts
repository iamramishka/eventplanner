import { eventDirectory } from "@/data/mock-content";
import { CoupleAccount } from "@/types/auth";
import { ContactInquiryPayload, SessionUser, VendorLeadPayload, WeddingOnboardingPayload } from "@/types/public";
import {
  getCoupleAccounts,
  getCoupleSession,
  saveCoupleAccounts,
  saveCoupleSession,
  toAuthSession,
} from "@/lib/services/shared-auth-store";

export type StoredUser = CoupleAccount;

export type StoredWedding = WeddingOnboardingPayload & {
  userId: string;
  weddingSlug: string;
};

const WEDDINGS_KEY = "vinyup-public-weddings";
const LEADS_KEY = "vinyup-public-vendor-leads";
const CONTACTS_KEY = "vinyup-public-contact-entries";

const seededWeddings: StoredWedding[] = [
  {
    userId: "user-amaya",
    partnerOneName: "Amaya",
    partnerTwoName: "Kavin",
    venueName: eventDirectory[0]?.location ?? "The Kingsbury, Colombo",
    venueTbd: false,
    eventDate: "2026-12-12",
    dateTbd: false,
    estimatedGuests: "220",
    guestsTbd: false,
    estimatedBudget: "950000",
    budgetTbd: false,
    weddingSlug: "amaya-kavin",
  },
];

function ensureBrowser() {
  if (typeof window === "undefined") {
    throw new Error("This mock service is only available in the browser.");
  }
}

function readJson<T>(key: string, fallback: T): T {
  ensureBrowser();

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  ensureBrowser();
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function ensureMockStorage() {
  readJson(WEDDINGS_KEY, seededWeddings);
  readJson<VendorLeadPayload[]>(LEADS_KEY, []);
  readJson<ContactInquiryPayload[]>(CONTACTS_KEY, []);
}

export function getUsers() {
  return getCoupleAccounts();
}

export function saveUsers(users: StoredUser[]) {
  saveCoupleAccounts(users);
}

export function getWeddings() {
  ensureMockStorage();
  return readJson<StoredWedding[]>(WEDDINGS_KEY, seededWeddings);
}

export function saveWeddings(weddings: StoredWedding[]) {
  writeJson(WEDDINGS_KEY, weddings);
}

export function getSession() {
  return getCoupleSession();
}

export function saveSession(session: SessionUser | null) {
  saveCoupleSession(session);
}

export function saveVendorLead(payload: VendorLeadPayload) {
  const entries = readJson<VendorLeadPayload[]>(LEADS_KEY, []);
  entries.unshift(payload);
  writeJson(LEADS_KEY, entries);
}

export function saveContact(payload: ContactInquiryPayload) {
  const entries = readJson<ContactInquiryPayload[]>(CONTACTS_KEY, []);
  entries.unshift(payload);
  writeJson(CONTACTS_KEY, entries);
}

export function toSessionUser(user: StoredUser): SessionUser {
  return toAuthSession(user) as SessionUser;
}
