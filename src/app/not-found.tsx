import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell">
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div className="soft-card max-w-2xl rounded-[2.5rem] p-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose">
            Page not found
          </p>
          <h1 className="mt-4 font-display text-5xl text-charcoal">
            This part of the celebration is still being arranged.
          </h1>
          <p className="mt-4 text-base leading-8 text-muted">
            The route you opened does not exist in the current Public Web MVP.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white"
            >
              Return Home
            </Link>
            <Link
              href="/auth?tab=signup"
              className="rounded-full border border-soft-border px-5 py-3 text-sm font-semibold text-charcoal"
            >
              Start Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
