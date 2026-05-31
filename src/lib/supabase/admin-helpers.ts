import { randomUUID } from "crypto";
import {
  AdminOverviewData,
  AuditLogRecord,
  CmsRecord,
  CoupleRecord,
  CoupleStatus,
  PlanRecord,
  ReportSnapshot,
  SupportInquiryRecord,
  SystemLogRecord,
  SystemSetting,
  TemplateAdminRecord,
  TrialRecord,
  VendorRecord,
  VendorStatus,
} from "@/types/admin";
import { getVendorCompletion } from "@/lib/vendor-utils";
import {
  loadVendorGallery,
  loadVendorServices,
  mapVendorContactRow,
  mapVendorProfileRow,
} from "@/lib/supabase/vendor-helpers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

type QueryLike = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any;
};

function asQueryClient(value: unknown) {
  return value as QueryLike;
}

function safeArray<T>(value: T[] | null | undefined) {
  return Array.isArray(value) ? value : [];
}

function relationFirst(value: unknown) {
  if (Array.isArray(value)) {
    return (value[0] ?? {}) as Record<string, unknown>;
  }

  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return {} as Record<string, unknown>;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : Number(value ?? fallback);
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function isoNow() {
  return new Date().toISOString();
}

export async function appendAdminAuditLog(
  supabase: unknown,
  payload: {
    actorUserId: string;
    action: string;
    targetType: string;
    targetId?: string | null;
    reason: string;
    targetLabel: string;
    extraPayload?: Record<string, unknown>;
  },
) {
  const queryClient = asQueryClient(supabase);
  const { error } = await queryClient.from("admin_audit_logs").insert({
    id: randomUUID(),
    actor_user_id: payload.actorUserId,
    action: payload.action,
    target_type: payload.targetType,
    target_id: payload.targetId ?? null,
    reason: payload.reason,
    payload: {
      targetLabel: payload.targetLabel,
      ...(payload.extraPayload ?? {}),
    },
    created_at: isoNow(),
  });

  if (error) {
    throw new Error(`Unable to append admin audit log: ${error.message}`);
  }
}

export function mapCoupleStatus(
  profileStatus: unknown,
  subscriptionStatus: unknown,
): CoupleStatus {
  if (profileStatus === "deleted") {
    return "deleted";
  }

  if (profileStatus === "suspended") {
    return "suspended";
  }

  if (subscriptionStatus === "trial") {
    return "trial";
  }

  if (subscriptionStatus === "expired" || subscriptionStatus === "grace") {
    return "expired";
  }

  return "active";
}

export function mapVendorAdminStatus(value: unknown): VendorStatus {
  switch (value) {
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "blocked":
      return "suspended";
    default:
      return "pending";
  }
}

export async function getAuthEmailMap(userIds: string[]) {
  if (!userIds.length || !isSupabaseServiceConfigured()) {
    return new Map<string, string>();
  }

  const client = createSupabaseAdminClient();
  const emailMap = new Map<string, string>();
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      break;
    }

    const users = safeArray(data?.users);
    users.forEach((item) => {
      if (userIds.includes(item.id)) {
        emailMap.set(item.id, item.email ?? "");
      }
    });

    hasMore = users.length === 1000;
    page += 1;
  }

  return emailMap;
}

export async function getProfileNameMap(supabase: unknown, userIds: string[]) {
  if (!userIds.length) {
    return new Map<string, string>();
  }

  const queryClient = asQueryClient(supabase);
  const { data, error } = await queryClient
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds);

  if (error) {
    throw new Error(`Unable to load profile names: ${error.message}`);
  }

  return new Map(
    safeArray(data as Array<Record<string, unknown>>).map((row) => [
      String(row.id),
      asString(row.full_name, "Unknown user"),
    ]),
  );
}

export async function getLatestRsvpStatsByWeddingId(supabase: unknown, weddingIds: string[]) {
  if (!weddingIds.length) {
    return new Map<string, { responded: number; total: number }>();
  }

  const queryClient = asQueryClient(supabase);
  const { data: guests, error: guestError } = await queryClient
    .from("guests")
    .select("id, wedding_id")
    .in("wedding_id", weddingIds);

  if (guestError) {
    throw new Error(`Unable to load guest counts: ${guestError.message}`);
  }

  const guestRows = safeArray(guests as Array<Record<string, unknown>>);
  const guestIds = guestRows.map((row) => String(row.id));
  const guestByWedding = new Map<string, string[]>();
  guestRows.forEach((row) => {
    const weddingId = String(row.wedding_id);
    const current = guestByWedding.get(weddingId) ?? [];
    current.push(String(row.id));
    guestByWedding.set(weddingId, current);
  });

  const result = new Map<string, { responded: number; total: number }>();
  weddingIds.forEach((id) => {
    result.set(id, { responded: 0, total: (guestByWedding.get(id) ?? []).length });
  });

  if (!guestIds.length) {
    return result;
  }

  const { data: rsvpRows, error: rsvpError } = await queryClient
    .from("guest_rsvp_current_v")
    .select("guest_id, status")
    .in("guest_id", guestIds);

  if (rsvpError) {
    throw new Error(`Unable to load RSVP stats: ${rsvpError.message}`);
  }

  const guestWeddingMap = new Map<string, string>();
  guestRows.forEach((row) => {
    guestWeddingMap.set(String(row.id), String(row.wedding_id));
  });

  safeArray(rsvpRows as Array<Record<string, unknown>>).forEach((row) => {
    const weddingId = guestWeddingMap.get(String(row.guest_id));
    if (!weddingId) {
      return;
    }

    const current = result.get(weddingId) ?? { responded: 0, total: 0 };
    if (row.status !== "pending") {
      current.responded += 1;
    }
    result.set(weddingId, current);
  });

  return result;
}

export async function getCoupleRecords(supabase: unknown): Promise<CoupleRecord[]> {
  const queryClient = asQueryClient(supabase);
  const { data, error } = await queryClient
    .from("profiles")
    .select(
      "id, full_name, status, created_at, updated_at, weddings(id, slug, updated_at, created_at, wedding_subscriptions(status, trial_ends_at, grace_ends_at, created_at, updated_at, plans(name)))",
    )
    .eq("role", "couple")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load couples: ${error.message}`);
  }

  const profileRows = safeArray(data as Array<Record<string, unknown>>);
  const profileIds = profileRows.map((row) => String(row.id));
  const emailMap = await getAuthEmailMap(profileIds);
  const weddingIds = profileRows
    .map((row) => safeArray(row.weddings as Array<Record<string, unknown>>)[0])
    .filter(Boolean)
    .map((row) => String((row as Record<string, unknown>).id));
  const rsvpStats = await getLatestRsvpStatsByWeddingId(supabase, weddingIds);

  return profileRows.map((row) => {
    const wedding = relationFirst(row.weddings);
    const subscription = relationFirst(wedding.wedding_subscriptions);
    const plan = relationFirst(subscription.plans);
    const stats = rsvpStats.get(String(wedding.id)) ?? { responded: 0, total: 0 };

    return {
      id: String(row.id),
      fullName: asString(row.full_name, "Unnamed couple"),
      email: emailMap.get(String(row.id)) ?? "",
      weddingSlug: asString(wedding.slug),
      planName: asString(plan.name, "Unassigned"),
      status: mapCoupleStatus(row.status, subscription.status),
      guestCount: stats.total,
      rsvpRate: stats.total ? Math.round((stats.responded / stats.total) * 100) : 0,
      createdAt: asString(wedding.created_at, asString(row.created_at, isoNow())),
      lastActiveAt: asString(
        wedding.updated_at,
        asString(row.updated_at, asString(row.created_at, isoNow())),
      ),
      trialEndsAt:
        typeof subscription.trial_ends_at === "string"
          ? subscription.trial_ends_at
          : undefined,
      notes: undefined,
    };
  });
}

export async function getVendorRecords(supabase: unknown): Promise<VendorRecord[]> {
  const queryClient = asQueryClient(supabase);
  const { data, error } = await queryClient
    .from("vendor_profiles")
    .select("*, profiles!vendor_profiles_user_id_fkey(full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load vendors: ${error.message}`);
  }

  const vendorRows = safeArray(data as Array<Record<string, unknown>>);
  const emailMap = await getAuthEmailMap(vendorRows.map((row) => String(row.user_id)));

  return vendorRows.map((row) => {
    const profile = relationFirst(row.profiles);
    return {
      id: String(row.user_id),
      businessName: asString(row.business_name, "Vendor Studio"),
      contactName: asString(profile.full_name, "Vendor contact"),
      email: asString(row.email, emailMap.get(String(row.user_id)) ?? ""),
      category: asString(row.category, "Other"),
      location: asString(row.location),
      status: mapVendorAdminStatus(row.status),
      featured: asBoolean(row.featured_by_admin),
      createdAt: asString(row.created_at, isoNow()),
      notes: asString(row.admin_message),
    };
  });
}

export async function computeVendorCanBePublic(
  supabase: unknown,
  storageClient: unknown,
  vendorRow: Record<string, unknown>,
) {
  const profile = mapVendorProfileRow(vendorRow);
  const contact = mapVendorContactRow(vendorRow);
  const gallery = await loadVendorGallery(supabase, storageClient, String(vendorRow.user_id));
  const services = await loadVendorServices(supabase, String(vendorRow.user_id));
  const completion = getVendorCompletion(profile, gallery.length, services, contact);
  return completion.isPublishReady;
}

export async function getPlanRecords(supabase: unknown): Promise<PlanRecord[]> {
  const queryClient = asQueryClient(supabase);
  const { data, error } = await queryClient
    .from("plans")
    .select("*")
    .order("is_trial", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Unable to load plans: ${error.message}`);
  }

  return safeArray(data as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    name: asString(row.name),
    priceLabel: asString(row.price_label),
    guestLimit: asNumber(row.guest_limit),
    galleryLimit: asNumber(row.gallery_limit),
    features: safeArray(row.features as string[]).map((item) => String(item)),
    active: asBoolean(row.active, true),
    isTrial: asBoolean(row.is_trial),
    updatedAt: asString(row.updated_at, isoNow()),
  }));
}

export async function getTrialRecords(supabase: unknown): Promise<TrialRecord[]> {
  const queryClient = asQueryClient(supabase);
  const { data, error } = await queryClient
    .from("wedding_subscriptions")
    .select(
      "id, status, created_at, trial_ends_at, grace_ends_at, wedding_id, weddings(owner_user_id, partner_one_name, partner_two_name, wedding_title), plans(name)",
    )
    .in("status", ["trial", "expired", "grace"])
    .order("trial_ends_at", { ascending: true });

  if (error) {
    throw new Error(`Unable to load trials: ${error.message}`);
  }

  const rows = safeArray(data as Array<Record<string, unknown>>);
  const ownerIds = rows
    .map((row) => relationFirst(row.weddings))
    .filter(Boolean)
    .map((row) => String((row as Record<string, unknown>).owner_user_id));
  const emailNameMap = await getProfileNameMap(supabase, ownerIds);

  return rows.map((row) => {
    const wedding = relationFirst(row.weddings);
    const plan = relationFirst(row.plans);
    const coupleId = asString(wedding.owner_user_id);
    const fallbackName = [asString(wedding.partner_one_name), asString(wedding.partner_two_name)]
      .filter(Boolean)
      .join(" & ");
    const coupleName =
      emailNameMap.get(coupleId) ??
      fallbackName ??
      asString(wedding.wedding_title, "Wedding");

    return {
      id: String(row.id),
      coupleId,
      coupleName,
      planName: asString(plan.name, "Free Trial"),
      startedAt: asString(row.created_at, isoNow()),
      endsAt: asString(row.trial_ends_at, isoNow()),
      graceEndsAt: asString(row.grace_ends_at, isoNow()),
      status:
        row.status === "expired"
          ? "expired"
          : row.status === "grace"
            ? "grace"
            : "active",
    };
  });
}

export async function getTemplateRecords(supabase: unknown): Promise<TemplateAdminRecord[]> {
  const queryClient = asQueryClient(supabase);
  const { data, error } = await queryClient
    .from("invitation_templates")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load invitation templates: ${error.message}`);
  }

  return safeArray(data as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    name: asString(row.name),
    version: asString(row.version),
    status: asString(row.status, "draft") as TemplateAdminRecord["status"],
    updatedAt: asString(row.updated_at, isoNow()),
    tags: safeArray(row.tags as string[]).map((item) => String(item)),
  }));
}

export async function getCmsRecords(supabase: unknown): Promise<CmsRecord[]> {
  const queryClient = asQueryClient(supabase);
  const { data, error } = await queryClient
    .from("cms_pages")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load CMS pages: ${error.message}`);
  }

  return safeArray(data as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    title: asString(row.title),
    pageKey: asString(row.page_key),
    status: asString(row.status, "draft") as CmsRecord["status"],
    updatedAt: asString(row.updated_at, isoNow()),
  }));
}

export async function getReportSnapshots(supabase: unknown): Promise<ReportSnapshot[]> {
  const couples = await getCoupleRecords(supabase);
  const vendors = await getVendorRecords(supabase);
  const trials = await getTrialRecords(supabase);

  const paidCouples = couples.filter((item) => item.planName !== "Free Trial" && item.status === "active").length;
  const conversionBase = Math.max(trials.length, 1);
  const trialToPaid = Math.round((paidCouples / conversionBase) * 100);
  const approvalRate = vendors.length
    ? Math.round((vendors.filter((item) => item.status === "approved").length / vendors.length) * 100)
    : 0;
  const weeklyNewCouples = couples.filter((item) => {
    const created = new Date(item.createdAt).getTime();
    return Date.now() - created <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  return [
    {
      id: "report-trial-to-paid",
      label: "Trial To Paid Conversion",
      value: `${trialToPaid}%`,
      description: "Live share of recent trial cohorts that converted to active paid couples.",
    },
    {
      id: "report-vendor-approval-rate",
      label: "Vendor Approval Rate",
      value: `${approvalRate}%`,
      description: "Live approval rate across vendor records in the current environment.",
    },
    {
      id: "report-weekly-new-couples",
      label: "Weekly New Couples",
      value: String(weeklyNewCouples),
      description: "Couple accounts created within the last 7 days.",
    },
  ];
}

export async function getSystemSettings(supabase: unknown): Promise<SystemSetting[]> {
  const queryClient = asQueryClient(supabase);
  const { data, error } = await queryClient
    .from("system_settings")
    .select("*")
    .order("label", { ascending: true });

  if (error) {
    throw new Error(`Unable to load system settings: ${error.message}`);
  }

  return safeArray(data as Array<Record<string, unknown>>).map((row) => ({
    key: asString(row.key),
    label: asString(row.label),
    value: asString(row.value),
    type: asString(row.type, "text") as SystemSetting["type"],
  }));
}

export async function getAuditLogRecords(supabase: unknown): Promise<AuditLogRecord[]> {
  const queryClient = asQueryClient(supabase);
  const { data, error } = await queryClient
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Unable to load admin audit logs: ${error.message}`);
  }

  const rows = safeArray(data as Array<Record<string, unknown>>);
  const actorIds = rows
    .map((row) => asString(row.actor_user_id))
    .filter(Boolean);
  const actorNameMap = await getProfileNameMap(supabase, actorIds);

  return rows.map((row) => {
    const payload =
      typeof row.payload === "object" && row.payload !== null
        ? (row.payload as Record<string, unknown>)
        : {};

    return {
      id: String(row.id),
      actorName: actorNameMap.get(asString(row.actor_user_id)) ?? "Unknown admin",
      action: asString(row.action),
      targetType: asString(row.target_type),
      targetLabel: asString(payload.targetLabel, asString(row.target_id)),
      reason: asString(row.reason),
      timestamp: asString(row.created_at, isoNow()),
    };
  });
}

export async function getSystemLogRecords(supabase: unknown): Promise<SystemLogRecord[]> {
  const queryClient = asQueryClient(supabase);
  const { data, error } = await queryClient
    .from("system_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Unable to load system logs: ${error.message}`);
  }

  return safeArray(data as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    level: asString(row.level, "info") as SystemLogRecord["level"],
    source: asString(row.source),
    message: asString(row.message),
    timestamp: asString(row.created_at, isoNow()),
  }));
}

export async function getSupportInquiryRecords(
  supabase: unknown,
): Promise<SupportInquiryRecord[]> {
  const queryClient = asQueryClient(supabase);
  const { data, error } = await queryClient
    .from("support_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load support inquiries: ${error.message}`);
  }

  return safeArray(data as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    senderName: asString(row.sender_name),
    email: asString(row.email),
    subject: asString(row.subject),
    status: asString(row.status, "open") as SupportInquiryRecord["status"],
    createdAt: asString(row.created_at, isoNow()),
  }));
}

export async function getAdminOverviewData(supabase: unknown): Promise<AdminOverviewData> {
  const [couples, vendors, trials, logs, audit] = await Promise.all([
    getCoupleRecords(supabase),
    getVendorRecords(supabase),
    getTrialRecords(supabase),
    getSystemLogRecords(supabase),
    getAuditLogRecords(supabase),
  ]);

  return {
    metrics: [
      {
        label: "Total Couples",
        value: new Intl.NumberFormat("en-US").format(couples.length),
        change: "+live from Supabase",
        tone: "info",
      },
      {
        label: "Active Weddings",
        value: new Intl.NumberFormat("en-US").format(
          couples.filter((item) => item.status === "active" || item.status === "trial").length,
        ),
        change: "Live operational count",
        tone: "success",
      },
      {
        label: "Pending Vendors",
        value: new Intl.NumberFormat("en-US").format(
          vendors.filter((item) => item.status === "pending").length,
        ),
        change: "Needs review",
        tone: "warning",
      },
      {
        label: "Expired Trials",
        value: new Intl.NumberFormat("en-US").format(
          trials.filter((item) => item.status === "expired" || item.status === "grace").length,
        ),
        change: "Cleanup candidates",
        tone: "danger",
      },
    ],
    alerts: [
      {
        id: "vendors-awaiting-review",
        title: "Vendor approvals waiting",
        description: `${vendors.filter((item) => item.status === "pending").length} vendor applications need review.`,
        timestamp: isoNow(),
        tone: "warning",
      },
      {
        id: "expired-trials",
        title: "Cleanup review needed",
        description: `${trials.filter((item) => item.status === "expired").length} expired trials can be moved to cleanup.`,
        timestamp: isoNow(),
        tone: "danger",
      },
      {
        id: "system-health",
        title: "System health snapshot",
        description: `${logs.filter((item) => item.level === "error").length} critical runtime errors in the latest logs.`,
        timestamp: isoNow(),
        tone: "info",
      },
    ],
    recentActions: audit.slice(0, 6),
  };
}
