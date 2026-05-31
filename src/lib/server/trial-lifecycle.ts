import "server-only";

type QueryLike = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any;
};

function asQueryClient(value: unknown) {
  return value as QueryLike;
}

export type WeddingAvailabilityState = {
  profileStatus: "active" | "suspended" | "deleted";
  subscriptionStatus: "trial" | "active" | "expired" | "grace" | "suspended";
  isLocked: boolean;
};

export function isWeddingLocked(
  profileStatus: string | undefined,
  subscriptionStatus: string | undefined,
) {
  return profileStatus === "deleted" || profileStatus === "suspended" || subscriptionStatus === "suspended";
}

export async function getWeddingAvailabilityState(
  supabase: unknown,
  weddingId: string,
  ownerUserId: string,
): Promise<WeddingAvailabilityState> {
  const queryClient = asQueryClient(supabase);

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    queryClient
      .from("profiles")
      .select("status")
      .eq("id", ownerUserId)
      .maybeSingle(),
    queryClient
      .from("wedding_subscriptions")
      .select("status")
      .eq("wedding_id", weddingId)
      .maybeSingle(),
  ]);

  const profileStatus =
    (typeof profile?.status === "string" ? profile.status : "active") as WeddingAvailabilityState["profileStatus"];
  const subscriptionStatus =
    (typeof subscription?.status === "string"
      ? subscription.status
      : "trial") as WeddingAvailabilityState["subscriptionStatus"];

  return {
    profileStatus,
    subscriptionStatus,
    isLocked: isWeddingLocked(profileStatus, subscriptionStatus),
  };
}

export async function expireTrialSubscriptions(supabase: unknown, now = new Date()) {
  const queryClient = asQueryClient(supabase);
  const { data: rows, error } = await queryClient
    .from("wedding_subscriptions")
    .select("id")
    .eq("status", "trial")
    .lte("trial_ends_at", now.toISOString());

  if (error) {
    throw new Error(`Unable to inspect trial subscriptions: ${error.message}`);
  }

  const ids = (rows ?? []).map((row: Record<string, unknown>) => String(row.id));
  if (!ids.length) {
    return 0;
  }

  const { error: updateError } = await queryClient
    .from("wedding_subscriptions")
    .update({ status: "expired", updated_at: now.toISOString() })
    .in("id", ids);

  if (updateError) {
    throw new Error(`Unable to expire trial subscriptions: ${updateError.message}`);
  }

  return ids.length;
}

export async function moveExpiredSubscriptionsToGrace(supabase: unknown, now = new Date()) {
  const queryClient = asQueryClient(supabase);
  const { data: rows, error } = await queryClient
    .from("wedding_subscriptions")
    .select("id, grace_ends_at")
    .eq("status", "expired");

  if (error) {
    throw new Error(`Unable to inspect expired subscriptions: ${error.message}`);
  }

  const ids = (rows ?? [])
    .filter((row: Record<string, unknown>) => {
      const graceEndsAt =
        typeof row.grace_ends_at === "string" ? new Date(row.grace_ends_at).getTime() : 0;
      return graceEndsAt > now.getTime();
    })
    .map((row: Record<string, unknown>) => String(row.id));

  if (!ids.length) {
    return 0;
  }

  const { error: updateError } = await queryClient
    .from("wedding_subscriptions")
    .update({ status: "grace", updated_at: now.toISOString() })
    .in("id", ids);

  if (updateError) {
    throw new Error(`Unable to move subscriptions into grace: ${updateError.message}`);
  }

  return ids.length;
}

export async function suspendGraceExpiredSubscriptions(supabase: unknown, now = new Date()) {
  const queryClient = asQueryClient(supabase);
  const { data: rows, error } = await queryClient
    .from("wedding_subscriptions")
    .select("id, wedding_id, grace_ends_at, weddings(owner_user_id)")
    .eq("status", "grace");

  if (error) {
    throw new Error(`Unable to inspect grace subscriptions: ${error.message}`);
  }

  const dueRows = (rows ?? []).filter((row: Record<string, unknown>) => {
    const graceEndsAt =
      typeof row.grace_ends_at === "string" ? new Date(row.grace_ends_at).getTime() : 0;
    return graceEndsAt <= now.getTime();
  });

  const subscriptionIds = dueRows.map((row: Record<string, unknown>) => String(row.id));
  const coupleIds = dueRows
    .map((row: Record<string, unknown>) => {
      const wedding =
        Array.isArray(row.weddings) && row.weddings.length
          ? (row.weddings[0] as Record<string, unknown>)
          : typeof row.weddings === "object" && row.weddings !== null
            ? (row.weddings as Record<string, unknown>)
            : null;
      return wedding?.owner_user_id;
    })
    .filter(Boolean)
    .map((value: unknown) => String(value));

  if (!subscriptionIds.length) {
    return 0;
  }

  const { error: subscriptionError } = await queryClient
    .from("wedding_subscriptions")
    .update({ status: "suspended", updated_at: now.toISOString() })
    .in("id", subscriptionIds);

  if (subscriptionError) {
    throw new Error(`Unable to suspend expired grace subscriptions: ${subscriptionError.message}`);
  }

  if (coupleIds.length) {
    const { error: profileError } = await queryClient
      .from("profiles")
      .update({ status: "deleted", updated_at: now.toISOString() })
      .in("id", coupleIds);

    if (profileError) {
      throw new Error(`Unable to soft-delete locked couple profiles: ${profileError.message}`);
    }
  }

  return subscriptionIds.length;
}
