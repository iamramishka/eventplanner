import type { User } from "@supabase/supabase-js";
import type { AppRole, AppSession } from "@/types/auth";

type QueryLike = {
  from: (table: string) => {
    select: (...args: unknown[]) => {
      eq: (...eqArgs: unknown[]) => {
        maybeSingle: () => Promise<{
          data: Record<string, unknown> | null;
          error: { message: string } | null;
        }>;
      };
    };
    upsert: (
      value: Record<string, unknown>,
      options?: { onConflict?: string },
    ) => Promise<{ error: { message: string } | null }>;
    insert: (value: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
  };
};

function asQueryClient(value: unknown) {
  return value as QueryLike;
}

function normalizeRole(value: unknown): AppRole {
  return value === "vendor" || value === "super_admin" ? value : "couple";
}

export async function ensureProfileForUser(supabase: unknown, user: User) {
  const queryClient = asQueryClient(supabase);
  const role = normalizeRole(user.user_metadata?.role);
  const fullName =
    typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : user.email?.split("@")[0] ?? "Vinyup User";

  const { error } = await queryClient.from("profiles").upsert(
    {
      id: user.id,
      role,
      full_name: fullName,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(`Unable to ensure profile: ${error.message}`);
  }

  return { role, fullName };
}

export async function ensureVendorProfileForUser(supabase: unknown, user: User) {
  const queryClient = asQueryClient(supabase);
  const businessName =
    typeof user.user_metadata?.business_name === "string" && user.user_metadata.business_name.trim()
      ? user.user_metadata.business_name.trim()
      : user.user_metadata?.full_name?.trim() || "Vendor Studio";

  const { data } = await queryClient
    .from("vendor_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (data) {
    return;
  }

  const { error } = await queryClient.from("vendor_profiles").insert({
    user_id: user.id,
    business_name: businessName,
    category: "Other",
    tagline: "",
    description: "",
    location: "",
    coverage_area: "",
    experience_years: 0,
    price_range: "",
    phone: "",
    whatsapp: "",
    email: user.email ?? "",
    website: "",
    instagram: "",
    facebook: "",
    map_link: "",
    status: "draft",
    is_public: false,
    can_be_public: false,
    featured_by_admin: false,
    admin_message:
      "Complete your profile, upload work, and submit it for review when you are ready.",
  });

  if (error) {
    throw new Error(`Unable to create vendor profile: ${error.message}`);
  }
}

export async function buildAppSession(supabase: unknown, user: User): Promise<AppSession> {
  const queryClient = asQueryClient(supabase);
  const fallback = await ensureProfileForUser(queryClient, user);

  const { data: profile, error: profileError } = await queryClient
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Unable to read profile: ${profileError.message}`);
  }

  const role = normalizeRole(profile?.role ?? fallback.role);
  const fullName =
    (typeof profile?.full_name === "string" && profile.full_name) || fallback.fullName;

  if (role === "couple") {
    const { data: wedding, error } = await queryClient
      .from("weddings")
      .select("id")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    if (error) {
      throw new Error(`Unable to read wedding: ${error.message}`);
    }

    return {
      id: user.id,
      fullName,
      email: user.email ?? "",
      role,
      hasWedding: Boolean(wedding),
    };
  }

  if (role === "vendor") {
    await ensureVendorProfileForUser(queryClient, user);

    const { data: vendor, error } = await queryClient
      .from("vendor_profiles")
      .select("business_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      throw new Error(`Unable to read vendor profile: ${error.message}`);
    }

    return {
      id: user.id,
      vendorId: user.id,
      fullName,
      email: user.email ?? "",
      role,
      businessName: (vendor?.business_name as string | undefined) ?? "Vendor Studio",
    };
  }

  return {
    id: user.id,
    adminId: user.id,
    fullName,
    email: user.email ?? "",
    role,
    lastLoginAt: new Date().toISOString(),
  };
}
