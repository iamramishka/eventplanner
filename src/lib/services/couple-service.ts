"use client";

import { musicTracks } from "@/data/couple-mock";
import { formatCountdownLabel, buildOverviewFromMetrics } from "@/lib/couple-utils";
import {
  getAssignmentMap,
  getChecklistMap,
  getCoupleAccountSettings,
  getCurrentCoupleContext,
  getAgendaMap,
  getBudgetMap,
  getGuestMap,
  getInvitationMap,
  getRsvpMap,
  getStoredWeddingBySlug,
  getSubscriptionMap,
  getTableMap,
  getVendorMap,
  getWeddingSettingsMap,
  saveAgendaMap,
  saveAssignmentMap,
  saveBudgetMap,
  saveChecklistMap,
  saveGuestMap,
  saveInvitationMap,
  saveRsvpMap,
  saveTableMap,
  saveVendorMap,
  saveWeddingSettingsMap,
  syncWeddingSettingsToCore,
} from "@/lib/services/couple-browser-store";
import {
  AgendaItemRecord,
  BudgetItemRecord,
  ChecklistItemRecord,
  CoupleOverviewData,
  GalleryAsset,
  GuestRecord,
  GuestRsvpCurrent,
  GuestRsvpHistoryRecord,
  InvitationContentSection,
  InvitationThemeSettings,
  WeddingSettingsRecord,
  WeddingTableAssignmentRecord,
  WeddingTableRecord,
  WeddingVendorRecord,
} from "@/types/couple";

function wait(ms = 220) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nowIso() {
  return new Date().toISOString();
}

function buildId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, "");
}

function getWorkspaceData() {
  const context = getCurrentCoupleContext();
  const weddingSlug = context.weddingSlug;

  return {
    context,
    weddingSlug,
    weddingSettings: getWeddingSettingsMap()[weddingSlug],
    subscription: getSubscriptionMap()[weddingSlug],
    guests: getGuestMap()[weddingSlug] ?? [],
    rsvpHistory: getRsvpMap()[weddingSlug] ?? [],
    invitation: getInvitationMap()[weddingSlug],
    agenda: getAgendaMap()[weddingSlug] ?? [],
    tables: getTableMap()[weddingSlug] ?? [],
    assignments: getAssignmentMap()[weddingSlug] ?? [],
    budgetItems: getBudgetMap()[weddingSlug] ?? [],
    checklistItems: getChecklistMap()[weddingSlug] ?? [],
    vendors: getVendorMap()[weddingSlug] ?? [],
  };
}

function getLatestRsvpsForGuests(
  guests: GuestRecord[],
  history: GuestRsvpHistoryRecord[],
): GuestRsvpCurrent[] {
  return guests.map((guest) => {
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
  });
}

export const coupleService = {
  async getDashboardOverview(): Promise<CoupleOverviewData> {
    await wait();
    const { weddingSettings, guests, rsvpHistory, budgetItems, checklistItems, tables } =
      getWorkspaceData();

    const latestRsvps = getLatestRsvpsForGuests(guests, rsvpHistory);
    const confirmedGuests = latestRsvps.filter((item) => item.status === "confirmed");
    const pendingGuests = latestRsvps.filter((item) => item.status === "pending");
    const declinedGuests = latestRsvps.filter((item) => item.status === "declined");

    const recentActivity = [...rsvpHistory]
      .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        title: `RSVP updated for ${
          guests.find((guest) => guest.id === item.guestId)?.name ?? "Guest"
        }`,
        description: `${item.status} · ${item.attendingCount} attending`,
        timestamp: item.submittedAt,
      }));

    return buildOverviewFromMetrics({
      guestCount: guests.length,
      confirmedGuests: confirmedGuests.length,
      pendingGuests: pendingGuests.length,
      declinedGuests: declinedGuests.length,
      attendingHeadcount: confirmedGuests.reduce(
        (total, item) => total + item.attendingCount,
        0,
      ),
      budgetEstimated: budgetItems.reduce((total, item) => total + item.estimatedAmount, 0),
      budgetActual: budgetItems.reduce((total, item) => total + item.actualAmount, 0),
      budgetPaid: budgetItems.reduce((total, item) => total + item.paidAmount, 0),
      checklistCompleted: checklistItems.filter((item) => item.isCompleted).length,
      checklistTotal: checklistItems.length,
      tableCount: tables.length,
      countdownLabel: formatCountdownLabel(weddingSettings?.eventDate),
      recentActivity,
    });
  },

  async getWeddingSettings() {
    await wait();
    return getWorkspaceData().weddingSettings;
  },

  async updateWeddingSettings(payload: WeddingSettingsRecord) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getWeddingSettingsMap();
    map[weddingSlug] = { ...payload, weddingSlug };
    saveWeddingSettingsMap(map);
    syncWeddingSettingsToCore(map[weddingSlug]);
    return map[weddingSlug];
  },

  async getSubscription() {
    await wait();
    return getWorkspaceData().subscription;
  },

  async getGuests() {
    await wait();
    return getWorkspaceData().guests.sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  },

  async upsertGuest(
    payload: Omit<GuestRecord, "id" | "weddingSlug" | "inviteToken" | "createdAt" | "updatedAt"> & {
      id?: string;
    },
  ) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getGuestMap();
    const guests = map[weddingSlug] ?? [];
    const normalizedPhone = normalizePhone(payload.whatsappNumber);

    if (!payload.name.trim()) {
      throw new Error("Guest name is required.");
    }

    if (!normalizedPhone) {
      throw new Error("A valid WhatsApp number is required.");
    }

    if (payload.maxAllowedMembers < 1) {
      throw new Error("Max allowed members must be at least 1.");
    }

    const duplicate = guests.find(
      (guest) =>
        guest.id !== payload.id &&
        normalizePhone(guest.whatsappNumber) === normalizedPhone,
    );

    if (duplicate) {
      throw new Error("This WhatsApp number already exists in your guest list.");
    }

    const nextRecord: GuestRecord = payload.id
      ? {
          ...(guests.find((item) => item.id === payload.id) as GuestRecord),
          ...payload,
          weddingSlug,
          whatsappNumber: normalizedPhone,
          updatedAt: nowIso(),
        }
      : {
          ...payload,
          id: buildId("guest"),
          weddingSlug,
          whatsappNumber: normalizedPhone,
          inviteToken: `INV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };

    map[weddingSlug] = payload.id
      ? guests.map((item) => (item.id === payload.id ? nextRecord : item))
      : [nextRecord, ...guests];
    saveGuestMap(map);
    return map[weddingSlug];
  },

  async deleteGuest(guestId: string) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const guestMap = getGuestMap();
    guestMap[weddingSlug] = (guestMap[weddingSlug] ?? []).filter((item) => item.id !== guestId);
    saveGuestMap(guestMap);

    const rsvpMap = getRsvpMap();
    rsvpMap[weddingSlug] = (rsvpMap[weddingSlug] ?? []).filter((item) => item.guestId !== guestId);
    saveRsvpMap(rsvpMap);

    const assignmentMap = getAssignmentMap();
    assignmentMap[weddingSlug] = (assignmentMap[weddingSlug] ?? []).filter(
      (item) => item.guestId !== guestId,
    );
    saveAssignmentMap(assignmentMap);
    return guestMap[weddingSlug];
  },

  async sendInvite(guestId: string) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getGuestMap();
    map[weddingSlug] = (map[weddingSlug] ?? []).map((item) =>
      item.id === guestId ? { ...item, lastInviteSentAt: nowIso(), updatedAt: nowIso() } : item,
    );
    saveGuestMap(map);
    return map[weddingSlug];
  },

  async getInviteLink(guestId: string) {
    await wait(80);
    const wedding = getStoredWeddingBySlug(getWorkspaceData().weddingSlug);
    const guest = getWorkspaceData().guests.find((item) => item.id === guestId);
    if (!guest || !wedding) {
      throw new Error("Invite link could not be generated.");
    }
    return `${window.location.origin}/w/${wedding.weddingSlug}?invite=${guest.inviteToken}`;
  },

  async getRsvps() {
    await wait();
    const { guests, rsvpHistory } = getWorkspaceData();
    return getLatestRsvpsForGuests(guests, rsvpHistory);
  },

  async getRsvpHistory(guestId: string) {
    await wait();
    return getWorkspaceData()
      .rsvpHistory.filter((item) => item.guestId === guestId)
      .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt));
  },

  async updateRsvpManual(
    guestId: string,
    payload: Omit<GuestRsvpHistoryRecord, "id" | "weddingSlug" | "guestId" | "submittedAt" | "source">,
  ) {
    await wait();
    const { weddingSlug, guests } = getWorkspaceData();
    const guest = guests.find((item) => item.id === guestId);

    if (!guest) {
      throw new Error("Guest not found.");
    }

    if (payload.attendingCount > guest.maxAllowedMembers) {
      throw new Error("Attending count cannot exceed the allowed guest count.");
    }

    const map = getRsvpMap();
    const nextEntry: GuestRsvpHistoryRecord = {
      id: buildId("rsvp"),
      weddingSlug,
      guestId,
      submittedAt: nowIso(),
      source: "couple",
      ...payload,
    };
    map[weddingSlug] = [nextEntry, ...(map[weddingSlug] ?? [])];
    saveRsvpMap(map);
    return map[weddingSlug];
  },

  async getInvitationWorkspace() {
    await wait();
    return getWorkspaceData().invitation;
  },

  async updateInvitationSection(section: InvitationContentSection) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getInvitationMap();
    const current = map[weddingSlug];
    map[weddingSlug] = {
      ...current,
      sections: current.sections.map((item) => (item.key === section.key ? section : item)),
      publishState: {
        ...current.publishState,
        hasUnpublishedChanges: true,
        lastDraftSavedAt: nowIso(),
      },
    };
    saveInvitationMap(map);
    return map[weddingSlug];
  },

  async updateInvitationVisibility(key: string, enabled: boolean) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getInvitationMap();
    const current = map[weddingSlug];
    map[weddingSlug] = {
      ...current,
      visibility: current.visibility.map((item) =>
        item.key === key ? { ...item, enabled } : item,
      ),
      publishState: {
        ...current.publishState,
        hasUnpublishedChanges: true,
        lastDraftSavedAt: nowIso(),
      },
    };
    saveInvitationMap(map);
    return map[weddingSlug];
  },

  async updateInvitationTheme(theme: InvitationThemeSettings) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getInvitationMap();
    const current = map[weddingSlug];
    map[weddingSlug] = {
      ...current,
      theme,
      publishState: {
        ...current.publishState,
        hasUnpublishedChanges: true,
        lastDraftSavedAt: nowIso(),
      },
    };
    saveInvitationMap(map);
    return map[weddingSlug];
  },

  async addGalleryAsset(asset: Omit<GalleryAsset, "id" | "weddingSlug" | "sortOrder" | "createdAt" | "isCover">) {
    await wait();
    const { weddingSlug, subscription } = getWorkspaceData();
    const map = getInvitationMap();
    const current = map[weddingSlug];
    if (current.gallery.length >= subscription.imageLimit) {
      throw new Error("Your current plan image limit has been reached.");
    }
    const nextAsset: GalleryAsset = {
      ...asset,
      id: buildId("gallery"),
      weddingSlug,
      isCover: current.gallery.length === 0,
      sortOrder: current.gallery.length,
      createdAt: nowIso(),
    };
    map[weddingSlug] = {
      ...current,
      gallery: [...current.gallery, nextAsset],
      publishState: {
        ...current.publishState,
        hasUnpublishedChanges: true,
        lastDraftSavedAt: nowIso(),
      },
    };
    saveInvitationMap(map);
    return map[weddingSlug];
  },

  async removeGalleryAsset(assetId: string) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getInvitationMap();
    const current = map[weddingSlug];
    const remaining = current.gallery
      .filter((item) => item.id !== assetId)
      .map((item, index) => ({ ...item, sortOrder: index, isCover: index === 0 }));
    map[weddingSlug] = {
      ...current,
      gallery: remaining,
      publishState: {
        ...current.publishState,
        hasUnpublishedChanges: true,
        lastDraftSavedAt: nowIso(),
      },
    };
    saveInvitationMap(map);
    return map[weddingSlug];
  },

  async setGalleryCover(assetId: string) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getInvitationMap();
    const current = map[weddingSlug];
    map[weddingSlug] = {
      ...current,
      gallery: current.gallery.map((item) => ({
        ...item,
        isCover: item.id === assetId,
      })),
      publishState: {
        ...current.publishState,
        hasUnpublishedChanges: true,
        lastDraftSavedAt: nowIso(),
      },
    };
    saveInvitationMap(map);
    return map[weddingSlug];
  },

  async updateMusicSettings(payload: {
    enabled: boolean;
    mutedByDefault: boolean;
    trackId: string;
  }) {
    await wait();
    if (!musicTracks.find((item) => item.id === payload.trackId)) {
      throw new Error("Please choose a valid music track.");
    }
    const { weddingSlug } = getWorkspaceData();
    const map = getInvitationMap();
    const current = map[weddingSlug];
    map[weddingSlug] = {
      ...current,
      music: payload,
      publishState: {
        ...current.publishState,
        hasUnpublishedChanges: true,
        lastDraftSavedAt: nowIso(),
      },
    };
    saveInvitationMap(map);
    return map[weddingSlug];
  },

  async publishInvitation() {
    await wait(320);
    const { weddingSlug } = getWorkspaceData();
    const map = getInvitationMap();
    const current = map[weddingSlug];
    if (!current.sections.find((item) => item.key === "hero")?.body.trim()) {
      throw new Error("Add your main invitation message before publishing.");
    }
    map[weddingSlug] = {
      ...current,
      publishState: {
        hasUnpublishedChanges: false,
        lastDraftSavedAt: current.publishState.lastDraftSavedAt ?? nowIso(),
        lastPublishedAt: nowIso(),
      },
    };
    saveInvitationMap(map);
    return map[weddingSlug];
  },

  async getAgenda() {
    await wait();
    return [...getWorkspaceData().agenda].sort((left, right) => left.sortOrder - right.sortOrder);
  },

  async upsertAgenda(
    payload: Omit<AgendaItemRecord, "id" | "weddingSlug" | "sortOrder"> & { id?: string },
  ) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getAgendaMap();
    const items = map[weddingSlug] ?? [];
    const nextItem: AgendaItemRecord = payload.id
      ? {
          ...(items.find((item) => item.id === payload.id) as AgendaItemRecord),
          ...payload,
          weddingSlug,
        }
      : {
          ...payload,
          id: buildId("agenda"),
          weddingSlug,
          sortOrder: items.length,
        };

    map[weddingSlug] = payload.id
      ? items.map((item) => (item.id === payload.id ? nextItem : item))
      : [...items, nextItem];
    saveAgendaMap(map);
    return map[weddingSlug];
  },

  async deleteAgenda(id: string) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getAgendaMap();
    map[weddingSlug] = (map[weddingSlug] ?? []).filter((item) => item.id !== id);
    saveAgendaMap(map);
    return map[weddingSlug];
  },

  async getTables() {
    await wait();
    return {
      tables: [...getWorkspaceData().tables].sort((left, right) => left.sortOrder - right.sortOrder),
      assignments: getWorkspaceData().assignments,
    };
  },

  async upsertTable(
    payload: Omit<WeddingTableRecord, "id" | "weddingSlug" | "sortOrder"> & { id?: string },
  ) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getTableMap();
    const items = map[weddingSlug] ?? [];
    const nextItem: WeddingTableRecord = payload.id
      ? {
          ...(items.find((item) => item.id === payload.id) as WeddingTableRecord),
          ...payload,
          weddingSlug,
        }
      : {
          ...payload,
          id: buildId("table"),
          weddingSlug,
          sortOrder: items.length,
        };

    map[weddingSlug] = payload.id
      ? items.map((item) => (item.id === payload.id ? nextItem : item))
      : [...items, nextItem];
    saveTableMap(map);
    return map[weddingSlug];
  },

  async deleteTable(id: string) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const tableMap = getTableMap();
    tableMap[weddingSlug] = (tableMap[weddingSlug] ?? []).filter((item) => item.id !== id);
    saveTableMap(tableMap);

    const assignmentMap = getAssignmentMap();
    assignmentMap[weddingSlug] = (assignmentMap[weddingSlug] ?? []).filter(
      (item) => item.tableId !== id,
    );
    saveAssignmentMap(assignmentMap);
    return {
      tables: tableMap[weddingSlug],
      assignments: assignmentMap[weddingSlug],
    };
  },

  async assignGuestToTable(payload: {
    tableId: string;
    guestId: string;
    assignedCount: number;
  }) {
    await wait();
    const { weddingSlug, tables, guests, rsvpHistory } = getWorkspaceData();
    const table = tables.find((item) => item.id === payload.tableId);
    const guest = guests.find((item) => item.id === payload.guestId);
    if (!table || !guest) {
      throw new Error("Table or guest not found.");
    }

    const latestRsvp = getLatestRsvpsForGuests([guest], rsvpHistory)[0];
    if (latestRsvp.status !== "confirmed") {
      throw new Error("Only confirmed guests can be assigned to tables.");
    }
    if (payload.assignedCount > latestRsvp.attendingCount) {
      throw new Error("Assigned count cannot exceed confirmed attending count.");
    }

    const assignmentMap = getAssignmentMap();
    const assignments = assignmentMap[weddingSlug] ?? [];
    const existingTableAssignments = assignments.filter((item) => item.tableId === payload.tableId);
    const usedCapacity = existingTableAssignments.reduce(
      (total, item) =>
        total +
        (item.guestId === payload.guestId ? 0 : item.assignedCount),
      0,
    );

    if (usedCapacity + payload.assignedCount > table.capacity) {
      throw new Error("This table does not have enough remaining capacity.");
    }

    const existingForGuest = assignments.find((item) => item.guestId === payload.guestId);
    const nextAssignment: WeddingTableAssignmentRecord = existingForGuest
      ? {
          ...existingForGuest,
          tableId: payload.tableId,
          assignedCount: payload.assignedCount,
        }
      : {
          id: buildId("assignment"),
          weddingSlug,
          guestId: payload.guestId,
          tableId: payload.tableId,
          assignedCount: payload.assignedCount,
        };

    assignmentMap[weddingSlug] = existingForGuest
      ? assignments.map((item) => (item.guestId === payload.guestId ? nextAssignment : item))
      : [...assignments, nextAssignment];
    saveAssignmentMap(assignmentMap);
    return assignmentMap[weddingSlug];
  },

  async removeTableAssignment(guestId: string) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getAssignmentMap();
    map[weddingSlug] = (map[weddingSlug] ?? []).filter((item) => item.guestId !== guestId);
    saveAssignmentMap(map);
    return map[weddingSlug];
  },

  async getBudgetItems() {
    await wait();
    return getWorkspaceData().budgetItems;
  },

  async upsertBudgetItem(
    payload: Omit<BudgetItemRecord, "id" | "weddingSlug"> & { id?: string },
  ) {
    await wait();
    if (payload.estimatedAmount < 0 || payload.actualAmount < 0 || payload.paidAmount < 0) {
      throw new Error("Budget amounts cannot be negative.");
    }
    if (payload.paidAmount > payload.actualAmount && payload.actualAmount > 0) {
      throw new Error("Paid amount cannot exceed the actual amount.");
    }
    const { weddingSlug } = getWorkspaceData();
    const map = getBudgetMap();
    const items = map[weddingSlug] ?? [];
    const nextItem: BudgetItemRecord = payload.id
      ? {
          ...(items.find((item) => item.id === payload.id) as BudgetItemRecord),
          ...payload,
          weddingSlug,
        }
      : {
          ...payload,
          id: buildId("budget"),
          weddingSlug,
        };
    map[weddingSlug] = payload.id
      ? items.map((item) => (item.id === payload.id ? nextItem : item))
      : [nextItem, ...items];
    saveBudgetMap(map);
    return map[weddingSlug];
  },

  async deleteBudgetItem(id: string) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getBudgetMap();
    map[weddingSlug] = (map[weddingSlug] ?? []).filter((item) => item.id !== id);
    saveBudgetMap(map);
    return map[weddingSlug];
  },

  async getChecklistItems() {
    await wait();
    return getWorkspaceData().checklistItems;
  },

  async upsertChecklistItem(
    payload: Omit<ChecklistItemRecord, "id" | "weddingSlug"> & { id?: string },
  ) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getChecklistMap();
    const items = map[weddingSlug] ?? [];
    const nextItem: ChecklistItemRecord = payload.id
      ? {
          ...(items.find((item) => item.id === payload.id) as ChecklistItemRecord),
          ...payload,
          weddingSlug,
        }
      : {
          ...payload,
          id: buildId("task"),
          weddingSlug,
        };
    map[weddingSlug] = payload.id
      ? items.map((item) => (item.id === payload.id ? nextItem : item))
      : [nextItem, ...items];
    saveChecklistMap(map);
    return map[weddingSlug];
  },

  async toggleChecklistItem(id: string) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getChecklistMap();
    map[weddingSlug] = (map[weddingSlug] ?? []).map((item) =>
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item,
    );
    saveChecklistMap(map);
    return map[weddingSlug];
  },

  async deleteChecklistItem(id: string) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getChecklistMap();
    map[weddingSlug] = (map[weddingSlug] ?? []).filter((item) => item.id !== id);
    saveChecklistMap(map);
    return map[weddingSlug];
  },

  async getVendors() {
    await wait();
    return getWorkspaceData().vendors;
  },

  async upsertVendor(
    payload: Omit<WeddingVendorRecord, "id" | "weddingSlug"> & { id?: string },
  ) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getVendorMap();
    const items = map[weddingSlug] ?? [];
    const nextItem: WeddingVendorRecord = payload.id
      ? {
          ...(items.find((item) => item.id === payload.id) as WeddingVendorRecord),
          ...payload,
          weddingSlug,
        }
      : {
          ...payload,
          id: buildId("vendor"),
          weddingSlug,
        };
    map[weddingSlug] = payload.id
      ? items.map((item) => (item.id === payload.id ? nextItem : item))
      : [nextItem, ...items];
    saveVendorMap(map);
    return map[weddingSlug];
  },

  async deleteVendor(id: string) {
    await wait();
    const { weddingSlug } = getWorkspaceData();
    const map = getVendorMap();
    map[weddingSlug] = (map[weddingSlug] ?? []).filter((item) => item.id !== id);
    saveVendorMap(map);
    return map[weddingSlug];
  },

  async getAccountSettings() {
    await wait();
    return getCoupleAccountSettings();
  },

  async getPreviewLink() {
    await wait(80);
    const theme = getWorkspaceData().invitation.theme;
    return `/demo/${theme.preset}?from=couple-dashboard`;
  },

  async getAvailableMusicTracks() {
    await wait(50);
    return musicTracks;
  },
};
