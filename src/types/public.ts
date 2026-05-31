import type { CoupleSession } from "@/types/auth";

export type NavItem = {
  label: string;
  href: string;
};

export type FeatureItem = {
  title: string;
  description: string;
  eyebrow?: string;
};

export type TemplateShowcase = {
  id: string;
  name: string;
  slug: string;
  description: string;
  mood: string;
  image: string;
  tags: string[];
  palette: string[];
  highlight: string;
};

export type PricingPlan = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  ctaLabel: string;
  featured?: boolean;
  footnote?: string;
  items: string[];
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  location: string;
};

export type VendorLeadPayload = {
  fullName: string;
  email: string;
  businessName: string;
  category: string;
  notes: string;
};

export type ContactInquiryPayload = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
};

export type AuthTab = "signup" | "signin" | "find-event";

export type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type SigninPayload = {
  email: string;
  password: string;
};

export type SessionUser = CoupleSession;

export type WeddingOnboardingPayload = {
  partnerOneName: string;
  partnerTwoName: string;
  venueName: string;
  venueTbd: boolean;
  eventDate: string;
  dateTbd: boolean;
  estimatedGuests: string;
  guestsTbd: boolean;
  estimatedBudget: string;
  budgetTbd: boolean;
};

export type WeddingOnboardingState = {
  status: "pending" | "completed";
  weddingSlug?: string;
};

export type FindEventPayload = {
  inviteCode: string;
};

export type FindEventResult =
  | {
      status: "found";
      eventName: string;
      weddingSlug: string;
      inviteCode: string;
      weddingDate: string;
      location: string;
    }
  | {
      status: "invalid" | "not-found";
      message: string;
    };
