import Link from "next/link";

type CTASectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function CTASection({
  eyebrow,
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CTASectionProps) {
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[2.5rem] bg-charcoal px-8 py-12 text-white shadow-[0_35px_80px_rgba(31,26,23,0.22)] sm:px-12">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold">
          {eyebrow}
        </p>
        <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-white/75">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={primaryHref}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-charcoal"
          >
            {primaryLabel}
          </Link>
          {secondaryLabel && secondaryHref ? (
            <Link
              href={secondaryHref}
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
