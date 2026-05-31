"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, InlineNotice, SubmitButton } from "@/components/shared/form-controls";
import { vendorAuthService } from "@/lib/services/vendor-auth-service";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type VendorLoginFormProps = {
  nextPath?: string;
  initialMode?: "signin" | "signup";
};

export function VendorLoginForm({
  nextPath,
  initialMode = "signin",
}: VendorLoginFormProps) {
  const showDemoCredentials = !isSupabaseConfigured();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [signinForm, setSigninForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-2 rounded-[1.5rem] bg-white/80 p-1.5">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setError("");
            setSuccess("");
          }}
          className={`rounded-[1.1rem] px-4 py-3 text-sm font-semibold transition-soft ${
            mode === "signin"
              ? "bg-charcoal text-white shadow-[0_12px_30px_rgba(31,26,23,0.16)]"
              : "text-[var(--vendor-text)] hover:bg-slate-100"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError("");
            setSuccess("");
          }}
          className={`rounded-[1.1rem] px-4 py-3 text-sm font-semibold transition-soft ${
            mode === "signup"
              ? "bg-charcoal text-white shadow-[0_12px_30px_rgba(31,26,23,0.16)]"
              : "text-[var(--vendor-text)] hover:bg-slate-100"
          }`}
        >
          Create Account
        </button>
      </div>

      <form
        className="grid gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setError("");
          setSuccess("");

          try {
            if (mode === "signin") {
              await vendorAuthService.login(signinForm);
            } else {
              await vendorAuthService.register(signupForm);
              setSuccess("Your vendor workspace is ready. Finish your profile and submit it for review when you are ready.");
            }

            router.push(nextPath || "/vendor-dashboard");
          } catch (caughtError) {
            setError(
              caughtError instanceof Error
                ? caughtError.message
                : mode === "signin"
                  ? "Something went wrong while signing you in."
                  : "Something went wrong while creating your vendor account.",
            );
          } finally {
            setPending(false);
          }
        }}
      >
        {mode === "signin" ? (
          <>
            <Field
              label="Email"
              name="email"
              type="email"
              value={signinForm.email}
              placeholder="vendor@example.com"
              disabled={pending}
              onChange={(event) =>
                setSigninForm((current) => ({ ...current, email: event.target.value }))
              }
            />
            <Field
              label="Password"
              name="password"
              type="password"
              value={signinForm.password}
              placeholder="Enter your password"
              disabled={pending}
              onChange={(event) =>
                setSigninForm((current) => ({ ...current, password: event.target.value }))
              }
            />
            {showDemoCredentials ? (
              <InlineNotice tone="default">
                Demo vendor account: <strong>studio@vinyup.com</strong> with password{" "}
                <strong>Vendor123!</strong>
              </InlineNotice>
            ) : null}
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                name="fullName"
                value={signupForm.fullName}
                placeholder="Your name"
                disabled={pending}
                onChange={(event) =>
                  setSignupForm((current) => ({ ...current, fullName: event.target.value }))
                }
              />
              <Field
                label="Business name"
                name="businessName"
                value={signupForm.businessName}
                placeholder="Studio or brand name"
                disabled={pending}
                onChange={(event) =>
                  setSignupForm((current) => ({ ...current, businessName: event.target.value }))
                }
              />
            </div>
            <Field
              label="Email"
              name="signupEmail"
              type="email"
              value={signupForm.email}
              placeholder="vendor@example.com"
              disabled={pending}
              onChange={(event) =>
                setSignupForm((current) => ({ ...current, email: event.target.value }))
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Password"
                name="signupPassword"
                type="password"
                value={signupForm.password}
                placeholder="At least 8 characters"
                disabled={pending}
                onChange={(event) =>
                  setSignupForm((current) => ({ ...current, password: event.target.value }))
                }
              />
              <Field
                label="Confirm password"
                name="confirmPassword"
                type="password"
                value={signupForm.confirmPassword}
                placeholder="Re-enter your password"
                disabled={pending}
                onChange={(event) =>
                  setSignupForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
              />
            </div>
            <InlineNotice tone="default">
              You will land in the live vendor dashboard with a ready-to-complete draft profile.
            </InlineNotice>
          </>
        )}
        {success ? <InlineNotice tone="success">{success}</InlineNotice> : null}
        {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
        <SubmitButton
          label={mode === "signin" ? "Sign In" : "Create Vendor Account"}
          pendingLabel={mode === "signin" ? "Signing in..." : "Creating account..."}
          pending={pending}
        />
      </form>
    </div>
  );
}
