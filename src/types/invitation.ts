import {
  AgendaItemRecord,
  GalleryAsset,
  GuestRsvpCurrent,
  GuestRsvpStatus,
  InvitationWorkspaceState,
  LiquorPreference,
  MealPreference,
} from "@/types/couple";

export type InvitationRenderStatus = "ready" | "not-found" | "unpublished" | "locked";

export type InvitationGuestContext = {
  guestId: string;
  guestName: string;
  inviteToken: string;
  side: "Bride" | "Groom";
  maxAllowedMembers: number;
  existingRsvp: GuestRsvpCurrent;
  tableAssignment?: {
    tableId: string;
    tableName: string;
    assignedCount: number;
  };
};

export type InvitationGuestPreview = {
  confirmedCount: number;
  names: string[];
};

export type InvitationPageData = {
  status: InvitationRenderStatus;
  weddingSlug: string;
  coupleNames: string;
  displayTitle: string;
  eventDate?: string;
  venueName?: string;
  venueMapLink?: string;
  contactPhone?: string;
  introMessage?: string;
  lockedTitle?: string;
  lockedMessage?: string;
  invitation: InvitationWorkspaceState;
  agenda: AgendaItemRecord[];
  gallery: GalleryAsset[];
  coverImage: string;
  guestPreview: InvitationGuestPreview;
  guestContext?: InvitationGuestContext;
};

export type InvitationRsvpInput = {
  status: GuestRsvpStatus;
  attendingCount: number;
  mealPreference: MealPreference;
  liquorPreference: LiquorPreference;
  specialNote: string;
};

export type InvitationTableLookupResult =
  | {
      status: "found";
      guestName: string;
      tableName: string;
      assignedCount: number;
    }
  | {
      status: "not-found";
      message: string;
    }
  | {
      status: "unavailable";
      message: string;
    };
