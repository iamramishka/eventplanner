"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckboxField, InlineNotice, SubmitButton } from "@/components/shared/form-controls";
import { VendorPageHeader } from "@/components/vendor/vendor-page-header";
import { VendorPanel } from "@/components/vendor/vendor-panel";
import { vendorService } from "@/lib/services/vendor-service";
import { VendorServiceRecord } from "@/types/vendor";

type ServiceFormState = {
  title: string;
  description: string;
  isActive: boolean;
};

type PackageFormState = {
  packageName: string;
  description: string;
  priceNote: string;
  inclusionsText: string;
  isActive: boolean;
};

const emptyServiceForm: ServiceFormState = {
  title: "",
  description: "",
  isActive: true,
};

const emptyPackageForm: PackageFormState = {
  packageName: "",
  description: "",
  priceNote: "",
  inclusionsText: "",
  isActive: true,
};

export function VendorServicesPage() {
  const [items, setItems] = useState<VendorServiceRecord[]>([]);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [packageForm, setPackageForm] = useState(emptyPackageForm);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    const next = await vendorService.getServices();
    setItems(next);
    if (!selectedServiceId && next[0]) {
      setSelectedServiceId(next[0].id);
    }
  };

  useEffect(() => {
    vendorService.getServices().then((next) => {
      setItems(next);
      if (next[0]) {
        setSelectedServiceId((current) => current || next[0].id);
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <VendorPageHeader
        eyebrow="Services"
        title="Explain what you offer without clutter"
        description="Keep your services and packages clear so couples understand the shape of your work and where to start."
      />

      {notice ? <InlineNotice tone="success">{notice}</InlineNotice> : null}
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <VendorPanel className="p-6">
          <div className="space-y-4">
            {items.map((service) => (
              <div key={service.id} className="rounded-[1.5rem] border border-[var(--vendor-border)] bg-white px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold text-[var(--vendor-text)]">{service.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--vendor-muted)]">{service.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingServiceId(service.id);
                        setServiceForm({
                          title: service.title,
                          description: service.description,
                          isActive: service.isActive,
                        });
                        setSelectedServiceId(service.id);
                      }}
                      className="rounded-full border border-[var(--vendor-border)] px-3 py-1.5 text-xs font-semibold text-[var(--vendor-text)]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          await vendorService.deleteService(service.id);
                          await load();
                          if (selectedServiceId === service.id) {
                            setSelectedServiceId("");
                          }
                          setNotice("Service removed.");
                        })
                      }
                      className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {service.packages.length ? (
                  <div className="mt-4 space-y-3">
                    {service.packages.map((pkg) => (
                      <div key={pkg.id} className="rounded-[1.3rem] bg-slate-50 px-4 py-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[var(--vendor-text)]">{pkg.packageName}</p>
                            <p className="mt-1 text-sm text-[var(--vendor-muted)]">{pkg.priceNote || "Custom quote"}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedServiceId(service.id);
                                setEditingPackageId(pkg.id);
                                setPackageForm({
                                  packageName: pkg.packageName,
                                  description: pkg.description,
                                  priceNote: pkg.priceNote,
                                  inclusionsText: pkg.inclusions.join(", "),
                                  isActive: pkg.isActive,
                                });
                              }}
                              className="rounded-full border border-[var(--vendor-border)] px-3 py-1.5 text-xs font-semibold text-[var(--vendor-text)]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() =>
                                startTransition(async () => {
                                  await vendorService.deletePackage(service.id, pkg.id);
                                  await load();
                                  setNotice("Package removed.");
                                })
                              }
                              className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-[var(--vendor-muted)]">{pkg.description}</p>
                        {pkg.inclusions.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {pkg.inclusions.map((item) => (
                              <span key={item} className="rounded-full bg-white px-3 py-1 text-xs text-[var(--vendor-text)]">
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[var(--vendor-muted)]">No packages added yet.</p>
                )}
              </div>
            ))}
          </div>
        </VendorPanel>

        <div className="space-y-6">
          <VendorPanel className="p-6">
            <h2 className="text-xl font-semibold text-[var(--vendor-text)]">
              {editingServiceId ? "Edit service" : "Add service"}
            </h2>
            <form
              className="mt-5 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                setError("");
                startTransition(async () => {
                  try {
                    const next = await vendorService.upsertService({
                      id: editingServiceId ?? undefined,
                      title: serviceForm.title,
                      description: serviceForm.description,
                      isActive: serviceForm.isActive,
                    });
                    setItems(next);
                    const focusService = editingServiceId ?? next[next.length - 1]?.id ?? "";
                    setSelectedServiceId(focusService);
                    setEditingServiceId(null);
                    setServiceForm(emptyServiceForm);
                    setNotice("Service saved.");
                  } catch (caughtError) {
                    setError(
                      caughtError instanceof Error ? caughtError.message : "Could not save service.",
                    );
                  }
                });
              }}
            >
              <div className="grid gap-2">
                <span className="text-sm font-medium text-[var(--vendor-text)]">Title</span>
                <input
                  value={serviceForm.title}
                  onChange={(event) => setServiceForm((current) => ({ ...current, title: event.target.value }))}
                  className="vendor-focus rounded-[1.25rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
                />
              </div>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--vendor-text)]">Description</span>
                <textarea
                  value={serviceForm.description}
                  onChange={(event) => setServiceForm((current) => ({ ...current, description: event.target.value }))}
                  rows={4}
                  className="vendor-focus rounded-[1.35rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
                />
              </label>
              <CheckboxField
                label="Service is active"
                checked={serviceForm.isActive}
                onChange={(event) => setServiceForm((current) => ({ ...current, isActive: event.target.checked }))}
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingServiceId(null);
                    setServiceForm(emptyServiceForm);
                  }}
                  className="rounded-full border border-[var(--vendor-border)] px-4 py-3 text-sm font-semibold text-[var(--vendor-text)]"
                >
                  Clear
                </button>
                <SubmitButton label="Save Service" pendingLabel="Saving..." pending={isPending} />
              </div>
            </form>
          </VendorPanel>

          <VendorPanel className="p-6">
            <h2 className="text-xl font-semibold text-[var(--vendor-text)]">
              {editingPackageId ? "Edit package" : "Add package"}
            </h2>
            <form
              className="mt-5 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!selectedServiceId) {
                  setError("Create or select a service before adding a package.");
                  return;
                }
                setError("");
                startTransition(async () => {
                  try {
                    await vendorService.upsertPackage(selectedServiceId, {
                      id: editingPackageId ?? undefined,
                      packageName: packageForm.packageName,
                      description: packageForm.description,
                      priceNote: packageForm.priceNote,
                      inclusions: packageForm.inclusionsText
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                      isActive: packageForm.isActive,
                    });
                    await load();
                    setEditingPackageId(null);
                    setPackageForm(emptyPackageForm);
                    setNotice("Package saved.");
                  } catch (caughtError) {
                    setError(
                      caughtError instanceof Error ? caughtError.message : "Could not save package.",
                    );
                  }
                });
              }}
            >
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--vendor-text)]">Service</span>
                <select
                  value={selectedServiceId}
                  onChange={(event) => setSelectedServiceId(event.target.value)}
                  className="vendor-focus rounded-[1.25rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
                >
                  <option value="">Select a service</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-2">
                <span className="text-sm font-medium text-[var(--vendor-text)]">Package name</span>
                <input
                  value={packageForm.packageName}
                  onChange={(event) => setPackageForm((current) => ({ ...current, packageName: event.target.value }))}
                  className="vendor-focus rounded-[1.25rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
                />
              </div>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--vendor-text)]">Description</span>
                <textarea
                  value={packageForm.description}
                  onChange={(event) => setPackageForm((current) => ({ ...current, description: event.target.value }))}
                  rows={4}
                  className="vendor-focus rounded-[1.35rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <span className="text-sm font-medium text-[var(--vendor-text)]">Price note</span>
                  <input
                    value={packageForm.priceNote}
                    onChange={(event) => setPackageForm((current) => ({ ...current, priceNote: event.target.value }))}
                    className="vendor-focus rounded-[1.25rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
                  />
                </div>
                <div className="grid gap-2">
                  <span className="text-sm font-medium text-[var(--vendor-text)]">Inclusions</span>
                  <input
                    value={packageForm.inclusionsText}
                    onChange={(event) => setPackageForm((current) => ({ ...current, inclusionsText: event.target.value }))}
                    placeholder="Coverage, album, highlights"
                    className="vendor-focus rounded-[1.25rem] border border-[var(--vendor-border)] bg-white px-4 py-3 text-sm text-[var(--vendor-text)]"
                  />
                </div>
              </div>
              <CheckboxField
                label="Package is active"
                checked={packageForm.isActive}
                onChange={(event) => setPackageForm((current) => ({ ...current, isActive: event.target.checked }))}
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPackageId(null);
                    setPackageForm(emptyPackageForm);
                  }}
                  className="rounded-full border border-[var(--vendor-border)] px-4 py-3 text-sm font-semibold text-[var(--vendor-text)]"
                >
                  Clear
                </button>
                <SubmitButton label="Save Package" pendingLabel="Saving..." pending={isPending} />
              </div>
            </form>
          </VendorPanel>
        </div>
      </div>
    </div>
  );
}
