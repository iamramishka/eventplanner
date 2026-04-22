"use client";

import {
  adminCredentials,
  seededAuditLogs,
  seededCmsPages,
  seededCouples,
  seededPlans,
  seededReports,
  seededSettings,
  seededSupportInquiries,
  seededSystemLogs,
  seededTemplates,
  seededTrials,
  seededVendors,
} from "@/data/admin-mock";
import {
  AdminSession,
  AuditLogRecord,
  CmsRecord,
  CoupleRecord,
  PlanRecord,
  ReportSnapshot,
  SupportInquiryRecord,
  SystemLogRecord,
  SystemSetting,
  TemplateAdminRecord,
  TrialRecord,
  VendorRecord,
} from "@/types/admin";
import {
  getAdminAccounts,
  getAdminSessionFromAuth,
  saveAdminSessionFromAuth,
} from "@/lib/services/shared-auth-store";
const ADMIN_COUPLES_KEY = "vinyup-admin-couples";
const ADMIN_VENDORS_KEY = "vinyup-admin-vendors";
const ADMIN_PLANS_KEY = "vinyup-admin-plans";
const ADMIN_TRIALS_KEY = "vinyup-admin-trials";
const ADMIN_TEMPLATES_KEY = "vinyup-admin-templates";
const ADMIN_CMS_KEY = "vinyup-admin-cms";
const ADMIN_REPORTS_KEY = "vinyup-admin-reports";
const ADMIN_SETTINGS_KEY = "vinyup-admin-settings";
const ADMIN_AUDIT_KEY = "vinyup-admin-audit";
const ADMIN_LOGS_KEY = "vinyup-admin-system-logs";
const ADMIN_SUPPORT_KEY = "vinyup-admin-support";

function ensureBrowser() {
  if (typeof window === "undefined") {
    throw new Error("Admin browser storage is only available in the browser.");
  }
}

function readJson<T>(key: string, fallback: T): T {
  ensureBrowser();

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  ensureBrowser();
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function ensureAdminStorage() {
  readJson<CoupleRecord[]>(ADMIN_COUPLES_KEY, seededCouples);
  readJson<VendorRecord[]>(ADMIN_VENDORS_KEY, seededVendors);
  readJson<PlanRecord[]>(ADMIN_PLANS_KEY, seededPlans);
  readJson<TrialRecord[]>(ADMIN_TRIALS_KEY, seededTrials);
  readJson<TemplateAdminRecord[]>(ADMIN_TEMPLATES_KEY, seededTemplates);
  readJson<CmsRecord[]>(ADMIN_CMS_KEY, seededCmsPages);
  readJson<ReportSnapshot[]>(ADMIN_REPORTS_KEY, seededReports);
  readJson<SystemSetting[]>(ADMIN_SETTINGS_KEY, seededSettings);
  readJson<AuditLogRecord[]>(ADMIN_AUDIT_KEY, seededAuditLogs);
  readJson<SystemLogRecord[]>(ADMIN_LOGS_KEY, seededSystemLogs);
  readJson<SupportInquiryRecord[]>(ADMIN_SUPPORT_KEY, seededSupportInquiries);
}

export function getAdminCredentials() {
  return getAdminAccounts()[0]
    ? {
        email: getAdminAccounts()[0].email,
        password: getAdminAccounts()[0].password,
      }
    : adminCredentials;
}

export function getAdminSession() {
  return getAdminSessionFromAuth();
}

export function saveAdminSession(session: AdminSession | null) {
  saveAdminSessionFromAuth(session);
}

export function getAdminCouples() {
  ensureAdminStorage();
  return readJson<CoupleRecord[]>(ADMIN_COUPLES_KEY, seededCouples);
}

export function saveAdminCouples(items: CoupleRecord[]) {
  writeJson(ADMIN_COUPLES_KEY, items);
}

export function getAdminVendors() {
  ensureAdminStorage();
  return readJson<VendorRecord[]>(ADMIN_VENDORS_KEY, seededVendors);
}

export function saveAdminVendors(items: VendorRecord[]) {
  writeJson(ADMIN_VENDORS_KEY, items);
}

export function getAdminPlans() {
  ensureAdminStorage();
  return readJson<PlanRecord[]>(ADMIN_PLANS_KEY, seededPlans);
}

export function saveAdminPlans(items: PlanRecord[]) {
  writeJson(ADMIN_PLANS_KEY, items);
}

export function getAdminTrials() {
  ensureAdminStorage();
  return readJson<TrialRecord[]>(ADMIN_TRIALS_KEY, seededTrials);
}

export function saveAdminTrials(items: TrialRecord[]) {
  writeJson(ADMIN_TRIALS_KEY, items);
}

export function getAdminTemplates() {
  ensureAdminStorage();
  return readJson<TemplateAdminRecord[]>(ADMIN_TEMPLATES_KEY, seededTemplates);
}

export function saveAdminTemplates(items: TemplateAdminRecord[]) {
  writeJson(ADMIN_TEMPLATES_KEY, items);
}

export function getAdminCms() {
  ensureAdminStorage();
  return readJson<CmsRecord[]>(ADMIN_CMS_KEY, seededCmsPages);
}

export function saveAdminCms(items: CmsRecord[]) {
  writeJson(ADMIN_CMS_KEY, items);
}

export function getAdminReports() {
  ensureAdminStorage();
  return readJson<ReportSnapshot[]>(ADMIN_REPORTS_KEY, seededReports);
}

export function getAdminSettings() {
  ensureAdminStorage();
  return readJson<SystemSetting[]>(ADMIN_SETTINGS_KEY, seededSettings);
}

export function saveAdminSettings(items: SystemSetting[]) {
  writeJson(ADMIN_SETTINGS_KEY, items);
}

export function getAdminAuditLogs() {
  ensureAdminStorage();
  return readJson<AuditLogRecord[]>(ADMIN_AUDIT_KEY, seededAuditLogs);
}

export function saveAdminAuditLogs(items: AuditLogRecord[]) {
  writeJson(ADMIN_AUDIT_KEY, items);
}

export function appendAdminAuditLog(item: AuditLogRecord) {
  const items = getAdminAuditLogs();
  saveAdminAuditLogs([item, ...items]);
}

export function getAdminSystemLogs() {
  ensureAdminStorage();
  return readJson<SystemLogRecord[]>(ADMIN_LOGS_KEY, seededSystemLogs);
}

export function getAdminSupportInquiries() {
  ensureAdminStorage();
  return readJson<SupportInquiryRecord[]>(ADMIN_SUPPORT_KEY, seededSupportInquiries);
}

export function saveAdminSupportInquiries(items: SupportInquiryRecord[]) {
  writeJson(ADMIN_SUPPORT_KEY, items);
}
