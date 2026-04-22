"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authService } from "@/lib/services/auth-service";
import { Field, InlineNotice, SubmitButton } from "@/components/shared/form-controls";

export function SignUpForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
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
          await authService.register(form);
          router.push("/onboarding/wedding");
        } catch (caughtError) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Something went wrong while creating your account.",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <Field
        label="Full name"
        name="fullName"
        value={form.fullName}
        placeholder="Enter your full name"
        disabled={pending}
        onChange={(event) =>
          setForm((current) => ({ ...current, fullName: event.target.value }))
        }
      />
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
        placeholder="Create a secure password"
        helperText="Use at least 8 characters for the MVP flow."
        disabled={pending}
        onChange={(event) =>
          setForm((current) => ({ ...current, password: event.target.value }))
        }
      />
      <Field
        label="Confirm password"
        name="confirmPassword"
        type="password"
        value={form.confirmPassword}
        placeholder="Repeat your password"
        disabled={pending}
        onChange={(event) =>
          setForm((current) => ({ ...current, confirmPassword: event.target.value }))
        }
      />
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
      <div className="mt-2 flex flex-col gap-3">
        <SubmitButton label="Create Account" pendingLabel="Creating account..." pending={pending} />
        <p className="text-sm text-muted">
          Already have an account?{" "}
          <Link href="/auth?tab=signin" className="font-semibold text-rose">
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
}
