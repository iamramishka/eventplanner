import { ContactForm } from "@/components/forms/contact-form";
import { SectionHeader } from "@/components/shared/section-header";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Contact Vinyup for product questions, partnerships, vendor inquiries, or launch interest.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <SectionHeader
            eyebrow="Contact"
            title="Questions, partnerships, or launch interest."
            description="Use the Public Web contact path for support, product questions, or collaboration requests."
          />
          <div className="mt-8 grid gap-4">
            {[
              "Product support and launch questions",
              "Partnership or press conversations",
              "Vendor and planner inquiries",
            ].map((item) => (
              <div key={item} className="soft-card rounded-[1.75rem] px-5 py-4 text-sm text-charcoal">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="soft-card rounded-[2.5rem] p-6">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
