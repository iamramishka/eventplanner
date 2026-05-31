import { AuthTabs } from "@/components/forms/auth-tabs";
import { buildMetadata } from "@/lib/metadata";
import { AuthTab } from "@/types/public";

type AuthPageProps = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

export const metadata = buildMetadata({
  title: "Sign Up, Sign In, or Find My Event",
  description:
    "Use one elegant Public Web page to create an account, return to planning, or help guests find their event.",
  path: "/auth",
  noIndex: true,
});

const allowedTabs: AuthTab[] = ["signup", "signin", "find-event"];

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const currentTab = allowedTabs.includes(params.tab as AuthTab)
    ? (params.tab as AuthTab)
    : "signup";

  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <AuthTabs defaultTab={currentTab} />
      </div>
    </section>
  );
}
