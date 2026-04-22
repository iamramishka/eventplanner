"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CoupleBadge } from "@/components/couple/couple-badge";
import { coupleService } from "@/lib/services/couple-service";
import { authService } from "@/lib/services/auth-service";
import { CoupleSubscriptionSnapshot, WeddingSettingsRecord } from "@/types/couple";
import { getSubscriptionTone } from "@/lib/couple-utils";

type CoupleShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/couple-dashboard", label: "Overview" },
  { href: "/couple-dashboard/wedding", label: "Wedding" },
  { href: "/couple-dashboard/guests", label: "Guests" },
  { href: "/couple-dashboard/rsvps", label: "RSVPs" },
  { href: "/couple-dashboard/invitation", label: "Invitation Website" },
  { href: "/couple-dashboard/agenda", label: "Agenda" },
  { href: "/couple-dashboard/tables", label: "Tables" },
  { href: "/couple-dashboard/budget", label: "Budget" },
  { href: "/couple-dashboard/checklist", label: "Checklist" },
  { href: "/couple-dashboard/vendors", label: "Vendors" },
  { href: "/couple-dashboard/settings", label: "Settings" },
];

const titleMap: Record<string, string> = {
  "/couple-dashboard": "Overview",
  "/couple-dashboard/wedding": "Wedding Settings",
  "/couple-dashboard/guests": "Guest Management",
  "/couple-dashboard/rsvps": "RSVP Management",
  "/couple-dashboard/invitation": "Invitation Website",
  "/couple-dashboard/agenda": "Agenda / Timeline",
  "/couple-dashboard/tables": "Table Assignment",
  "/couple-dashboard/budget": "Budget Planner",
  "/couple-dashboard/checklist": "Checklist",
  "/couple-dashboard/vendors": "Vendor Management",
  "/couple-dashboard/settings": "Account & Subscription",
};

export function CoupleShell({ children }: CoupleShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewLink, setPreviewLink] = useState("/demo/blush-bloom");
  const [weddingSettings, setWeddingSettings] = useState<WeddingSettingsRecord | null>(null);
  const [subscription, setSubscription] = useState<CoupleSubscriptionSnapshot | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    Promise.all([
      coupleService.getWeddingSettings(),
      coupleService.getSubscription(),
      coupleService.getPreviewLink(),
    ]).then(([settings, plan, preview]) => {
      setWeddingSettings(settings);
      setSubscription(plan);
      setPreviewLink(preview);
    });
  }, [pathname]);

  return (
    <div className="couple-shell">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-[#E8DDD7] bg-[rgba(255,252,249,0.94)] px-5 py-6 backdrop-blur-xl transition-transform duration-200 lg:static lg:w-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose">
                Vinyup
              </p>
              <h2 className="mt-2 font-display text-3xl text-charcoal">Couple Workspace</h2>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-full border border-[#E8DDD7] px-3 py-1 text-sm text-charcoal lg:hidden"
            >
              Close
            </button>
          </div>

          <nav className="mt-8 grid gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`rounded-[1.2rem] px-4 py-3 text-sm transition-soft ${
                    active
                      ? "bg-[#F7E8ED] font-semibold text-rose"
                      : "text-muted hover:bg-white hover:text-charcoal"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          />
        ) : null}

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-[#E8DDD7] bg-[rgba(250,247,245,0.9)] px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="couple-panel rounded-[1.2rem] px-3 py-2 text-sm font-medium text-charcoal lg:hidden"
                >
                  Menu
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                    {titleMap[pathname] ?? "Dashboard"}
                  </p>
                  <h1 className="mt-1 text-lg font-semibold text-charcoal">
                    {weddingSettings?.weddingTitle || "Your Wedding Workspace"}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {subscription ? (
                  <CoupleBadge
                    label={subscription.renewalLabel}
                    tone={getSubscriptionTone(subscription)}
                  />
                ) : null}
                <Link
                  href={previewLink}
                  className="rounded-full border border-[#E8DDD7] bg-white px-4 py-2.5 text-sm font-semibold text-charcoal"
                >
                  Preview Invitation
                </Link>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await authService.signOut();
                      router.replace("/auth?tab=signin");
                    })
                  }
                  className="rounded-full bg-charcoal px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {isPending ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
