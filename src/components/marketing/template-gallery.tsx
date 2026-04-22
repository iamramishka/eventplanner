"use client";

import { useMemo, useState } from "react";
import { TemplateCard } from "@/components/marketing/template-card";
import { TemplateShowcase } from "@/types/public";

type TemplateGalleryProps = {
  templates: TemplateShowcase[];
};

export function TemplateGallery({ templates }: TemplateGalleryProps) {
  const [activeTag, setActiveTag] = useState("all");

  const tags = useMemo(() => {
    const uniqueTags = new Set<string>();
    templates.forEach((template) => {
      template.tags.forEach((tag) => uniqueTags.add(tag));
    });
    return ["all", ...Array.from(uniqueTags)];
  }, [templates]);

  const visibleTemplates =
    activeTag === "all"
      ? templates
      : templates.filter((template) => template.tags.includes(activeTag));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-soft ${
              activeTag === tag
                ? "bg-charcoal text-white"
                : "border border-soft-border bg-white/80 text-charcoal"
            }`}
          >
            {tag === "all" ? "All styles" : tag}
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {visibleTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
