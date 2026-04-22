"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { vendorAuthService } from "@/lib/services/vendor-auth-service";
import { VendorSession } from "@/types/vendor";

export function VendorGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<VendorSession | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    vendorAuthService.getSession().then((currentSession) => {
      if (!mounted) {
        return;
      }

      if (!currentSession) {
        router.replace(`/vendor-dashboard/login?next=${encodeURIComponent(pathname)}`);
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
      <div className="vendor-shell flex min-h-screen items-center justify-center p-6">
        <div className="vendor-panel rounded-[1.5rem] px-6 py-5 text-sm text-[var(--vendor-muted)]">
          Verifying vendor session...
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
