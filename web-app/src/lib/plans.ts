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

export function getEntitlements(plan: PlanType): Entitlements {
  return PLAN_FEATURES[plan] || PLAN_FEATURES.trial;
}
