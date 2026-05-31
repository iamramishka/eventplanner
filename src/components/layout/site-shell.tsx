import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

type SiteShellProps = {
  children: React.ReactNode;
  compact?: boolean;
};

export function SiteShell({ children, compact = false }: SiteShellProps) {
  return (
    <div className="page-shell">
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className={compact ? "flex-1" : "flex-1 pb-10"}>{children}</main>
        <Footer />
      </div>
    </div>
  );
}
