import { CoupleOverviewData, CoupleSubscriptionSnapshot, GuestRsvpCurrent } from "@/types/couple";

export function formatCoupleDate(value?: string) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatCoupleCurrency(value: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCountdownLabel(dateValue?: string) {
  if (!dateValue) {
    return "Date to be announced";
  }

  const today = new Date();
  const target = new Date(dateValue);
  const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    return "Wedding date has passed";
  }

  return `${diff} days to go`;
}

export function getRsvpTone(status: GuestRsvpCurrent["status"]) {
  switch (status) {
    case "confirmed":
      return "success";
    case "declined":
      return "danger";
    default:
      return "default";
  }
}

export function getSubscriptionTone(plan: CoupleSubscriptionSnapshot) {
  switch (plan.status) {
    case "active":
      return "success";
    case "expired":
      return "danger";
    default:
      return "warning";
  }
}

export function buildOverviewFromMetrics(input: {
  guestCount: number;
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
  attendingHeadcount: number;
  budgetEstimated: number;
  budgetActual: number;
  budgetPaid: number;
  checklistCompleted: number;
  checklistTotal: number;
  tableCount: number;
  countdownLabel: string;
  recentActivity: CoupleOverviewData["recentActivity"];
}): CoupleOverviewData {
  return input;
}
