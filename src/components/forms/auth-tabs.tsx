"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FindEventForm } from "@/components/forms/find-event-form";
import { SignInForm } from "@/components/forms/sign-in-form";
import { SignUpForm } from "@/components/forms/sign-up-form";
import { AuthTab } from "@/types/public";

type AuthTabsProps = {
  defaultTab: AuthTab;
};

const tabs: Array<{ id: AuthTab; label: string; title: string; description: string }> = [
  {
    id: "signup",
    label: "Sign Up",
    title: "Start your wedding journey",
    description:
      "Create your account, then continue into the wedding onboarding handoff.",
  },
  {
    id: "signin",
    label: "Sign In",
    title: "Welcome back",
    description: "Pick up your planning flow or continue into the next setup step.",
  },
  {
    id: "find-event",
    label: "Find My Event",
    title: "Locate your invitation quickly",
    description:
      "Guests can enter an invite code and jump directly into the live invitation.",
  },
];

export function AuthTabs({ defaultTab }: AuthTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as AuthTab | null) ?? defaultTab;

  const renderContent = () => {
    switch (activeTab) {
      case "signin":
        return <SignInForm />;
      case "find-event":
        return <FindEventForm />;
      default:
        return <SignUpForm />;
    }
  };

  const activeMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <div className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose">
          One elegant entry point
        </p>
        <h1 className="font-display text-5xl leading-tight text-charcoal sm:text-6xl">
          Sign up, return, or help guests find the celebration.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-muted">
          The Public Web entry layer keeps access simple while preserving the premium tone of the brand.
        </p>
        <div className="grid gap-4">
          {[
            "Unified tabs with deep-linkable URLs",
            "Large mobile-first inputs and calm validation",
            "Clear handoff into onboarding or the live invitation",
          ].map((item) => (
            <div key={item} className="glass-card rounded-[1.5rem] px-5 py-4 text-sm text-charcoal">
              {item}
            </div>
          ))}
        </div>
      </div>

      <section className="soft-card rounded-[2.5rem] p-4 sm:p-6">
        <div
          role="tablist"
          aria-label="Authentication tabs"
          className="grid grid-cols-3 rounded-[1.5rem] bg-white/75 p-1"
        >
          {tabs.map((tab) => {
            const active = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => router.replace(`/auth?tab=${tab.id}`)}
                className={`rounded-[1.1rem] px-3 py-3 text-sm font-semibold transition-soft ${
                  active ? "bg-charcoal text-white" : "text-muted hover:text-charcoal"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="px-2 pb-2 pt-6 sm:px-4">
          <h2 className="font-display text-4xl text-charcoal">{activeMeta.title}</h2>
          <p className="mt-3 text-sm leading-7 text-muted">{activeMeta.description}</p>
          <div className="mt-6">{renderContent()}</div>
        </div>
      </section>
    </div>
  );
}
