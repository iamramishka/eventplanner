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

export const adminCredentials = {
  email: "ops@vinyup.com",
  password: "Admin123!",
};

export const seededAdminSession: AdminSession = {
  id: "admin-1",
  adminId: "admin-1",
  fullName: "Platform Owner",
  email: adminCredentials.email,
  role: "super_admin",
  lastLoginAt: "2026-04-22T18:45:00.000Z",
};

export const seededCouples: CoupleRecord[] = [
  {
    id: "couple-1",
    fullName: "Amaya Perera",
    email: "amaya@vinyup.com",
    weddingSlug: "amaya-kavin",
    planName: "Premium",
    status: "active",
    guestCount: 220,
    rsvpRate: 76,
    createdAt: "2026-01-12T08:00:00.000Z",
    lastActiveAt: "2026-04-22T12:30:00.000Z",
    notes: "High-value active couple account.",
  },
  {
    id: "couple-2",
    fullName: "Nilan Fernando",
    email: "nilan@vinyup.com",
    weddingSlug: "nilan-savini",
    planName: "Free Trial",
    status: "trial",
    guestCount: 110,
    rsvpRate: 42,
    createdAt: "2026-04-18T08:00:00.000Z",
    lastActiveAt: "2026-04-22T10:15:00.000Z",
    trialEndsAt: "2026-04-25T23:59:59.000Z",
    notes: "Potential upgrade candidate.",
  },
  {
    id: "couple-3",
    fullName: "Mihiri Senadeera",
    email: "mihiri@example.com",
    weddingSlug: "mihiri-danuka",
    planName: "Free Trial",
    status: "expired",
    guestCount: 58,
    rsvpRate: 19,
    createdAt: "2026-04-02T08:00:00.000Z",
    lastActiveAt: "2026-04-12T15:45:00.000Z",
    trialEndsAt: "2026-04-10T23:59:59.000Z",
    notes: "Eligible for cleanup if grace expires.",
  },
  {
    id: "couple-4",
    fullName: "Iresha Weerasinghe",
    email: "iresha@example.com",
    weddingSlug: "iresha-kasuni",
    planName: "Premium",
    status: "suspended",
    guestCount: 154,
    rsvpRate: 63,
    createdAt: "2026-02-04T08:00:00.000Z",
    lastActiveAt: "2026-04-06T11:20:00.000Z",
    notes: "Suspended after repeated payment failure review.",
  },
];

export const seededVendors: VendorRecord[] = [
  {
    id: "vendor-1",
    businessName: "Sena Studio",
    contactName: "Sena Rodrigo",
    email: "hello@senastudio.lk",
    category: "Photography",
    location: "Colombo",
    status: "approved",
    featured: true,
    createdAt: "2026-03-08T07:20:00.000Z",
  },
  {
    id: "vendor-2",
    businessName: "Garden Veil Events",
    contactName: "Rashmi Peris",
    email: "team@gardenveil.lk",
    category: "Planning",
    location: "Kandy",
    status: "pending",
    featured: false,
    createdAt: "2026-04-21T09:00:00.000Z",
  },
  {
    id: "vendor-3",
    businessName: "Harbor Lights Decor",
    contactName: "Janith Silva",
    email: "janith@harborlights.lk",
    category: "Decor",
    location: "Galle",
    status: "approved",
    featured: false,
    createdAt: "2026-02-18T10:35:00.000Z",
  },
  {
    id: "vendor-4",
    businessName: "Royal Banquets",
    contactName: "Madhavi Jayasuriya",
    email: "sales@royalbanquets.lk",
    category: "Venue",
    location: "Negombo",
    status: "suspended",
    featured: false,
    createdAt: "2026-01-21T06:10:00.000Z",
  },
];

export const seededPlans: PlanRecord[] = [
  {
    id: "plan-trial",
    name: "Free Trial",
    priceLabel: "LKR 0 / 7 days",
    guestLimit: 120,
    galleryLimit: 20,
    features: ["Guest setup", "RSVP basics", "Template previews"],
    active: true,
    isTrial: true,
    updatedAt: "2026-04-20T09:00:00.000Z",
  },
  {
    id: "plan-basic",
    name: "Basic",
    priceLabel: "LKR 4,900 / wedding",
    guestLimit: 180,
    galleryLimit: 50,
    features: ["Invitation site", "Guest management", "Checklist"],
    active: true,
    isTrial: false,
    updatedAt: "2026-04-18T09:00:00.000Z",
  },
  {
    id: "plan-premium",
    name: "Premium",
    priceLabel: "LKR 9,900 / wedding",
    guestLimit: 350,
    galleryLimit: 200,
    features: ["Everything in Basic", "Budget planner", "Vendor visibility", "Exports"],
    active: true,
    isTrial: false,
    updatedAt: "2026-04-19T09:00:00.000Z",
  },
];

export const seededTrials: TrialRecord[] = [
  {
    id: "trial-1",
    coupleId: "couple-2",
    coupleName: "Nilan Fernando",
    planName: "Free Trial",
    startedAt: "2026-04-18T08:00:00.000Z",
    endsAt: "2026-04-25T23:59:59.000Z",
    graceEndsAt: "2026-04-28T23:59:59.000Z",
    status: "active",
  },
  {
    id: "trial-2",
    coupleId: "couple-3",
    coupleName: "Mihiri Senadeera",
    planName: "Free Trial",
    startedAt: "2026-04-02T08:00:00.000Z",
    endsAt: "2026-04-10T23:59:59.000Z",
    graceEndsAt: "2026-04-13T23:59:59.000Z",
    status: "expired",
  },
  {
    id: "trial-3",
    coupleId: "couple-5",
    coupleName: "Sahan & Nadee",
    planName: "Free Trial",
    startedAt: "2026-04-11T08:00:00.000Z",
    endsAt: "2026-04-18T23:59:59.000Z",
    graceEndsAt: "2026-04-21T23:59:59.000Z",
    status: "grace",
  },
];

export const seededTemplates: TemplateAdminRecord[] = [
  {
    id: "template-1",
    name: "Classic Gold",
    version: "1.3.0",
    status: "active",
    updatedAt: "2026-04-18T10:00:00.000Z",
    tags: ["formal", "luxury"],
  },
  {
    id: "template-2",
    name: "Blush Bloom",
    version: "1.2.4",
    status: "active",
    updatedAt: "2026-04-16T09:10:00.000Z",
    tags: ["romantic", "soft"],
  },
  {
    id: "template-3",
    name: "Sage Garden",
    version: "0.9.2",
    status: "draft",
    updatedAt: "2026-04-21T06:50:00.000Z",
    tags: ["outdoor", "garden"],
  },
];

export const seededCmsPages: CmsRecord[] = [
  {
    id: "cms-1",
    title: "Home Page Hero",
    pageKey: "home",
    status: "published",
    updatedAt: "2026-04-20T08:20:00.000Z",
  },
  {
    id: "cms-2",
    title: "Pricing Page Content",
    pageKey: "pricing",
    status: "published",
    updatedAt: "2026-04-17T11:00:00.000Z",
  },
  {
    id: "cms-3",
    title: "Vendor Join Callout",
    pageKey: "vendors",
    status: "draft",
    updatedAt: "2026-04-21T12:40:00.000Z",
  },
];

export const seededReports: ReportSnapshot[] = [
  {
    id: "report-1",
    label: "Trial To Paid Conversion",
    value: "31%",
    description: "Last 30 days conversion rate from trial-start to paid activation.",
  },
  {
    id: "report-2",
    label: "Vendor Approval Rate",
    value: "67%",
    description: "Share of incoming vendor applications approved after review.",
  },
  {
    id: "report-3",
    label: "Weekly New Couples",
    value: "84",
    description: "New couple signups in the most recent completed week.",
  },
];

export const seededSettings: SystemSetting[] = [
  {
    key: "support_email",
    label: "Support email",
    value: "support@vinyup.com",
    type: "email",
  },
  {
    key: "platform_name",
    label: "Platform name",
    value: "Vinyup Weddings",
    type: "text",
  },
  {
    key: "maintenance_mode",
    label: "Maintenance mode",
    value: "false",
    type: "toggle",
  },
  {
    key: "vendor_auto_feature",
    label: "Auto-feature approved vendors",
    value: "false",
    type: "toggle",
  },
];

export const seededAuditLogs: AuditLogRecord[] = [
  {
    id: "audit-1",
    actorName: "Platform Owner",
    action: "Approved vendor",
    targetType: "vendor",
    targetLabel: "Sena Studio",
    reason: "Verified profile quality and portfolio.",
    timestamp: "2026-04-22T08:45:00.000Z",
  },
  {
    id: "audit-2",
    actorName: "Platform Owner",
    action: "Updated plan",
    targetType: "plan",
    targetLabel: "Premium",
    reason: "Adjusted guest limit for launch pricing.",
    timestamp: "2026-04-21T13:30:00.000Z",
  },
  {
    id: "audit-3",
    actorName: "Platform Owner",
    action: "Suspended couple",
    targetType: "couple",
    targetLabel: "Iresha Weerasinghe",
    reason: "Repeated payment review issue pending follow-up.",
    timestamp: "2026-04-20T10:00:00.000Z",
  },
];

export const seededSystemLogs: SystemLogRecord[] = [
  {
    id: "log-1",
    level: "error",
    source: "trial-cleanup-worker",
    message: "Cleanup batch skipped 1 record due to retention lock.",
    timestamp: "2026-04-22T07:05:00.000Z",
  },
  {
    id: "log-2",
    level: "warning",
    source: "vendor-review-service",
    message: "Vendor profile submitted without secondary contact number.",
    timestamp: "2026-04-22T06:48:00.000Z",
  },
  {
    id: "log-3",
    level: "info",
    source: "dashboard-aggregator",
    message: "Daily admin overview snapshot refreshed successfully.",
    timestamp: "2026-04-22T06:00:00.000Z",
  },
];

export const seededSupportInquiries: SupportInquiryRecord[] = [
  {
    id: "support-1",
    senderName: "Rivini Perera",
    email: "rivini@example.com",
    subject: "Need help restoring vendor profile visibility",
    status: "open",
    createdAt: "2026-04-22T09:35:00.000Z",
  },
  {
    id: "support-2",
    senderName: "Mihiri Senadeera",
    email: "mihiri@example.com",
    subject: "Trial expired before invitation setup finished",
    status: "resolved",
    createdAt: "2026-04-21T08:12:00.000Z",
  },
];
