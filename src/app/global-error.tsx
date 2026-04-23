"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[var(--color-background,#f8fafc)] text-[var(--color-foreground,#0f172a)]">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">Unexpected Error</p>
          <h1 className="text-3xl font-semibold">Something went wrong.</h1>
          <p className="max-w-xl text-sm text-slate-600">
            We ran into an unexpected problem while loading this page. Please try again.
          </p>
          <button
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            onClick={() => reset()}
            type="button"
          >
            Try Again
          </button>
        </main>
      </body>
    </html>
  );
}
