"use client";

import {
  getSession as readSession,
  getUsers,
  saveSession,
  saveUsers,
  toSessionUser,
} from "@/lib/services/browser-store";
import { SessionUser, SigninPayload, SignupPayload } from "@/types/public";
import { CoupleAccount } from "@/types/auth";
import { getAuthAccounts, normalizeAuthEmail } from "@/lib/services/shared-auth-store";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  hydrateCoupleBootstrap,
  syncCoupleSessionCache,
} from "@/lib/services/couple-supabase-bridge";

function wait(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

async function hydrateCoupleStateIfNeeded(session: SessionUser | null) {
  syncCoupleSessionCache(session);

  if (
    !session ||
    !session.hasWedding ||
    session.accountStatus !== "active" ||
    session.subscriptionStatus === "suspended" ||
    !isSupabaseConfigured()
  ) {
    return;
  }

  const response = await fetch("/api/v1/couple/bootstrap", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return;
  }

  const payload = (await response.json()) as {
    bootstrap?: Parameters<typeof hydrateCoupleBootstrap>[0] | null;
  };

  if (payload.bootstrap) {
    hydrateCoupleBootstrap(payload.bootstrap);
  }
}

export const authService = {
  async register(payload: SignupPayload): Promise<SessionUser> {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "couple",
          fullName: payload.fullName,
          email: payload.email,
          password: payload.password,
        }),
      });

      const data = await parseJson<{ session: SessionUser }>(response);
      await hydrateCoupleStateIfNeeded(data.session);
      return data.session;
    }

    await wait();

    const fullName = payload.fullName.trim();
    const email = normalizeAuthEmail(payload.email);
    const password = payload.password.trim();

    if (!fullName || !email || !password) {
      throw new Error("Please complete all required fields.");
    }

    if (password !== payload.confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const users = getUsers();
    if (getAuthAccounts().some((account) => normalizeAuthEmail(account.email) === email)) {
      throw new Error("An account with this email already exists.");
    }

    const nextUser: CoupleAccount = {
      id: `user-${Date.now()}`,
      fullName,
      email,
      password,
      role: "couple",
      hasWedding: false,
    };

    const sessionUser = toSessionUser(nextUser);

    saveUsers([nextUser, ...users]);
    saveSession(sessionUser);
    return sessionUser;
  },

  async login(payload: SigninPayload): Promise<SessionUser> {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await parseJson<{ session: SessionUser }>(response);
      await hydrateCoupleStateIfNeeded(data.session);
      return data.session;
    }

    await wait();

    const email = normalizeAuthEmail(payload.email);
    const password = payload.password.trim();
    const user = getUsers().find(
      (entry) => normalizeAuthEmail(entry.email) === email && entry.password === password,
    );

    if (!user) {
      throw new Error("We couldn't match that email and password.");
    }

    const sessionUser = toSessionUser(user);
    saveSession(sessionUser);
    return sessionUser;
  },

  async getSession() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/auth/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as { session: SessionUser | null };
      await hydrateCoupleStateIfNeeded(data.session);
      return data.session;
    }

    await wait(120);
    return readSession();
  },

  async signOut() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message || "Unable to sign out.");
      }

      syncCoupleSessionCache(null);
      return;
    }

    await wait(120);
    saveSession(null);
  },
};
