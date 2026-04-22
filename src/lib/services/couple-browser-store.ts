"use client";

import {
  defaultChecklistItems,
  defaultInvitationWorkspace,
  defaultSubscriptionSnapshot,
  defaultWeddingSettings,
  coupleSupportEmail,
  seededAmayaAgenda,
  seededAmayaBudget,
  seededAmayaChecklist,
  seededAmayaGuests,
  seededAmayaInvitation,
  seededAmayaRsvpHistory,
  seededAmayaSettings,
  seededAmayaTableAssignments,
  seededAmayaTables,
  seededAmayaVendors,
} from "@/data/couple-mock";
import {
  AgendaItemRecord,
  BudgetItemRecord,
  ChecklistItemRecord,
  CoupleAccountSettings,
  CoupleSubscriptionSnapshot,
  CoupleWorkspaceContext,
  GuestRecord,
  GuestRsvpHistoryRecord,
  InvitationWorkspaceState,
  WeddingSettingsRecord,
  WeddingTableAssignmentRecord,
  WeddingTableRecord,
  WeddingVendorRecord,
} from "@/types/couple";
import { getSession, getWeddings, saveWeddings, StoredWedding } from "@/lib/services/browser-store";

type WorkspaceMap<T> = Record<string, T>;
type WorkspaceListMap<T> = Record<string, T[]>;

const COUPLE_SETTINGS_KEY = "vinyup-couple-settings";
const COUPLE_SUBSCRIPTIONS_KEY = "vinyup-couple-subscriptions";
const COUPLE_GUESTS_KEY = "vinyup-couple-guests";
const COUPLE_RSVPS_KEY = "vinyup-couple-rsvp-history";
const COUPLE_INVITATION_KEY = "vinyup-couple-invitation";
const COUPLE_AGENDA_KEY = "vinyup-couple-agenda";
const COUPLE_TABLES_KEY = "vinyup-couple-tables";
const COUPLE_ASSIGNMENTS_KEY = "vinyup-couple-table-assignments";
const COUPLE_BUDGET_KEY = "vinyup-couple-budget";
const COUPLE_CHECKLIST_KEY = "vinyup-couple-checklist";
const COUPLE_VENDORS_KEY = "vinyup-couple-vendors";

function ensureBrowser() {
  if (typeof window === "undefined") {
    throw new Error("Couple workspace storage is only available in the browser.");
  }
}

function readJson<T>(key: string, fallback: T): T {
  ensureBrowser();
  const rawValue = window.localStorage.getItem(key);

  if (!rawValue) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  ensureBrowser();
  window.localStorage.setItem(key, JSON.stringify(value));
}

const seededSettings: WorkspaceMap<WeddingSettingsRecord> = {
  "amaya-kavin": seededAmayaSettings,
};

const seededSubscriptions: WorkspaceMap<CoupleSubscriptionSnapshot> = {
  "amaya-kavin": defaultSubscriptionSnapshot("active"),
};

const seededGuests: WorkspaceListMap<GuestRecord> = {
  "amaya-kavin": seededAmayaGuests,
};

const seededRsvps: WorkspaceListMap<GuestRsvpHistoryRecord> = {
  "amaya-kavin": seededAmayaRsvpHistory,
};

const seededInvitation: WorkspaceMap<InvitationWorkspaceState> = {
  "amaya-kavin": seededAmayaInvitation,
};

const seededAgenda: WorkspaceListMap<AgendaItemRecord> = {
  "amaya-kavin": seededAmayaAgenda,
};

const seededTables: WorkspaceListMap<WeddingTableRecord> = {
  "amaya-kavin": seededAmayaTables,
};

const seededAssignments: WorkspaceListMap<WeddingTableAssignmentRecord> = {
  "amaya-kavin": seededAmayaTableAssignments,
};

const seededBudget: WorkspaceListMap<BudgetItemRecord> = {
  "amaya-kavin": seededAmayaBudget,
};

const seededChecklist: WorkspaceListMap<ChecklistItemRecord> = {
  "amaya-kavin": seededAmayaChecklist,
};

const seededVendors: WorkspaceListMap<WeddingVendorRecord> = {
  "amaya-kavin": seededAmayaVendors,
};

function updateStoredWedding(
  weddingSlug: string,
  updater: (wedding: StoredWedding) => StoredWedding,
) {
  const weddings = getWeddings().map((wedding) =>
    wedding.weddingSlug === weddingSlug ? updater(wedding) : wedding,
  );
  saveWeddings(weddings);
}

function initializeWeddingWorkspace(wedding: StoredWedding) {
  const settingsMap = readJson<WorkspaceMap<WeddingSettingsRecord>>(
    COUPLE_SETTINGS_KEY,
    seededSettings,
  );
  if (!settingsMap[wedding.weddingSlug]) {
    settingsMap[wedding.weddingSlug] = {
      ...defaultWeddingSettings(wedding.weddingSlug),
      partnerOneName: wedding.partnerOneName,
      partnerTwoName: wedding.partnerTwoName,
      eventDate: wedding.eventDate,
      dateTbd: wedding.dateTbd,
      venueName: wedding.venueName,
      venueTbd: wedding.venueTbd,
      estimatedGuests: wedding.estimatedGuests,
      estimatedBudget: wedding.estimatedBudget,
      weddingTitle: `${wedding.partnerOneName || "Our"} & ${wedding.partnerTwoName || "Wedding"}`,
    };
    writeJson(COUPLE_SETTINGS_KEY, settingsMap);
  }

  const subscriptionMap = readJson<WorkspaceMap<CoupleSubscriptionSnapshot>>(
    COUPLE_SUBSCRIPTIONS_KEY,
    seededSubscriptions,
  );
  if (!subscriptionMap[wedding.weddingSlug]) {
    subscriptionMap[wedding.weddingSlug] = defaultSubscriptionSnapshot("trial");
    writeJson(COUPLE_SUBSCRIPTIONS_KEY, subscriptionMap);
  }

  const invitationMap = readJson<WorkspaceMap<InvitationWorkspaceState>>(
    COUPLE_INVITATION_KEY,
    seededInvitation,
  );
  if (!invitationMap[wedding.weddingSlug]) {
    invitationMap[wedding.weddingSlug] = defaultInvitationWorkspace();
    writeJson(COUPLE_INVITATION_KEY, invitationMap);
  }

  const checklistMap = readJson<WorkspaceListMap<ChecklistItemRecord>>(
    COUPLE_CHECKLIST_KEY,
    seededChecklist,
  );
  if (!checklistMap[wedding.weddingSlug]) {
    checklistMap[wedding.weddingSlug] = defaultChecklistItems(wedding.weddingSlug);
    writeJson(COUPLE_CHECKLIST_KEY, checklistMap);
  }

  const listDefaults: Array<[string, WorkspaceListMap<unknown>]> = [
    [COUPLE_GUESTS_KEY, seededGuests],
    [COUPLE_RSVPS_KEY, seededRsvps],
    [COUPLE_AGENDA_KEY, seededAgenda],
    [COUPLE_TABLES_KEY, seededTables],
    [COUPLE_ASSIGNMENTS_KEY, seededAssignments],
    [COUPLE_BUDGET_KEY, seededBudget],
    [COUPLE_VENDORS_KEY, seededVendors],
  ];

  listDefaults.forEach(([key, fallback]) => {
    const map = readJson<Record<string, unknown[]>>(key, fallback as Record<string, unknown[]>);
    if (!map[wedding.weddingSlug]) {
      map[wedding.weddingSlug] = [];
      writeJson(key, map);
    }
  });
}

export function ensureCoupleWorkspaceStorage() {
  const weddings = getWeddings();
  weddings.forEach((wedding) => initializeWeddingWorkspace(wedding));
}

export function getCurrentCoupleContext(): CoupleWorkspaceContext {
  ensureCoupleWorkspaceStorage();
  const session = getSession();
  if (!session) {
    throw new Error("No active couple session.");
  }

  const wedding = getWeddings().find((item) => item.userId === session.id);
  if (!wedding) {
    throw new Error("No wedding workspace found for this account.");
  }

  return {
    userId: session.id,
    fullName: session.fullName,
    weddingSlug: wedding.weddingSlug,
  };
}

export function getStoredWeddingBySlug(weddingSlug: string) {
  ensureCoupleWorkspaceStorage();
  return getWeddings().find((item) => item.weddingSlug === weddingSlug) ?? null;
}

export function getWeddingSettingsMap() {
  ensureCoupleWorkspaceStorage();
  return readJson<WorkspaceMap<WeddingSettingsRecord>>(COUPLE_SETTINGS_KEY, seededSettings);
}

export function saveWeddingSettingsMap(value: WorkspaceMap<WeddingSettingsRecord>) {
  writeJson(COUPLE_SETTINGS_KEY, value);
}

export function syncWeddingSettingsToCore(settings: WeddingSettingsRecord) {
  updateStoredWedding(settings.weddingSlug, (wedding) => ({
    ...wedding,
    partnerOneName: settings.partnerOneName,
    partnerTwoName: settings.partnerTwoName,
    venueName: settings.venueName,
    venueTbd: settings.venueTbd,
    eventDate: settings.eventDate,
    dateTbd: settings.dateTbd,
    estimatedGuests: settings.estimatedGuests,
    estimatedBudget: settings.estimatedBudget,
  }));
}

export function getSubscriptionMap() {
  ensureCoupleWorkspaceStorage();
  return readJson<WorkspaceMap<CoupleSubscriptionSnapshot>>(
    COUPLE_SUBSCRIPTIONS_KEY,
    seededSubscriptions,
  );
}

export function saveSubscriptionMap(value: WorkspaceMap<CoupleSubscriptionSnapshot>) {
  writeJson(COUPLE_SUBSCRIPTIONS_KEY, value);
}

export function getGuestMap() {
  ensureCoupleWorkspaceStorage();
  return readJson<WorkspaceListMap<GuestRecord>>(COUPLE_GUESTS_KEY, seededGuests);
}

export function saveGuestMap(value: WorkspaceListMap<GuestRecord>) {
  writeJson(COUPLE_GUESTS_KEY, value);
}

export function getRsvpMap() {
  ensureCoupleWorkspaceStorage();
  return readJson<WorkspaceListMap<GuestRsvpHistoryRecord>>(COUPLE_RSVPS_KEY, seededRsvps);
}

export function saveRsvpMap(value: WorkspaceListMap<GuestRsvpHistoryRecord>) {
  writeJson(COUPLE_RSVPS_KEY, value);
}

export function getInvitationMap() {
  ensureCoupleWorkspaceStorage();
  return readJson<WorkspaceMap<InvitationWorkspaceState>>(COUPLE_INVITATION_KEY, seededInvitation);
}

export function saveInvitationMap(value: WorkspaceMap<InvitationWorkspaceState>) {
  writeJson(COUPLE_INVITATION_KEY, value);
}

export function getAgendaMap() {
  ensureCoupleWorkspaceStorage();
  return readJson<WorkspaceListMap<AgendaItemRecord>>(COUPLE_AGENDA_KEY, seededAgenda);
}

export function saveAgendaMap(value: WorkspaceListMap<AgendaItemRecord>) {
  writeJson(COUPLE_AGENDA_KEY, value);
}

export function getTableMap() {
  ensureCoupleWorkspaceStorage();
  return readJson<WorkspaceListMap<WeddingTableRecord>>(COUPLE_TABLES_KEY, seededTables);
}

export function saveTableMap(value: WorkspaceListMap<WeddingTableRecord>) {
  writeJson(COUPLE_TABLES_KEY, value);
}

export function getAssignmentMap() {
  ensureCoupleWorkspaceStorage();
  return readJson<WorkspaceListMap<WeddingTableAssignmentRecord>>(
    COUPLE_ASSIGNMENTS_KEY,
    seededAssignments,
  );
}

export function saveAssignmentMap(value: WorkspaceListMap<WeddingTableAssignmentRecord>) {
  writeJson(COUPLE_ASSIGNMENTS_KEY, value);
}

export function getBudgetMap() {
  ensureCoupleWorkspaceStorage();
  return readJson<WorkspaceListMap<BudgetItemRecord>>(COUPLE_BUDGET_KEY, seededBudget);
}

export function saveBudgetMap(value: WorkspaceListMap<BudgetItemRecord>) {
  writeJson(COUPLE_BUDGET_KEY, value);
}

export function getChecklistMap() {
  ensureCoupleWorkspaceStorage();
  return readJson<WorkspaceListMap<ChecklistItemRecord>>(COUPLE_CHECKLIST_KEY, seededChecklist);
}

export function saveChecklistMap(value: WorkspaceListMap<ChecklistItemRecord>) {
  writeJson(COUPLE_CHECKLIST_KEY, value);
}

export function getVendorMap() {
  ensureCoupleWorkspaceStorage();
  return readJson<WorkspaceListMap<WeddingVendorRecord>>(COUPLE_VENDORS_KEY, seededVendors);
}

export function saveVendorMap(value: WorkspaceListMap<WeddingVendorRecord>) {
  writeJson(COUPLE_VENDORS_KEY, value);
}

export function getCoupleAccountSettings(): CoupleAccountSettings {
  const context = getCurrentCoupleContext();
  const session = getSession();
  const subscription = getSubscriptionMap()[context.weddingSlug] ?? defaultSubscriptionSnapshot();

  return {
    fullName: session?.fullName ?? "",
    email: session?.email ?? "",
    plan: subscription,
    supportEmail: coupleSupportEmail,
  };
}
