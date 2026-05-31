import Link from "next/link";
import { VendorLeadForm } from "@/components/forms/vendor-lead-form";
import { CTASection } from "@/components/marketing/cta-section";
import { SectionHeader } from "@/components/shared/section-header";
import { vendorBenefits } from "@/data/mock-content";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Join As A Vendor",
  description:
    "Discover how wedding vendors can be introduced to couples through a premium Public Web experience.",
  path: "/vendors",
});

export default function VendorsPage() {
  return (
    <>
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <SectionHeader
              eyebrow="Vendor Discovery"
              title="A more polished way to meet planning couples."
              description="This Public Web layer now connects directly into the live vendor dashboard while still supporting guided follow-up for teams that want help getting started."
            />
            <div className="mt-8 grid gap-4">
              {vendorBenefits.map((item) => (
                <div key={item} className="soft-card rounded-[1.75rem] px-5 py-4 text-sm leading-7 text-charcoal">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="soft-card rounded-[2.5rem] p-6">
            <h2 className="font-display text-4xl text-charcoal">Start your vendor workspace</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              Create your vendor account now, or leave your details if you prefer a guided onboarding follow-up.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href="/vendor-dashboard/login?mode=signup"
                className="rounded-full bg-charcoal px-5 py-3.5 text-center text-sm font-semibold text-white shadow-[0_16px_36px_rgba(31,26,23,0.18)] transition-soft hover:-translate-y-0.5"
              >
                Create Vendor Account
              </Link>
              <Link
                href="/vendor-dashboard/login"
                className="rounded-full border border-soft-border px-5 py-3.5 text-center text-sm font-semibold text-charcoal transition-soft hover:-translate-y-0.5"
              >
                Sign In
              </Link>
            </div>
            <div className="mt-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Prefer a guided follow-up?
              </p>
              <VendorLeadForm />
            </div>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Planning Side"
        title="Curious how couples experience the platform first?"
        description="The strongest vendor story is still anchored in the couple journey and invitation quality."
        primaryLabel="Explore Home"
        primaryHref="/"
        secondaryLabel="See Pricing"
        secondaryHref="/pricing"
      />
    </>
  );
}
