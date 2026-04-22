"use client";

import { useEffect, useState, useTransition } from "react";
import { InlineNotice, SubmitButton } from "@/components/shared/form-controls";
import { VendorPageHeader } from "@/components/vendor/vendor-page-header";
import { VendorPanel } from "@/components/vendor/vendor-panel";
import { vendorService } from "@/lib/services/vendor-service";
import { VendorAccountSettings } from "@/types/vendor";

export function VendorSettingsPage() {
  const [account, setAccount] = useState<VendorAccountSettings | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    nextPassword: "",
    confirmPassword: "",
  });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    vendorService.getAccountSettings().then(setAccount);
  }, []);

  if (!account) {
    return <div className="text-sm text-[var(--vendor-muted)]">Loading account settings...</div>;
  }

  return (
    <div className="space-y-6">
      <VendorPageHeader
        eyebrow="Settings"
        title="Account settings kept intentionally simple"
        description="Update your basic account details here. More advanced notification preferences can come later."
      />

      {notice ? <InlineNotice tone="success">{notice}</InlineNotice> : null}
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <VendorPanel className="p-6">
          <h2 className="text-xl font-semibold text-[var(--vendor-text)]">Account details</h2>
          <form
            className="mt-5 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              startTransition(async () => {
                try {
                  const next = await vendorService.updateAccountSettings(account);
                  setAccount(next);
                  setNotice("Account details updated.");
                } catch (caughtError) {
                  setError(
                    caughtError instanceof Error ? caughtError.message : "Could not update account details.",
                  );
                }
              });
            }}
          >
            {[
              { key: "fullName", label: "Full name" },
              { key: "email", label: "Email" },
              { key: "businessName", label: "Business name" },
            ].map((field) => (
              <label key={field.key} className="grid gap-2">
                <span className="text-sm font-medium text-[var(--vendor-text)]">{field.label}</span>
                <input
                  value={account[field.key as keyof VendorAccountSettings]}
                  onChange={(event) =>
                    setAccount((current) =>
                      current
                        ? { ...current, [field.key]: event.target.value }
                        : current,
                    )
                  }
                  className="vendor-focus rounded-[1.25rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
                />
              </label>
            ))}
            <div className="flex justify-end">
              <SubmitButton label="Save Account" pendingLabel="Saving..." pending={isPending} />
            </div>
          </form>
        </VendorPanel>

        <div className="space-y-6">
          <VendorPanel className="p-6">
            <h2 className="text-xl font-semibold text-[var(--vendor-text)]">Change password</h2>
            <form
              className="mt-5 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                setError("");
                startTransition(async () => {
                  try {
                    await vendorService.changePassword(passwordForm);
                    setPasswordForm({
                      currentPassword: "",
                      nextPassword: "",
                      confirmPassword: "",
                    });
                    setNotice("Password updated.");
                  } catch (caughtError) {
                    setError(
                      caughtError instanceof Error ? caughtError.message : "Could not update password.",
                    );
                  }
                });
              }}
            >
              {[
                { key: "currentPassword", label: "Current password" },
                { key: "nextPassword", label: "New password" },
                { key: "confirmPassword", label: "Confirm new password" },
              ].map((field) => (
                <label key={field.key} className="grid gap-2">
                  <span className="text-sm font-medium text-[var(--vendor-text)]">{field.label}</span>
                  <input
                    type="password"
                    value={passwordForm[field.key as keyof typeof passwordForm]}
                    onChange={(event) =>
                      setPasswordForm((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                    className="vendor-focus rounded-[1.25rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
                  />
                </label>
              ))}
              <div className="flex justify-end">
                <SubmitButton label="Update Password" pendingLabel="Updating..." pending={isPending} />
              </div>
            </form>
          </VendorPanel>

          <VendorPanel className="p-6">
            <p className="text-lg font-semibold text-rose-700">Danger zone</p>
            <p className="mt-3 text-sm leading-7 text-[var(--vendor-muted)]">
              Account deletion is not self-service in this MVP. Contact support if you need to request account removal or restoration review.
            </p>
          </VendorPanel>
        </div>
      </div>
    </div>
  );
}
