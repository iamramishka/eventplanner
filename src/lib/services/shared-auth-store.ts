"use client";

import { adminCredentials } from "@/data/admin-mock";
import { vendorDemoCredentials } from "@/data/vendor-mock";
import {
  AdminAccount,
  AdminSession,
  AppSession,
  AuthAccountRecord,
  CoupleAccount,
  CoupleSession,
  VendorAccount,
  VendorSession,
} from "@/types/auth";

const AUTH_ACCOUNTS_KEY = "vinyup-auth-accounts";
const AUTH_SESSION_KEY = "vinyup-auth-session";

const seededAccounts: AuthAccountRecord[] = [
  {
    id: "user-amaya",
    fullName: "Amaya Perera",
    email: "amaya@vinyup.com",
    password: "Welcome123!",
    role: "couple",
    hasWedding: true,
  },
  {
    id: "user-nilan",
    fullName: "Nilan Fernando",
    email: "nilan@vinyup.com",
    password: "Welcome123!",
    role: "couple",
    hasWedding: false,
  },
  ...vendorDemoCredentials.map<VendorAccount>((item) => ({
    id: item.vendorId,
    vendorId: item.vendorId,
    fullName: item.fullName,
    email: item.email,
    password: item.password,
    role: "vendor",
    businessName: item.businessName,
  })),
  {
    id: "admin-1",
    adminId: "admin-1",
    fullName: "Platform Owner",
    email: adminCredentials.email,
    password: adminCredentials.password,
    role: "super_admin",
    lastLoginAt: new Date("2026-04-22T18:45:00.000Z").toISOString(),
  } satisfies AdminAccount,
];

function ensureBrowser() {
  if (typeof window === "undefined") {
    throw new Error("Auth browser storage is only available in the browser.");
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

export function normalizeAuthEmail(email: string) {
  return email.trim().toLowerCase();
}

export function ensureSharedAuthStorage() {
  readJson<AuthAccountRecord[]>(AUTH_ACCOUNTS_KEY, seededAccounts);
  readJson<AppSession | null>(AUTH_SESSION_KEY, null);
}

export function getAuthAccounts() {
  ensureSharedAuthStorage();
  return readJson<AuthAccountRecord[]>(AUTH_ACCOUNTS_KEY, seededAccounts);
}

export function saveAuthAccounts(accounts: AuthAccountRecord[]) {
  writeJson(AUTH_ACCOUNTS_KEY, accounts);
}

export function getAuthSession() {
  ensureSharedAuthStorage();
  return readJson<AppSession | null>(AUTH_SESSION_KEY, null);
}

export function saveAuthSession(session: AppSession | null) {
  writeJson(AUTH_SESSION_KEY, session);
}

export function isCoupleAccount(account: AuthAccountRecord): account is CoupleAccount {
  return account.role === "couple";
}

export function isVendorAccount(account: AuthAccountRecord): account is VendorAccount {
  return account.role === "vendor";
}

export function isAdminAccount(account: AuthAccountRecord): account is AdminAccount {
  return account.role === "super_admin";
}

export function toAuthSession(account: AuthAccountRecord): AppSession {
  switch (account.role) {
    case "couple":
      return {
        id: account.id,
        fullName: account.fullName,
        email: account.email,
        role: "couple",
        hasWedding: account.hasWedding,
        accountStatus: "active",
        subscriptionStatus: account.hasWedding ? "trial" : undefined,
      };
    case "vendor":
      return {
        id: account.id,
        vendorId: account.vendorId,
        fullName: account.fullName,
        email: account.email,
        role: "vendor",
        businessName: account.businessName,
      };
    default:
      return {
        id: account.id,
        adminId: account.adminId,
        fullName: account.fullName,
        email: account.email,
        role: "super_admin",
        lastLoginAt: account.lastLoginAt,
      };
  }
}

function mergeAccounts<T extends AuthAccountRecord>(
  nextRecords: T[],
  matcher: (account: AuthAccountRecord) => account is T,
) {
  const remaining = getAuthAccounts().filter((account) => !matcher(account));
  saveAuthAccounts([...remaining, ...nextRecords]);
}

export function getCoupleAccounts() {
  return getAuthAccounts().filter(isCoupleAccount);
}

export function saveCoupleAccounts(accounts: CoupleAccount[]) {
  mergeAccounts(accounts, isCoupleAccount);
}

export function getVendorAccountsFromAuth() {
  return getAuthAccounts().filter(isVendorAccount);
}

export function saveVendorAccountsToAuth(accounts: VendorAccount[]) {
  mergeAccounts(accounts, isVendorAccount);
}

export function getAdminAccounts() {
  return getAuthAccounts().filter(isAdminAccount);
}

export function saveAdminAccounts(accounts: AdminAccount[]) {
  mergeAccounts(accounts, isAdminAccount);
}

export function getCoupleSession() {
  const session = getAuthSession();
  return session?.role === "couple" ? session : null;
}

export function saveCoupleSession(session: CoupleSession | null) {
  saveAuthSession(session);
}

export function getVendorSessionFromAuth() {
  const session = getAuthSession();
  return session?.role === "vendor" ? session : null;
}

export function saveVendorSessionFromAuth(session: VendorSession | null) {
  saveAuthSession(session);
}

export function getAdminSessionFromAuth() {
  const session = getAuthSession();
  return session?.role === "super_admin" ? session : null;
}

export function saveAdminSessionFromAuth(session: AdminSession | null) {
  saveAuthSession(session);
}
