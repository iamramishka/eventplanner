import { CTASection } from "@/components/marketing/cta-section";
import { FAQAccordion } from "@/components/marketing/faq-accordion";
import { PricingCard } from "@/components/marketing/pricing-card";
import { SectionHeader } from "@/components/shared/section-header";
import { faqs } from "@/data/mock-content";
import { buildMetadata } from "@/lib/metadata";
import { publicContentService } from "@/lib/services/public-content-service";

export const metadata = buildMetadata({
  title: "Pricing",
  description:
    "Compare the Vinyup free trial and premium plan with a clear, trust-building pricing structure.",
  path: "/pricing",
});

export default async function PricingPage() {
  const pricing = await publicContentService.getPricing();

  return (
    <>
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Pricing"
            title="Transparent plans that feel reassuring, not sales-heavy."
            description="Pricing on the Public Web should reduce hesitation and keep the next step obvious."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {pricing.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionHeader
            eyebrow="Common Questions"
            title="Answer the objections closest to purchase."
            description="A pricing page works better when the final questions are answered right there."
            align="center"
          />
          <div className="mt-8">
            <FAQAccordion items={faqs.slice(1, 5)} />
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Best Next Step"
        title="Start with the free trial and decide after you feel the product."
        description="The onboarding handoff comes immediately after signup, so couples can move from curiosity to structure in one flow."
        primaryLabel="Start Free"
        primaryHref="/auth?tab=signup"
      />
    </>
  );
}
