"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { VendorBadge } from "@/components/vendor/vendor-badge";
import { getVendorStatusTone, formatVendorCompletionLabel } from "@/lib/vendor-utils";
import { vendorAuthService } from "@/lib/services/vendor-auth-service";
import { vendorService } from "@/lib/services/vendor-service";
import { VendorOverviewData, VendorSession } from "@/types/vendor";

const navItems = [
  { href: "/vendor-dashboard", label: "Overview" },
  { href: "/vendor-dashboard/profile", label: "Profile" },
  { href: "/vendor-dashboard/gallery", label: "Gallery" },
  { href: "/vendor-dashboard/services", label: "Services" },
  { href: "/vendor-dashboard/contact", label: "Contact Info" },
  { href: "/vendor-dashboard/visibility", label: "Visibility" },
  { href: "/vendor-dashboard/settings", label: "Settings" },
];

const pageTitles: Record<string, string> = {
  "/vendor-dashboard": "Overview Dashboard",
  "/vendor-dashboard/profile": "Vendor Profile",
  "/vendor-dashboard/gallery": "Gallery / Portfolio",
  "/vendor-dashboard/services": "Services & Packages",
  "/vendor-dashboard/contact": "Contact & Social Info",
  "/vendor-dashboard/visibility": "Visibility & Status",
  "/vendor-dashboard/settings": "Account Settings",
};

export function VendorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState<VendorSession | null>(null);
  const [overview, setOverview] = useState<VendorOverviewData | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    Promise.all([vendorAuthService.getSession(), vendorService.getOverview()]).then(
      ([currentSession, currentOverview]) => {
        setSession(currentSession);
        setOverview(currentOverview);
      },
    );
  }, [pathname]);

  const title = useMemo(() => pageTitles[pathname] ?? "Vendor Dashboard", [pathname]);

  return (
    <div className="vendor-shell">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-[var(--vendor-border)] bg-[rgba(255,255,255,0.96)] px-5 py-6 backdrop-blur-xl transition-transform duration-200 lg:static lg:w-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--vendor-accent)]">
                Vinyup
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-[var(--vendor-text)]">
                Vendor Studio
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-full border border-[var(--vendor-border)] px-3 py-1 text-sm text-[var(--vendor-text)] lg:hidden"
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
                      ? "bg-[rgba(37,99,235,0.1)] font-semibold text-[var(--vendor-primary)]"
                      : "text-[var(--vendor-muted)] hover:bg-white hover:text-[var(--vendor-text)]"
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
            className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          />
        ) : null}

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-[var(--vendor-border)] bg-[rgba(248,250,252,0.92)] px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="vendor-panel rounded-[1.1rem] px-3 py-2 text-sm font-medium text-[var(--vendor-text)] lg:hidden"
                >
                  Menu
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--vendor-muted)]">
                    {title}
                  </p>
                  <h1 className="mt-1 text-lg font-semibold text-[var(--vendor-text)]">
                    {session?.businessName || "Vendor Dashboard"}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {overview ? (
                  <VendorBadge
                    label={formatVendorCompletionLabel(overview.completionPercent)}
                    tone="accent"
                  />
                ) : null}
                {overview ? (
                  <VendorBadge
                    label={overview.status}
                    tone={getVendorStatusTone(overview.status)}
                  />
                ) : null}
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await vendorAuthService.logout();
                      router.replace("/vendor-dashboard/login");
                    })
                  }
                  className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
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
