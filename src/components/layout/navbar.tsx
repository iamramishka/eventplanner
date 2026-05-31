"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { primaryNavItems } from "@/data/site";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-soft-border/60 bg-[rgba(252,248,246,0.86)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="transition-soft rounded-full border border-soft-border/70 bg-white/80 px-4 py-2 text-sm font-semibold tracking-[0.18em] text-charcoal hover:-translate-y-0.5 hover:shadow-lg focus-ring"
        >
          VINYUP
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {primaryNavItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-soft text-sm ${
                  active ? "text-charcoal" : "text-muted hover:text-charcoal"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/auth?tab=signin"
            className="transition-soft rounded-full px-4 py-2 text-sm text-muted hover:text-charcoal"
          >
            Sign In
          </Link>
          <Link
            href="/auth?tab=signup"
            className="transition-soft rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(31,26,23,0.18)] hover:-translate-y-0.5 hover:bg-rose"
          >
            Start Free
          </Link>
        </div>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsOpen((value) => !value)}
          className="transition-soft rounded-full border border-soft-border bg-white/80 p-3 text-charcoal focus-ring lg:hidden"
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1.5 block h-0.5 w-5 bg-current" />
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-soft-border/60 bg-white/90 px-4 pb-6 pt-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {primaryNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm text-charcoal hover:bg-surface-strong"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 grid gap-2">
            <Link
              href="/auth?tab=signin"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-soft-border px-4 py-3 text-center text-sm font-medium text-charcoal"
            >
              Sign In
            </Link>
            <Link
              href="/auth?tab=signup"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-charcoal px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Start Free
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
