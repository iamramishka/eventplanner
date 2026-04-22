"use client";

import { useEffect, useState, useTransition } from "react";
import { InlineNotice } from "@/components/shared/form-controls";
import { VendorBadge } from "@/components/vendor/vendor-badge";
import { VendorPageHeader } from "@/components/vendor/vendor-page-header";
import { VendorPanel } from "@/components/vendor/vendor-panel";
import { vendorService } from "@/lib/services/vendor-service";
import { formatVendorCompletionLabel, getVendorStatusTone } from "@/lib/vendor-utils";

type VisibilityView = Awaited<ReturnType<typeof vendorService.getVisibility>>;

export function VendorVisibilityPage() {
  const [data, setData] = useState<VisibilityView | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const load = async () => setData(await vendorService.getVisibility());

  useEffect(() => {
    load();
  }, []);

  if (!data) {
    return <div className="text-sm text-[var(--vendor-muted)]">Loading visibility settings...</div>;
  }

  return (
    <div className="space-y-6">
      <VendorPageHeader
        eyebrow="Visibility"
        title="Control public visibility with clear status rules"
        description="Your public listing depends on both your own visibility choice and the platform approval state."
      />

      {notice ? <InlineNotice tone="success">{notice}</InlineNotice> : null}
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <VendorPanel className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <VendorBadge label={data.status} tone={getVendorStatusTone(data.status)} />
            <VendorBadge
              label={data.isPublic ? "Public" : "Hidden"}
              tone={data.isPublic ? "success" : "default"}
            />
            <VendorBadge
              label={formatVendorCompletionLabel(data.completionPercent)}
              tone="accent"
            />
          </div>
          <p className="mt-5 rounded-[1.4rem] bg-white px-4 py-4 text-sm leading-7 text-[var(--vendor-muted)]">
            {data.adminMessage}
          </p>
          {data.rejectedReason ? (
            <p className="mt-4 rounded-[1.4rem] bg-rose-50 px-4 py-4 text-sm leading-7 text-rose-700">
              Rejected reason: {data.rejectedReason}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    const next = await vendorService.toggleVisibility(!data.isPublic);
                    setData((current) =>
                      current
                        ? {
                            ...current,
                            ...next,
                          }
                        : current,
                    );
                    setNotice(next.isPublic ? "Profile is now public." : "Profile is now hidden.");
                    setError("");
                  } catch (caughtError) {
                    setError(
                      caughtError instanceof Error
                        ? caughtError.message
                        : "Could not update visibility.",
                    );
                  }
                })
              }
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
            >
              {data.isPublic ? "Hide Profile" : "Make Public"}
            </button>
            {data.status !== "pending" ? (
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    try {
                      const next = await vendorService.submitForReview();
                      await load();
                      setNotice(next.adminMessage);
                      setError("");
                    } catch (caughtError) {
                      setError(
                        caughtError instanceof Error
                          ? caughtError.message
                          : "Could not submit profile for review.",
                      );
                    }
                  })
                }
                className="rounded-full border border-[var(--vendor-border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--vendor-text)] disabled:opacity-70"
              >
                Submit for Review
              </button>
            ) : null}
          </div>
        </VendorPanel>

        <VendorPanel className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--vendor-accent)]">
            Submission readiness
          </p>
          {data.missingSteps.length ? (
            <div className="mt-4 space-y-3">
              {data.missingSteps.map((item) => (
                <div key={item} className="rounded-[1.4rem] border border-[var(--vendor-border)] bg-white px-4 py-4 text-sm text-[var(--vendor-text)]">
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-[1.4rem] bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
              Your profile is complete and eligible for public visibility.
            </p>
          )}
        </VendorPanel>
      </div>
    </div>
  );
}
