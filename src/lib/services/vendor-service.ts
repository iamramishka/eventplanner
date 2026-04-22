"use client";

import { getVendorCompletion } from "@/lib/vendor-utils";
import {
  getVendorAccountSettingsMap,
  getVendorAccounts,
  getVendorContacts,
  getVendorGalleryMap,
  getVendorProfiles,
  getVendorServicesMap,
  getVendorSession,
  getVendorVisibilityMap,
  saveVendorAccountSettingsMap,
  saveVendorAccounts,
  saveVendorContacts,
  saveVendorGalleryMap,
  saveVendorProfiles,
  saveVendorServicesMap,
  saveVendorSession,
  saveVendorVisibilityMap,
} from "@/lib/services/vendor-browser-store";
import {
  VendorAccountSettings,
  VendorContactInfoRecord,
  VendorGalleryAsset,
  VendorOverviewData,
  VendorProfileRecord,
  VendorServicePackage,
  VendorServiceRecord,
} from "@/types/vendor";

function wait(ms = 220) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nowIso() {
  return new Date().toISOString();
}

function buildId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function getCurrentVendorId() {
  const session = getVendorSession();

  if (!session) {
    throw new Error("No active vendor session.");
  }

  return session.vendorId;
}

function getWorkspace() {
  const vendorId = getCurrentVendorId();

  return {
    vendorId,
    profile: getVendorProfiles()[vendorId],
    gallery: getVendorGalleryMap()[vendorId] ?? [],
    services: getVendorServicesMap()[vendorId] ?? [],
    contact: getVendorContacts()[vendorId],
    visibility: getVendorVisibilityMap()[vendorId],
    account: getVendorAccountSettingsMap()[vendorId],
  };
}

function validateUrl(value: string, label: string) {
  if (!value.trim()) {
    return;
  }

  try {
    new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }
}

export const vendorService = {
  async getOverview(): Promise<VendorOverviewData> {
    await wait();
    const { profile, gallery, services, contact, visibility } = getWorkspace();
    const completion = getVendorCompletion(profile, gallery.length, services, contact);

    return {
      completionPercent: completion.completionPercent,
      status: visibility.status,
      isPublic: visibility.isPublic,
      canBePublic: visibility.canBePublic,
      serviceCount: services.length,
      packageCount: services.reduce((total, item) => total + item.packages.length, 0),
      galleryCount: gallery.length,
      missingSteps: completion.missingSteps,
      adminMessage: visibility.adminMessage,
      businessName: profile.businessName,
    };
  },

  async getProfile() {
    await wait();
    return getWorkspace().profile;
  },

  async updateProfile(payload: VendorProfileRecord) {
    await wait();

    if (!payload.businessName.trim()) {
      throw new Error("Business name is required.");
    }

    if (!payload.category) {
      throw new Error("Vendor category is required.");
    }

    if (payload.description.trim().length < 40) {
      throw new Error("Description should be at least 40 characters.");
    }

    if (payload.experienceYears < 0) {
      throw new Error("Experience years cannot be negative.");
    }

    const vendorId = getCurrentVendorId();
    const profileMap = getVendorProfiles();
    profileMap[vendorId] = {
      ...payload,
      vendorId,
      businessName: payload.businessName.trim(),
      tagline: payload.tagline.trim(),
      description: payload.description.trim(),
      location: payload.location.trim(),
      coverageArea: payload.coverageArea.trim(),
      priceRange: payload.priceRange.trim(),
    };
    saveVendorProfiles(profileMap);

    const accountMap = getVendorAccountSettingsMap();
    accountMap[vendorId] = {
      ...accountMap[vendorId],
      businessName: profileMap[vendorId].businessName,
    };
    saveVendorAccountSettingsMap(accountMap);

    const accounts = getVendorAccounts().map((item) =>
      item.vendorId === vendorId
        ? { ...item, businessName: profileMap[vendorId].businessName }
        : item,
    );
    saveVendorAccounts(accounts);

    const session = getVendorSession();
    if (session && session.vendorId === vendorId) {
      saveVendorSession({ ...session, businessName: profileMap[vendorId].businessName });
    }

    return profileMap[vendorId];
  },

  async getGallery() {
    await wait();
    return [...getWorkspace().gallery].sort((left, right) => left.sortOrder - right.sortOrder);
  },

  async addGalleryAsset(payload: { imageUrl: string; altText: string }) {
    await wait();
    const vendorId = getCurrentVendorId();
    const galleryMap = getVendorGalleryMap();
    const current = galleryMap[vendorId] ?? [];

    if (!payload.imageUrl.trim()) {
      throw new Error("Image upload is required.");
    }

    const nextAsset: VendorGalleryAsset = {
      id: buildId("vendor-gallery"),
      vendorId,
      imageUrl: payload.imageUrl,
      altText: payload.altText.trim() || "Vendor portfolio image",
      isFeatured: current.length === 0,
      sortOrder: current.length,
      uploadedAt: nowIso(),
    };

    galleryMap[vendorId] = [...current, nextAsset];
    saveVendorGalleryMap(galleryMap);
    return galleryMap[vendorId];
  },

  async removeGalleryAsset(assetId: string) {
    await wait();
    const vendorId = getCurrentVendorId();
    const galleryMap = getVendorGalleryMap();
    const remaining = (galleryMap[vendorId] ?? [])
      .filter((item) => item.id !== assetId)
      .map((item, index) => ({
        ...item,
        sortOrder: index,
        isFeatured: index === 0 ? true : item.isFeatured,
      }));

    if (remaining.length > 0 && !remaining.some((item) => item.isFeatured)) {
      remaining[0] = { ...remaining[0], isFeatured: true };
    }

    galleryMap[vendorId] = remaining;
    saveVendorGalleryMap(galleryMap);
    return galleryMap[vendorId];
  },

  async setFeaturedGalleryAsset(assetId: string) {
    await wait();
    const vendorId = getCurrentVendorId();
    const galleryMap = getVendorGalleryMap();
    galleryMap[vendorId] = (galleryMap[vendorId] ?? []).map((item) => ({
      ...item,
      isFeatured: item.id === assetId,
    }));
    saveVendorGalleryMap(galleryMap);
    return galleryMap[vendorId];
  },

  async moveGalleryAsset(assetId: string, direction: "up" | "down") {
    await wait();
    const vendorId = getCurrentVendorId();
    const items = [...(getVendorGalleryMap()[vendorId] ?? [])].sort(
      (left, right) => left.sortOrder - right.sortOrder,
    );
    const index = items.findIndex((item) => item.id === assetId);

    if (index === -1) {
      return items;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) {
      return items;
    }

    const [selected] = items.splice(index, 1);
    items.splice(targetIndex, 0, selected);

    const next = items.map((item, itemIndex) => ({ ...item, sortOrder: itemIndex }));
    const galleryMap = getVendorGalleryMap();
    galleryMap[vendorId] = next;
    saveVendorGalleryMap(galleryMap);
    return next;
  },

  async getServices() {
    await wait();
    return [...getWorkspace().services].sort((left, right) => left.sortOrder - right.sortOrder);
  },

  async upsertService(
    payload: Omit<VendorServiceRecord, "id" | "vendorId" | "sortOrder" | "packages"> & {
      id?: string;
      packages?: VendorServicePackage[];
    },
  ) {
    await wait();

    if (!payload.title.trim()) {
      throw new Error("Service title is required.");
    }

    const vendorId = getCurrentVendorId();
    const serviceMap = getVendorServicesMap();
    const services = serviceMap[vendorId] ?? [];

    const nextRecord: VendorServiceRecord = payload.id
      ? {
          ...(services.find((item) => item.id === payload.id) as VendorServiceRecord),
          ...payload,
          vendorId,
        }
      : {
          id: buildId("vendor-service"),
          vendorId,
          title: payload.title.trim(),
          description: payload.description.trim(),
          isActive: payload.isActive,
          sortOrder: services.length,
          packages: payload.packages ?? [],
        };

    serviceMap[vendorId] = payload.id
      ? services.map((item) => (item.id === payload.id ? nextRecord : item))
      : [...services, nextRecord];
    saveVendorServicesMap(serviceMap);
    return serviceMap[vendorId];
  },

  async deleteService(serviceId: string) {
    await wait();
    const vendorId = getCurrentVendorId();
    const serviceMap = getVendorServicesMap();
    serviceMap[vendorId] = (serviceMap[vendorId] ?? [])
      .filter((item) => item.id !== serviceId)
      .map((item, index) => ({ ...item, sortOrder: index }));
    saveVendorServicesMap(serviceMap);
    return serviceMap[vendorId];
  },

  async upsertPackage(
    serviceId: string,
    payload: Omit<VendorServicePackage, "id" | "sortOrder"> & {
      id?: string;
    },
  ) {
    await wait();

    if (!payload.packageName.trim()) {
      throw new Error("Package name is required.");
    }

    const vendorId = getCurrentVendorId();
    const serviceMap = getVendorServicesMap();
    const services = serviceMap[vendorId] ?? [];

    serviceMap[vendorId] = services.map((service) => {
      if (service.id !== serviceId) {
        return service;
      }

      const packages = [...service.packages];
      const nextPackage: VendorServicePackage = payload.id
        ? {
            ...(packages.find((item) => item.id === payload.id) as VendorServicePackage),
            ...payload,
          }
        : {
            ...payload,
            id: buildId("vendor-package"),
            sortOrder: packages.length,
          };

      return {
        ...service,
        packages: payload.id
          ? packages.map((item) => (item.id === payload.id ? nextPackage : item))
          : [...packages, nextPackage],
      };
    });

    saveVendorServicesMap(serviceMap);
    return serviceMap[vendorId];
  },

  async deletePackage(serviceId: string, packageId: string) {
    await wait();
    const vendorId = getCurrentVendorId();
    const serviceMap = getVendorServicesMap();
    serviceMap[vendorId] = (serviceMap[vendorId] ?? []).map((service) =>
      service.id === serviceId
        ? {
            ...service,
            packages: service.packages
              .filter((item) => item.id !== packageId)
              .map((item, index) => ({ ...item, sortOrder: index })),
          }
        : service,
    );
    saveVendorServicesMap(serviceMap);
    return serviceMap[vendorId];
  },

  async getContactInfo() {
    await wait();
    return getWorkspace().contact;
  },

  async updateContactInfo(payload: VendorContactInfoRecord) {
    await wait();

    validateUrl(payload.website, "Website");
    validateUrl(payload.instagram, "Instagram");
    validateUrl(payload.facebook, "Facebook");
    validateUrl(payload.mapLink, "Map link");

    const vendorId = getCurrentVendorId();
    const map = getVendorContacts();
    map[vendorId] = {
      ...payload,
      vendorId,
      phone: payload.phone.trim(),
      whatsapp: payload.whatsapp.trim(),
      email: payload.email.trim().toLowerCase(),
      website: payload.website.trim(),
      instagram: payload.instagram.trim(),
      facebook: payload.facebook.trim(),
      mapLink: payload.mapLink.trim(),
    };
    saveVendorContacts(map);
    return map[vendorId];
  },

  async getVisibility() {
    await wait();
    const { profile, gallery, services, contact, visibility } = getWorkspace();
    const completion = getVendorCompletion(profile, gallery.length, services, contact);

    return {
      ...visibility,
      canBePublic: visibility.status === "approved" && completion.isPublishReady,
      completionPercent: completion.completionPercent,
      missingSteps: completion.missingSteps,
    };
  },

  async toggleVisibility(nextState: boolean) {
    await wait();
    const vendorId = getCurrentVendorId();
    const { profile, gallery, services, contact } = getWorkspace();
    const completion = getVendorCompletion(profile, gallery.length, services, contact);
    const visibilityMap = getVendorVisibilityMap();
    const current = visibilityMap[vendorId];

    if (nextState && current.status !== "approved") {
      throw new Error("Your profile must be approved before it can go public.");
    }

    if (nextState && !completion.isPublishReady) {
      throw new Error("Finish the required profile sections before going public.");
    }

    visibilityMap[vendorId] = {
      ...current,
      isPublic: nextState,
      canBePublic: current.status === "approved" && completion.isPublishReady,
      adminMessage: nextState
        ? "Your profile is approved and currently visible to couples."
        : "Your profile is hidden from public discovery until you turn visibility back on.",
    };
    saveVendorVisibilityMap(visibilityMap);
    return visibilityMap[vendorId];
  },

  async submitForReview() {
    await wait(320);
    const vendorId = getCurrentVendorId();
    const { profile, gallery, services, contact } = getWorkspace();
    const completion = getVendorCompletion(profile, gallery.length, services, contact);

    if (!completion.isPublishReady) {
      throw new Error("Complete the required profile sections before submitting.");
    }

    const visibilityMap = getVendorVisibilityMap();
    visibilityMap[vendorId] = {
      ...visibilityMap[vendorId],
      status: "pending",
      isPublic: false,
      canBePublic: false,
      lastSubmittedAt: nowIso(),
      adminMessage: "Your profile has been submitted and is waiting for admin review.",
      rejectedReason: undefined,
    };
    saveVendorVisibilityMap(visibilityMap);
    return visibilityMap[vendorId];
  },

  async getAccountSettings() {
    await wait();
    return getWorkspace().account;
  },

  async updateAccountSettings(payload: VendorAccountSettings) {
    await wait();

    if (!payload.fullName.trim()) {
      throw new Error("Full name is required.");
    }

    if (!payload.email.trim() || !payload.email.includes("@")) {
      throw new Error("A valid email address is required.");
    }

    const vendorId = getCurrentVendorId();
    const settingsMap = getVendorAccountSettingsMap();
    settingsMap[vendorId] = {
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      businessName: payload.businessName.trim(),
    };
    saveVendorAccountSettingsMap(settingsMap);

    const accounts = getVendorAccounts().map((item) =>
      item.vendorId === vendorId
        ? {
            ...item,
            fullName: settingsMap[vendorId].fullName,
            email: settingsMap[vendorId].email,
            businessName: settingsMap[vendorId].businessName || item.businessName,
          }
        : item,
    );
    saveVendorAccounts(accounts);

    const session = getVendorSession();
    if (session && session.vendorId === vendorId) {
      saveVendorSession({
        ...session,
        fullName: settingsMap[vendorId].fullName,
        email: settingsMap[vendorId].email,
        businessName: settingsMap[vendorId].businessName || session.businessName,
      });
    }

    return settingsMap[vendorId];
  },

  async changePassword(payload: {
    currentPassword: string;
    nextPassword: string;
    confirmPassword: string;
  }) {
    await wait(260);

    if (payload.nextPassword.length < 8) {
      throw new Error("New password must be at least 8 characters.");
    }

    if (payload.nextPassword !== payload.confirmPassword) {
      throw new Error("New passwords do not match.");
    }

    const vendorId = getCurrentVendorId();
    const accounts = getVendorAccounts();
    const account = accounts.find((item) => item.vendorId === vendorId);

    if (!account || account.password !== payload.currentPassword) {
      throw new Error("Current password is incorrect.");
    }

    saveVendorAccounts(
      accounts.map((item) =>
        item.vendorId === vendorId ? { ...item, password: payload.nextPassword } : item,
      ),
    );
  },
};
