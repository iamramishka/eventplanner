export type AdminRole = "super_admin";

import type { AdminSession as SharedAdminSession } from "@/types/auth";

export type AdminUser = SharedAdminSession;

export type AdminSession = SharedAdminSession;

export type AdminOverviewMetric = {
  label: string;
  value: string;
  change: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
};

export type AdminActivityItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
};

export type CoupleStatus = "active" | "trial" | "expired" | "suspended" | "deleted";

export type CoupleRecord = {
  id: string;
  fullName: string;
  email: string;
  weddingSlug: string;
  planName: string;
  status: CoupleStatus;
  guestCount: number;
  rsvpRate: number;
  createdAt: string;
  lastActiveAt: string;
  trialEndsAt?: string;
  notes?: string;
};

export type VendorStatus = "pending" | "approved" | "rejected" | "suspended";

export type VendorRecord = {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  category: string;
  location: string;
  status: VendorStatus;
  featured: boolean;
  createdAt: string;
  notes?: string;
};

export type PlanRecord = {
  id: string;
  name: string;
  priceLabel: string;
  guestLimit: number;
  galleryLimit: number;
  features: string[];
  active: boolean;
  isTrial: boolean;
  updatedAt: string;
};

export type TrialRecord = {
  id: string;
  coupleId: string;
  coupleName: string;
  planName: string;
  startedAt: string;
  endsAt: string;
  graceEndsAt: string;
  status: "active" | "expired" | "grace" | "cleaned";
};

export type TemplateAdminRecord = {
  id: string;
  name: string;
  version: string;
  status: "draft" | "active" | "inactive";
  updatedAt: string;
  tags: string[];
};

export type CmsRecord = {
  id: string;
  title: string;
  pageKey: string;
  status: "draft" | "published";
  updatedAt: string;
};

export type ReportSnapshot = {
  id: string;
  label: string;
  value: string;
  description: string;
};

export type SystemSetting = {
  key: string;
  label: string;
  value: string;
  type: "text" | "email" | "toggle";
};

export type AuditLogRecord = {
  id: string;
  actorName: string;
  action: string;
  targetType: string;
  targetLabel: string;
  reason: string;
  timestamp: string;
};

export type SystemLogRecord = {
  id: string;
  level: "info" | "warning" | "error";
  source: string;
  message: string;
  timestamp: string;
};

export type SupportInquiryRecord = {
  id: string;
  senderName: string;
  email: string;
  subject: string;
  status: "open" | "resolved";
  createdAt: string;
};

export type AdminLoginPayload = {
  email: string;
  password: string;
};

export type AdminOverviewData = {
  metrics: AdminOverviewMetric[];
  alerts: AdminActivityItem[];
  recentActions: AuditLogRecord[];
};
