import Link from "next/link";
import { PricingPlan } from "@/types/public";

type PricingCardProps = {
  plan: PricingPlan;
};

export function PricingCard({ plan }: PricingCardProps) {
  return (
    <article
      className={`rounded-[2rem] p-8 ${
        plan.featured
          ? "bg-charcoal text-white shadow-[0_30px_70px_rgba(31,26,23,0.22)]"
          : "soft-card text-charcoal"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-3xl">{plan.name}</h3>
          <p className={`mt-3 text-sm leading-7 ${plan.featured ? "text-white/80" : "text-muted"}`}>
            {plan.description}
          </p>
        </div>
        {plan.featured ? (
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            Popular
          </span>
        ) : null}
      </div>
      <div className="mt-8">
        <p className="font-display text-5xl">{plan.price}</p>
        <p className={`mt-2 text-sm ${plan.featured ? "text-white/70" : "text-muted"}`}>
          {plan.cadence}
        </p>
      </div>
      <ul className="mt-8 space-y-3">
        {plan.items.map((item) => (
          <li key={item} className={`flex gap-3 text-sm ${plan.featured ? "text-white/85" : "text-muted"}`}>
            <span className={plan.featured ? "text-gold" : "text-rose"}>●</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/auth?tab=signup"
        className={`mt-8 inline-flex rounded-full px-5 py-3 text-sm font-semibold ${
          plan.featured ? "bg-white text-charcoal" : "bg-charcoal text-white"
        }`}
      >
        {plan.ctaLabel}
      </Link>
      {plan.footnote ? (
        <p className={`mt-4 text-xs leading-6 ${plan.featured ? "text-white/60" : "text-muted"}`}>
          {plan.footnote}
        </p>
      ) : null}
    </article>
  );
}
