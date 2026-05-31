"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useState, useTransition } from "react";
import { InlineNotice } from "@/components/shared/form-controls";
import { VendorBadge } from "@/components/vendor/vendor-badge";
import { VendorPageHeader } from "@/components/vendor/vendor-page-header";
import { VendorPanel } from "@/components/vendor/vendor-panel";
import { vendorService } from "@/lib/services/vendor-service";
import { VendorGalleryAsset } from "@/types/vendor";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Image upload failed."));
    reader.readAsDataURL(file);
  });
}

export function VendorGalleryPage() {
  const [items, setItems] = useState<VendorGalleryAsset[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const load = async () => setItems(await vendorService.getGallery());

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <VendorPageHeader
        eyebrow="Gallery"
        title="Portfolio that feels clean and professional"
        description="Upload, reorder, and feature your strongest visuals so couples understand your style quickly."
      />

      {notice ? <InlineNotice tone="success">{notice}</InlineNotice> : null}
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}

      <VendorPanel className="p-6">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-[var(--vendor-text)]">Upload image</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }
              setError("");
              startTransition(async () => {
                try {
                  if (file.size > 4 * 1024 * 1024) {
                    throw new Error("Images must be smaller than 4MB.");
                  }
                  if (!file.type.startsWith("image/")) {
                    throw new Error("Only image uploads are supported.");
                  }
                  const imageUrl = await readFileAsDataUrl(file);
                  await vendorService.addGalleryAsset({
                    imageUrl,
                    altText: file.name.replace(/\.[^/.]+$/, ""),
                  });
                  await load();
                  setNotice("Portfolio image uploaded.");
                } catch (caughtError) {
                  setError(
                    caughtError instanceof Error ? caughtError.message : "Gallery upload failed.",
                  );
                }
              });
            }}
            className="rounded-[1.3rem] border border-dashed border-[var(--vendor-border)] bg-white px-4 py-4 text-sm text-[var(--vendor-text)]"
          />
        </label>
      </VendorPanel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <VendorPanel key={item.id} className="overflow-hidden p-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-slate-100">
              <Image
                src={item.imageUrl}
                alt={item.altText}
                fill
                unoptimized={item.imageUrl.startsWith("data:")}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--vendor-text)]">{item.altText}</p>
              {item.isFeatured ? <VendorBadge label="Featured" tone="accent" /> : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await vendorService.setFeaturedGalleryAsset(item.id);
                    await load();
                    setNotice("Featured image updated.");
                  })
                }
                className="rounded-full border border-[var(--vendor-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--vendor-text)]"
              >
                Feature
              </button>
              <button
                type="button"
                disabled={isPending || index === 0}
                onClick={() =>
                  startTransition(async () => {
                    await vendorService.moveGalleryAsset(item.id, "up");
                    await load();
                  })
                }
                className="rounded-full border border-[var(--vendor-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--vendor-text)] disabled:opacity-50"
              >
                Up
              </button>
              <button
                type="button"
                disabled={isPending || index === items.length - 1}
                onClick={() =>
                  startTransition(async () => {
                    await vendorService.moveGalleryAsset(item.id, "down");
                    await load();
                  })
                }
                className="rounded-full border border-[var(--vendor-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--vendor-text)] disabled:opacity-50"
              >
                Down
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await vendorService.removeGalleryAsset(item.id);
                    await load();
                    setNotice("Portfolio image removed.");
                  })
                }
                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
              >
                Remove
              </button>
            </div>
          </VendorPanel>
        ))}
      </div>
    </div>
  );
}
