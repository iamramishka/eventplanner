"use client";

import { useEffect, useState, useTransition } from "react";
import { InlineNotice, SubmitButton } from "@/components/shared/form-controls";
import { VendorPageHeader } from "@/components/vendor/vendor-page-header";
import { VendorPanel } from "@/components/vendor/vendor-panel";
import { vendorService } from "@/lib/services/vendor-service";
import { VendorCategory, VendorProfileRecord } from "@/types/vendor";

const categories: VendorCategory[] = [
  "Photography",
  "Videography",
  "Catering",
  "Decoration",
  "Makeup",
  "Music",
  "Transport",
  "Cake",
  "Venue",
  "Planning",
  "Other",
];

export function VendorProfilePage() {
  const [form, setForm] = useState<VendorProfileRecord | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    vendorService.getProfile().then(setForm);
  }, []);

  if (!form) {
    return <div className="text-sm text-[var(--vendor-muted)]">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <VendorPageHeader
        eyebrow="Profile"
        title="Shape your business identity"
        description="Present your brand clearly so couples understand what you do, where you work, and what kind of experience you offer."
      />

      {notice ? <InlineNotice tone="success">{notice}</InlineNotice> : null}
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <VendorPanel className="p-6">
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              startTransition(async () => {
                try {
                  const next = await vendorService.updateProfile(form);
                  setForm(next);
                  setNotice("Vendor profile updated.");
                } catch (caughtError) {
                  setError(
                    caughtError instanceof Error ? caughtError.message : "Could not save profile.",
                  );
                }
              });
            }}
          >
            <div className="grid gap-2">
              <span className="text-sm font-medium text-[var(--vendor-text)]">Business name</span>
              <input
                aria-label="Business name"
                value={form.businessName}
                onChange={(event) => setForm((current) => current ? { ...current, businessName: event.target.value } : current)}
                className="vendor-focus rounded-[1.25rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--vendor-text)]">Category</span>
                <select
                  aria-label="Category"
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) =>
                      current ? { ...current, category: event.target.value as VendorCategory } : current,
                    )
                  }
                  className="vendor-focus rounded-[1.25rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-2">
                <span className="text-sm font-medium text-[var(--vendor-text)]">Tagline</span>
                <input
                  aria-label="Tagline"
                  value={form.tagline}
                  onChange={(event) => setForm((current) => current ? { ...current, tagline: event.target.value } : current)}
                  className="vendor-focus rounded-[1.25rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
                />
              </div>
            </div>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[var(--vendor-text)]">Description</span>
              <textarea
                aria-label="Description"
                value={form.description}
                onChange={(event) => setForm((current) => current ? { ...current, description: event.target.value } : current)}
                rows={6}
                className="vendor-focus rounded-[1.35rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <span className="text-sm font-medium text-[var(--vendor-text)]">Location</span>
                <input
                  aria-label="Location"
                  value={form.location}
                  onChange={(event) => setForm((current) => current ? { ...current, location: event.target.value } : current)}
                  className="vendor-focus rounded-[1.25rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
                />
              </div>
              <div className="grid gap-2">
                <span className="text-sm font-medium text-[var(--vendor-text)]">Coverage area</span>
                <input
                  aria-label="Coverage area"
                  value={form.coverageArea}
                  onChange={(event) => setForm((current) => current ? { ...current, coverageArea: event.target.value } : current)}
                  className="vendor-focus rounded-[1.25rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <span className="text-sm font-medium text-[var(--vendor-text)]">Years of experience</span>
                <input
                  aria-label="Years of experience"
                  type="number"
                  value={String(form.experienceYears)}
                  onChange={(event) => setForm((current) => current ? { ...current, experienceYears: Number(event.target.value || 0) } : current)}
                  className="vendor-focus rounded-[1.25rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
                />
              </div>
              <div className="grid gap-2">
                <span className="text-sm font-medium text-[var(--vendor-text)]">Price range</span>
                <input
                  aria-label="Price range"
                  value={form.priceRange}
                  onChange={(event) => setForm((current) => current ? { ...current, priceRange: event.target.value } : current)}
                  className="vendor-focus rounded-[1.25rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <SubmitButton label="Save Profile" pendingLabel="Saving..." pending={isPending} />
            </div>
          </form>
        </VendorPanel>

        <VendorPanel className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--vendor-accent)]">
            Preview
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--vendor-text)]">{form.businessName}</h2>
          <p className="mt-2 text-sm font-medium text-[var(--vendor-primary)]">{form.category}</p>
          <p className="mt-4 text-sm leading-7 text-[var(--vendor-muted)]">{form.tagline}</p>
          <p className="mt-4 text-sm leading-7 text-[var(--vendor-muted)]">{form.description}</p>
          <div className="mt-6 grid gap-3">
            {[
              `Based in ${form.location || "your location"}`,
              form.coverageArea || "Coverage area not added yet",
              `${form.experienceYears} years experience`,
              form.priceRange || "Price range not added yet",
            ].map((item) => (
              <div key={item} className="rounded-[1.3rem] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]">
                {item}
              </div>
            ))}
          </div>
        </VendorPanel>
      </div>
    </div>
  );
}
