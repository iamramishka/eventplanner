"use client";

import { musicTracks } from "@/data/couple-mock";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  getAgendaMap,
  getAssignmentMap,
  getGuestMap,
  getInvitationMap,
  getRsvpMap,
  getStoredWeddingBySlug,
  getTableMap,
  getWeddingSettingsMap,
  saveRsvpMap,
  ensureCoupleWorkspaceStorage,
} from "@/lib/services/couple-browser-store";
import { resolveInvitationPresetImage, normalizeInvitationLookup } from "@/lib/invitation-utils";
import {
  GuestRecord,
  GuestRsvpCurrent,
  GuestRsvpHistoryRecord,
  GuestRsvpStatus,
  InvitationSectionSetting,
} from "@/types/couple";
import {
  InvitationPageData,
  InvitationRsvpInput,
  InvitationTableLookupResult,
} from "@/types/invitation";

function wait(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function getLatestRsvp(
  guest: GuestRecord,
  history: GuestRsvpHistoryRecord[],
): GuestRsvpCurrent {
  const latest = history
    .filter((item) => item.guestId === guest.id)
    .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))[0];

  return {
    guestId: guest.id,
    guestName: guest.name,
    side: guest.side,
    status: latest?.status ?? "pending",
    attendingCount: latest?.attendingCount ?? 0,
    mealPreference: latest?.mealPreference ?? "Standard",
    liquorPreference: latest?.liquorPreference ?? "Undecided",
    specialNote: latest?.specialNote ?? "",
    submittedAt: latest?.submittedAt,
    maxAllowedMembers: guest.maxAllowedMembers,
    inviteSentAt: guest.lastInviteSentAt,
  };
}

function getInvitationSectionVisibility(
  visibility: InvitationSectionSetting[],
  key: InvitationSectionSetting["key"],
) {
  return visibility.find((item) => item.key === key)?.enabled ?? false;
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & {
    message?: string;
  };

  if (!response.ok) {
    throw Object.assign(new Error(payload.message || "Request failed."), {
      status: response.status,
    });
  }

  return payload;
}

function findGuestByToken(token: string) {
  ensureCoupleWorkspaceStorage();
  const normalizedToken = token.trim().toUpperCase();
  const guestMap = getGuestMap();

  for (const [weddingSlug, guests] of Object.entries(guestMap)) {
    const guest = guests.find((item) => item.inviteToken.toUpperCase() === normalizedToken);
    if (guest) {
      return { weddingSlug, guest };
    }
  }

  return null;
}

function buildInvitationPageData(
  weddingSlug: string,
  guestToken?: string | null,
): InvitationPageData {
  ensureCoupleWorkspaceStorage();

  const wedding = getStoredWeddingBySlug(weddingSlug);
  if (!wedding) {
    return {
      status: "not-found",
      weddingSlug,
      coupleNames: "Wedding invitation",
      displayTitle: "Invitation not found",
      invitation: {
        sections: [],
        visibility: [],
        theme: {
          preset: "blush-bloom",
          primaryColor: "#C45A74",
          secondaryColor: "#D8B48A",
          accentColor: "#8FA98F",
          surfaceColor: "#FFFDFC",
        },
        gallery: [],
        music: {
          enabled: false,
          mutedByDefault: true,
          trackId: musicTracks[0]?.id ?? "strings-at-dawn",
        },
        publishState: {
          hasUnpublishedChanges: false,
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

  const settings = getWeddingSettingsMap()[weddingSlug];
  const invitation = getInvitationMap()[weddingSlug];
  const guests = getGuestMap()[weddingSlug] ?? [];
  const rsvpHistory = getRsvpMap()[weddingSlug] ?? [];
  const agenda = [...(getAgendaMap()[weddingSlug] ?? [])].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );
  const tables = getTableMap()[weddingSlug] ?? [];
  const assignments = getAssignmentMap()[weddingSlug] ?? [];

  if (!settings || !invitation || !invitation.publishState.lastPublishedAt) {
    return {
      status: "unpublished",
      weddingSlug,
      coupleNames: `${wedding.partnerOneName} & ${wedding.partnerTwoName}`,
      displayTitle: "Invitation not published",
      invitation:
        invitation ??
        {
          sections: [],
          visibility: [],
          theme: {
            preset: "blush-bloom",
            primaryColor: "#C45A74",
            secondaryColor: "#D8B48A",
            accentColor: "#8FA98F",
            surfaceColor: "#FFFDFC",
          },
          gallery: [],
          music: {
            enabled: false,
            mutedByDefault: true,
            trackId: musicTracks[0]?.id ?? "strings-at-dawn",
          },
          publishState: {
            hasUnpublishedChanges: false,
          },
        },
      agenda,
      gallery: invitation?.gallery ?? [],
      coverImage: invitation ? resolveInvitationPresetImage(invitation.theme) : "/templates/blush-bloom.svg",
      guestPreview: {
        confirmedCount: 0,
        names: [],
      },
    };
  }

  const coverImage =
    invitation.gallery.find((item) => item.isCover)?.imageUrl ??
    resolveInvitationPresetImage(invitation.theme);

  const latestRsvps = guests.map((guest) => getLatestRsvp(guest, rsvpHistory));
  const confirmedGuests = latestRsvps.filter((item) => item.status === "confirmed");
  const previewNames = confirmedGuests.slice(0, 6).map((item) => item.guestName);

  const guestMatch = guestToken
    ? guests.find((item) => item.inviteToken.toUpperCase() === guestToken.trim().toUpperCase())
    : undefined;

  const guestContext = guestMatch
    ? (() => {
        const latest = getLatestRsvp(guestMatch, rsvpHistory);
        const assignment = assignments.find((item) => item.guestId === guestMatch.id);
        const table = assignment ? tables.find((item) => item.id === assignment.tableId) : null;

        return {
          guestId: guestMatch.id,
          guestName: guestMatch.name,
          inviteToken: guestMatch.inviteToken,
          side: guestMatch.side,
          maxAllowedMembers: guestMatch.maxAllowedMembers,
          existingRsvp: latest,
          tableAssignment:
            assignment && table
              ? {
                  tableId: table.id,
                  tableName: table.tableName,
                  assignedCount: assignment.assignedCount,
                }
              : undefined,
        };
      })()
    : undefined;

  return {
    status: "ready",
    weddingSlug,
    coupleNames: `${settings.partnerOneName} & ${settings.partnerTwoName}`,
    displayTitle: settings.weddingTitle || `${settings.partnerOneName} & ${settings.partnerTwoName}`,
    eventDate: settings.eventDate,
    venueName: settings.venueTbd ? "Venue to be announced" : settings.venueName,
    venueMapLink: settings.venueMapLink,
    contactPhone: settings.contactPhone,
    introMessage: settings.introMessage,
    invitation,
    agenda,
    gallery: [...invitation.gallery].sort((left, right) => left.sortOrder - right.sortOrder),
    coverImage,
    guestPreview: {
      confirmedCount: confirmedGuests.length,
      names: previewNames,
    },
    guestContext,
  };
}

export const invitationService = {
  async getInvitationBySlug(slug: string, guestToken?: string | null) {
    if (isSupabaseConfigured()) {
      try {
        const search = guestToken ? `?token=${encodeURIComponent(guestToken)}` : "";
        const response = await fetch(`/api/v1/invitations/slug/${slug}${search}`, {
          method: "GET",
          cache: "no-store",
        });

        const data = await parseJson<{ page: InvitationPageData }>(response);
        return data.page;
      } catch (error) {
        if ((error as { status?: number }).status !== 501) {
          throw error;
        }
      }
    }

    await wait();
    return buildInvitationPageData(slug, guestToken);
  },

  async getInvitationByToken(token: string) {
    if (isSupabaseConfigured()) {
      try {
        const response = await fetch(`/api/v1/invitations/token/${encodeURIComponent(token)}`, {
          method: "GET",
          cache: "no-store",
        });

        const data = await parseJson<{ page: InvitationPageData }>(response);
        return data.page;
      } catch (error) {
        if ((error as { status?: number }).status !== 501) {
          throw error;
        }
      }
    }

    await wait();
    const match = findGuestByToken(token);
    if (!match) {
      return {
        status: "not-found",
        weddingSlug: "",
        coupleNames: "Wedding invitation",
        displayTitle: "Invitation not found",
        invitation: {
          sections: [],
          visibility: [],
          theme: {
            preset: "blush-bloom",
            primaryColor: "#C45A74",
            secondaryColor: "#D8B48A",
            accentColor: "#8FA98F",
            surfaceColor: "#FFFDFC",
          },
          gallery: [],
          music: {
            enabled: false,
            mutedByDefault: true,
            trackId: musicTracks[0]?.id ?? "strings-at-dawn",
          },
          publishState: {
            hasUnpublishedChanges: false,
          },
        },
        agenda: [],
        gallery: [],
        coverImage: "/templates/blush-bloom.svg",
        guestPreview: {
          confirmedCount: 0,
          names: [],
        },
      } satisfies InvitationPageData;
    }

    return buildInvitationPageData(match.weddingSlug, token);
  },

  async submitRsvp(token: string, payload: InvitationRsvpInput) {
    if (isSupabaseConfigured()) {
      try {
        const response = await fetch(`/api/v1/invitations/rsvp/${encodeURIComponent(token)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await parseJson<{ page: InvitationPageData }>(response);
        return data.page;
      } catch (error) {
        if ((error as { status?: number }).status !== 501) {
          throw error;
        }
      }
    }

    await wait(320);
    const match = findGuestByToken(token);
    if (!match) {
      throw new Error("This RSVP link is no longer valid.");
    }

    const { weddingSlug, guest } = match;
    const invitation = getInvitationMap()[weddingSlug];

    if (!invitation || !getInvitationSectionVisibility(invitation.visibility, "rsvp")) {
      throw new Error("RSVP is not available for this invitation.");
    }

    const settings = getWeddingSettingsMap()[weddingSlug];
    if (settings?.rsvpDeadline) {
      const deadline = new Date(settings.rsvpDeadline).getTime();
      if (!Number.isNaN(deadline) && deadline < Date.now()) {
        throw new Error("The RSVP deadline has passed for this event.");
      }
    }

    if (!["pending", "confirmed", "declined"].includes(payload.status)) {
      throw new Error("Please choose a valid RSVP status.");
    }

    if (payload.status === "confirmed" && payload.attendingCount < 1) {
      throw new Error("Select at least one attendee if you are attending.");
    }

    if (payload.attendingCount > guest.maxAllowedMembers) {
      throw new Error("Attending count cannot exceed the allowed guest count.");
    }

    const nextEntry: GuestRsvpHistoryRecord = {
      id: buildId("rsvp"),
      weddingSlug,
      guestId: guest.id,
      status: payload.status as GuestRsvpStatus,
      attendingCount: payload.status === "declined" ? 0 : payload.attendingCount,
      mealPreference: payload.mealPreference,
      liquorPreference: payload.liquorPreference,
      specialNote: payload.specialNote,
      submittedAt: nowIso(),
      source: "guest",
    };

    const rsvpMap = getRsvpMap();
    rsvpMap[weddingSlug] = [nextEntry, ...(rsvpMap[weddingSlug] ?? [])];
    saveRsvpMap(rsvpMap);

    return buildInvitationPageData(weddingSlug, token);
  },

  async lookupGuestTokenForWedding(slug: string, token: string) {
    if (isSupabaseConfigured()) {
      try {
        const response = await fetch(
          `/api/v1/invitations/slug/${slug}?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = await parseJson<{ page: InvitationPageData }>(response);
        return data.page.status === "ready" && data.page.guestContext ? data.page : null;
      } catch (error) {
        if ((error as { status?: number }).status !== 501) {
          throw error;
        }
      }
    }

    await wait(160);
    const page = buildInvitationPageData(slug, token);
    return page.status === "ready" && page.guestContext ? page : null;
  },

  async findTableByToken(token: string): Promise<InvitationTableLookupResult> {
    if (isSupabaseConfigured()) {
      try {
        const response = await fetch(`/api/v1/invitations/table/${encodeURIComponent(token)}`, {
          method: "GET",
          cache: "no-store",
        });

        const data = await parseJson<{ result: InvitationTableLookupResult }>(response);
        return data.result;
      } catch (error) {
        if ((error as { status?: number }).status !== 501) {
          throw error;
        }
      }
    }

    await wait(160);
    const page = await this.getInvitationByToken(token);

    if (page.status !== "ready") {
      return {
        status: "not-found",
        message: "We could not find a table assignment for this invitation.",
      };
    }

    if (!getInvitationSectionVisibility(page.invitation.visibility, "table-finder")) {
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
  },

  async findTableByName(slug: string, query: string): Promise<InvitationTableLookupResult> {
    if (isSupabaseConfigured()) {
      try {
        const response = await fetch(`/api/v1/invitations/lookup/${slug}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        });

        const data = await parseJson<{ result: InvitationTableLookupResult }>(response);
        return data.result;
      } catch (error) {
        if ((error as { status?: number }).status !== 501) {
          throw error;
        }
      }
    }

    await wait(220);
    const page = buildInvitationPageData(slug);
    if (page.status !== "ready") {
      return {
        status: "not-found",
        message: "This invitation is not available.",
      };
    }

    if (!getInvitationSectionVisibility(page.invitation.visibility, "table-finder")) {
      return {
        status: "unavailable",
        message: "Table finder is not enabled for this invitation.",
      };
    }

    const normalizedQuery = normalizeInvitationLookup(query);
    if (normalizedQuery.length < 3) {
      return {
        status: "not-found",
        message: "Enter the full guest name to look up the table assignment.",
      };
    }

    const guests = getGuestMap()[slug] ?? [];
    const assignments = getAssignmentMap()[slug] ?? [];
    const tables = getTableMap()[slug] ?? [];
    const match = guests.find(
      (guest) => normalizeInvitationLookup(guest.name) === normalizedQuery,
    );

    if (!match) {
      return {
        status: "not-found",
        message: "No published table assignment was found for that guest name.",
      };
    }

    const assignment = assignments.find((item) => item.guestId === match.id);
    const table = assignment ? tables.find((item) => item.id === assignment.tableId) : null;

    if (!assignment || !table) {
      return {
        status: "not-found",
        message: "Table assignment is not available for that guest yet.",
      };
    }

    return {
      status: "found",
      guestName: match.name,
      tableName: table.tableName,
      assignedCount: assignment.assignedCount,
    };
  },
};
