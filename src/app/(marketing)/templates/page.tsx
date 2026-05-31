import { CTASection } from "@/components/marketing/cta-section";
import { TemplateGallery } from "@/components/marketing/template-gallery";
import { SectionHeader } from "@/components/shared/section-header";
import { buildMetadata } from "@/lib/metadata";
import { publicContentService } from "@/lib/services/public-content-service";

export const metadata = buildMetadata({
  title: "Invitation Templates",
  description:
    "Browse curated invitation template demos designed for elegant, emotional wedding experiences.",
  path: "/templates",
});

export default async function TemplatesPage() {
  const templates = await publicContentService.getTemplates();

  return (
    <>
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Templates"
            title="A curated invitation gallery with enough variety to inspire, not overwhelm."
            description="Use real previews, clear moods, and fast paths into signup or demo exploration."
          />
          <div className="mt-10">
            <TemplateGallery templates={templates} />
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Need A Starting Point?"
        title="Preview a style, then move straight into account creation."
        description="The Public Web should make it easy to connect design desire with conversion intent."
        primaryLabel="Start Free"
        primaryHref="/auth?tab=signup"
        secondaryLabel="Find My Event"
        secondaryHref="/auth?tab=find-event"
      />
    </>
  );
}
