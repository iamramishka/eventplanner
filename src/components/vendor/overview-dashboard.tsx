"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { VendorBadge } from "@/components/vendor/vendor-badge";
import { VendorPageHeader } from "@/components/vendor/vendor-page-header";
import { VendorPanel } from "@/components/vendor/vendor-panel";
import { vendorService } from "@/lib/services/vendor-service";
import { formatVendorCompletionLabel, getVendorStatusTone } from "@/lib/vendor-utils";
import { VendorOverviewData } from "@/types/vendor";

export function VendorOverviewDashboard() {
  const [overview, setOverview] = useState<VendorOverviewData | null>(null);

  useEffect(() => {
    vendorService.getOverview().then(setOverview);
  }, []);

  if (!overview) {
    return <div className="text-sm text-[var(--vendor-muted)]">Loading vendor overview...</div>;
  }

  return (
    <div className="space-y-6">
      <VendorPageHeader
        eyebrow="Overview"
        title="A calm view of your vendor presence"
        description="Track profile readiness, visibility, and what still needs attention before couples discover your work."
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Profile", value: formatVendorCompletionLabel(overview.completionPercent) },
          { label: "Services", value: String(overview.serviceCount) },
          { label: "Packages", value: String(overview.packageCount) },
          { label: "Portfolio", value: String(overview.galleryCount) },
        ].map((item) => (
          <VendorPanel key={item.label} className="p-5">
            <p className="text-sm text-[var(--vendor-muted)]">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[var(--vendor-text)]">{item.value}</p>
          </VendorPanel>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <VendorPanel className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--vendor-primary)]">
                Profile Status
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--vendor-text)]">
                {overview.businessName}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <VendorBadge label={overview.status} tone={getVendorStatusTone(overview.status)} />
              <VendorBadge label={overview.isPublic ? "Public" : "Hidden"} tone={overview.isPublic ? "success" : "default"} />
            </div>
          </div>
          <p className="mt-5 rounded-[1.4rem] bg-white px-4 py-4 text-sm leading-7 text-[var(--vendor-muted)]">
            {overview.adminMessage}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/vendor-dashboard/profile"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Complete Profile
            </Link>
            <Link
              href="/vendor-dashboard/visibility"
              className="rounded-full border border-[var(--vendor-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--vendor-text)]"
            >
              Review Visibility
            </Link>
          </div>
        </VendorPanel>

        <VendorPanel className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--vendor-accent)]">
            What still matters
          </p>
          {overview.missingSteps.length ? (
            <div className="mt-4 space-y-3">
              {overview.missingSteps.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.4rem] border border-[var(--vendor-border)] bg-white px-4 py-4 text-sm text-[var(--vendor-text)]"
                >
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-[1.4rem] bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
              Your vendor profile is complete and ready for public discovery.
            </p>
          )}
        </VendorPanel>
      </div>
    </div>
  );
}
