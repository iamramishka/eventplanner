import { FAQAccordion } from "@/components/marketing/faq-accordion";
import { SectionHeader } from "@/components/shared/section-header";
import { StructuredData } from "@/components/shared/structured-data";
import { buildMetadata } from "@/lib/metadata";
import { publicContentService } from "@/lib/services/public-content-service";
import { faqJsonLd } from "@/lib/structured-data";

export const metadata = buildMetadata({
  title: "FAQ",
  description:
    "Find answers about Vinyup's wedding planning, invitation, RSVP, guest management, and Public Web entry experience.",
  path: "/faq",
});

export default async function FAQPage() {
  const items = await publicContentService.getFaqs();

  return (
    <>
      <StructuredData data={faqJsonLd(items)} />
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionHeader
            eyebrow="FAQ"
            title="Thoughtful answers for the questions that block confidence."
            description="The Public Web FAQ should do two jobs well: reassure visitors and support discoverability."
            align="center"
          />
          <div className="mt-10">
            <FAQAccordion items={items} />
          </div>
        </div>
      </section>
    </>
  );
}
