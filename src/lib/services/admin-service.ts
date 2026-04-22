"use client";

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
    await wait();
    return getAdminCouples();
  },

  async updateCoupleStatus(id: string, status: CoupleRecord["status"], reason: string) {
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
    await wait();
    return getAdminVendors();
  },

  async updateVendorStatus(id: string, status: VendorRecord["status"], reason: string) {
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
    await wait();
    return getAdminPlans();
  },

  async updatePlan(updated: PlanRecord, reason: string) {
    await wait();
    const plans = getAdminPlans().map((item) =>
      item.id === updated.id ? { ...updated, updatedAt: isoNow() } : item,
    );
    saveAdminPlans(plans);
    appendAudit("Updated plan", "plan", updated.name, reason);
    return plans;
  },

  async getTrials() {
    await wait();
    return getAdminTrials();
  },

  async runCleanup(reason: string) {
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
    await wait();
    return getAdminTemplates();
  },

  async toggleTemplateStatus(id: string, reason: string) {
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
    await wait();
    return getAdminCms();
  },

  async toggleCmsStatus(id: string, reason: string) {
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
    await wait();
    return getAdminReports();
  },

  async getSettings() {
    await wait();
    return getAdminSettings();
  },

  async updateSetting(key: string, value: string, reason: string) {
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
    await wait();
    return getAdminAuditLogs();
  },

  async getSystemLogs() {
    await wait();
    return getAdminSystemLogs();
  },

  async getSupportInquiries() {
    await wait();
    return getAdminSupportInquiries();
  },

  async resolveSupportInquiry(id: string, reason: string) {
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
