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
import { isSupabaseConfigured } from "@/lib/supabase/env";

function wait(ms = 320) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildVendorId() {
  return `vendor-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export const vendorAuthService = {
  async login(payload: VendorLoginPayload): Promise<VendorSession> {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
        session?: VendorSession;
      };

      if (!response.ok || !body.session) {
        throw new Error(body.message || "Invalid vendor credentials.");
      }

      if (body.session.role !== "vendor") {
        throw new Error("This account is not a vendor account.");
      }

      saveVendorSession(body.session);
      return body.session;
    }

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
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "vendor",
          fullName: payload.fullName,
          businessName: payload.businessName,
          email: payload.email,
          password: payload.password,
        }),
      });

      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
        session?: VendorSession;
      };

      if (!response.ok || !body.session) {
        throw new Error(body.message || "Something went wrong while creating your vendor account.");
      }

      if (body.session.role !== "vendor") {
        throw new Error("This account is not a vendor account.");
      }

      saveVendorSession(body.session);
      return body.session;
    }

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
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/auth/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      const body = (await response.json()) as { session: VendorSession | null };
      const session = body.session?.role === "vendor" ? body.session : null;
      saveVendorSession(session);
      return session;
    }

    await wait(80);
    return getVendorSession();
  },

  async logout() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message || "Unable to sign out.");
      }

      saveVendorSession(null);
      return;
    }

    await wait(120);
    saveVendorSession(null);
  },
};
