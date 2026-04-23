import { getDefaultInvitationSiteSeed } from "@/lib/supabase/constants";
import { resolveInvitationPresetImage } from "@/lib/invitation-utils";
import type {
  AgendaItemRecord,
  GalleryAsset,
  GuestRsvpCurrent,
  InvitationSectionSetting,
} from "@/types/couple";
import type {
  InvitationGuestContext,
  InvitationPageData,
  InvitationTableLookupResult,
} from "@/types/invitation";
import { buildCurrentRsvp, mapGuestRow } from "@/lib/supabase/guest-helpers";
import { getSignedGalleryUrl } from "@/lib/supabase/couple-planning-helpers";
import { getWeddingAvailabilityState } from "@/lib/server/trial-lifecycle";

type QueryLike = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any;
};

function asQueryClient(value: unknown) {
  return value as QueryLike;
}

function defaultInvitationPage(status: InvitationPageData["status"], weddingSlug = ""): InvitationPageData {
  const seed = getDefaultInvitationSiteSeed();
  return {
    status,
    weddingSlug,
    coupleNames: "Wedding invitation",
    displayTitle: status === "not-found" ? "Invitation not found" : "Invitation coming soon",
    invitation: {
      sections: seed.blocks.map((block) => ({
        key: block.block_key as InvitationPageData["invitation"]["sections"][number]["key"],
        label: block.block_key.replace(/-/g, " "),
        title: block.title,
        body: block.body,
      })),
      visibility: seed.site.visibility as InvitationSectionSetting[],
      theme: {
        preset: seed.site.theme_preset as InvitationPageData["invitation"]["theme"]["preset"],
        primaryColor: String(seed.site.primary_color),
        secondaryColor: String(seed.site.secondary_color),
        accentColor: String(seed.site.accent_color),
        surfaceColor: String(seed.site.surface_color),
      },
      gallery: [],
      music: {
        enabled: Boolean(seed.site.music_enabled),
        mutedByDefault: Boolean(seed.site.music_muted_by_default),
        trackId: String(seed.site.music_track_id ?? "strings-at-dawn"),
      },
      publishState: {
        hasUnpublishedChanges: Boolean(seed.site.has_unpublished_changes),
      },
    },
    agenda: [],
    gallery: [],
    coverImage: "/templates/blush-bloom.svg",
    guestPreview: {
      confirmedCount: 0,
      names: [],
    },
  };
}

function lockedInvitationPage(slug: string): InvitationPageData {
  const page = defaultInvitationPage("locked", slug);
  return {
    ...page,
    displayTitle: "Invitation temporarily unavailable",
    lockedTitle: "This invitation is currently locked",
    lockedMessage:
      "The couple's access window has ended, so this invitation is not available right now. Please contact the couple or the platform team if you need help.",
  };
}

function mapAgendaRow(row: Record<string, unknown>, weddingSlug: string): AgendaItemRecord {
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

function mapGalleryRow(row: Record<string, unknown>, weddingSlug: string): GalleryAsset {
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

function isSectionEnabled(
  visibility: Array<{ key: string; enabled: boolean }>,
  key: string,
) {
  return visibility.find((item) => item.key === key)?.enabled ?? false;
}

export async function buildInvitationPageDataFromSlug(
  supabase: unknown,
  slug: string,
  token?: string | null,
): Promise<InvitationPageData> {
  const queryClient = asQueryClient(supabase);
  const { data: wedding, error: weddingError } = await queryClient
    .from("weddings")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (weddingError) {
    throw new Error(`Unable to load invitation wedding: ${weddingError.message}`);
  }

  if (!wedding) {
    return defaultInvitationPage("not-found", slug);
  }

  const availability = await getWeddingAvailabilityState(
    queryClient,
    String(wedding.id),
    String(wedding.owner_user_id),
  );

  if (availability.isLocked) {
    return lockedInvitationPage(slug);
  }

  const { data: site, error: siteError } = await queryClient
    .from("invitation_sites")
    .select("*")
    .eq("wedding_id", String(wedding.id))
    .maybeSingle();

  if (siteError) {
    throw new Error(`Unable to load invitation site: ${siteError.message}`);
  }

  if (!site || !site.last_published_at) {
    return defaultInvitationPage("unpublished", slug);
  }

  const { data: blocks, error: blocksError } = await queryClient
    .from("invitation_content_blocks")
    .select("*")
    .eq("wedding_id", String(wedding.id))
    .order("sort_order", { ascending: true });

  if (blocksError) {
    throw new Error(`Unable to load invitation blocks: ${blocksError.message}`);
  }

  const { data: agendaRows, error: agendaError } = await queryClient
    .from("agenda_items")
    .select("*")
    .eq("wedding_id", String(wedding.id))
    .order("sort_order", { ascending: true });

  if (agendaError) {
    throw new Error(`Unable to load invitation agenda: ${agendaError.message}`);
  }

  const { data: galleryRows, error: galleryError } = await queryClient
    .from("gallery_assets")
    .select("*")
    .eq("wedding_id", String(wedding.id))
    .order("sort_order", { ascending: true });

  if (galleryError) {
    throw new Error(`Unable to load invitation gallery: ${galleryError.message}`);
  }

  const { data: guestRows, error: guestError } = await queryClient
    .from("guests")
    .select("*")
    .eq("wedding_id", String(wedding.id))
    .order("created_at", { ascending: true });

  if (guestError) {
    throw new Error(`Unable to load invitation guests: ${guestError.message}`);
  }

  const guestRecords = (guestRows ?? []) as Array<Record<string, unknown>>;
  const guestIds = guestRecords.map((row: Record<string, unknown>) => String(row.id));

  let inviteRows: Array<Record<string, unknown>> = [];
  let rsvpRows: Array<Record<string, unknown>> = [];

  if (guestIds.length) {
    const { data, error: inviteError } = await queryClient
      .from("guest_invites")
      .select("*")
      .in("guest_id", guestIds)
      .eq("is_active", true);

    if (inviteError) {
      throw new Error(`Unable to load invitation invite tokens: ${inviteError.message}`);
    }

    inviteRows = data ?? [];

    const { data: latestRsvps, error: rsvpError } = await queryClient
      .from("rsvp_responses")
      .select("*")
      .in("guest_id", guestIds)
      .order("submitted_at", { ascending: false });

    if (rsvpError) {
      throw new Error(`Unable to load invitation RSVP data: ${rsvpError.message}`);
    }

    rsvpRows = latestRsvps ?? [];
  }

  const { data: tableRows, error: tableError } = await queryClient
    .from("wedding_tables")
    .select("*")
    .eq("wedding_id", String(wedding.id))
    .order("sort_order", { ascending: true });

  if (tableError) {
    throw new Error(`Unable to load wedding tables: ${tableError.message}`);
  }

  const tableRecords = (tableRows ?? []) as Array<Record<string, unknown>>;
  const tableIds = tableRecords.map((row: Record<string, unknown>) => String(row.id));
  let assignmentRows: Array<Record<string, unknown>> = [];

  if (tableIds.length) {
    const { data, error: assignmentError } = await queryClient
      .from("wedding_table_assignments")
      .select("*")
      .in("table_id", tableIds);

    if (assignmentError) {
      throw new Error(`Unable to load table assignments: ${assignmentError.message}`);
    }

    assignmentRows = data ?? [];
  }

  const visibility = Array.isArray(site.visibility)
    ? (site.visibility as InvitationSectionSetting[])
    : (getDefaultInvitationSiteSeed().site.visibility as InvitationSectionSetting[]);

  const sections = ((blocks ?? []) as Array<Record<string, unknown>>).map((block: Record<string, unknown>) => ({
    key: String(block.block_key) as InvitationPageData["invitation"]["sections"][number]["key"],
    label: String(block.block_key).replace(/-/g, " "),
    title: String(block.title ?? ""),
    body: String(block.body ?? ""),
  }));

  const gallery = await Promise.all(
    ((galleryRows ?? []) as Array<Record<string, unknown>>).map(async (row) =>
      mapGalleryRow(
        {
          ...row,
          image_url: await getSignedGalleryUrl(queryClient, String(row.image_path ?? "")),
        },
        slug,
      ),
    ),
  );
  const coverImage =
    gallery.find((item) => item.isCover)?.imageUrl ??
    resolveInvitationPresetImage({
      preset: String(site.theme_preset ?? "blush-bloom") as InvitationPageData["invitation"]["theme"]["preset"],
      primaryColor: String(site.primary_color ?? "#C45A74"),
      secondaryColor: String(site.secondary_color ?? "#D8B48A"),
      accentColor: String(site.accent_color ?? "#8FA98F"),
      surfaceColor: String(site.surface_color ?? "#FFFDFC"),
    });

  const inviteMap = new Map<string, Record<string, unknown>>(
    inviteRows.map((invite: Record<string, unknown>) => [String(invite.guest_id), invite]),
  );
  const rsvpMap = new Map<string, Record<string, unknown>>();
  for (const row of rsvpRows) {
    const guestId = String(row.guest_id);
    if (!rsvpMap.has(guestId)) {
      rsvpMap.set(guestId, row);
    }
  }

  const guests = guestRecords.map((row: Record<string, unknown>) =>
    mapGuestRow({ ...row, weddings: { slug } }, inviteMap.get(String(row.id))),
  );
  const confirmed = guests
    .map((guest: typeof guests[number]) => buildCurrentRsvp(guest, rsvpMap.get(guest.id) ?? null))
    .filter((item: GuestRsvpCurrent) => item.status === "confirmed");

  let guestContext: InvitationGuestContext | undefined;
  if (token) {
    const matchedGuest = guests.find(
      (guest: typeof guests[number]) =>
        guest.inviteToken.toUpperCase() === token.trim().toUpperCase(),
    );

    if (matchedGuest) {
      const assignment = assignmentRows.find(
        (item: Record<string, unknown>) => String(item.guest_id) === matchedGuest.id,
      );
      const table = assignment
        ? tableRecords.find(
            (item: Record<string, unknown>) => String(item.id) === String(assignment.table_id),
          )
        : null;

      guestContext = {
        guestId: matchedGuest.id,
        guestName: matchedGuest.name,
        inviteToken: matchedGuest.inviteToken,
        side: matchedGuest.side,
        maxAllowedMembers: matchedGuest.maxAllowedMembers,
        existingRsvp: buildCurrentRsvp(matchedGuest, rsvpMap.get(matchedGuest.id) ?? null),
        tableAssignment:
          assignment && table
            ? {
                tableId: String(table.id),
                tableName: String(table.table_name),
                assignedCount: Number(assignment.assigned_count ?? 0),
              }
            : undefined,
      };
    }
  }

  return {
    status: "ready",
    weddingSlug: slug,
    coupleNames: `${String(wedding.partner_one_name ?? "")} & ${String(wedding.partner_two_name ?? "")}`,
    displayTitle:
      String(wedding.wedding_title ?? "").trim() ||
      `${String(wedding.partner_one_name ?? "")} & ${String(wedding.partner_two_name ?? "")}`,
    eventDate:
      typeof wedding.event_date === "string" && wedding.event_date
        ? wedding.event_date.slice(0, 10)
        : undefined,
    venueName:
      wedding.venue_tbd || !wedding.venue_name
        ? "Venue to be announced"
        : String(wedding.venue_name),
    venueMapLink: String(wedding.venue_map_link ?? ""),
    contactPhone: String(wedding.contact_phone ?? ""),
    introMessage: "We’re so happy to celebrate with the people who matter most to us.",
    invitation: {
      sections,
      visibility,
      theme: {
        preset: String(site.theme_preset ?? "blush-bloom") as InvitationPageData["invitation"]["theme"]["preset"],
        primaryColor: String(site.primary_color ?? "#C45A74"),
        secondaryColor: String(site.secondary_color ?? "#D8B48A"),
        accentColor: String(site.accent_color ?? "#8FA98F"),
        surfaceColor: String(site.surface_color ?? "#FFFDFC"),
      },
      gallery,
      music: {
        enabled: Boolean(site.music_enabled),
        mutedByDefault: Boolean(site.music_muted_by_default ?? true),
        trackId: String(site.music_track_id ?? "strings-at-dawn"),
      },
      publishState: {
        hasUnpublishedChanges: Boolean(site.has_unpublished_changes),
        lastDraftSavedAt:
          typeof site.last_draft_saved_at === "string" ? site.last_draft_saved_at : undefined,
        lastPublishedAt:
          typeof site.last_published_at === "string" ? site.last_published_at : undefined,
      },
    },
    agenda: ((agendaRows ?? []) as Array<Record<string, unknown>>).map(
      (row: Record<string, unknown>) => mapAgendaRow(row, slug),
    ),
    gallery,
    coverImage,
    guestPreview: {
      confirmedCount: confirmed.length,
      names: confirmed.slice(0, 6).map((item: GuestRsvpCurrent) => item.guestName),
    },
    guestContext,
  };
}

export async function buildInvitationPageDataFromToken(
  supabase: unknown,
  token: string,
): Promise<InvitationPageData> {
  const queryClient = asQueryClient(supabase);
  const { data: invite, error } = await queryClient
    .from("guest_invites")
    .select("guest_id")
    .eq("invite_token", token.trim().toUpperCase())
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to resolve invitation token: ${error.message}`);
  }

  if (!invite) {
    return defaultInvitationPage("not-found");
  }

  const { data: guest, error: guestError } = await queryClient
    .from("guests")
    .select("id, wedding_id, weddings(slug)")
    .eq("id", String(invite.guest_id))
    .maybeSingle();

  if (guestError) {
    throw new Error(`Unable to resolve invitation guest: ${guestError.message}`);
  }

  const slug = String(guest?.weddings?.slug ?? "");
  if (!slug) {
    return defaultInvitationPage("not-found");
  }

  return buildInvitationPageDataFromSlug(queryClient, slug, token);
}

export async function submitGuestRsvpByToken(
  supabase: unknown,
  token: string,
  payload: {
    status: GuestRsvpCurrent["status"];
    attendingCount: number;
    mealPreference: GuestRsvpCurrent["mealPreference"];
    liquorPreference: GuestRsvpCurrent["liquorPreference"];
    specialNote: string;
  },
) {
  const queryClient = asQueryClient(supabase);
  const page = await buildInvitationPageDataFromToken(queryClient, token);

  if (page.status === "locked") {
    throw new Error(page.lockedMessage ?? "RSVP is not available for this invitation.");
  }

  if (page.status !== "ready" || !page.guestContext) {
    throw new Error("This RSVP link is no longer valid.");
  }

  if (!isSectionEnabled(page.invitation.visibility, "rsvp")) {
    throw new Error("RSVP is not available for this invitation.");
  }

  if (
    page.guestContext.maxAllowedMembers < payload.attendingCount ||
    payload.attendingCount < 0
  ) {
    throw new Error("Attending count cannot exceed the allowed guest count.");
  }

  if (payload.status === "confirmed" && payload.attendingCount < 1) {
    throw new Error("Select at least one attendee if you are attending.");
  }

  const { error } = await queryClient.from("rsvp_responses").insert({
    guest_id: page.guestContext.guestId,
    status: payload.status,
    attending_count: payload.status === "declined" ? 0 : payload.attendingCount,
    meal_preference: payload.mealPreference,
    liquor_preference: payload.liquorPreference,
    special_note: payload.specialNote,
    source: "guest",
    submitted_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Unable to save RSVP: ${error.message}`);
  }

  return buildInvitationPageDataFromToken(queryClient, token);
}

export async function findTableByTokenFromDb(
  supabase: unknown,
  token: string,
): Promise<InvitationTableLookupResult> {
  const page = await buildInvitationPageDataFromToken(supabase, token);

  if (page.status !== "ready") {
    if (page.status === "locked") {
      return {
        status: "unavailable",
        message: page.lockedMessage ?? "Table lookup is not available for this invitation.",
      };
    }

    return {
      status: "not-found",
      message: "We could not find a table assignment for this invitation.",
    };
  }

  if (!isSectionEnabled(page.invitation.visibility, "table-finder")) {
    return {
      status: "unavailable",
      message: "Table finder is not enabled for this invitation.",
    };
  }

  if (!page.guestContext?.tableAssignment) {
    return {
      status: "not-found",
      message: "Your table assignment has not been published yet.",
    };
  }

  return {
    status: "found",
    guestName: page.guestContext.guestName,
    tableName: page.guestContext.tableAssignment.tableName,
    assignedCount: page.guestContext.tableAssignment.assignedCount,
  };
}

export async function findTableByGuestNameFromDb(
  supabase: unknown,
  slug: string,
  query: string,
): Promise<InvitationTableLookupResult> {
  const page = await buildInvitationPageDataFromSlug(supabase, slug);

  if (page.status !== "ready") {
    if (page.status === "locked") {
      return {
        status: "unavailable",
        message: page.lockedMessage ?? "Table lookup is not available for this invitation.",
      };
    }

    return {
      status: "not-found",
      message: "This invitation is not available.",
    };
  }

  if (!isSectionEnabled(page.invitation.visibility, "table-finder")) {
    return {
      status: "unavailable",
      message: "Table finder is not enabled for this invitation.",
    };
  }

  const normalized = query.toLowerCase().replace(/\s+/g, " ").trim();
  if (normalized.length < 3) {
    return {
      status: "not-found",
      message: "Enter the full guest name to look up the table assignment.",
    };
  }

  const queryClient = asQueryClient(supabase);
  const { data: wedding, error: weddingError } = await queryClient
    .from("weddings")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (weddingError || !wedding) {
    return {
      status: "not-found",
      message: "This invitation is not available.",
    };
  }

  const { data: guest, error } = await queryClient
    .from("guests")
    .select("id, name, wedding_id")
    .eq("wedding_id", String(wedding.id))
    .eq("name", query.trim())
    .maybeSingle();

  if (error || !guest) {
    return {
      status: "not-found",
      message: "No published table assignment was found for that guest name.",
    };
  }

  const { data: assignment } = await queryClient
    .from("wedding_table_assignments")
    .select("*")
    .eq("guest_id", String(guest.id))
    .maybeSingle();

  if (!assignment) {
    return {
      status: "not-found",
      message: "Table assignment is not available for that guest yet.",
    };
  }

  const { data: table } = await queryClient
    .from("wedding_tables")
    .select("*")
    .eq("id", String(assignment.table_id))
    .maybeSingle();

  if (!table) {
    return {
      status: "not-found",
      message: "Table assignment is not available for that guest yet.",
    };
  }

  return {
    status: "found",
    guestName: String(guest.name),
    tableName: String(table.table_name),
    assignedCount: Number(assignment.assigned_count ?? 0),
  };
}
