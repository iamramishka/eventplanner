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
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  hydrateCoupleBootstrap,
  syncCoupleSessionCache,
} from "@/lib/services/couple-supabase-bridge";

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
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/couple/onboarding", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
        state?: WeddingOnboardingState;
        bootstrap?: Parameters<typeof hydrateCoupleBootstrap>[0];
        session?: ReturnType<typeof getSession>;
      };

      if (!response.ok || !body.state) {
        throw new Error(body.message || "We couldn't create your wedding yet.");
      }

      if (body.session) {
        syncCoupleSessionCache(body.session);
      }

      if (body.bootstrap) {
        hydrateCoupleBootstrap(body.bootstrap);
      }

      return body.state;
    }

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
    if (isSupabaseConfigured()) {
      const sessionResponse = await fetch("/api/v1/auth/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!sessionResponse.ok) {
        return { status: "pending" };
      }

      const sessionPayload = (await sessionResponse.json()) as {
        session: { hasWedding?: boolean } | null;
      };

      return {
        status: sessionPayload.session?.hasWedding ? "completed" : "pending",
      };
    }

    await wait(150);
    const session = getSession();
    if (!session) {
      return { status: "pending" };
    }

    return { status: session.hasWedding ? "completed" : "pending" };
  },
};
