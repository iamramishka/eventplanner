import { defaultSubscriptionSnapshot } from "@/data/couple-mock";
import type {
  CoupleSubscriptionSnapshot,
  InvitationWorkspaceState,
  WeddingSettingsRecord,
} from "@/types/couple";
import type { StoredWedding } from "@/lib/services/browser-store";
import { getDefaultInvitationSiteSeed } from "@/lib/supabase/constants";

type QueryResult = Promise<{
  data: Record<string, unknown> | null;
  error: { message: string } | null;
}>;

type QueryLike = {
  from: (table: string) => {
    select: (...args: unknown[]) => {
      eq: (...eqArgs: unknown[]) => {
        maybeSingle: () => QueryResult;
      };
    };
    insert: (
      value: Record<string, unknown> | Array<Record<string, unknown>>,
    ) => Promise<{ error: { message: string } | null }>;
  };
};

function asQueryClient(value: unknown) {
  return value as QueryLike;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function buildUniqueWeddingSlug(
  supabase: unknown,
  preferredValue: string,
) {
  const queryClient = asQueryClient(supabase);
  const baseSlug = slugify(preferredValue) || `wedding-${Date.now()}`;
  let candidate = baseSlug;
  let suffix = 2;

  for (;;) {
    const { data, error } = await queryClient
      .from("weddings")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(`Unable to validate wedding slug: ${error.message}`);
    }

    if (!data) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function seedInvitationForWedding(supabase: unknown, weddingId: string) {
  const queryClient = asQueryClient(supabase);
  const seed = getDefaultInvitationSiteSeed();
  const now = new Date().toISOString();

  const { error: siteError } = await queryClient.from("invitation_sites").insert({
    wedding_id: weddingId,
    ...seed.site,
    created_at: now,
    updated_at: now,
  });

  if (siteError) {
    throw new Error(`Unable to create invitation site: ${siteError.message}`);
  }

  const { error: blocksError } = await queryClient.from("invitation_content_blocks").insert(
    seed.blocks.map((block) => ({
      wedding_id: weddingId,
      ...block,
    })),
  );

  if (blocksError) {
    throw new Error(`Unable to create invitation content blocks: ${blocksError.message}`);
  }
}

export function toStoredWedding(row: Record<string, unknown>): StoredWedding {
  return {
    userId: String(row.owner_user_id),
    weddingSlug: String(row.slug),
    partnerOneName: String(row.partner_one_name ?? ""),
    partnerTwoName: String(row.partner_two_name ?? ""),
    venueName: String(row.venue_name ?? ""),
    venueTbd: Boolean(row.venue_tbd),
    eventDate:
      typeof row.event_date === "string" && row.event_date
        ? row.event_date.slice(0, 10)
        : "",
    dateTbd: Boolean(row.date_tbd),
    estimatedGuests:
      row.estimated_guests === null || row.estimated_guests === undefined
        ? ""
        : String(row.estimated_guests),
    guestsTbd: row.estimated_guests === null || row.estimated_guests === undefined,
    estimatedBudget:
      row.estimated_budget === null || row.estimated_budget === undefined
        ? ""
        : String(row.estimated_budget),
    budgetTbd: row.estimated_budget === null || row.estimated_budget === undefined,
  };
}

export function toWeddingSettings(row: Record<string, unknown>): WeddingSettingsRecord {
  return {
    weddingSlug: String(row.slug),
    partnerOneName: String(row.partner_one_name ?? ""),
    partnerTwoName: String(row.partner_two_name ?? ""),
    weddingTitle:
      String(row.wedding_title ?? "").trim() ||
      `${String(row.partner_one_name ?? "")} & ${String(row.partner_two_name ?? "")}`,
    eventDate:
      typeof row.event_date === "string" && row.event_date
        ? row.event_date.slice(0, 10)
        : "",
    dateTbd: Boolean(row.date_tbd),
    venueName: String(row.venue_name ?? ""),
    venueTbd: Boolean(row.venue_tbd),
    venueMapLink: String(row.venue_map_link ?? ""),
    introMessage:
      String(row.intro_message ?? "").trim() ||
      "We're so happy to celebrate with the people who matter most to us.",
    timezone: String(row.timezone ?? "Asia/Colombo"),
    contactPhone: String(row.contact_phone ?? ""),
    rsvpDeadline:
      typeof row.rsvp_deadline === "string" && row.rsvp_deadline
        ? row.rsvp_deadline.slice(0, 10)
        : "",
    estimatedGuests:
      row.estimated_guests === null || row.estimated_guests === undefined
        ? ""
        : String(row.estimated_guests),
    estimatedBudget:
      row.estimated_budget === null || row.estimated_budget === undefined
        ? ""
        : String(row.estimated_budget),
  };
}

export function toSubscriptionSnapshot(
  row: Record<string, unknown> | null,
): CoupleSubscriptionSnapshot {
  const status =
    row?.status === "active" || row?.status === "expired" ? row.status : "trial";
  const base = defaultSubscriptionSnapshot(status);
  const plan = (row?.plans as
    | {
        name?: string;
        gallery_limit?: number;
        features?: string[];
      }
    | undefined) ?? {};

  return {
    ...base,
    planName: typeof plan.name === "string" ? plan.name : base.planName,
    imageLimit: typeof plan.gallery_limit === "number" ? plan.gallery_limit : base.imageLimit,
    features: Array.isArray(plan.features) ? plan.features : base.features,
  };
}

export function toInvitationWorkspace(
  site: Record<string, unknown> | null,
  blocks: Array<Record<string, unknown>>,
): InvitationWorkspaceState {
  const seed = getDefaultInvitationSiteSeed();

  return {
    sections:
      blocks.length > 0
        ? blocks
            .sort((left, right) => Number(left.sort_order) - Number(right.sort_order))
            .map((block) => ({
              key: String(block.block_key) as InvitationWorkspaceState["sections"][number]["key"],
              label: String(block.block_key).replace(/-/g, " "),
              title: String(block.title ?? ""),
              body: String(block.body ?? ""),
            }))
        : seed.blocks.map((block) => ({
            key: block.block_key as InvitationWorkspaceState["sections"][number]["key"],
            label: block.block_key.replace(/-/g, " "),
            title: block.title,
            body: block.body,
          })),
    visibility: Array.isArray(site?.visibility)
      ? (site.visibility as InvitationWorkspaceState["visibility"])
      : (seed.site.visibility as InvitationWorkspaceState["visibility"]),
    theme: {
      preset:
        (site?.theme_preset as InvitationWorkspaceState["theme"]["preset"]) ?? "blush-bloom",
      primaryColor: String(site?.primary_color ?? "#C45A74"),
      secondaryColor: String(site?.secondary_color ?? "#D8B48A"),
      accentColor: String(site?.accent_color ?? "#8FA98F"),
      surfaceColor: String(site?.surface_color ?? "#FFFDFC"),
    },
    gallery: [],
    music: {
      enabled: Boolean(site?.music_enabled),
      mutedByDefault: Boolean(site?.music_muted_by_default ?? true),
      trackId: String(site?.music_track_id ?? "strings-at-dawn"),
    },
    publishState: {
      hasUnpublishedChanges: Boolean(site?.has_unpublished_changes),
      lastDraftSavedAt:
        typeof site?.last_draft_saved_at === "string" ? site.last_draft_saved_at : undefined,
      lastPublishedAt:
        typeof site?.last_published_at === "string" ? site.last_published_at : undefined,
    },
  };
}
