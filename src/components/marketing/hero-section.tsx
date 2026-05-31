import Image from "next/image";
import Link from "next/link";
import { trustMetrics } from "@/data/mock-content";

export function HeroSection() {
  return (
    <section className="px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="rounded-full border border-soft-border/80 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose sm:inline-flex">
            Wedding planning, invitations, guests, and calm coordination
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[1.02] text-charcoal sm:text-6xl lg:text-7xl">
            Plan your wedding in one beautiful, beautifully organized place.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Create a romantic invitation website, manage guests and RSVPs, guide your event story, and move into planning with confidence from the first click.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth?tab=signup"
              className="rounded-full bg-charcoal px-6 py-4 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(31,26,23,0.18)]"
            >
              Start Free
            </Link>
            <Link
              href="/demo/blush-bloom"
              className="rounded-full border border-soft-border bg-white/80 px-6 py-4 text-sm font-semibold text-charcoal"
            >
              View Demo Invitation
            </Link>
            <Link
              href="/vendors"
              className="rounded-full border border-transparent px-6 py-4 text-sm font-semibold text-rose"
            >
              Join as Vendor
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {trustMetrics.map((metric) => (
              <div key={metric.label} className="glass-card rounded-[1.5rem] px-5 py-4">
                <p className="font-display text-3xl text-charcoal">{metric.value}</p>
                <p className="mt-1 text-sm text-muted">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-8 h-28 w-28 rounded-full bg-lavender/25 blur-3xl" />
          <div className="absolute -right-4 bottom-0 h-32 w-32 rounded-full bg-gold/25 blur-3xl" />
          <div className="soft-card relative overflow-hidden rounded-[2.5rem] p-4">
            <Image
              src="/hero-preview.svg"
              alt="Preview collage of the Vinyup public experience"
              width={1200}
              height={900}
              priority
              className="h-auto w-full rounded-[2rem]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
