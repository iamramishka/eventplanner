import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Server-side layout guard for /super routes.
 * Redirects to /login if no session, or to / if wrong role.
 */
export default async function SuperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?from=/super");
  }

  if ((session.user as any)?.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}
