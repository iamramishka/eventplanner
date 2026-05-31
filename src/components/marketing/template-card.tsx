import Image from "next/image";
import Link from "next/link";
import { TemplateShowcase } from "@/types/public";

type TemplateCardProps = {
  template: TemplateShowcase;
};

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <article className="soft-card transition-soft overflow-hidden rounded-[2rem] hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={template.image}
          alt={`${template.name} invitation preview`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-2">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
        <div>
          <h3 className="font-display text-3xl text-charcoal">{template.name}</h3>
          <p className="mt-2 text-sm leading-7 text-muted">{template.description}</p>
        </div>
        <p className="text-sm font-medium text-charcoal">{template.highlight}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/demo/${template.slug}`}
            className="rounded-full bg-charcoal px-4 py-3 text-sm font-semibold text-white"
          >
            Preview Demo
          </Link>
          <Link
            href="/auth?tab=signup"
            className="rounded-full border border-soft-border px-4 py-3 text-sm font-medium text-charcoal"
          >
            Start With This Style
          </Link>
        </div>
      </div>
    </article>
  );
}
