import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Server-side layout guard for /vendor routes.
 * Redirects to /login if no session, or to / if wrong role.
 */
export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?from=/vendor");
  }

  if ((session.user as any)?.role !== "VENDOR") {
    redirect("/");
  }

  return <>{children}</>;
}
