"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authService } from "@/lib/services/auth-service";

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

      if (session.accountStatus !== "active" || session.subscriptionStatus === "suspended") {
        setAllowed(false);
        return;
      }

      if (!session.hasWedding && pathname !== "/onboarding/wedding") {
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
    return (
      <div className="couple-shell flex min-h-screen items-center justify-center px-6">
        <div className="couple-panel max-w-xl rounded-[2rem] px-6 py-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose">
            Wedding Workspace Locked
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-charcoal">
            This wedding workspace is no longer editable
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted">
            The trial or grace period has ended for this wedding. Ask the platform team to extend
            the subscription if you need access restored.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
