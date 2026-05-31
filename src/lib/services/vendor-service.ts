"use client";

import { getVendorCompletion } from "@/lib/vendor-utils";
import { isSupabaseConfigured } from "@/lib/supabase/env";
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
  VendorVisibilitySettings,
} from "@/types/vendor";

const pendingReviewMessage =
  "Your profile has been submitted and is waiting for admin review.";
const rereviewMessage =
  "Your latest changes are pending admin review before your profile can go live again.";
const publicMessage = "Your profile is approved and currently visible to couples.";
const hiddenMessage =
  "Your profile is hidden from public discovery until you turn visibility back on.";

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

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

function syncVendorSession(updates: Partial<NonNullable<ReturnType<typeof getVendorSession>>>) {
  const session = getVendorSession();

  if (!session) {
    return;
  }

  saveVendorSession({
    ...session,
    ...updates,
  });
}

function getLocalCompletionState(vendorId: string) {
  const profile = getVendorProfiles()[vendorId];
  const gallery = getVendorGalleryMap()[vendorId] ?? [];
  const services = getVendorServicesMap()[vendorId] ?? [];
  const contact = getVendorContacts()[vendorId];
  return getVendorCompletion(profile, gallery.length, services, contact);
}

function updateLocalVisibilityForVendor(
  vendorId: string,
  options?: { triggerRereview?: boolean },
) {
  const visibilityMap = getVendorVisibilityMap();
  const current = visibilityMap[vendorId];

  if (!current) {
    return;
  }

  if (options?.triggerRereview && current.status === "approved") {
    visibilityMap[vendorId] = {
      ...current,
      status: "pending",
      isPublic: false,
      canBePublic: false,
      rejectedReason: undefined,
      lastSubmittedAt: nowIso(),
      adminMessage: rereviewMessage,
    };
    saveVendorVisibilityMap(visibilityMap);
    return;
  }

  const completion = getLocalCompletionState(vendorId);
  visibilityMap[vendorId] = {
    ...current,
    canBePublic: current.status === "approved" && completion.isPublishReady,
  };
  saveVendorVisibilityMap(visibilityMap);
}

function getLocalVisibilityView(vendorId: string) {
  const visibility = getVendorVisibilityMap()[vendorId];
  const completion = getLocalCompletionState(vendorId);

  return {
    ...visibility,
    canBePublic: visibility.status === "approved" && completion.isPublishReady,
    completionPercent: completion.completionPercent,
    missingSteps: completion.missingSteps,
  };
}

function replaceVendorAccountRecord(
  vendorId: string,
  updates: Partial<ReturnType<typeof getVendorAccounts>[number]>,
) {
  saveVendorAccounts(
    getVendorAccounts().map((item) =>
      item.vendorId === vendorId
        ? {
            ...item,
            ...updates,
          }
        : item,
    ),
  );
}

export const vendorService = {
  async getOverview(): Promise<VendorOverviewData> {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/vendor/overview", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ overview: VendorOverviewData }>(response);
      return data.overview;
    }

    await wait();
    const { vendorId, profile, gallery, services, contact } = getWorkspace();
    const completion = getVendorCompletion(profile, gallery.length, services, contact);
    const visibility = getLocalVisibilityView(vendorId);

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
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/vendor/profile", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ profile: VendorProfileRecord }>(response);
      return data.profile;
    }

    await wait();
    return getWorkspace().profile;
  },

  async updateProfile(payload: VendorProfileRecord) {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/vendor/profile", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await parseJson<{ profile: VendorProfileRecord }>(response);
      syncVendorSession({ businessName: data.profile.businessName });
      return data.profile;
    }

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

    replaceVendorAccountRecord(vendorId, {
      businessName: profileMap[vendorId].businessName,
    });
    syncVendorSession({ businessName: profileMap[vendorId].businessName });
    updateLocalVisibilityForVendor(vendorId, { triggerRereview: true });

    return profileMap[vendorId];
  },

  async getGallery() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/vendor/gallery", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ gallery: VendorGalleryAsset[] }>(response);
      return data.gallery;
    }

    await wait();
    return [...getWorkspace().gallery].sort((left, right) => left.sortOrder - right.sortOrder);
  },

  async addGalleryAsset(payload: { imageUrl: string; altText: string }) {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/vendor/gallery", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await parseJson<{ gallery: VendorGalleryAsset[] }>(response);
      return data.gallery;
    }

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
    updateLocalVisibilityForVendor(vendorId, { triggerRereview: true });
    return galleryMap[vendorId];
  },

  async removeGalleryAsset(assetId: string) {
    if (isSupabaseConfigured()) {
      const response = await fetch(`/api/v1/vendor/gallery/${assetId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await parseJson<{ gallery: VendorGalleryAsset[] }>(response);
      return data.gallery;
    }

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
    updateLocalVisibilityForVendor(vendorId, { triggerRereview: true });
    return galleryMap[vendorId];
  },

  async setFeaturedGalleryAsset(assetId: string) {
    if (isSupabaseConfigured()) {
      const response = await fetch(`/api/v1/vendor/gallery/${assetId}/featured`, {
        method: "POST",
        credentials: "include",
      });

      const data = await parseJson<{ gallery: VendorGalleryAsset[] }>(response);
      return data.gallery;
    }

    await wait();
    const vendorId = getCurrentVendorId();
    const galleryMap = getVendorGalleryMap();
    galleryMap[vendorId] = (galleryMap[vendorId] ?? []).map((item) => ({
      ...item,
      isFeatured: item.id === assetId,
    }));
    saveVendorGalleryMap(galleryMap);
    updateLocalVisibilityForVendor(vendorId, { triggerRereview: true });
    return galleryMap[vendorId];
  },

  async moveGalleryAsset(assetId: string, direction: "up" | "down") {
    if (isSupabaseConfigured()) {
      const response = await fetch(`/api/v1/vendor/gallery/${assetId}/move`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ direction }),
      });

      const data = await parseJson<{ gallery: VendorGalleryAsset[] }>(response);
      return data.gallery;
    }

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
    updateLocalVisibilityForVendor(vendorId, { triggerRereview: true });
    return next;
  },

  async getServices() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/vendor/services", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ services: VendorServiceRecord[] }>(response);
      return data.services;
    }

    await wait();
    return [...getWorkspace().services].sort((left, right) => left.sortOrder - right.sortOrder);
  },

  async upsertService(
    payload: Omit<VendorServiceRecord, "id" | "vendorId" | "sortOrder" | "packages"> & {
      id?: string;
      packages?: VendorServicePackage[];
    },
  ) {
    if (isSupabaseConfigured()) {
      const response = await fetch(
        payload.id ? `/api/v1/vendor/services/${payload.id}` : "/api/v1/vendor/services",
        {
          method: payload.id ? "PATCH" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      await parseJson<{ service: VendorServiceRecord }>(response);
      return vendorService.getServices();
    }

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
          title: payload.title.trim(),
          description: payload.description.trim(),
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
    updateLocalVisibilityForVendor(vendorId, { triggerRereview: true });
    return serviceMap[vendorId];
  },

  async deleteService(serviceId: string) {
    if (isSupabaseConfigured()) {
      const response = await fetch(`/api/v1/vendor/services/${serviceId}`, {
        method: "DELETE",
        credentials: "include",
      });

      await parseJson<{ ok: boolean }>(response);
      return vendorService.getServices();
    }

    await wait();
    const vendorId = getCurrentVendorId();
    const serviceMap = getVendorServicesMap();
    serviceMap[vendorId] = (serviceMap[vendorId] ?? [])
      .filter((item) => item.id !== serviceId)
      .map((item, index) => ({ ...item, sortOrder: index }));
    saveVendorServicesMap(serviceMap);
    updateLocalVisibilityForVendor(vendorId, { triggerRereview: true });
    return serviceMap[vendorId];
  },

  async upsertPackage(
    serviceId: string,
    payload: Omit<VendorServicePackage, "id" | "sortOrder"> & {
      id?: string;
    },
  ) {
    if (isSupabaseConfigured()) {
      const response = await fetch(
        payload.id ? `/api/v1/vendor/packages/${payload.id}` : `/api/v1/vendor/services/${serviceId}/packages`,
        {
          method: payload.id ? "PATCH" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      await parseJson<{ package: VendorServicePackage }>(response);
      return vendorService.getServices();
    }

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
            packageName: payload.packageName.trim(),
            description: payload.description.trim(),
            priceNote: payload.priceNote.trim(),
          }
        : {
            ...payload,
            id: buildId("vendor-package"),
            packageName: payload.packageName.trim(),
            description: payload.description.trim(),
            priceNote: payload.priceNote.trim(),
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
    updateLocalVisibilityForVendor(vendorId, { triggerRereview: true });
    return serviceMap[vendorId];
  },

  async deletePackage(serviceId: string, packageId: string) {
    if (isSupabaseConfigured()) {
      const response = await fetch(`/api/v1/vendor/packages/${packageId}`, {
        method: "DELETE",
        credentials: "include",
      });

      await parseJson<{ ok: boolean }>(response);
      return vendorService.getServices();
    }

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
    updateLocalVisibilityForVendor(vendorId, { triggerRereview: true });
    return serviceMap[vendorId];
  },

  async getContactInfo() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/vendor/contact", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ contact: VendorContactInfoRecord }>(response);
      return data.contact;
    }

    await wait();
    return getWorkspace().contact;
  },

  async updateContactInfo(payload: VendorContactInfoRecord) {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/vendor/contact", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await parseJson<{ contact: VendorContactInfoRecord }>(response);
      return data.contact;
    }

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
    updateLocalVisibilityForVendor(vendorId, { triggerRereview: true });
    return map[vendorId];
  },

  async getVisibility() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/vendor/visibility", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{
        visibility: ReturnType<typeof getLocalVisibilityView>;
      }>(response);
      return data.visibility;
    }

    await wait();
    const { vendorId } = getWorkspace();
    return getLocalVisibilityView(vendorId);
  },

  async toggleVisibility(nextState: boolean) {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/vendor/visibility", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic: nextState }),
      });

      const data = await parseJson<{
        visibility: VendorVisibilitySettings;
      }>(response);
      return data.visibility;
    }

    await wait();
    const vendorId = getCurrentVendorId();
    const current = getLocalVisibilityView(vendorId);
    const visibilityMap = getVendorVisibilityMap();

    if (nextState && current.status !== "approved") {
      throw new Error("Your profile must be approved before it can go public.");
    }

    if (nextState && !current.canBePublic) {
      throw new Error("Finish the required profile sections before going public.");
    }

    visibilityMap[vendorId] = {
      ...visibilityMap[vendorId],
      isPublic: nextState,
      canBePublic: current.canBePublic,
      adminMessage: nextState ? publicMessage : hiddenMessage,
    };
    saveVendorVisibilityMap(visibilityMap);
    return visibilityMap[vendorId];
  },

  async submitForReview() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/vendor/visibility/submit", {
        method: "POST",
        credentials: "include",
      });

      const data = await parseJson<{
        visibility: VendorVisibilitySettings;
      }>(response);
      return data.visibility;
    }

    await wait(320);
    const vendorId = getCurrentVendorId();
    const current = getLocalVisibilityView(vendorId);

    if (!current.canBePublic && current.missingSteps.length) {
      throw new Error("Complete the required profile sections before submitting.");
    }

    const visibilityMap = getVendorVisibilityMap();
    visibilityMap[vendorId] = {
      ...visibilityMap[vendorId],
      status: "pending",
      isPublic: false,
      canBePublic: false,
      lastSubmittedAt: nowIso(),
      adminMessage: pendingReviewMessage,
      rejectedReason: undefined,
    };
    saveVendorVisibilityMap(visibilityMap);
    return visibilityMap[vendorId];
  },

  async getAccountSettings() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/vendor/settings", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ settings: VendorAccountSettings }>(response);
      return data.settings;
    }

    await wait();
    return getWorkspace().account;
  },

  async updateAccountSettings(payload: VendorAccountSettings) {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/vendor/settings", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await parseJson<{ settings: VendorAccountSettings }>(response);
      syncVendorSession({
        fullName: data.settings.fullName,
        email: data.settings.email,
        businessName: data.settings.businessName,
      });
      return data.settings;
    }

    await wait();

    if (!payload.fullName.trim()) {
      throw new Error("Full name is required.");
    }

    if (!payload.email.trim() || !payload.email.includes("@")) {
      throw new Error("A valid email address is required.");
    }

    if (!payload.businessName.trim()) {
      throw new Error("Business name is required.");
    }

    const vendorId = getCurrentVendorId();
    const nextSettings = {
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      businessName: payload.businessName.trim(),
    };

    const currentSettings = getVendorAccountSettingsMap()[vendorId];
    const shouldTriggerRereview =
      currentSettings.businessName !== nextSettings.businessName ||
      currentSettings.email !== nextSettings.email;

    const settingsMap = getVendorAccountSettingsMap();
    settingsMap[vendorId] = nextSettings;
    saveVendorAccountSettingsMap(settingsMap);

    const profileMap = getVendorProfiles();
    profileMap[vendorId] = {
      ...profileMap[vendorId],
      businessName: nextSettings.businessName,
    };
    saveVendorProfiles(profileMap);

    const contactsMap = getVendorContacts();
    contactsMap[vendorId] = {
      ...contactsMap[vendorId],
      email: nextSettings.email,
    };
    saveVendorContacts(contactsMap);

    replaceVendorAccountRecord(vendorId, {
      fullName: nextSettings.fullName,
      email: nextSettings.email,
      businessName: nextSettings.businessName,
    });

    syncVendorSession({
      fullName: nextSettings.fullName,
      email: nextSettings.email,
      businessName: nextSettings.businessName,
    });

    updateLocalVisibilityForVendor(vendorId, {
      triggerRereview: shouldTriggerRereview,
    });

    return nextSettings;
  },

  async changePassword(payload: {
    currentPassword: string;
    nextPassword: string;
    confirmPassword: string;
  }) {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/vendor/settings/password", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      await parseJson<{ ok: boolean }>(response);
      return;
    }

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
