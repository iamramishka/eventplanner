import { getAdminSettings } from './adminSettings';

// src/lib/plans.ts
export type PlanType = 'trial' | 'premium';

export interface Entitlements {
  maxGuests: number;
  digitalInvitations: boolean;
  customDomain: boolean;
  vendorShortlist: boolean;
  premiumTemplates: boolean;
}

export const PLAN_FEATURES: Record<PlanType, Entitlements> = {
  trial: {
    maxGuests: 50,
    digitalInvitations: false,
    customDomain: false,
    vendorShortlist: true,
    premiumTemplates: false,
  },
  premium: {
    maxGuests: 1000, // virtually unlimited
    digitalInvitations: true,
    customDomain: true,
    vendorShortlist: true,
    premiumTemplates: true,
  },
};

export function normalizePlan(plan: string | undefined | null): PlanType {
  return plan === 'premium' ? 'premium' : 'trial';
}

export function getEntitlements(plan: PlanType): Entitlements {
  const savedPlan = getAdminSettings().plans.find((item) => item.id === plan);
  return savedPlan?.entitlements || PLAN_FEATURES[plan] || PLAN_FEATURES.trial;
}
