"use client";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  appendAdminAuditLog,
  getAdminAuditLogs,
  getAdminCms,
  getAdminCouples,
  getAdminPlans,
  getAdminReports,
  getAdminSession,
  getAdminSettings,
  getAdminSupportInquiries,
  getAdminSystemLogs,
  getAdminTemplates,
  getAdminTrials,
  getAdminVendors,
  saveAdminCms,
  saveAdminCouples,
  saveAdminPlans,
  saveAdminSettings,
  saveAdminSupportInquiries,
  saveAdminTemplates,
  saveAdminTrials,
  saveAdminVendors,
} from "@/lib/services/admin-browser-store";
import {
  AdminActivityItem,
  AdminOverviewData,
  CoupleRecord,
  PlanRecord,
  VendorRecord,
} from "@/types/admin";

async function parseJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

function wait(ms = 240) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isoNow() {
  return new Date().toISOString();
}

function appendAudit(action: string, targetType: string, targetLabel: string, reason: string) {
  const session = getAdminSession();

  appendAdminAuditLog({
    id: `audit-${Date.now()}`,
    actorName: session?.fullName ?? "Unknown admin",
    action,
    targetType,
    targetLabel,
    reason,
    timestamp: isoNow(),
  });
}

function formatMetricNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export const adminService = {
  async getOverview(): Promise<AdminOverviewData> {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/admin/dashboard", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ overview: AdminOverviewData }>(response);
      return data.overview;
    }

    await wait();

    const couples = getAdminCouples();
    const vendors = getAdminVendors();
    const trials = getAdminTrials();
    const logs = getAdminSystemLogs();
    const audit = getAdminAuditLogs();

    const metrics = [
      {
        label: "Total Couples",
        value: formatMetricNumber(couples.length),
        change: "+12 this week",
        tone: "info" as const,
      },
      {
        label: "Active Weddings",
        value: formatMetricNumber(
          couples.filter((item) => item.status === "active" || item.status === "trial").length,
        ),
        change: "78% healthy",
        tone: "success" as const,
      },
      {
        label: "Pending Vendors",
        value: formatMetricNumber(vendors.filter((item) => item.status === "pending").length),
        change: "Needs review",
        tone: "warning" as const,
      },
      {
        label: "Expired Trials",
        value: formatMetricNumber(
          trials.filter((item) => item.status === "expired" || item.status === "grace").length,
        ),
        change: "2 cleanup candidates",
        tone: "danger" as const,
      },
    ];

    const alerts: AdminActivityItem[] = [
      {
        id: "alert-1",
        title: "Vendor approvals waiting",
        description: `${vendors.filter((item) => item.status === "pending").length} vendor applications need review.`,
        timestamp: isoNow(),
        tone: "warning",
      },
      {
        id: "alert-2",
        title: "Cleanup review needed",
        description: `${trials.filter((item) => item.status === "expired").length} expired trials can be moved to cleanup.`,
        timestamp: isoNow(),
        tone: "danger",
      },
      {
        id: "alert-3",
        title: "System health stable",
        description: `${logs.filter((item) => item.level === "error").length} critical runtime errors in the latest snapshot.`,
        timestamp: isoNow(),
        tone: "info",
      },
    ];

    return {
      metrics,
      alerts,
      recentActions: audit.slice(0, 6),
    };
  },

  async getCouples() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/admin/couples", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ couples: CoupleRecord[] }>(response);
      return data.couples;
    }

    await wait();
    return getAdminCouples();
  },

  async updateCoupleStatus(id: string, status: CoupleRecord["status"], reason: string) {
    if (isSupabaseConfigured()) {
      const response = await fetch(`/api/admin/couples/${id}/status`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, reason }),
      });

      await parseJson<{ ok: boolean }>(response);
      return adminService.getCouples();
    }

    await wait();
    const couples = getAdminCouples().map((item) =>
      item.id === id ? { ...item, status } : item,
    );
    const target = couples.find((item) => item.id === id);
    saveAdminCouples(couples);
    if (target) {
      appendAudit("Updated couple status", "couple", target.fullName, reason);
    }
    return couples;
  },

  async extendTrial(coupleId: string, extraDays: number, reason: string) {
    if (isSupabaseConfigured()) {
      const response = await fetch(`/api/admin/couples/${coupleId}/extend-trial`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ extraDays, reason }),
      });

      await parseJson<{ ok: boolean }>(response);
      return adminService.getTrials();
    }

    await wait();
    const trials = getAdminTrials().map((item) => {
      if (item.coupleId !== coupleId) {
        return item;
      }

      const endsAt = new Date(item.endsAt);
      endsAt.setDate(endsAt.getDate() + extraDays);
      const graceEndsAt = new Date(item.graceEndsAt);
      graceEndsAt.setDate(graceEndsAt.getDate() + extraDays);

      return {
        ...item,
        endsAt: endsAt.toISOString(),
        graceEndsAt: graceEndsAt.toISOString(),
        status: "active" as const,
      };
    });

    saveAdminTrials(trials);

    const couples = getAdminCouples().map((item) =>
      item.id === coupleId
        ? { ...item, status: "trial" as const, trialEndsAt: trials.find((trial) => trial.coupleId === coupleId)?.endsAt }
        : item,
    );
    const target = couples.find((item) => item.id === coupleId);
    saveAdminCouples(couples);

    if (target) {
      appendAudit("Extended trial", "couple", target.fullName, reason);
    }

    return trials;
  },

  async deleteCouple(id: string, reason: string) {
    if (isSupabaseConfigured()) {
      const response = await fetch(`/api/admin/couples/${id}/delete`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      await parseJson<{ ok: boolean }>(response);
      return adminService.getCouples();
    }

    await wait();
    const target = getAdminCouples().find((item) => item.id === id);
    const couples = getAdminCouples().map((item) =>
      item.id === id ? { ...item, status: "deleted" as const } : item,
    );
    saveAdminCouples(couples);
    if (target) {
      appendAudit("Soft deleted couple", "couple", target.fullName, reason);
    }
    return couples;
  },

  async getVendors() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/admin/vendors", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ vendors: VendorRecord[] }>(response);
      return data.vendors;
    }

    await wait();
    return getAdminVendors();
  },

  async updateVendorStatus(id: string, status: VendorRecord["status"], reason: string) {
    if (isSupabaseConfigured()) {
      const response = await fetch(`/api/admin/vendors/${id}/status`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, reason }),
      });

      await parseJson<{ ok: boolean }>(response);
      return adminService.getVendors();
    }

    await wait();
    const vendors = getAdminVendors().map((item) =>
      item.id === id ? { ...item, status } : item,
    );
    const target = vendors.find((item) => item.id === id);
    saveAdminVendors(vendors);
    if (target) {
      appendAudit("Updated vendor status", "vendor", target.businessName, reason);
    }
    return vendors;
  },

  async toggleVendorFeature(id: string, reason: string) {
    if (isSupabaseConfigured()) {
      const response = await fetch(`/api/admin/vendors/${id}/feature`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      await parseJson<{ ok: boolean }>(response);
      return adminService.getVendors();
    }

    await wait();
    const vendors = getAdminVendors().map((item) =>
      item.id === id ? { ...item, featured: !item.featured } : item,
    );
    const target = vendors.find((item) => item.id === id);
    saveAdminVendors(vendors);
    if (target) {
      appendAudit(
        target.featured ? "Unfeatured vendor" : "Featured vendor",
        "vendor",
        target.businessName,
        reason,
      );
    }
    return vendors;
  },

  async getPlans() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/admin/plans", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ plans: PlanRecord[] }>(response);
      return data.plans;
    }

    await wait();
    return getAdminPlans();
  },

  async updatePlan(updated: PlanRecord, reason: string) {
    if (isSupabaseConfigured()) {
      const response = await fetch(`/api/admin/plans/${updated.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: updated, reason }),
      });

      await parseJson<{ ok: boolean }>(response);
      return adminService.getPlans();
    }

    await wait();
    const plans = getAdminPlans().map((item) =>
      item.id === updated.id ? { ...updated, updatedAt: isoNow() } : item,
    );
    saveAdminPlans(plans);
    appendAudit("Updated plan", "plan", updated.name, reason);
    return plans;
  },

  async getTrials() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/admin/trials", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ trials: ReturnType<typeof getAdminTrials> }>(response);
      return data.trials;
    }

    await wait();
    return getAdminTrials();
  },

  async runCleanup(reason: string) {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/admin/trials/cleanup", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      await parseJson<{ ok: boolean }>(response);
      return adminService.getTrials();
    }

    await wait(420);
    const trials = getAdminTrials().map((item) =>
      item.status === "expired" ? { ...item, status: "cleaned" as const } : item,
    );
    saveAdminTrials(trials);

    const couples = getAdminCouples().map((item) =>
      item.status === "expired" ? { ...item, status: "deleted" as const } : item,
    );
    saveAdminCouples(couples);

    appendAudit("Ran cleanup batch", "system", "Expired trials", reason);
    return trials;
  },

  async getTemplates() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/admin/templates", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ templates: ReturnType<typeof getAdminTemplates> }>(response);
      return data.templates;
    }

    await wait();
    return getAdminTemplates();
  },

  async toggleTemplateStatus(id: string, reason: string) {
    if (isSupabaseConfigured()) {
      const response = await fetch(`/api/admin/templates/${id}/status`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      await parseJson<{ ok: boolean }>(response);
      return adminService.getTemplates();
    }

    await wait();
    const templates = getAdminTemplates().map((item) => {
      if (item.id !== id) {
        return item;
      }

      const nextStatus: "active" | "inactive" =
        item.status === "active"
          ? "inactive"
          : "active";

      return {
        ...item,
        status: nextStatus,
        updatedAt: isoNow(),
      };
    });
    const target = templates.find((item) => item.id === id);
    saveAdminTemplates(templates);
    if (target) {
      appendAudit("Updated template status", "template", target.name, reason);
    }
    return templates;
  },

  async getCms() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/admin/cms", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ pages: ReturnType<typeof getAdminCms> }>(response);
      return data.pages;
    }

    await wait();
    return getAdminCms();
  },

  async toggleCmsStatus(id: string, reason: string) {
    if (isSupabaseConfigured()) {
      const response = await fetch(`/api/admin/cms/${id}/status`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      await parseJson<{ ok: boolean }>(response);
      return adminService.getCms();
    }

    await wait();
    const pages = getAdminCms().map((item) =>
      item.id === id
        ? {
            ...item,
            status: (item.status === "published" ? "draft" : "published") as
              | "draft"
              | "published",
            updatedAt: isoNow(),
          }
        : item,
    );
    const target = pages.find((item) => item.id === id);
    saveAdminCms(pages);
    if (target) {
      appendAudit("Updated CMS status", "cms", target.title, reason);
    }
    return pages;
  },

  async getReports() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/admin/reports", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ reports: ReturnType<typeof getAdminReports> }>(response);
      return data.reports;
    }

    await wait();
    return getAdminReports();
  },

  async getSettings() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/admin/settings", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ settings: ReturnType<typeof getAdminSettings> }>(response);
      return data.settings;
    }

    await wait();
    return getAdminSettings();
  },

  async updateSetting(key: string, value: string, reason: string) {
    if (isSupabaseConfigured()) {
      const response = await fetch(`/api/admin/settings/${key}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value, reason }),
      });

      await parseJson<{ ok: boolean }>(response);
      return adminService.getSettings();
    }

    await wait();
    const settings = getAdminSettings().map((item) =>
      item.key === key ? { ...item, value } : item,
    );
    const target = settings.find((item) => item.key === key);
    saveAdminSettings(settings);
    if (target) {
      appendAudit("Updated system setting", "setting", target.label, reason);
    }
    return settings;
  },

  async getAuditLogs() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/admin/logs/audit", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ logs: ReturnType<typeof getAdminAuditLogs> }>(response);
      return data.logs;
    }

    await wait();
    return getAdminAuditLogs();
  },

  async getSystemLogs() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/admin/logs/system", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ logs: ReturnType<typeof getAdminSystemLogs> }>(response);
      return data.logs;
    }

    await wait();
    return getAdminSystemLogs();
  },

  async getSupportInquiries() {
    if (isSupabaseConfigured()) {
      const response = await fetch("/api/admin/support", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJson<{ inquiries: ReturnType<typeof getAdminSupportInquiries> }>(response);
      return data.inquiries;
    }

    await wait();
    return getAdminSupportInquiries();
  },

  async resolveSupportInquiry(id: string, reason: string) {
    if (isSupabaseConfigured()) {
      const response = await fetch(`/api/admin/support/${id}/resolve`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      await parseJson<{ ok: boolean }>(response);
      return adminService.getSupportInquiries();
    }

    await wait();
    const items = getAdminSupportInquiries().map((item) =>
      item.id === id ? { ...item, status: "resolved" as const } : item,
    );
    const target = items.find((item) => item.id === id);
    saveAdminSupportInquiries(items);
    if (target) {
      appendAudit("Resolved support inquiry", "support", target.subject, reason);
    }
    return items;
  },
};
