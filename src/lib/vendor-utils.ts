import {
  VendorContactInfoRecord,
  VendorProfileCompletion,
  VendorProfileRecord,
  VendorServiceRecord,
  VendorStatus,
} from "@/types/vendor";

export function getVendorStatusTone(status: VendorStatus) {
  switch (status) {
    case "approved":
      return "success";
    case "blocked":
    case "rejected":
      return "danger";
    case "pending":
      return "warning";
    default:
      return "default";
  }
}

export function getVendorCompletion(
  profile: VendorProfileRecord,
  galleryCount: number,
  services: VendorServiceRecord[],
  contact: VendorContactInfoRecord,
): VendorProfileCompletion {
  const checks = [
    {
      ok: Boolean(profile.businessName.trim() && profile.category),
      label: "Complete business basics",
    },
    {
      ok: profile.description.trim().length >= 40,
      label: "Add a fuller business description",
    },
    {
      ok: Boolean(profile.location.trim() && profile.coverageArea.trim()),
      label: "Add your location and coverage area",
    },
    {
      ok: profile.experienceYears >= 0 && Boolean(profile.priceRange.trim()),
      label: "Add experience and price range",
    },
    {
      ok: services.length > 0,
      label: "Add at least one service",
    },
    {
      ok: services.some((service) => service.packages.length > 0),
      label: "Add at least one package",
    },
    {
      ok: galleryCount > 0,
      label: "Upload portfolio images",
    },
    {
      ok: Boolean(
        contact.phone.trim() ||
          contact.whatsapp.trim() ||
          contact.email.trim() ||
          contact.website.trim(),
      ),
      label: "Add a public contact method",
    },
  ];

  const completed = checks.filter((item) => item.ok).length;
  const completionPercent = Math.round((completed / checks.length) * 100);

  return {
    completionPercent,
    missingSteps: checks.filter((item) => !item.ok).map((item) => item.label),
    isPublishReady: checks.every((item) => item.ok),
  };
}

export function formatVendorCompletionLabel(value: number) {
  return `${value}% complete`;
}
