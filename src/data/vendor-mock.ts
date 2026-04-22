import {
  VendorAccountSettings,
  VendorContactInfoRecord,
  VendorGalleryAsset,
  VendorProfileRecord,
  VendorServiceRecord,
  VendorSession,
  VendorVisibilitySettings,
} from "@/types/vendor";

export const vendorDemoCredentials = [
  {
    vendorId: "vendor-luna",
    email: "studio@vinyup.com",
    password: "Vendor123!",
    fullName: "Luna Wijesinghe",
    businessName: "Luna Studio",
  },
];

export const seededVendorProfiles: Record<string, VendorProfileRecord> = {
  "vendor-luna": {
    vendorId: "vendor-luna",
    businessName: "Luna Studio",
    category: "Photography",
    tagline: "Editorial wedding photography with a warm documentary eye.",
    description:
      "We photograph weddings with a balance of emotional storytelling and refined portrait direction, creating images that feel timeless and deeply personal.",
    location: "Colombo",
    coverageArea: "Islandwide coverage across Sri Lanka",
    experienceYears: 8,
    priceRange: "Mid to premium",
  },
};

export const seededVendorGallery: Record<string, VendorGalleryAsset[]> = {
  "vendor-luna": [
    {
      id: "vendor-gallery-1",
      vendorId: "vendor-luna",
      imageUrl: "/templates/classic-gold.svg",
      altText: "Ballroom couple portrait",
      isFeatured: true,
      sortOrder: 0,
      uploadedAt: "2026-03-01T09:00:00.000Z",
    },
    {
      id: "vendor-gallery-2",
      vendorId: "vendor-luna",
      imageUrl: "/templates/blush-bloom.svg",
      altText: "Garden wedding couple portrait",
      isFeatured: false,
      sortOrder: 1,
      uploadedAt: "2026-03-01T09:10:00.000Z",
    },
    {
      id: "vendor-gallery-3",
      vendorId: "vendor-luna",
      imageUrl: "/templates/sage-garden.svg",
      altText: "Outdoor ceremony setup",
      isFeatured: false,
      sortOrder: 2,
      uploadedAt: "2026-03-01T09:18:00.000Z",
    },
  ],
};

export const seededVendorServices: Record<string, VendorServiceRecord[]> = {
  "vendor-luna": [
    {
      id: "vendor-service-1",
      vendorId: "vendor-luna",
      title: "Full Wedding Day Coverage",
      description: "Complete ceremony-to-reception photography coverage.",
      isActive: true,
      sortOrder: 0,
      packages: [
        {
          id: "vendor-package-1",
          packageName: "Signature Day Story",
          description: "Full-day photography with curated highlights and edited gallery delivery.",
          priceNote: "Starting from LKR 220,000",
          inclusions: ["8 hours coverage", "Two photographers", "Online gallery"],
          isActive: true,
          sortOrder: 0,
        },
        {
          id: "vendor-package-2",
          packageName: "Intimate Ceremony",
          description: "A lighter package for smaller celebrations and ROM events.",
          priceNote: "Starting from LKR 95,000",
          inclusions: ["4 hours coverage", "One photographer", "Preview images within 72 hours"],
          isActive: true,
          sortOrder: 1,
        },
      ],
    },
    {
      id: "vendor-service-2",
      vendorId: "vendor-luna",
      title: "Pre-Wedding Sessions",
      description: "Editorial engagement and announcement shoots tailored to your story.",
      isActive: true,
      sortOrder: 1,
      packages: [
        {
          id: "vendor-package-3",
          packageName: "Golden Hour Session",
          description: "Outdoor engagement portraits with styling guidance.",
          priceNote: "Custom quote available",
          inclusions: ["90-minute session", "Location guidance", "Retouched highlights"],
          isActive: true,
          sortOrder: 0,
        },
      ],
    },
  ],
};

export const seededVendorContacts: Record<string, VendorContactInfoRecord> = {
  "vendor-luna": {
    vendorId: "vendor-luna",
    phone: "+94 11 555 1122",
    whatsapp: "+94 77 456 7788",
    email: "studio@vinyup.com",
    website: "https://lunastudio.example.com",
    instagram: "https://instagram.com/lunastudio",
    facebook: "https://facebook.com/lunastudio",
    mapLink: "https://maps.google.com/?q=Colombo",
  },
};

export const seededVendorVisibility: Record<string, VendorVisibilitySettings> = {
  "vendor-luna": {
    vendorId: "vendor-luna",
    status: "approved",
    isPublic: true,
    canBePublic: true,
    featuredByAdmin: false,
    adminMessage: "Your profile is approved and currently visible to couples.",
    approvedAt: "2026-03-03T08:30:00.000Z",
    lastSubmittedAt: "2026-03-02T12:00:00.000Z",
  },
};

export const seededVendorAccounts: Array<
  VendorSession & {
    password: string;
  }
> = vendorDemoCredentials.map((item) => ({
  id: item.vendorId,
  vendorId: item.vendorId,
  fullName: item.fullName,
  email: item.email,
  role: "vendor",
  businessName: item.businessName,
  password: item.password,
}));

export const seededVendorAccountSettings: Record<string, VendorAccountSettings> = {
  "vendor-luna": {
    fullName: "Luna Wijesinghe",
    email: "studio@vinyup.com",
    businessName: "Luna Studio",
  },
};
