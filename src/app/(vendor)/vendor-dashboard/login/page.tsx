import { VendorLoginForm } from "@/components/vendor/vendor-login-form";
import { buildMetadata } from "@/lib/metadata";

type VendorLoginPageProps = {
  searchParams: Promise<{
    next?: string;
    mode?: string;
  }>;
};

export const metadata = buildMetadata({
  title: "Vendor Login",
  description: "Vendor dashboard access for Vinyup.",
  path: "/vendor-dashboard/login",
  noIndex: true,
});

export default async function VendorLoginPage({ searchParams }: VendorLoginPageProps) {
  const query = await searchParams;
  const initialMode = query.mode === "signup" ? "signup" : "signin";

  return (
    <main className="vendor-shell flex min-h-screen items-center justify-center px-4 py-10">
      <section className="vendor-panel w-full max-w-lg rounded-[2rem] p-8 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--vendor-accent)]">
          Vendor Dashboard
        </p>
        <h1 className="mt-5 text-4xl font-semibold text-[var(--vendor-text)]">
          Manage your business profile in one calm workspace
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--vendor-muted)]">
          Sign in or create a vendor account to manage your profile, services, portfolio, and public visibility.
        </p>
        <div className="mt-8">
          <VendorLoginForm nextPath={query.next} initialMode={initialMode} />
        </div>
      </section>
    </main>
  );
}
