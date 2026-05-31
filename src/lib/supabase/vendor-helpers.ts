import { randomUUID } from "crypto";
import { Buffer } from "buffer";
import { getVendorCompletion } from "@/lib/vendor-utils";
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

const VENDOR_PORTFOLIO_BUCKET = "vendor-portfolio";
const PENDING_REVIEW_MESSAGE =
  "Your profile has been submitted and is waiting for admin review.";
const REREVIEW_MESSAGE =
  "Your latest changes are pending admin review before your profile can go live again.";

type QueryLike = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any;
  storage?: {
    from: (bucket: string) => {
      upload: (
        path: string,
        body: Buffer,
        options?: { contentType?: string; upsert?: boolean },
      ) => Promise<{ error: { message: string } | null }>;
      remove: (paths: string[]) => Promise<{ error: { message: string } | null }>;
      createSignedUrl: (
        path: string,
        expiresIn: number,
      ) => Promise<{ data: { signedUrl: string } | null; error: { message: string } | null }>;
    };
  };
};

function asQueryClient(value: unknown) {
  return value as QueryLike;
}

export function getVendorPortfolioBucketName() {
  return VENDOR_PORTFOLIO_BUCKET;
}

export function validateVendorUrl(value: string, label: string) {
  if (!value.trim()) {
    return;
  }

  try {
    new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }
}

export function mapVendorProfileRow(row: Record<string, unknown>): VendorProfileRecord {
  return {
    vendorId: String(row.user_id),
    businessName: String(row.business_name ?? ""),
    category: String(row.category ?? "Other") as VendorProfileRecord["category"],
    tagline: String(row.tagline ?? ""),
    description: String(row.description ?? ""),
    location: String(row.location ?? ""),
    coverageArea: String(row.coverage_area ?? ""),
    experienceYears: Number(row.experience_years ?? 0),
    priceRange: String(row.price_range ?? ""),
  };
}

export function mapVendorContactRow(row: Record<string, unknown>): VendorContactInfoRecord {
  return {
    vendorId: String(row.user_id),
    phone: String(row.phone ?? ""),
    whatsapp: String(row.whatsapp ?? ""),
    email: String(row.email ?? ""),
    website: String(row.website ?? ""),
    instagram: String(row.instagram ?? ""),
    facebook: String(row.facebook ?? ""),
    mapLink: String(row.map_link ?? ""),
  };
}

export function mapVendorVisibilityRow(
  row: Record<string, unknown>,
  canBePublicOverride?: boolean,
): VendorVisibilitySettings {
  return {
    vendorId: String(row.user_id),
    status: String(row.status ?? "draft") as VendorVisibilitySettings["status"],
    isPublic: Boolean(row.is_public),
    canBePublic:
      typeof canBePublicOverride === "boolean"
        ? canBePublicOverride
        : Boolean(row.can_be_public),
    featuredByAdmin: Boolean(row.featured_by_admin),
    adminMessage: String(
      row.admin_message ??
        "Complete your profile, upload work, and submit it for review when you are ready.",
    ),
    rejectedReason:
      typeof row.rejected_reason === "string" && row.rejected_reason
        ? row.rejected_reason
        : undefined,
    lastSubmittedAt:
      typeof row.last_submitted_at === "string" ? row.last_submitted_at : undefined,
    approvedAt: typeof row.approved_at === "string" ? row.approved_at : undefined,
  };
}

export function mapVendorGalleryRow(row: Record<string, unknown>): VendorGalleryAsset {
  return {
    id: String(row.id),
    vendorId: String(row.vendor_id),
    imageUrl: String(row.image_url ?? row.image_path ?? ""),
    altText: String(row.alt_text ?? "Vendor portfolio image"),
    isFeatured: Boolean(row.is_featured),
    sortOrder: Number(row.sort_order ?? 0),
    uploadedAt: String(row.uploaded_at ?? new Date().toISOString()),
  };
}

export function mapVendorPackageRow(row: Record<string, unknown>): VendorServicePackage {
  return {
    id: String(row.id),
    packageName: String(row.package_name ?? ""),
    description: String(row.description ?? ""),
    priceNote: String(row.price_note ?? ""),
    inclusions: Array.isArray(row.inclusions)
      ? row.inclusions.map((item) => String(item))
      : [],
    isActive: Boolean(row.is_active ?? true),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export function mapVendorServiceRow(
  row: Record<string, unknown>,
  packages: VendorServicePackage[],
): VendorServiceRecord {
  return {
    id: String(row.id),
    vendorId: String(row.vendor_id),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    isActive: Boolean(row.is_active ?? true),
    sortOrder: Number(row.sort_order ?? 0),
    packages,
  };
}

export function mapVendorAccountSettings(
  fullName: string,
  email: string,
  businessName: string,
): VendorAccountSettings {
  return {
    fullName,
    email,
    businessName,
  };
}

export async function getSignedVendorPortfolioUrl(storageClient: unknown, path: string) {
  if (
    !path ||
    path.startsWith("data:") ||
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("/")
  ) {
    return path;
  }

  const client = asQueryClient(storageClient);
  const bucket = client.storage?.from(VENDOR_PORTFOLIO_BUCKET);
  if (!bucket) {
    return path;
  }

  const { data, error } = await bucket.createSignedUrl(path, 60 * 60);
  if (error || !data?.signedUrl) {
    return path;
  }

  return data.signedUrl;
}

export async function signVendorGalleryRows(
  storageClient: unknown,
  rows: Array<Record<string, unknown>>,
) {
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      image_url: await getSignedVendorPortfolioUrl(
        storageClient,
        String(row.image_path ?? ""),
      ),
    })),
  );
}

export async function loadVendorGallery(
  supabase: unknown,
  storageClient: unknown,
  vendorId: string,
) {
  const queryClient = asQueryClient(supabase);
  const { data, error } = await queryClient
    .from("vendor_gallery_assets")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Unable to load vendor gallery: ${error.message}`);
  }

  const signedRows = await signVendorGalleryRows(
    storageClient,
    (data ?? []) as Array<Record<string, unknown>>,
  );
  return signedRows.map((row) => mapVendorGalleryRow(row));
}

export async function loadVendorServices(
  supabase: unknown,
  vendorId: string,
): Promise<VendorServiceRecord[]> {
  const queryClient = asQueryClient(supabase);
  const { data: services, error: servicesError } = await queryClient
    .from("vendor_services")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("sort_order", { ascending: true });

  if (servicesError) {
    throw new Error(`Unable to load vendor services: ${servicesError.message}`);
  }

  const serviceRows = (services ?? []) as Array<Record<string, unknown>>;
  const serviceIds = serviceRows.map((row) => String(row.id));

  if (!serviceIds.length) {
    return [];
  }

  const { data: packages, error: packagesError } = await queryClient
    .from("vendor_service_packages")
    .select("*")
    .in("service_id", serviceIds)
    .order("sort_order", { ascending: true });

  if (packagesError) {
    throw new Error(`Unable to load vendor packages: ${packagesError.message}`);
  }

  const packageRows = (packages ?? []) as Array<Record<string, unknown>>;

  return serviceRows.map((row) =>
    mapVendorServiceRow(
      row,
      packageRows
        .filter((item) => String(item.service_id) === String(row.id))
        .map((item) => mapVendorPackageRow(item)),
    ),
  );
}

export async function getVendorOverviewData(
  supabase: unknown,
  storageClient: unknown,
  vendorRow: Record<string, unknown>,
): Promise<VendorOverviewData> {
  const profile = mapVendorProfileRow(vendorRow);
  const contact = mapVendorContactRow(vendorRow);
  const gallery = await loadVendorGallery(supabase, storageClient, String(vendorRow.user_id));
  const services = await loadVendorServices(supabase, String(vendorRow.user_id));
  const completion = getVendorCompletion(profile, gallery.length, services, contact);

  return {
    completionPercent: completion.completionPercent,
    status: String(vendorRow.status ?? "draft") as VendorOverviewData["status"],
    isPublic: Boolean(vendorRow.is_public),
    canBePublic:
      String(vendorRow.status ?? "draft") === "approved" && completion.isPublishReady,
    serviceCount: services.length,
    packageCount: services.reduce((total, item) => total + item.packages.length, 0),
    galleryCount: gallery.length,
    missingSteps: completion.missingSteps,
    adminMessage: String(
      vendorRow.admin_message ??
        "Complete your profile, upload work, and submit it for review when you are ready.",
    ),
    businessName: profile.businessName,
  };
}

export async function getVendorVisibilityData(
  supabase: unknown,
  storageClient: unknown,
  vendorRow: Record<string, unknown>,
) {
  const profile = mapVendorProfileRow(vendorRow);
  const contact = mapVendorContactRow(vendorRow);
  const gallery = await loadVendorGallery(supabase, storageClient, String(vendorRow.user_id));
  const services = await loadVendorServices(supabase, String(vendorRow.user_id));
  const completion = getVendorCompletion(profile, gallery.length, services, contact);

  return {
    ...mapVendorVisibilityRow(
      vendorRow,
      String(vendorRow.status ?? "draft") === "approved" && completion.isPublishReady,
    ),
    completionPercent: completion.completionPercent,
    missingSteps: completion.missingSteps,
  };
}

export function buildPendingReviewState(now = new Date().toISOString()) {
  return {
    status: "pending",
    is_public: false,
    can_be_public: false,
    rejected_reason: null,
    last_submitted_at: now,
    admin_message: PENDING_REVIEW_MESSAGE,
  };
}

export function buildRereviewState(now = new Date().toISOString()) {
  return {
    status: "pending",
    is_public: false,
    can_be_public: false,
    rejected_reason: null,
    last_submitted_at: now,
    admin_message: REREVIEW_MESSAGE,
  };
}

export async function applyVendorPostEditState(
  supabase: unknown,
  vendorRow: Record<string, unknown>,
  options?: { triggerRereview?: boolean },
) {
  const queryClient = asQueryClient(supabase);
  const vendorId = String(vendorRow.user_id);
  const now = new Date().toISOString();

  if (options?.triggerRereview && String(vendorRow.status) === "approved") {
    const nextState = buildRereviewState(now);
    const { data, error } = await queryClient
      .from("vendor_profiles")
      .update(nextState)
      .eq("user_id", vendorId)
      .select("*")
      .maybeSingle();

    if (error || !data) {
      throw new Error(error?.message ?? "Unable to update vendor review state.");
    }

    return data;
  }

  const profile = mapVendorProfileRow(vendorRow);
  const contact = mapVendorContactRow(vendorRow);
  const { data: galleryRows } = await queryClient
    .from("vendor_gallery_assets")
    .select("id")
    .eq("vendor_id", vendorId);
  const services = await loadVendorServices(queryClient, vendorId);
  const completion = getVendorCompletion(
    profile,
    (galleryRows ?? []).length,
    services,
    contact,
  );
  const nextCanBePublic =
    String(vendorRow.status ?? "draft") === "approved" && completion.isPublishReady;

  if (Boolean(vendorRow.can_be_public) === nextCanBePublic) {
    return vendorRow;
  }

  const { data, error } = await queryClient
    .from("vendor_profiles")
    .update({ can_be_public: nextCanBePublic })
    .eq("user_id", vendorId)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to update vendor publish readiness.");
  }

  return data;
}

export function parseVendorGalleryDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!match) {
    throw new Error("Gallery upload must be a valid image data URL.");
  }

  const mimeType = match[1];
  const base64 = match[2];
  const buffer = Buffer.from(base64, "base64");
  const extension =
    mimeType === "image/png"
      ? "png"
      : mimeType === "image/jpeg"
        ? "jpg"
        : mimeType === "image/webp"
          ? "webp"
          : mimeType === "image/svg+xml"
            ? "svg"
            : "";

  if (!extension) {
    throw new Error("Only PNG, JPG, WEBP, and SVG images are supported.");
  }

  return { mimeType, buffer, extension };
}

export function sanitizeVendorUploadFileName(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/(^-|-$)/g, "") || "portfolio-image"
  );
}

export async function uploadVendorPortfolioAsset(
  storageClient: unknown,
  vendorId: string,
  assetId: string,
  fileName: string,
  imageDataUrl: string,
) {
  const client = asQueryClient(storageClient);
  const { mimeType, buffer, extension } = parseVendorGalleryDataUrl(imageDataUrl);
  const sanitizedName = sanitizeVendorUploadFileName(fileName).replace(/\.[a-z0-9]+$/i, "");
  const storagePath = `vendors/${vendorId}/${assetId}-${sanitizedName}.${extension}`;
  const bucket = client.storage?.from(VENDOR_PORTFOLIO_BUCKET);

  if (!bucket) {
    throw new Error("Vendor portfolio storage is not available.");
  }

  const { error } = await bucket.upload(storagePath, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Unable to upload portfolio asset: ${error.message}`);
  }

  return storagePath;
}

export async function removeVendorPortfolioAsset(
  storageClient: unknown,
  storagePath: string,
) {
  if (
    !storagePath ||
    storagePath.startsWith("data:") ||
    storagePath.startsWith("http://") ||
    storagePath.startsWith("https://") ||
    storagePath.startsWith("/")
  ) {
    return;
  }

  const client = asQueryClient(storageClient);
  const bucket = client.storage?.from(VENDOR_PORTFOLIO_BUCKET);

  if (!bucket) {
    throw new Error("Vendor portfolio storage is not available.");
  }

  const { error } = await bucket.remove([storagePath]);
  if (error) {
    throw new Error(`Unable to remove portfolio asset: ${error.message}`);
  }
}

export function buildInsertedVendorGalleryRow(
  vendorId: string,
  payload: { altText: string },
  imagePath: string,
  existingCount: number,
) {
  return {
    id: randomUUID(),
    vendor_id: vendorId,
    image_path: imagePath,
    alt_text: payload.altText.trim() || "Vendor portfolio image",
    is_featured: existingCount === 0,
    sort_order: existingCount,
    uploaded_at: new Date().toISOString(),
  };
}
