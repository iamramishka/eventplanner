import { CTASection } from "@/components/marketing/cta-section";
import { SectionHeader } from "@/components/shared/section-header";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "About",
  description:
    "Learn why Vinyup approaches wedding planning and digital invitations with a premium, calm, emotionally warm design language.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionHeader
            eyebrow="About Vinyup"
            title="Designed for couples who want beauty and clarity in the same product."
            description="Vinyup treats the Public Web as more than a landing page. It is the brand layer, trust layer, and first step into the product."
          />
          <div className="mt-10 grid gap-5">
            <div className="soft-card rounded-[2rem] p-6 text-sm leading-8 text-muted">
              We believe wedding software should feel as considered as the celebration itself. That means emotional typography, calm flows, and a clear path from discovery into action.
            </div>
            <div className="soft-card rounded-[2rem] p-6 text-sm leading-8 text-muted">
              Public Web introduces the platform, lets guests find their events, welcomes vendors, and creates the first account-to-onboarding moment without exposing the complexity of the full product too early.
            </div>
            <div className="soft-card rounded-[2rem] p-6 text-sm leading-8 text-muted">
              This MVP intentionally stops at the entry layer. Couple administration, invitation engine details, vendor dashboard behavior, and super admin tooling are separate parts of the system.
            </div>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Next Step"
        title="See the public experience the way a first-time couple would."
        description="A strong first impression is a product feature here, not a marketing afterthought."
        primaryLabel="Start Free"
        primaryHref="/auth?tab=signup"
        secondaryLabel="Browse Templates"
        secondaryHref="/templates"
      />
    </>
  );
}
