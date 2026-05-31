import Image from "next/image";
import Link from "next/link";
import { CTASection } from "@/components/marketing/cta-section";
import { FAQAccordion } from "@/components/marketing/faq-accordion";
import { FeatureCard } from "@/components/marketing/feature-card";
import { HeroSection } from "@/components/marketing/hero-section";
import { PricingCard } from "@/components/marketing/pricing-card";
import { TemplateCard } from "@/components/marketing/template-card";
import { TestimonialCard } from "@/components/marketing/testimonial-card";
import { SectionHeader } from "@/components/shared/section-header";
import { StructuredData } from "@/components/shared/structured-data";
import {
  dashboardPreviewItems,
  faqs,
  homeHighlights,
  howItWorksSteps,
  invitationMoments,
} from "@/data/mock-content";
import { buildMetadata } from "@/lib/metadata";
import { publicContentService } from "@/lib/services/public-content-service";
import { organizationJsonLd, softwareJsonLd } from "@/lib/structured-data";

export const metadata = buildMetadata({
  title: "Wedding Planning + Invitations + Guest Management",
  description:
    "Vinyup helps couples launch beautiful invitation experiences and move into wedding planning with clarity.",
  path: "/",
});

export default async function HomePage() {
  const [templates, testimonials, pricing] = await Promise.all([
    publicContentService.getTemplates(),
    publicContentService.getTestimonials(),
    publicContentService.getPricing(),
  ]);

  return (
    <>
      <StructuredData data={organizationJsonLd()} />
      <StructuredData data={softwareJsonLd()} />

      <HeroSection />

      <section className="section-anchor px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Platform Highlights"
            title="Everything couples need, presented with softness and structure."
            description="Vinyup is designed to feel emotional on the surface and dependable underneath."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {homeHighlights.map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-anchor px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeader
            eyebrow="How It Works"
            title="A five-step entry journey that removes planning friction early."
            description="The Public Web should explain the next step fast, then hand couples into the product with confidence."
          />
          <div className="grid gap-4">
            {howItWorksSteps.map((step, index) => (
              <div key={step} className="soft-card rounded-[1.75rem] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-rose">
                  Step {index + 1}
                </p>
                <p className="mt-3 text-base text-charcoal">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-anchor px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Invitation Showcase"
            title="Let the invitation feel cinematic before anyone ever opens a dashboard."
            description="The visual story sells the emotion. The product depth arrives just after that trust is earned."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="soft-card overflow-hidden rounded-[2.5rem] p-4">
              <Image
                src="/invitation-showcase.svg"
                alt="Invitation showcase preview"
                width={1200}
                height={900}
                className="h-auto w-full rounded-[2rem]"
              />
            </div>
            <div className="grid gap-4">
              {invitationMoments.map((item) => (
                <div key={item} className="glass-card rounded-[1.75rem] p-5">
                  <p className="font-display text-2xl text-charcoal">{item}</p>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    A premium touchpoint that helps guests feel guided rather than overwhelmed.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-anchor px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Dashboard Preview"
            title="Show the system power without turning the homepage into a product manual."
            description="This layer reassures visitors that Vinyup is more than a beautiful invitation."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="grid gap-4">
              {dashboardPreviewItems.map((item) => (
                <div key={item} className="soft-card rounded-[1.75rem] px-5 py-4 text-sm text-charcoal">
                  {item}
                </div>
              ))}
            </div>
            <div className="soft-card overflow-hidden rounded-[2.5rem] p-4">
              <Image
                src="/dashboard-preview.svg"
                alt="Dashboard preview"
                width={1200}
                height={900}
                className="h-auto w-full rounded-[2rem]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-anchor px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader
              eyebrow="Templates"
              title="Choose a design mood before you ever touch setup."
              description="Real previews help couples feel the product emotionally before making a commitment."
            />
            <Link href="/templates" className="text-sm font-semibold text-rose">
              Explore all templates
            </Link>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {templates.slice(0, 3).map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-anchor px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Pricing"
            title="Simple pricing for a confident decision."
            description="Keep the comparison clear, premium, and easy to trust."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {pricing.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-anchor px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Social Proof"
            title="Warm trust signals beat cold enterprise proof every time here."
            description="Couples and vendors need to feel that the platform is polished, credible, and emotionally aligned."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-anchor px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.5rem] bg-[linear-gradient(135deg,rgba(151,172,150,0.18),rgba(255,255,255,0.86),rgba(201,165,116,0.16))] px-8 py-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose">
              Vendor Callout
            </p>
            <h2 className="mt-4 font-display text-4xl text-charcoal">
              Join a wedding platform that already feels premium before the lead even lands.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-muted">
              Public Web gives vendors a polished discovery layer and a cleaner conversion story than a crowded directory.
            </p>
          </div>
          <Link
            href="/vendors"
            className="rounded-full bg-charcoal px-6 py-4 text-sm font-semibold text-white"
          >
            Join as Vendor
          </Link>
        </div>
      </section>

      <section className="section-anchor px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="FAQ"
            title="Answer the practical questions before they block conversion."
            description="A lean FAQ helps both SEO and decision confidence."
          />
          <div className="mt-8">
            <FAQAccordion items={faqs.slice(0, 4)} />
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Ready To Begin"
        title="Start planning your wedding in one smart, beautiful platform."
        description="Create your account, preview templates, and move into the onboarding handoff when you are ready."
        primaryLabel="Create Your Wedding"
        primaryHref="/auth?tab=signup"
        secondaryLabel="View Invitation Demo"
        secondaryHref="/demo/classic-gold"
      />
    </>
  );
}
