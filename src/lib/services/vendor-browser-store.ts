"use client";

import {
  seededVendorAccountSettings,
  seededVendorContacts,
  seededVendorGallery,
  seededVendorProfiles,
  seededVendorServices,
  seededVendorVisibility,
} from "@/data/vendor-mock";
import {
  VendorAccountSettings,
  VendorContactInfoRecord,
  VendorGalleryAsset,
  VendorSession,
  VendorProfileRecord,
  VendorServiceRecord,
  VendorVisibilitySettings,
} from "@/types/vendor";
import {
  getVendorAccountsFromAuth,
  getVendorSessionFromAuth,
  saveVendorAccountsToAuth,
  saveVendorSessionFromAuth,
} from "@/lib/services/shared-auth-store";

export type VendorAccountRecord = VendorSession & {
  password: string;
};

type VendorMap<T> = Record<string, T>;
type VendorListMap<T> = Record<string, T[]>;

const VENDOR_PROFILES_KEY = "vinyup-vendor-profiles";
const VENDOR_GALLERY_KEY = "vinyup-vendor-gallery";
const VENDOR_SERVICES_KEY = "vinyup-vendor-services";
const VENDOR_CONTACTS_KEY = "vinyup-vendor-contacts";
const VENDOR_VISIBILITY_KEY = "vinyup-vendor-visibility";
const VENDOR_SETTINGS_KEY = "vinyup-vendor-settings";

function ensureBrowser() {
  if (typeof window === "undefined") {
    throw new Error("Vendor browser storage is only available in the browser.");
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

export function ensureVendorStorage() {
  readJson<VendorMap<VendorProfileRecord>>(VENDOR_PROFILES_KEY, seededVendorProfiles);
  readJson<VendorListMap<VendorGalleryAsset>>(VENDOR_GALLERY_KEY, seededVendorGallery);
  readJson<VendorListMap<VendorServiceRecord>>(VENDOR_SERVICES_KEY, seededVendorServices);
  readJson<VendorMap<VendorContactInfoRecord>>(VENDOR_CONTACTS_KEY, seededVendorContacts);
  readJson<VendorMap<VendorVisibilitySettings>>(VENDOR_VISIBILITY_KEY, seededVendorVisibility);
  readJson<VendorMap<VendorAccountSettings>>(VENDOR_SETTINGS_KEY, seededVendorAccountSettings);
}

export function getVendorAccounts() {
  return getVendorAccountsFromAuth();
}

export function saveVendorAccounts(value: VendorAccountRecord[]) {
  saveVendorAccountsToAuth(value);
}

export function getVendorSession() {
  return getVendorSessionFromAuth();
}

export function saveVendorSession(value: VendorSession | null) {
  saveVendorSessionFromAuth(value);
}

export function getVendorProfiles() {
  ensureVendorStorage();
  return readJson<VendorMap<VendorProfileRecord>>(VENDOR_PROFILES_KEY, seededVendorProfiles);
}

export function saveVendorProfiles(value: VendorMap<VendorProfileRecord>) {
  writeJson(VENDOR_PROFILES_KEY, value);
}

export function getVendorGalleryMap() {
  ensureVendorStorage();
  return readJson<VendorListMap<VendorGalleryAsset>>(VENDOR_GALLERY_KEY, seededVendorGallery);
}

export function saveVendorGalleryMap(value: VendorListMap<VendorGalleryAsset>) {
  writeJson(VENDOR_GALLERY_KEY, value);
}

export function getVendorServicesMap() {
  ensureVendorStorage();
  return readJson<VendorListMap<VendorServiceRecord>>(VENDOR_SERVICES_KEY, seededVendorServices);
}

export function saveVendorServicesMap(value: VendorListMap<VendorServiceRecord>) {
  writeJson(VENDOR_SERVICES_KEY, value);
}

export function getVendorContacts() {
  ensureVendorStorage();
  return readJson<VendorMap<VendorContactInfoRecord>>(VENDOR_CONTACTS_KEY, seededVendorContacts);
}

export function saveVendorContacts(value: VendorMap<VendorContactInfoRecord>) {
  writeJson(VENDOR_CONTACTS_KEY, value);
}

export function getVendorVisibilityMap() {
  ensureVendorStorage();
  return readJson<VendorMap<VendorVisibilitySettings>>(VENDOR_VISIBILITY_KEY, seededVendorVisibility);
}

export function saveVendorVisibilityMap(value: VendorMap<VendorVisibilitySettings>) {
  writeJson(VENDOR_VISIBILITY_KEY, value);
}

export function getVendorAccountSettingsMap() {
  ensureVendorStorage();
  return readJson<VendorMap<VendorAccountSettings>>(VENDOR_SETTINGS_KEY, seededVendorAccountSettings);
}

export function saveVendorAccountSettingsMap(value: VendorMap<VendorAccountSettings>) {
  writeJson(VENDOR_SETTINGS_KEY, value);
}
