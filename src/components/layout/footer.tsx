import Link from "next/link";
import { footerGroups, siteConfig } from "@/data/site";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-soft-border/70 bg-white/65">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose">
              {siteConfig.shortName}
            </p>
            <h2 className="mt-4 font-display text-3xl text-charcoal">
              Wedding planning should feel graceful, not scattered.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Vinyup combines emotional invitation design with the structure couples need to keep guests, RSVPs, and decisions moving.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-charcoal">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-soft hover:text-charcoal"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-soft-border/70 pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Crafted for beautiful celebrations.</p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-charcoal">
              Brand Story
            </Link>
            <Link href="/contact" className="hover:text-charcoal">
              Contact
            </Link>
            <Link href="/faq" className="hover:text-charcoal">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
