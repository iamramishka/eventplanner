import { randomUUID } from "crypto";
import { Buffer } from "buffer";
import { defaultChecklistItems } from "@/data/couple-mock";
import {
  AgendaItemRecord,
  BudgetItemRecord,
  ChecklistItemRecord,
  CoupleSubscriptionSnapshot,
  GalleryAsset,
  InvitationWorkspaceState,
  WeddingTableAssignmentRecord,
  WeddingTableRecord,
  WeddingVendorRecord,
} from "@/types/couple";
import { getDefaultInvitationSiteSeed } from "@/lib/supabase/constants";
import { toInvitationWorkspace, toSubscriptionSnapshot } from "@/lib/supabase/couple-helpers";

const WEDDING_GALLERY_BUCKET = "wedding-gallery";

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

export function getWeddingGalleryBucketName() {
  return WEDDING_GALLERY_BUCKET;
}

export function getInvitationIntroFallback() {
  return "We're so happy to celebrate with the people who matter most to us.";
}

export function mapAgendaItemRow(
  row: Record<string, unknown>,
  weddingSlug: string,
): AgendaItemRecord {
  return {
    id: String(row.id),
    weddingSlug,
    title: String(row.title ?? ""),
    eventTime: String(row.event_time ?? ""),
    durationMinutes: Number(row.duration_minutes ?? 0),
    description: String(row.description ?? ""),
    iconKey: String(row.icon_key ?? "sparkles"),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export function mapBudgetItemRow(
  row: Record<string, unknown>,
  weddingSlug: string,
): BudgetItemRecord {
  return {
    id: String(row.id),
    weddingSlug,
    category: String(row.category ?? "Other") as BudgetItemRecord["category"],
    title: String(row.title ?? ""),
    estimatedAmount: Number(row.estimated_amount ?? 0),
    actualAmount: Number(row.actual_amount ?? 0),
    paidAmount: Number(row.paid_amount ?? 0),
    note: String(row.note ?? ""),
    dueDate: typeof row.due_date === "string" ? row.due_date : undefined,
    status: String(row.status ?? "planned") as BudgetItemRecord["status"],
  };
}

export function mapChecklistItemRow(
  row: Record<string, unknown>,
  weddingSlug: string,
): ChecklistItemRecord {
  return {
    id: String(row.id),
    weddingSlug,
    group: String(row.group_name ?? ""),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    dueDate: typeof row.due_date === "string" ? row.due_date : undefined,
    priority: String(row.priority ?? "Medium") as ChecklistItemRecord["priority"],
    isCompleted: Boolean(row.is_completed),
  };
}

export function mapTableRow(
  row: Record<string, unknown>,
  weddingSlug: string,
): WeddingTableRecord {
  return {
    id: String(row.id),
    weddingSlug,
    tableName: String(row.table_name ?? ""),
    capacity: Number(row.capacity ?? 1),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export function mapTableAssignmentRow(
  row: Record<string, unknown>,
  weddingSlug: string,
): WeddingTableAssignmentRecord {
  return {
    id: String(row.id),
    weddingSlug,
    tableId: String(row.table_id),
    guestId: String(row.guest_id),
    assignedCount: Number(row.assigned_count ?? 1),
  };
}

export function mapWeddingVendorRow(
  row: Record<string, unknown>,
  weddingSlug: string,
): WeddingVendorRecord {
  return {
    id: String(row.id),
    weddingSlug,
    name: String(row.name ?? ""),
    category: String(row.category ?? ""),
    phone: String(row.phone ?? ""),
    whatsapp: String(row.whatsapp ?? ""),
    email: String(row.email ?? ""),
    note: String(row.note ?? ""),
    status: String(row.status ?? "Shortlisted") as WeddingVendorRecord["status"],
    linkedBudgetItemId:
      typeof row.linked_budget_item_id === "string"
        ? row.linked_budget_item_id
        : undefined,
  };
}

export function mapGalleryAssetRow(
  row: Record<string, unknown>,
  weddingSlug: string,
): GalleryAsset {
  return {
    id: String(row.id),
    weddingSlug,
    name: String(row.name ?? ""),
    imageType: String(row.image_type ?? "gallery") as GalleryAsset["imageType"],
    imageUrl: String(row.image_url ?? row.image_path ?? ""),
    isCover: Boolean(row.is_cover),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

export async function getSubscriptionSnapshotForWedding(
  supabase: unknown,
  weddingId: string,
): Promise<CoupleSubscriptionSnapshot> {
  const queryClient = asQueryClient(supabase);
  const { data, error } = await queryClient
    .from("wedding_subscriptions")
    .select("status, trial_ends_at, grace_ends_at, plans(name, gallery_limit, features)")
    .eq("wedding_id", weddingId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load wedding subscription: ${error.message}`);
  }

  return toSubscriptionSnapshot(data);
}

export async function getInvitationWorkspaceForWedding(
  supabase: unknown,
  weddingId: string,
  weddingSlug: string,
): Promise<InvitationWorkspaceState> {
  const queryClient = asQueryClient(supabase);
  const { data: site, error: siteError } = await queryClient
    .from("invitation_sites")
    .select("*")
    .eq("wedding_id", weddingId)
    .maybeSingle();

  if (siteError) {
    throw new Error(`Unable to load invitation site: ${siteError.message}`);
  }

  const { data: blocks, error: blockError } = await queryClient
    .from("invitation_content_blocks")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("sort_order", { ascending: true });

  if (blockError) {
    throw new Error(`Unable to load invitation content blocks: ${blockError.message}`);
  }

  const { data: galleryRows, error: galleryError } = await queryClient
    .from("gallery_assets")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("sort_order", { ascending: true });

  if (galleryError) {
    throw new Error(`Unable to load gallery assets: ${galleryError.message}`);
  }

  const signedGalleryRows = await signWeddingGalleryRows(
    supabase,
    (galleryRows ?? []) as Array<Record<string, unknown>>,
  );
  const workspace = toInvitationWorkspace(site, (blocks ?? []) as Array<Record<string, unknown>>);

  return {
    ...workspace,
    gallery: signedGalleryRows.map((row) => mapGalleryAssetRow(row, weddingSlug)),
  };
}

export async function signWeddingGalleryRows(
  storageClient: unknown,
  rows: Array<Record<string, unknown>>,
) {
  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      image_url: await getSignedGalleryUrl(storageClient, String(row.image_path ?? "")),
    })),
  );
}

export async function getSignedGalleryUrl(storageClient: unknown, path: string) {
  if (!path || path.startsWith("data:") || path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }

  const client = asQueryClient(storageClient);
  const bucket = client.storage?.from(WEDDING_GALLERY_BUCKET);
  if (!bucket) {
    return path;
  }

  const { data, error } = await bucket.createSignedUrl(path, 60 * 60);

  if (error || !data?.signedUrl) {
    return path;
  }

  return data.signedUrl;
}

export function buildChecklistSeedRows(weddingId: string, weddingSlug: string) {
  return defaultChecklistItems(weddingSlug).map((item) => ({
    id: randomUUID(),
    wedding_id: weddingId,
    group_name: item.group,
    title: item.title,
    description: item.description,
    due_date: item.dueDate || null,
    priority: item.priority,
    is_completed: item.isCompleted,
  }));
}

export async function ensureChecklistSeeded(
  supabase: unknown,
  weddingId: string,
  weddingSlug: string,
) {
  const queryClient = asQueryClient(supabase);
  const { data, error } = await queryClient
    .from("checklist_items")
    .select("id")
    .eq("wedding_id", weddingId)
    .limit(1);

  if (error && error.message) {
    throw new Error(`Unable to inspect checklist items: ${error.message}`);
  }

  if (Array.isArray(data) ? data.length > 0 : Boolean(data)) {
    return;
  }

  const { error: insertError } = await queryClient
    .from("checklist_items")
    .insert(buildChecklistSeedRows(weddingId, weddingSlug));

  if (insertError) {
    throw new Error(`Unable to seed default checklist items: ${insertError.message}`);
  }
}

export function parseGalleryDataUrl(dataUrl: string) {
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

export function sanitizeUploadFileName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/(^-|-$)/g, "") || "gallery-image";
}

export async function uploadWeddingGalleryAsset(
  storageClient: unknown,
  weddingId: string,
  assetId: string,
  fileName: string,
  imageDataUrl: string,
) {
  const client = asQueryClient(storageClient);
  const { buffer, extension, mimeType } = parseGalleryDataUrl(imageDataUrl);
  const sanitizedName = sanitizeUploadFileName(fileName).replace(/\.[a-z0-9]+$/i, "");
  const storagePath = `weddings/${weddingId}/${assetId}-${sanitizedName}.${extension}`;
  const bucket = client.storage?.from(WEDDING_GALLERY_BUCKET);

  if (!bucket) {
    throw new Error("Wedding gallery storage is not available.");
  }

  const { error } = await bucket.upload(storagePath, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Unable to upload gallery asset: ${error.message}`);
  }

  return storagePath;
}

export async function removeWeddingGalleryAsset(
  storageClient: unknown,
  storagePath: string,
) {
  if (!storagePath || storagePath.startsWith("data:") || storagePath.startsWith("http://") || storagePath.startsWith("https://") || storagePath.startsWith("/")) {
    return;
  }

  const client = asQueryClient(storageClient);
  const bucket = client.storage?.from(WEDDING_GALLERY_BUCKET);

  if (!bucket) {
    throw new Error("Wedding gallery storage is not available.");
  }

  const { error } = await bucket.remove([storagePath]);

  if (error) {
    throw new Error(`Unable to remove gallery asset from storage: ${error.message}`);
  }
}

export function getInvitationSeedBlocks() {
  return getDefaultInvitationSiteSeed().blocks;
}
