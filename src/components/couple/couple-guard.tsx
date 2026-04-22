"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authService } from "@/lib/services/auth-service";
import { getWeddings } from "@/lib/services/browser-store";

type CoupleGuardProps = {
  children: React.ReactNode;
};

export function CoupleGuard({ children }: CoupleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    authService.getSession().then((session) => {
      if (!mounted) {
        return;
      }

      if (!session || session.role !== "couple") {
        router.replace(`/auth?tab=signin`);
        setAllowed(false);
        return;
      }

      const wedding = getWeddings().find((item) => item.userId === session.id);
      if (!wedding && pathname !== "/onboarding/wedding") {
        router.replace("/onboarding/wedding");
        setAllowed(false);
        return;
      }

      setAllowed(true);
    });

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  if (allowed === null) {
    return (
      <div className="couple-shell flex min-h-screen items-center justify-center px-6">
        <div className="couple-panel rounded-[2rem] px-6 py-5 text-sm text-muted">
          Opening your wedding workspace...
        </div>
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
