"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { adminAuthService } from "@/lib/services/admin-auth-service";

type AdminShellProps = {
  children: React.ReactNode;
};

const navGroups = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Accounts",
    items: [
      { href: "/admin/couples", label: "Couples" },
      { href: "/admin/vendors", label: "Vendors" },
      { href: "/admin/trials", label: "Trials & Cleanup" },
    ],
  },
  {
    label: "Commerce",
    items: [{ href: "/admin/plans", label: "Plans" }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/templates", label: "Templates" },
      { href: "/admin/cms", label: "CMS" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/admin/reports", label: "Reports" },
      { href: "/admin/logs", label: "Logs & Support" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

const pageTitles: Record<string, string> = {
  "/admin": "Super Admin Dashboard",
  "/admin/couples": "Couple Management",
  "/admin/vendors": "Vendor Management",
  "/admin/plans": "Plan Management",
  "/admin/trials": "Trial & Cleanup",
  "/admin/templates": "Template Management",
  "/admin/cms": "CMS Management",
  "/admin/reports": "Reports & Analytics",
  "/admin/settings": "System Settings",
  "/admin/logs": "Logs & Support",
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentTitle = useMemo(() => pageTitles[pathname] ?? "Super Admin", [pathname]);

  return (
    <div className="admin-shell">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-[var(--admin-sidebar)] px-5 py-6 text-white admin-transition lg:static lg:w-auto ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
                Vinyup
              </p>
              <h2 className="mt-2 text-xl font-semibold">Super Admin</h2>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-full border border-white/10 px-3 py-1 text-sm lg:hidden"
            >
              Close
            </button>
          </div>

          <nav className="mt-8 space-y-8">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="px-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {group.label}
                </p>
                <div className="mt-3 grid gap-1">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`admin-transition rounded-2xl px-3 py-2.5 text-sm ${
                          active
                            ? "bg-white/12 font-semibold text-white"
                            : "text-slate-300 hover:bg-white/6 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          />
        ) : null}

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-slate-50/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="admin-panel rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 lg:hidden"
                >
                  Menu
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Platform control
                  </p>
                  <h1 className="mt-1 text-lg font-semibold text-slate-950">{currentTitle}</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 md:block">
                  Single-role admin session
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await adminAuthService.logout();
                      router.replace("/admin/login");
                    })
                  }
                  className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
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
