import { FeatureItem } from "@/types/public";

type FeatureCardProps = FeatureItem & {
  tone?: "default" | "soft";
};

export function FeatureCard({
  title,
  description,
  eyebrow,
  tone = "default",
}: FeatureCardProps) {
  return (
    <article
      className={`transition-soft rounded-[2rem] p-6 hover:-translate-y-1 ${
        tone === "soft" ? "glass-card" : "soft-card"
      }`}
    >
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-rose">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="font-display text-2xl text-charcoal">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
    </article>
  );
}
