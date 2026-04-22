"use client";

import {
  getVendorAccountSettingsMap,
  getVendorAccounts,
  getVendorContacts,
  getVendorGalleryMap,
  getVendorProfiles,
  getVendorSession,
  getVendorServicesMap,
  getVendorVisibilityMap,
  saveVendorAccountSettingsMap,
  saveVendorSession,
  saveVendorAccounts,
  saveVendorContacts,
  saveVendorGalleryMap,
  saveVendorProfiles,
  saveVendorServicesMap,
  saveVendorVisibilityMap,
} from "@/lib/services/vendor-browser-store";
import {
  VendorContactInfoRecord,
  VendorLoginPayload,
  VendorProfileRecord,
  VendorSession,
  VendorSignupPayload,
  VendorVisibilitySettings,
} from "@/types/vendor";
import { VendorAccount } from "@/types/auth";
import { getAuthAccounts, normalizeAuthEmail } from "@/lib/services/shared-auth-store";

function wait(ms = 320) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildVendorId() {
  return `vendor-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export const vendorAuthService = {
  async login(payload: VendorLoginPayload): Promise<VendorSession> {
    await wait();

    const email = normalizeAuthEmail(payload.email);
    const password = payload.password.trim();
    const account = getVendorAccounts().find(
      (item) => normalizeAuthEmail(item.email) === email && item.password === password,
    );

    if (!account) {
      throw new Error("Invalid vendor credentials.");
    }

    const session: VendorSession = {
      id: account.id,
      vendorId: account.vendorId,
      fullName: account.fullName,
      email: account.email,
      role: "vendor",
      businessName: account.businessName,
    };

    saveVendorSession(session);
    return session;
  },

  async register(payload: VendorSignupPayload): Promise<VendorSession> {
    await wait(360);

    const fullName = payload.fullName.trim();
    const businessName = payload.businessName.trim();
    const email = normalizeAuthEmail(payload.email);
    const password = payload.password.trim();

    if (!fullName) {
      throw new Error("Full name is required.");
    }

    if (!businessName) {
      throw new Error("Business name is required.");
    }

    if (!email || !email.includes("@")) {
      throw new Error("A valid email address is required.");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    if (password !== payload.confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const accounts = getVendorAccounts();
    if (getAuthAccounts().some((account) => normalizeAuthEmail(account.email) === email)) {
      throw new Error("A vendor account already exists for this email.");
    }

    const vendorId = buildVendorId();
    const session: VendorSession = {
      id: vendorId,
      vendorId,
      fullName,
      email,
      role: "vendor",
      businessName,
    };

    const profileMap = getVendorProfiles();
    const visibilityMap = getVendorVisibilityMap();
    const contactsMap = getVendorContacts();
    const galleryMap = getVendorGalleryMap();
    const servicesMap = getVendorServicesMap();
    const settingsMap = getVendorAccountSettingsMap();

    const profile: VendorProfileRecord = {
      vendorId,
      businessName,
      category: "Other",
      tagline: "",
      description: "",
      location: "",
      coverageArea: "",
      experienceYears: 0,
      priceRange: "",
    };

    const contact: VendorContactInfoRecord = {
      vendorId,
      phone: "",
      whatsapp: "",
      email,
      website: "",
      instagram: "",
      facebook: "",
      mapLink: "",
    };

    const visibility: VendorVisibilitySettings = {
      vendorId,
      status: "draft",
      isPublic: false,
      canBePublic: false,
      featuredByAdmin: false,
      adminMessage: "Complete your profile, upload work, and submit it for review when you are ready.",
    };

    const nextAccount: VendorAccount = {
      ...session,
      password,
    };

    saveVendorAccounts([nextAccount, ...accounts]);

    profileMap[vendorId] = profile;
    saveVendorProfiles(profileMap);

    contactsMap[vendorId] = contact;
    saveVendorContacts(contactsMap);

    visibilityMap[vendorId] = visibility;
    saveVendorVisibilityMap(visibilityMap);

    galleryMap[vendorId] = [];
    saveVendorGalleryMap(galleryMap);

    servicesMap[vendorId] = [];
    saveVendorServicesMap(servicesMap);

    settingsMap[vendorId] = {
      fullName,
      email,
      businessName,
    };
    saveVendorAccountSettingsMap(settingsMap);

    saveVendorSession(session);
    return session;
  },

  async getSession() {
    await wait(80);
    return getVendorSession();
  },

  async logout() {
    await wait(120);
    saveVendorSession(null);
  },
};
