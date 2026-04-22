"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authService } from "@/lib/services/auth-service";
import { Field, InlineNotice, SubmitButton } from "@/components/shared/form-controls";

export function SignInForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
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
          const session = await authService.login(form);
          router.push(session.hasWedding ? "/couple-dashboard" : "/onboarding/wedding");
        } catch (caughtError) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Something went wrong while signing you in.",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <Field
        label="Email"
        name="email"
        type="email"
        value={form.email}
        placeholder="you@example.com"
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
        placeholder="Enter your password"
        disabled={pending}
        onChange={(event) =>
          setForm((current) => ({ ...current, password: event.target.value }))
        }
      />
      <InlineNotice tone="default">
        Demo accounts: <strong>amaya@vinyup.com</strong> or <strong>nilan@vinyup.com</strong> with password <strong>Welcome123!</strong>
      </InlineNotice>
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
      <div className="mt-2 flex flex-col gap-3">
        <SubmitButton label="Sign In" pendingLabel="Signing in..." pending={pending} />
        <p className="text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/auth?tab=signup" className="font-semibold text-rose">
            Create One
          </Link>
        </p>
        <p className="text-sm text-muted">
          Forgot password? <span className="font-semibold text-charcoal">Password recovery is planned for backend integration.</span>
        </p>
      </div>
    </form>
  );
}
