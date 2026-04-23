"use client";

import {
  getAdminCredentials,
  getAdminSession,
  saveAdminSession,
} from "@/lib/services/admin-browser-store";
import { AdminLoginPayload, AdminSession } from "@/types/admin";
import { getAdminAccounts } from "@/lib/services/shared-auth-store";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function wait(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const adminAuthService = {
  async login(payload: AdminLoginPayload): Promise<AdminSession> {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
        session?: AdminSession;
      };

      if (!response.ok || !body.session) {
        throw new Error(body.message || "Invalid admin credentials.");
      }

      if (body.session.role !== "super_admin") {
        throw new Error("This account does not have super admin access.");
      }

      saveAdminSession(body.session);
      return body.session;
    }

    await wait();

    const credentials = getAdminCredentials();
    const email = payload.email.trim().toLowerCase();
    const password = payload.password.trim();

    if (
      email !== credentials.email.toLowerCase() ||
      password !== credentials.password
    ) {
      throw new Error("Invalid admin credentials.");
    }

    const account = getAdminAccounts()[0];
    const session: AdminSession = {
      id: account?.id ?? "admin-1",
      adminId: account?.adminId ?? "admin-1",
      fullName: account?.fullName ?? "Platform Owner",
      email: credentials.email,
      role: "super_admin",
      lastLoginAt: new Date().toISOString(),
    };

    saveAdminSession(session);
    return session;
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

      const body = (await response.json()) as { session: AdminSession | null };
      const session = body.session?.role === "super_admin" ? body.session : null;
      saveAdminSession(session);
      return session;
    }

    await wait(80);
    return getAdminSession();
  },

  async logout() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message || "Unable to sign out.");
      }

      saveAdminSession(null);
      return;
    }

    await wait(120);
    saveAdminSession(null);
  },
};
