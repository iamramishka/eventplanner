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

function wait(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const authService = {
  async register(payload: SignupPayload): Promise<SessionUser> {
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
    await wait(120);
    return readSession();
  },

  async signOut() {
    await wait(120);
    saveSession(null);
  },
};
