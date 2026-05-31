import { CTASection } from "@/components/marketing/cta-section";
import { FeatureCard } from "@/components/marketing/feature-card";
import { SectionHeader } from "@/components/shared/section-header";
import { featureCollections, homeHighlights } from "@/data/mock-content";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Features",
  description:
    "See how Vinyup combines invitations, guests, RSVPs, and wedding planning into a premium Public Web story.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <>
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Features"
            title="A clear feature story for couples, guests, and vendors."
            description="Public Web should explain the product in layers: emotional value first, functional confidence second."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {homeHighlights.map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      {Object.entries(featureCollections).map(([key, items]) => (
        <section key={key} className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader
              eyebrow={key}
              title={
                key === "couples"
                  ? "For couples"
                  : key === "guests"
                    ? "For guests"
                    : "For vendors"
              }
              description="Grouped benefits make the story easier to scan without drifting into dashboard complexity."
            />
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {items.map((item) => (
                <FeatureCard key={item.title} {...item} tone="soft" />
              ))}
            </div>
          </div>
        </section>
      ))}

      <CTASection
        eyebrow="Start Free"
        title="See the invitation beauty, then let the product depth carry the rest."
        description="The clearest conversion path is still a focused signup and lightweight onboarding handoff."
        primaryLabel="Go To Auth"
        primaryHref="/auth?tab=signup"
      />
    </>
  );
}
