"use client";

import { useEffect, useState, useTransition } from "react";
import { InlineNotice, SubmitButton } from "@/components/shared/form-controls";
import { VendorPageHeader } from "@/components/vendor/vendor-page-header";
import { VendorPanel } from "@/components/vendor/vendor-panel";
import { vendorService } from "@/lib/services/vendor-service";
import { VendorContactInfoRecord } from "@/types/vendor";

export function VendorContactPage() {
  const [form, setForm] = useState<VendorContactInfoRecord | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    vendorService.getContactInfo().then(setForm);
  }, []);

  if (!form) {
    return <div className="text-sm text-[var(--vendor-muted)]">Loading contact info...</div>;
  }

  return (
    <div className="space-y-6">
      <VendorPageHeader
        eyebrow="Contact"
        title="Give couples a clear way to reach you"
        description="Keep your public contact and social links current so interest turns into conversation without confusion."
      />

      {notice ? <InlineNotice tone="success">{notice}</InlineNotice> : null}
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}

      <VendorPanel className="p-6">
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            startTransition(async () => {
              try {
                const next = await vendorService.updateContactInfo(form);
                setForm(next);
                setNotice("Contact information updated.");
              } catch (caughtError) {
                setError(
                  caughtError instanceof Error ? caughtError.message : "Could not save contact information.",
                );
              }
            });
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: "phone", label: "Phone" },
              { key: "whatsapp", label: "WhatsApp" },
              { key: "email", label: "Email" },
              { key: "website", label: "Website" },
              { key: "instagram", label: "Instagram" },
              { key: "facebook", label: "Facebook" },
              { key: "mapLink", label: "Map link" },
            ].map((field) => (
              <label key={field.key} className="grid gap-2">
                <span className="text-sm font-medium text-[var(--vendor-text)]">{field.label}</span>
                <input
                  value={form[field.key as keyof VendorContactInfoRecord] as string}
                  onChange={(event) =>
                    setForm((current) =>
                      current
                        ? { ...current, [field.key]: event.target.value }
                        : current,
                    )
                  }
                  className="vendor-focus rounded-[1.25rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
                />
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <SubmitButton label="Save Contact Info" pendingLabel="Saving..." pending={isPending} />
          </div>
        </form>
      </VendorPanel>
    </div>
  );
}
