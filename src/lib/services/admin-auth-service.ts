"use client";

import {
  getAdminCredentials,
  getAdminSession,
  saveAdminSession,
} from "@/lib/services/admin-browser-store";
import { AdminLoginPayload, AdminSession } from "@/types/admin";
import { getAdminAccounts } from "@/lib/services/shared-auth-store";

function wait(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const adminAuthService = {
  async login(payload: AdminLoginPayload): Promise<AdminSession> {
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
    await wait(80);
    return getAdminSession();
  },

  async logout() {
    await wait(120);
    saveAdminSession(null);
  },
};
