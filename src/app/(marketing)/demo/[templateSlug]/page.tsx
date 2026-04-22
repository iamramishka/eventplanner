import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { templateShowcases } from "@/data/mock-content";
import { buildMetadata } from "@/lib/metadata";

type DemoPageProps = {
  params: Promise<{
    templateSlug: string;
  }>;
  searchParams: Promise<{
    event?: string;
    code?: string;
    from?: string;
  }>;
};

export async function generateStaticParams() {
  return templateShowcases.map((template) => ({
    templateSlug: template.slug,
  }));
}

export async function generateMetadata({ params }: DemoPageProps) {
  const { templateSlug } = await params;
  const template = templateShowcases.find((entry) => entry.slug === templateSlug);

  if (!template) {
    return buildMetadata({
      title: "Template Demo",
      description: "Invitation preview demo for Vinyup Public Web.",
      path: `/demo/${templateSlug}`,
    });
  }

  return buildMetadata({
    title: `${template.name} Demo`,
    description: template.description,
    path: `/demo/${template.slug}`,
    image: template.image,
  });
}

export default async function DemoTemplatePage({
  params,
  searchParams,
}: DemoPageProps) {
  const { templateSlug } = await params;
  const query = await searchParams;
  const template = templateShowcases.find((entry) => entry.slug === templateSlug);

  if (!template) {
    notFound();
  }

  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {query.from === "find-event" ? (
          <div className="mb-6 rounded-[1.5rem] border border-sage/30 bg-sage/10 px-5 py-4 text-sm text-charcoal">
            Guest lookup matched <strong>{query.event ?? "your event"}</strong>. This Public Web MVP now hands the guest into a curated invitation preview route.
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose">
              Template demo
            </p>
            <h1 className="mt-4 font-display text-5xl leading-tight text-charcoal sm:text-6xl">
              {template.name}
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted">{template.mood}</p>
            <p className="mt-6 text-base leading-8 text-muted">{template.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {template.palette.map((tone) => (
                <span
                  key={tone}
                  className="rounded-full border border-soft-border bg-white/80 px-4 py-2 text-sm text-charcoal"
                >
                  {tone}
                </span>
              ))}
            </div>
            <div className="mt-8 grid gap-4">
              <div className="soft-card rounded-[1.75rem] px-5 py-4 text-sm leading-7 text-charcoal">
                {template.highlight}
              </div>
              {query.code ? (
                <div className="soft-card rounded-[1.75rem] px-5 py-4 text-sm leading-7 text-charcoal">
                  Invite code used: <strong>{query.code}</strong>
                </div>
              ) : null}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth?tab=signup"
                className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white"
              >
                Start With This Template
              </Link>
              <Link
                href="/templates"
                className="rounded-full border border-soft-border px-5 py-3 text-sm font-semibold text-charcoal"
              >
                Back to Templates
              </Link>
            </div>
          </div>

          <div className="soft-card overflow-hidden rounded-[2.5rem] p-4">
            <Image
              src={template.image}
              alt={`${template.name} invitation demo`}
              width={1400}
              height={1050}
              priority
              className="h-auto w-full rounded-[2rem]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
