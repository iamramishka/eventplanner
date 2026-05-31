import {
  FAQItem,
  FeatureItem,
  PricingPlan,
  TemplateShowcase,
  Testimonial,
} from "@/types/public";

export const trustMetrics = [
  { value: "1,200+", label: "celebrations designed" },
  { value: "38k+", label: "guests coordinated" },
  { value: "94%", label: "RSVP response uplift" },
];

export const homeHighlights: FeatureItem[] = [
  {
    title: "Guest Management",
    description: "Organize households, notes, dietary needs, and attendance from one calm workspace.",
  },
  {
    title: "Online RSVP",
    description: "Collect responses beautifully with reminders and guest-friendly flows.",
  },
  {
    title: "Seating Planner",
    description: "Shape tables and groupings without spreadsheets or last-minute confusion.",
  },
  {
    title: "Budget Planner",
    description: "Track estimates, deposits, and spending with a premium visual overview.",
  },
  {
    title: "Wedding Website",
    description: "Launch a romantic invitation site with your details, story, and gallery.",
  },
  {
    title: "Checklist & Agenda",
    description: "Keep your timeline moving with shared tasks and event-day structure.",
  },
  {
    title: "Vendor Coordination",
    description: "Keep photographers, planners, and venue contacts aligned in one place.",
  },
  {
    title: "Live Tracking",
    description: "See RSVP movement, guest totals, and planning progress in real time.",
  },
];

export const howItWorksSteps = [
  "Create your account in seconds.",
  "Set up your wedding basics and aesthetic.",
  "Choose an invitation style and share it instantly.",
  "Add guests, collect RSVPs, and guide the experience.",
  "Move into the couple dashboard when you are ready.",
];

export const invitationMoments = [
  "Envelope reveal",
  "Story-led invitation opening",
  "Schedule and venue details",
  "RSVP and table-finder moments",
];

export const dashboardPreviewItems = [
  "Guest list overview with smart statuses",
  "RSVP analytics with quick insights",
  "Budget dashboard with visual breakdowns",
  "Checklist and milestone tracking",
  "Template and gallery styling controls",
];

export const featureCollections: Record<string, FeatureItem[]> = {
  couples: [
    {
      eyebrow: "For Couples",
      title: "From planning chaos to one beautiful system",
      description:
        "Manage guests, RSVPs, spending, timelines, and your digital invitation in a unified flow.",
    },
    {
      eyebrow: "For Couples",
      title: "Onboard quickly, refine later",
      description:
        "Start with the essentials, then evolve the details inside the product without losing momentum.",
    },
    {
      eyebrow: "For Couples",
      title: "Luxury presentation without complexity",
      description:
        "Elegant invitation styling and premium guest experience without custom design work.",
    },
  ],
  guests: [
    {
      eyebrow: "For Guests",
      title: "Fast access from any device",
      description:
        "Guests can find their event, RSVP, and check details without needing a product account.",
    },
    {
      eyebrow: "For Guests",
      title: "Clear, readable event pages",
      description:
        "Dates, venues, schedules, and updates are presented with warmth and clarity.",
    },
    {
      eyebrow: "For Guests",
      title: "Less confusion, fewer messages",
      description:
        "The invitation experience answers the practical questions before they become inbox noise.",
    },
  ],
  vendors: [
    {
      eyebrow: "For Vendors",
      title: "Be discovered by planning couples",
      description:
        "Showcase your services inside a premium ecosystem that already understands wedding flow.",
    },
    {
      eyebrow: "For Vendors",
      title: "Quality leads over noisy marketplaces",
      description:
        "Position your business where couples are actively making decisions.",
    },
    {
      eyebrow: "For Vendors",
      title: "A clean path into the vendor experience",
      description:
        "Public Web handles discovery and registration handoff without pulling you into dashboard complexity here.",
    },
  ],
};

export const templateShowcases: TemplateShowcase[] = [
  {
    id: "classic-gold",
    name: "Classic Gold",
    slug: "classic-gold",
    description: "Timeless ivory surfaces, champagne highlights, and formal editorial spacing.",
    mood: "Formal, luminous, and timeless",
    image: "/templates/classic-gold.svg",
    tags: ["formal", "editorial", "luxury"],
    palette: ["Ivory", "Champagne", "Charcoal"],
    highlight: "Ideal for elegant ballroom celebrations and classic ceremonies.",
  },
  {
    id: "blush-bloom",
    name: "Blush Bloom",
    slug: "blush-bloom",
    description: "Romantic blush tones, soft florals, and gentle storytelling panels.",
    mood: "Soft, romantic, and emotional",
    image: "/templates/blush-bloom.svg",
    tags: ["romantic", "garden", "soft"],
    palette: ["Blush", "Rose", "Warm White"],
    highlight: "Designed for intimate weddings with expressive personal details.",
  },
  {
    id: "sage-garden",
    name: "Sage Garden",
    slug: "sage-garden",
    description: "Muted sage greenery with airy layouts built for outdoor and destination events.",
    mood: "Fresh, calm, and organic",
    image: "/templates/sage-garden.svg",
    tags: ["garden", "outdoor", "airy"],
    palette: ["Sage", "Ivory", "Stone"],
    highlight: "Perfect for villas, vineyards, and nature-inspired celebrations.",
  },
  {
    id: "lavender-evening",
    name: "Lavender Evening",
    slug: "lavender-evening",
    description: "Lavender dusk tones with glowing accents for a more cinematic invitation mood.",
    mood: "Dreamy, moody, and modern",
    image: "/templates/lavender-evening.svg",
    tags: ["modern", "evening", "cinematic"],
    palette: ["Lavender", "Plum", "Soft Gold"],
    highlight: "A standout option for sunset ceremonies and fashion-forward couples.",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Free Trial",
    price: "LKR 0",
    cadence: "for 7 days",
    description: "A gentle start for couples who want to explore the platform before committing.",
    ctaLabel: "Start Free",
    items: [
      "One wedding workspace",
      "Curated invitation demos",
      "Core guest setup",
      "Basic RSVP collection",
      "Guided onboarding handoff",
    ],
    footnote: "No credit card required for the MVP flow.",
  },
  {
    name: "Premium",
    price: "LKR 9,900",
    cadence: "per wedding",
    description: "Everything you need for a polished digital invitation and planning workflow.",
    ctaLabel: "Choose Premium",
    featured: true,
    items: [
      "Expanded guest capacity",
      "Advanced invitation styling",
      "Full gallery and custom sections",
      "Analytics and exports",
      "Vendor visibility features",
    ],
    footnote: "Pricing shown as a clear launch-direction reference for Public Web.",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Amaya & Kavin",
    role: "Couple",
    quote:
      "The invitation felt custom, the RSVP flow felt effortless, and our guest list finally stopped living in five different places.",
    location: "Colombo",
  },
  {
    id: "2",
    name: "Rivini Perera",
    role: "Planner",
    quote:
      "It presents beautifully to couples while still feeling like a real system, not just a pretty landing page.",
    location: "Kandy",
  },
  {
    id: "3",
    name: "Sena Studio",
    role: "Vendor",
    quote:
      "The vendor entry story is clean and premium. It feels like a platform where the right clients would trust us.",
    location: "Galle",
  },
];

export const faqs: FAQItem[] = [
  {
    id: "faq-1",
    question: "Is Vinyup only for digital invitations?",
    answer:
      "No. The invitation experience is one part of a broader planning system that also helps with guests, RSVPs, budgets, seating, and timelines.",
  },
  {
    id: "faq-2",
    question: "Can guests RSVP without creating an account?",
    answer:
      "Yes. The guest experience is designed to be public-friendly and low-friction, so guests can respond and access event details easily.",
  },
  {
    id: "faq-3",
    question: "What happens right after sign up?",
    answer:
      "You are taken into a lightweight wedding onboarding step to capture the basics and prepare the handoff into the couple product experience.",
  },
  {
    id: "faq-4",
    question: "Can I preview invitation styles before creating a wedding?",
    answer:
      "Yes. Public Web includes curated template demos so couples can understand the visual direction before starting.",
  },
  {
    id: "faq-5",
    question: "Can vendors join from the Public Web?",
    answer:
      "Yes. Vendors can start a live vendor account from the Public Web and also leave their details if they want a guided follow-up.",
  },
  {
    id: "faq-6",
    question: "Is the Find My Event flow live?",
    answer:
      "Yes. The MVP supports exact invite-code lookup and hands guests into the live invitation route for the matching wedding.",
  },
];

export const vendorBenefits = [
  "Premium discovery space inside a wedding-first ecosystem",
  "A live vendor workspace for profile, portfolio, services, and visibility",
  "A softer brand context than crowded marketplace directories",
];

export const eventDirectory = [
  {
    inviteCode: "AMAYA2026",
    eventName: "Amaya & Kavin",
    weddingSlug: "amaya-kavin",
    weddingDate: "12 December 2026",
    location: "The Kingsbury, Colombo",
  },
  {
    inviteCode: "KAVIN2026",
    eventName: "Amaya & Kavin",
    weddingSlug: "amaya-kavin",
    weddingDate: "12 December 2026",
    location: "The Kingsbury, Colombo",
  },
];
