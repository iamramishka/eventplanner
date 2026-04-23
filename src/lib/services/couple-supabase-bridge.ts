"use client";

import { defaultChecklistItems } from "@/data/couple-mock";
import { StoredWedding, getWeddings, saveSession, saveWeddings } from "@/lib/services/browser-store";
import {
  getChecklistMap,
  getInvitationMap,
  getSubscriptionMap,
  getWeddingSettingsMap,
  saveChecklistMap,
  saveInvitationMap,
  saveSubscriptionMap,
  saveWeddingSettingsMap,
} from "@/lib/services/couple-browser-store";
import type { AppSession } from "@/types/auth";
import type {
  CoupleSubscriptionSnapshot,
  InvitationWorkspaceState,
  WeddingSettingsRecord,
} from "@/types/couple";

type CoupleBootstrapPayload = {
  wedding: StoredWedding;
  settings: WeddingSettingsRecord;
  subscription: CoupleSubscriptionSnapshot;
  invitation: InvitationWorkspaceState;
};

export function syncCoupleSessionCache(session: AppSession | null) {
  if (!session || session.role !== "couple") {
    saveSession(null);
    return;
  }

  saveSession(session);
}

export function hydrateCoupleBootstrap(payload: CoupleBootstrapPayload) {
  const weddings = getWeddings().filter((item) => item.userId !== payload.wedding.userId);
  saveWeddings([payload.wedding, ...weddings]);

  const settingsMap = getWeddingSettingsMap();
  settingsMap[payload.wedding.weddingSlug] = payload.settings;
  saveWeddingSettingsMap(settingsMap);

  const subscriptionMap = getSubscriptionMap();
  subscriptionMap[payload.wedding.weddingSlug] = payload.subscription;
  saveSubscriptionMap(subscriptionMap);

  const invitationMap = getInvitationMap();
  invitationMap[payload.wedding.weddingSlug] = payload.invitation;
  saveInvitationMap(invitationMap);

  const checklistMap = getChecklistMap();
  if (!checklistMap[payload.wedding.weddingSlug]) {
    checklistMap[payload.wedding.weddingSlug] = defaultChecklistItems(payload.wedding.weddingSlug);
    saveChecklistMap(checklistMap);
  }
}
