import type { VendorSession as SharedVendorSession } from "@/types/auth";

export type VendorSession = SharedVendorSession;

export type VendorLoginPayload = {
  email: string;
  password: string;
};

export type VendorSignupPayload = {
  fullName: string;
  businessName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type VendorStatus = "draft" | "pending" | "approved" | "rejected" | "blocked";

export type VendorCategory =
  | "Photography"
  | "Videography"
  | "Catering"
  | "Decoration"
  | "Makeup"
  | "Music"
  | "Transport"
  | "Cake"
  | "Venue"
  | "Planning"
  | "Other";

export type VendorProfileRecord = {
  vendorId: string;
  businessName: string;
  category: VendorCategory;
  tagline: string;
  description: string;
  location: string;
  coverageArea: string;
  experienceYears: number;
  priceRange: string;
};

export type VendorGalleryAsset = {
  id: string;
  vendorId: string;
  imageUrl: string;
  altText: string;
  isFeatured: boolean;
  sortOrder: number;
  uploadedAt: string;
};

export type VendorServicePackage = {
  id: string;
  packageName: string;
  description: string;
  priceNote: string;
  inclusions: string[];
  isActive: boolean;
  sortOrder: number;
};

export type VendorServiceRecord = {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  packages: VendorServicePackage[];
};

export type VendorContactInfoRecord = {
  vendorId: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  mapLink: string;
};

export type VendorVisibilitySettings = {
  vendorId: string;
  status: VendorStatus;
  isPublic: boolean;
  canBePublic: boolean;
  featuredByAdmin: boolean;
  adminMessage: string;
  rejectedReason?: string;
  lastSubmittedAt?: string;
  approvedAt?: string;
};

export type VendorOverviewData = {
  completionPercent: number;
  status: VendorStatus;
  isPublic: boolean;
  canBePublic: boolean;
  serviceCount: number;
  packageCount: number;
  galleryCount: number;
  missingSteps: string[];
  adminMessage: string;
  businessName: string;
};

export type VendorAccountSettings = {
  fullName: string;
  email: string;
  businessName: string;
};

export type VendorProfileCompletion = {
  completionPercent: number;
  missingSteps: string[];
  isPublishReady: boolean;
};
