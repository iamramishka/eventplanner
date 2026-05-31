"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useState, useTransition } from "react";
import { CoupleBadge } from "@/components/couple/couple-badge";
import { CoupleEmptyState } from "@/components/couple/couple-empty-state";
import { CouplePageHeader } from "@/components/couple/couple-page-header";
import { CouplePanel } from "@/components/couple/couple-panel";
import { Field, InlineNotice } from "@/components/shared/form-controls";
import { musicTracks } from "@/data/couple-mock";
import { coupleService } from "@/lib/services/couple-service";
import {
  InvitationContentSection,
  InvitationWorkspaceState,
} from "@/types/couple";

const invitationTabs = ["Content", "Sections", "Theme", "Gallery", "Music"] as const;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Image upload failed."));
    reader.readAsDataURL(file);
  });
}

export function InvitationWorkspacePage() {
  const [workspace, setWorkspace] = useState<InvitationWorkspaceState | null>(null);
  const [tab, setTab] = useState<(typeof invitationTabs)[number]>("Content");
  const [selectedSectionKey, setSelectedSectionKey] =
    useState<InvitationContentSection["key"]>("hero");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    const data = await coupleService.getInvitationWorkspace();
    setWorkspace(data);
  };

  useEffect(() => {
    load();
  }, []);

  if (!workspace) {
    return <div className="text-sm text-muted">Loading invitation workspace...</div>;
  }

  const selectedSection =
    workspace.sections.find((item) => item.key === selectedSectionKey) ?? workspace.sections[0];

  const previewImage = workspace.gallery.find((item) => item.isCover)?.imageUrl ?? "/templates/blush-bloom.svg";

  return (
    <div className="space-y-6">
      <CouplePageHeader
        eyebrow="Invitation Website"
        title="A simple publishing workspace for your invitation"
        description="Edit the invitation experience through guided controls, not technical builder tools."
        actions={
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                try {
                  const next = await coupleService.publishInvitation();
                  setWorkspace(next);
                  setNotice("Invitation changes published.");
                  setError("");
                } catch (caughtError) {
                  setError(
                    caughtError instanceof Error ? caughtError.message : "Publish failed.",
                  );
                }
              })
            }
            className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            {isPending ? "Publishing..." : "Publish Changes"}
          </button>
        }
      />

      {notice ? <InlineNotice tone="success">{notice}</InlineNotice> : null}
      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}

      <CouplePanel className="p-5">
        <div className="flex flex-wrap gap-3">
          {invitationTabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-soft ${
                tab === item
                  ? "bg-charcoal text-white"
                  : "border border-[#E8DDD7] bg-white text-charcoal"
              }`}
            >
              {item}
            </button>
          ))}
          <CoupleBadge
            label={
              workspace.publishState.hasUnpublishedChanges
                ? "Draft changes ready"
                : "Published"
            }
            tone={workspace.publishState.hasUnpublishedChanges ? "warning" : "success"}
          />
        </div>
      </CouplePanel>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <CouplePanel className="p-6">
          {tab === "Content" ? (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {workspace.sections.map((section) => (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => setSelectedSectionKey(section.key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-soft ${
                      selectedSection.key === section.key
                        ? "bg-[#F8E7EC] text-rose"
                        : "border border-[#E8DDD7] bg-white text-charcoal"
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
              <Field
                label="Section title"
                name="sectionTitle"
                value={selectedSection.title}
                onChange={(event) =>
                  setWorkspace((current) =>
                    current
                      ? {
                          ...current,
                          sections: current.sections.map((item) =>
                            item.key === selectedSection.key
                              ? { ...item, title: event.target.value }
                              : item,
                          ),
                        }
                      : current,
                  )
                }
              />
              <label className="grid gap-2">
                <span className="text-sm font-medium text-charcoal">Section body</span>
                <textarea
                  value={selectedSection.body}
                  onChange={(event) =>
                    setWorkspace((current) =>
                      current
                        ? {
                            ...current,
                            sections: current.sections.map((item) =>
                              item.key === selectedSection.key
                                ? { ...item, body: event.target.value }
                                : item,
                            ),
                          }
                        : current,
                    )
                  }
                  rows={6}
                  className="couple-focus rounded-[1.4rem] border border-[#E8DDD7] bg-white px-4 py-3.5 text-sm text-charcoal"
                />
              </label>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const currentSection = workspace.sections.find(
                      (item) => item.key === selectedSection.key,
                    );
                    if (!currentSection) {
                      return;
                    }
                    const next = await coupleService.updateInvitationSection(currentSection);
                    setWorkspace(next);
                    setNotice(`${currentSection.label} content saved.`);
                  })
                }
                className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
              >
                Save Section
              </button>
            </div>
          ) : null}

          {tab === "Sections" ? (
            <div className="space-y-4">
              {workspace.visibility.map((section) => (
                <div
                  key={section.key}
                  className="flex flex-col gap-3 rounded-[1.5rem] border border-[#E8DDD7] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-charcoal">{section.label}</p>
                    <p className="mt-1 text-sm text-muted">{section.description}</p>
                  </div>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const next = await coupleService.updateInvitationVisibility(
                          section.key,
                          !section.enabled,
                        );
                        setWorkspace(next);
                        setNotice(`${section.label} visibility updated.`);
                      })
                    }
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      section.enabled
                        ? "bg-[#F8E7EC] text-rose"
                        : "bg-[#F4F7F1] text-[#4F8A5B]"
                    }`}
                  >
                    {section.enabled ? "Visible" : "Hidden"}
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {tab === "Theme" ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {["classic-gold", "blush-bloom", "sage-garden", "lavender-evening"].map(
                  (preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        setWorkspace((current) =>
                          current
                            ? {
                                ...current,
                                theme: { ...current.theme, preset: preset as never },
                              }
                            : current,
                        )
                      }
                      className={`rounded-[1.5rem] border px-4 py-4 text-left text-sm font-semibold ${
                        workspace.theme.preset === preset
                          ? "border-[#C45A74] bg-[#FDF1F5] text-rose"
                          : "border-[#E8DDD7] bg-white text-charcoal"
                      }`}
                    >
                      {preset}
                    </button>
                  ),
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { key: "primaryColor", label: "Primary color" },
                  { key: "secondaryColor", label: "Secondary color" },
                  { key: "accentColor", label: "Accent color" },
                  { key: "surfaceColor", label: "Surface color" },
                ].map((field) => (
                  <label key={field.key} className="grid gap-2">
                    <span className="text-sm font-medium text-charcoal">{field.label}</span>
                    <input
                      type="color"
                      value={workspace.theme[field.key as keyof typeof workspace.theme] as string}
                      onChange={(event) =>
                        setWorkspace((current) =>
                          current
                            ? {
                                ...current,
                                theme: {
                                  ...current.theme,
                                  [field.key]: event.target.value,
                                },
                              }
                            : current,
                        )
                      }
                      className="h-12 w-full rounded-[1rem] border border-[#E8DDD7] bg-white p-1"
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const next = await coupleService.updateInvitationTheme(workspace.theme);
                    setWorkspace(next);
                    setNotice("Theme settings saved.");
                  })
                }
                className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
              >
                Save Theme
              </button>
            </div>
          ) : null}

          {tab === "Gallery" ? (
            <div className="space-y-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-charcoal">Upload gallery image</span>
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
                        const next = await coupleService.addGalleryAsset({
                          name: file.name,
                          imageType: "gallery",
                          imageUrl,
                        });
                        setWorkspace(next);
                        setNotice("Gallery image added.");
                      } catch (caughtError) {
                        setError(
                          caughtError instanceof Error
                            ? caughtError.message
                            : "Gallery upload failed.",
                        );
                      }
                    });
                  }}
                  className="rounded-[1.2rem] border border-dashed border-[#E8DDD7] bg-white px-4 py-4 text-sm text-charcoal"
                />
              </label>
              {workspace.gallery.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {workspace.gallery
                    .slice()
                    .sort((left, right) => left.sortOrder - right.sortOrder)
                    .map((asset) => (
                      <div key={asset.id} className="rounded-[1.5rem] border border-[#E8DDD7] p-3">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-[#F8F3F0]">
                          <Image
                            src={asset.imageUrl}
                            alt={asset.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 50vw"
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-charcoal">{asset.name}</p>
                            <p className="text-xs text-muted">{asset.imageType}</p>
                          </div>
                          {asset.isCover ? <CoupleBadge label="Cover" tone="accent" /> : null}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              startTransition(async () => {
                                const next = await coupleService.setGalleryCover(asset.id);
                                setWorkspace(next);
                                setNotice("Cover image updated.");
                              })
                            }
                            className="rounded-full border border-[#E8DDD7] px-3 py-2 text-xs font-semibold text-charcoal"
                          >
                            Set Cover
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              startTransition(async () => {
                                const next = await coupleService.removeGalleryAsset(asset.id);
                                setWorkspace(next);
                                setNotice("Gallery image removed.");
                              })
                            }
                            className="rounded-full border border-[#F2D2D2] px-3 py-2 text-xs font-semibold text-[#D95C5C]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <CoupleEmptyState
                  title="No gallery uploaded"
                  description="Upload a few images to bring your invitation story to life."
                />
              )}
            </div>
          ) : null}

          {tab === "Music" ? (
            <div className="space-y-5">
              <div className="rounded-[1.5rem] border border-[#E8DDD7] px-4 py-4 text-sm leading-7 text-muted">
                Music will only start after the guest opens the invitation. This respects browser autoplay rules and keeps the experience graceful.
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-[1.4rem] border border-[#E8DDD7] bg-white px-4 py-4 text-sm text-charcoal">
                  <input
                    type="checkbox"
                    checked={workspace.music.enabled}
                    onChange={(event) =>
                      setWorkspace((current) =>
                        current
                          ? {
                              ...current,
                              music: { ...current.music, enabled: event.target.checked },
                            }
                          : current,
                      )
                    }
                    className="h-4 w-4 accent-rose"
                  />
                  Enable background music
                </label>
                <label className="flex items-center gap-3 rounded-[1.4rem] border border-[#E8DDD7] bg-white px-4 py-4 text-sm text-charcoal">
                  <input
                    type="checkbox"
                    checked={workspace.music.mutedByDefault}
                    onChange={(event) =>
                      setWorkspace((current) =>
                        current
                          ? {
                              ...current,
                              music: {
                                ...current.music,
                                mutedByDefault: event.target.checked,
                              },
                            }
                          : current,
                      )
                    }
                    className="h-4 w-4 accent-rose"
                  />
                  Start muted by default
                </label>
              </div>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-charcoal">Track</span>
                <select
                  value={workspace.music.trackId}
                  onChange={(event) =>
                    setWorkspace((current) =>
                      current
                        ? {
                            ...current,
                            music: { ...current.music, trackId: event.target.value },
                          }
                        : current,
                    )
                  }
                  className="couple-focus rounded-[1.3rem] border border-[#E8DDD7] bg-white px-4 py-3 text-sm text-charcoal"
                >
                  {musicTracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.label} · {track.mood}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const next = await coupleService.updateMusicSettings(workspace.music);
                    setWorkspace(next);
                    setNotice("Music settings saved.");
                  })
                }
                className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
              >
                Save Music Settings
              </button>
            </div>
          ) : null}
        </CouplePanel>

        <CouplePanel className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose">
            Live preview summary
          </p>
          <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-[#E8DDD7] bg-[#FFFDFC]">
            <div className="relative aspect-[4/3]">
              <Image
                src={previewImage}
                alt="Invitation preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-3 p-5">
              <p
                className="font-display text-4xl text-charcoal"
                style={{ color: workspace.theme.primaryColor }}
              >
                {selectedSection.title}
              </p>
              <p className="text-sm leading-7 text-muted">{selectedSection.body}</p>
              <div className="flex flex-wrap gap-2">
                {workspace.visibility
                  .filter((item) => item.enabled)
                  .slice(0, 5)
                  .map((item) => (
                    <CoupleBadge key={item.key} label={item.label} />
                  ))}
              </div>
            </div>
          </div>
        </CouplePanel>
      </div>
    </div>
  );
}
