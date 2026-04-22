import { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Super Admin Login",
  description: "Secure entry to the Vinyup Super Admin system.",
  path: "/admin/login",
  noIndex: true,
});

type AdminLoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;

  return (
    <div className="admin-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
            Vinyup Super Admin
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
            Professional control for platform operations.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
            This admin experience is intentionally minimal, fast, and data-first. It handles operational control only and stays separate from the public and end-user product surfaces.
          </p>
        </div>

        <div className="admin-panel rounded-[2rem] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-950">Sign in</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Single-role admin access for the current MVP.
          </p>
          <div className="mt-6">
            <AdminLoginForm nextPath={params.next} />
          </div>
        </div>
      </div>
    </div>
  );
}
