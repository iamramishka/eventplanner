import { OnboardingForm } from "@/components/forms/onboarding-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Wedding Onboarding",
  description:
    "Complete the lightweight wedding setup handoff after signup before continuing into the couple experience.",
  path: "/onboarding/wedding",
  noIndex: true,
});

export default function WeddingOnboardingPage() {
  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose">
            Wedding onboarding
          </p>
          <h1 className="mt-4 font-display text-5xl leading-tight text-charcoal sm:text-6xl">
            Capture the essentials now. Refine the rest later.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
            This handoff step keeps signup light while still creating enough structure to continue into the couple experience.
          </p>
          <div className="mt-8 grid gap-4">
            {[
              "Only the basics required for first-time setup",
              "TBD toggles for venue, date, guest count, and budget",
              "Redirect straight into the live couple dashboard after creation",
            ].map((item) => (
              <div key={item} className="glass-card rounded-[1.75rem] px-5 py-4 text-sm text-charcoal">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card rounded-[2.5rem] p-6">
          <div className="mb-6 flex items-center gap-3 rounded-full bg-white/80 px-4 py-3 text-sm text-charcoal">
            <span className="font-semibold text-rose">Account</span>
            <span className="text-muted">→</span>
            <span className="font-semibold">Wedding</span>
          </div>
          <OnboardingForm />
        </div>
      </div>
    </section>
  );
}
