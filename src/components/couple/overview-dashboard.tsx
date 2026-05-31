"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CoupleBadge } from "@/components/couple/couple-badge";
import { CouplePageHeader } from "@/components/couple/couple-page-header";
import { CouplePanel } from "@/components/couple/couple-panel";
import { coupleService } from "@/lib/services/couple-service";
import { formatCoupleCurrency, formatCoupleDate } from "@/lib/couple-utils";
import { CoupleOverviewData, WeddingSettingsRecord } from "@/types/couple";

export function OverviewDashboard() {
  const [overview, setOverview] = useState<CoupleOverviewData | null>(null);
  const [settings, setSettings] = useState<WeddingSettingsRecord | null>(null);

  useEffect(() => {
    Promise.all([coupleService.getDashboardOverview(), coupleService.getWeddingSettings()]).then(
      ([overviewData, weddingSettings]) => {
        setOverview(overviewData);
        setSettings(weddingSettings);
      },
    );
  }, []);

  if (!overview || !settings) {
    return <div className="text-sm text-muted">Loading your wedding workspace...</div>;
  }

  const statCards = [
    { label: "Total Guests", value: overview.guestCount },
    { label: "Confirmed", value: overview.confirmedGuests },
    { label: "Pending", value: overview.pendingGuests },
    { label: "Declined", value: overview.declinedGuests },
    { label: "Attending Headcount", value: overview.attendingHeadcount },
    { label: "Tables Created", value: overview.tableCount },
    {
      label: "Budget Used",
      value:
        overview.budgetEstimated > 0
          ? `${Math.round((overview.budgetActual / overview.budgetEstimated) * 100)}%`
          : "0%",
    },
    {
      label: "Checklist Progress",
      value: `${overview.checklistCompleted}/${overview.checklistTotal}`,
    },
  ];

  return (
    <div className="space-y-6">
      <CouplePageHeader
        eyebrow="Overview"
        title="A calm command center for your wedding"
        description="See RSVP movement, planning progress, and what needs your attention next without digging through multiple tools."
        actions={
          <>
            <Link
              href="/couple-dashboard/guests"
              className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white"
            >
              Add Guest
            </Link>
            <Link
              href="/couple-dashboard/invitation"
              className="rounded-full border border-[#E8DDD7] bg-white px-5 py-3 text-sm font-semibold text-charcoal"
            >
              Edit Invitation
            </Link>
          </>
        }
      />

      <CouplePanel className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted">
              {settings.partnerOneName} & {settings.partnerTwoName}
            </p>
            <h2 className="mt-2 font-display text-4xl text-charcoal">
              {settings.weddingTitle}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <CoupleBadge label={overview.countdownLabel} tone="accent" />
            <CoupleBadge label={formatCoupleDate(settings.eventDate)} />
            <CoupleBadge label={settings.venueName || "Venue TBD"} />
          </div>
        </div>
      </CouplePanel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <CouplePanel key={card.label} className="p-5">
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-4 text-4xl font-semibold text-charcoal">{card.value}</p>
          </CouplePanel>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <CouplePanel className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-charcoal">Recent guest activity</h3>
            <Link href="/couple-dashboard/rsvps" className="text-sm font-semibold text-rose">
              View RSVPs
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {overview.recentActivity.length ? (
              overview.recentActivity.map((item) => (
                <div key={item.id} className="rounded-[1.5rem] border border-[#E8DDD7] px-4 py-4">
                  <p className="font-semibold text-charcoal">{item.title}</p>
                  <p className="mt-1 text-sm text-muted">{item.description}</p>
                  <p className="mt-2 text-xs text-muted">{formatCoupleDate(item.timestamp)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[#E8DDD7] px-4 py-8 text-sm text-muted">
                No recent RSVP or guest activity yet. Start by inviting your first guests.
              </div>
            )}
          </div>
        </CouplePanel>

        <div className="grid gap-6">
          <CouplePanel className="p-6">
            <h3 className="text-lg font-semibold text-charcoal">Planning snapshot</h3>
            <div className="mt-5 grid gap-3">
              <div className="rounded-[1.5rem] bg-[#FAF3F0] px-4 py-4 text-sm text-muted">
                Budget used:{" "}
                <strong className="text-charcoal">
                  {formatCoupleCurrency(overview.budgetActual)}
                </strong>
              </div>
              <div className="rounded-[1.5rem] bg-[#F7F5F0] px-4 py-4 text-sm text-muted">
                Paid so far:{" "}
                <strong className="text-charcoal">
                  {formatCoupleCurrency(overview.budgetPaid)}
                </strong>
              </div>
              <div className="rounded-[1.5rem] bg-[#F4F7F1] px-4 py-4 text-sm text-muted">
                Checklist progress:{" "}
                <strong className="text-charcoal">
                  {overview.checklistCompleted} of {overview.checklistTotal} done
                </strong>
              </div>
            </div>
          </CouplePanel>

          <CouplePanel className="p-6">
            <h3 className="text-lg font-semibold text-charcoal">Quick actions</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { href: "/couple-dashboard/guests", label: "Add guest" },
                { href: "/couple-dashboard/agenda", label: "Create agenda item" },
                { href: "/couple-dashboard/budget", label: "Add budget item" },
                { href: "/couple-dashboard/checklist", label: "Review checklist" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[1.4rem] border border-[#E8DDD7] bg-white px-4 py-4 text-sm font-semibold text-charcoal transition-soft hover:-translate-y-0.5"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </CouplePanel>
        </div>
      </div>
    </div>
  );
}
