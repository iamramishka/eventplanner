import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

type SessionUserWithRole = {
  role?: string;
};

/**
 * Server-side layout guard for /couple routes.
 * In development, auth is bypassed so the dashboard can be previewed directly.
 * In production, redirects to /login if no session, or to / if wrong role.
 */
export default async function CoupleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Dev bypass — skip auth so the dashboard can be tested without a real session
  if (process.env.NODE_ENV !== "development") {
    const session = await getServerSession(authOptions);

    if (!session) {
      redirect("/login?from=/couple");
    }

    if ((session.user as SessionUserWithRole)?.role !== "COUPLE") {
      redirect("/");
    }
  }

  return <>{children}</>;
}
