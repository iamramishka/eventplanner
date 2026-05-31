"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, InlineNotice, SubmitButton } from "@/components/shared/form-controls";
import { adminCredentials } from "@/data/admin-mock";
import { adminAuthService } from "@/lib/services/admin-auth-service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type AdminLoginFormProps = {
  nextPath?: string;
};

export function AdminLoginForm({ nextPath }: AdminLoginFormProps) {
  const router = useRouter();
  const showDemoCredentials = !isSupabaseConfigured();
  const [form, setForm] = useState({
    email: showDemoCredentials ? adminCredentials.email : "",
    password: showDemoCredentials ? adminCredentials.password : "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError("");

        try {
          await adminAuthService.login(form);
          router.push(nextPath || "/admin");
        } catch (caughtError) {
          setError(
            caughtError instanceof Error ? caughtError.message : "Unable to sign in.",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <Field
        label="Admin email"
        name="email"
        type="email"
        value={form.email}
        disabled={pending}
        onChange={(event) =>
          setForm((current) => ({ ...current, email: event.target.value }))
        }
      />
      <Field
        label="Password"
        name="password"
        type="password"
        value={form.password}
        disabled={pending}
        onChange={(event) =>
          setForm((current) => ({ ...current, password: event.target.value }))
        }
      />
      {showDemoCredentials ? (
        <InlineNotice tone="default">
          Demo admin access uses <strong>{adminCredentials.email}</strong> and{" "}
          <strong>{adminCredentials.password}</strong>.
        </InlineNotice>
      ) : null}
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
      <SubmitButton label="Sign In To Admin" pendingLabel="Signing in..." pending={pending} />
    </form>
  );
}
