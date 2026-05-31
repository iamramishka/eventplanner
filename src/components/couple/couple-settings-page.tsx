"use client";

import { useEffect, useState } from "react";
import { CoupleBadge } from "@/components/couple/couple-badge";
import { CouplePageHeader } from "@/components/couple/couple-page-header";
import { CouplePanel } from "@/components/couple/couple-panel";
import { coupleService } from "@/lib/services/couple-service";
import { CoupleAccountSettings } from "@/types/couple";

export function CoupleSettingsPage() {
  const [account, setAccount] = useState<CoupleAccountSettings | null>(null);

  useEffect(() => {
    coupleService.getAccountSettings().then(setAccount);
  }, []);

  if (!account) {
    return <div className="text-sm text-muted">Loading account settings...</div>;
  }

  return (
    <div className="space-y-6">
      <CouplePageHeader
        eyebrow="Settings"
        title="Account & subscription"
        description="Review your current plan, feature access, and support options from one calm account area."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <CouplePanel className="p-6">
          <h2 className="text-xl font-semibold text-charcoal">Account details</h2>
          <div className="mt-5 grid gap-3">
            <div className="rounded-[1.5rem] bg-[#FAF3F0] px-4 py-4 text-sm text-muted">
              Full name: <strong className="text-charcoal">{account.fullName}</strong>
            </div>
            <div className="rounded-[1.5rem] bg-[#FAF3F0] px-4 py-4 text-sm text-muted">
              Email: <strong className="text-charcoal">{account.email}</strong>
            </div>
            <div className="rounded-[1.5rem] bg-[#FAF3F0] px-4 py-4 text-sm text-muted">
              Support:{" "}
              <a href={`mailto:${account.supportEmail}`} className="font-semibold text-rose">
                {account.supportEmail}
              </a>
            </div>
          </div>
        </CouplePanel>

        <CouplePanel className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-charcoal">Subscription</h2>
            <CoupleBadge
              label={account.plan.status}
              tone={
                account.plan.status === "active"
                  ? "success"
                  : account.plan.status === "expired"
                    ? "danger"
                    : "warning"
              }
            />
          </div>
          <div className="mt-5 grid gap-3">
            <div className="rounded-[1.5rem] bg-[#F7F5F0] px-4 py-4 text-sm text-muted">
              Plan: <strong className="text-charcoal">{account.plan.planName}</strong>
            </div>
            <div className="rounded-[1.5rem] bg-[#F7F5F0] px-4 py-4 text-sm text-muted">
              Status note: <strong className="text-charcoal">{account.plan.renewalLabel}</strong>
            </div>
            <div className="rounded-[1.5rem] bg-[#F7F5F0] px-4 py-4 text-sm text-muted">
              Remaining days: <strong className="text-charcoal">{account.plan.remainingDays}</strong>
            </div>
            <div className="rounded-[1.5rem] bg-[#F7F5F0] px-4 py-4 text-sm text-muted">
              Gallery limit: <strong className="text-charcoal">{account.plan.imageLimit}</strong>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
              Included features
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {account.plan.features.map((feature) => (
                <CoupleBadge key={feature} label={feature} />
              ))}
            </div>
          </div>
          <div className="mt-6 rounded-[1.5rem] border border-[#F2D2D2] bg-[#FFF8F8] px-4 py-4">
            <p className="font-semibold text-[#B35353]">Danger zone</p>
            <p className="mt-2 text-sm leading-7 text-muted">
              Wedding deletion is not self-service in this MVP. Contact support if you need to request account removal or restoration review.
            </p>
          </div>
        </CouplePanel>
      </div>
    </div>
  );
}
