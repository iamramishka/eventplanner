import { templateShowcases } from "@/data/mock-content";
import { InvitationThemeSettings } from "@/types/couple";

export function formatInvitationDate(value?: string) {
  if (!value) {
    return "Date to be announced";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export function formatInvitationTime(value?: string) {
  if (!value) {
    return "";
  }

  const [hours, minutes] = value.split(":");
  const parsed = new Date();
  parsed.setHours(Number(hours || 0), Number(minutes || 0), 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

export function getInvitationInitials(coupleNames: string) {
  const parts = coupleNames
    .split("&")
    .join(" ")
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean);

  return parts
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase() ?? "")
    .join("");
}

export function getCountdownParts(value?: string) {
  if (!value) {
    return null;
  }

  const target = new Date(value).getTime();
  if (Number.isNaN(target)) {
    return null;
  }

  const difference = target - Date.now();
  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isPast: false,
  };
}

export function isInvitationSectionVisible(
  key: string,
  visibility: Array<{ key: string; enabled: boolean }>,
) {
  return visibility.find((item) => item.key === key)?.enabled ?? false;
}

export function resolveInvitationPresetImage(theme: InvitationThemeSettings) {
  return (
    templateShowcases.find((template) => template.slug === theme.preset)?.image ??
    "/templates/blush-bloom.svg"
  );
}

export function buildInvitationBackground(theme: InvitationThemeSettings) {
  return {
    backgroundImage: [
      `radial-gradient(circle at top left, ${theme.primaryColor}22, transparent 28%)`,
      `radial-gradient(circle at top right, ${theme.secondaryColor}22, transparent 26%)`,
      `linear-gradient(180deg, ${theme.surfaceColor} 0%, #fffdfb 45%, #f8efe9 100%)`,
    ].join(", "),
  };
}

export function normalizeInvitationLookup(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}
