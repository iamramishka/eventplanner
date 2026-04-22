"use client";

import {
  getSession,
  getUsers,
  getWeddings,
  saveSession,
  saveUsers,
  saveWeddings,
} from "@/lib/services/browser-store";
import { WeddingOnboardingPayload, WeddingOnboardingState } from "@/types/public";

function wait(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildUniqueWeddingSlug(existingSlugs: string[], preferredValue: string) {
  const baseSlug = slugify(preferredValue) || `wedding-${Date.now()}`;

  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  let candidate = `${baseSlug}-${suffix}`;

  while (existingSlugs.includes(candidate)) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }

  return candidate;
}

export const onboardingService = {
  async createWedding(
    payload: WeddingOnboardingPayload,
  ): Promise<WeddingOnboardingState> {
    await wait();

    const session = getSession();
    if (!session) {
      throw new Error("Please sign in again before creating your wedding.");
    }

    const weddings = getWeddings();
    const weddingSlug = buildUniqueWeddingSlug(
      weddings.map((wedding) => wedding.weddingSlug),
      `${payload.partnerOneName}-${payload.partnerTwoName}`,
    );

    const nextWedding = {
      ...payload,
      userId: session.id,
      weddingSlug,
    };

    const remaining = weddings.filter((wedding) => wedding.userId !== session.id);
    remaining.unshift(nextWedding);
    saveWeddings(remaining);

    const users = getUsers().map((user) =>
      user.id === session.id ? { ...user, hasWedding: true } : user,
    );
    saveUsers(users);

    saveSession({ ...session, hasWedding: true });

    return {
      status: "completed",
      weddingSlug,
    };
  },

  async getCurrentState(): Promise<WeddingOnboardingState> {
    await wait(150);
    const session = getSession();
    if (!session) {
      return { status: "pending" };
    }

    return { status: session.hasWedding ? "completed" : "pending" };
  },
};
