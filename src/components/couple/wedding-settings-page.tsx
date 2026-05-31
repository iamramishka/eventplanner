"use client";

import { useEffect, useState, useTransition } from "react";
import { CouplePageHeader } from "@/components/couple/couple-page-header";
import { CouplePanel } from "@/components/couple/couple-panel";
import { Field, InlineNotice, SubmitButton } from "@/components/shared/form-controls";
import { coupleService } from "@/lib/services/couple-service";
import { WeddingSettingsRecord } from "@/types/couple";

export function WeddingSettingsPage() {
  const [form, setForm] = useState<WeddingSettingsRecord | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    coupleService.getWeddingSettings().then(setForm);
  }, []);

  if (!form) {
    return <div className="text-sm text-muted">Loading wedding settings...</div>;
  }

  return (
    <div className="space-y-6">
      <CouplePageHeader
        eyebrow="Wedding"
        title="Wedding settings"
        description="Manage the private event details that power your planning workspace and invitation basics."
      />

      {feedback ? <InlineNotice tone="success">{feedback}</InlineNotice> : null}

      <CouplePanel className="p-6">
        <form
          className="grid gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              const saved = await coupleService.updateWeddingSettings(form);
              setForm(saved);
              setFeedback("Wedding settings saved.");
            });
          }}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <Field
              label="Partner one name"
              name="partnerOneName"
              value={form.partnerOneName}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, partnerOneName: event.target.value } : current,
                )
              }
            />
            <Field
              label="Partner two name"
              name="partnerTwoName"
              value={form.partnerTwoName}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, partnerTwoName: event.target.value } : current,
                )
              }
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field
              label="Wedding title"
              name="weddingTitle"
              value={form.weddingTitle}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, weddingTitle: event.target.value } : current,
                )
              }
            />
            <Field
              label="Event date"
              name="eventDate"
              type="date"
              value={form.eventDate}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, eventDate: event.target.value } : current,
                )
              }
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field
              label="Venue name"
              name="venueName"
              value={form.venueName}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, venueName: event.target.value } : current,
                )
              }
            />
            <Field
              label="Venue map link"
              name="venueMapLink"
              value={form.venueMapLink}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, venueMapLink: event.target.value } : current,
                )
              }
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field
              label="Timezone"
              name="timezone"
              value={form.timezone}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, timezone: event.target.value } : current,
                )
              }
            />
            <Field
              label="RSVP deadline"
              name="rsvpDeadline"
              type="date"
              value={form.rsvpDeadline}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, rsvpDeadline: event.target.value } : current,
                )
              }
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field
              label="Contact phone"
              name="contactPhone"
              value={form.contactPhone}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, contactPhone: event.target.value } : current,
                )
              }
            />
            <Field
              label="Estimated guests"
              name="estimatedGuests"
              type="number"
              value={form.estimatedGuests}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, estimatedGuests: event.target.value } : current,
                )
              }
            />
          </div>

          <Field
            label="Estimated budget (LKR)"
            name="estimatedBudget"
            type="number"
            value={form.estimatedBudget}
            onChange={(event) =>
              setForm((current) =>
                current ? { ...current, estimatedBudget: event.target.value } : current,
              )
            }
          />

          <label className="grid gap-2">
            <span className="text-sm font-medium text-charcoal">Intro message</span>
            <textarea
              value={form.introMessage}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, introMessage: event.target.value } : current,
                )
              }
              rows={5}
              className="couple-focus min-h-36 rounded-[1.4rem] border border-[#E8DDD7] bg-white px-4 py-3.5 text-sm text-charcoal"
            />
          </label>

          <div className="flex justify-end">
            <SubmitButton
              label="Save Wedding Settings"
              pendingLabel="Saving..."
              pending={isPending}
            />
          </div>
        </form>
      </CouplePanel>
    </div>
  );
}
