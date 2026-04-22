"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminAuthService } from "@/lib/services/admin-auth-service";
import { AdminSession } from "@/types/admin";

type AdminGuardProps = {
  children: React.ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AdminSession | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    adminAuthService.getSession().then((currentSession) => {
      if (!mounted) {
        return;
      }

      if (!currentSession) {
        router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
        setSession(null);
        return;
      }

      setSession(currentSession);
    });

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  if (session === undefined) {
    return (
      <div className="admin-shell flex min-h-screen items-center justify-center p-6">
        <div className="admin-panel rounded-3xl px-6 py-5 text-sm text-slate-600">
          Verifying admin session...
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
