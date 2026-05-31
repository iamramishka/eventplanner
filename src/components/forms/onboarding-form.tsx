"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { onboardingService } from "@/lib/services/onboarding-service";
import {
  CheckboxField,
  Field,
  InlineNotice,
  SubmitButton,
} from "@/components/shared/form-controls";

export function OnboardingForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    partnerOneName: "",
    partnerTwoName: "",
    venueName: "",
    venueTbd: false,
    eventDate: "",
    dateTbd: false,
    estimatedGuests: "",
    guestsTbd: false,
    estimatedBudget: "",
    budgetTbd: false,
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  return (
    <form
      className="grid gap-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError("");

        try {
          await onboardingService.createWedding(form);
          router.push("/couple-dashboard");
        } catch (caughtError) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "We couldn't create your wedding yet.",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Partner one"
          name="partnerOneName"
          value={form.partnerOneName}
          disabled={pending}
          onChange={(event) =>
            setForm((current) => ({ ...current, partnerOneName: event.target.value }))
          }
        />
        <Field
          label="Partner two"
          name="partnerTwoName"
          value={form.partnerTwoName}
          disabled={pending}
          onChange={(event) =>
            setForm((current) => ({ ...current, partnerTwoName: event.target.value }))
          }
        />
      </div>

      <div className="grid gap-3">
        <Field
          label="Event venue"
          name="venueName"
          value={form.venueName}
          placeholder="Venue name"
          disabled={pending || form.venueTbd}
          onChange={(event) =>
            setForm((current) => ({ ...current, venueName: event.target.value }))
          }
        />
        <CheckboxField
          label="Still deciding the venue"
          checked={form.venueTbd}
          disabled={pending}
          onChange={(event) =>
            setForm((current) => ({ ...current, venueTbd: event.target.checked }))
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-3">
          <Field
            label="Event date"
            name="eventDate"
            type="date"
            value={form.eventDate}
            disabled={pending || form.dateTbd}
            onChange={(event) =>
              setForm((current) => ({ ...current, eventDate: event.target.value }))
            }
          />
          <CheckboxField
            label="Date still to be confirmed"
            checked={form.dateTbd}
            disabled={pending}
            onChange={(event) =>
              setForm((current) => ({ ...current, dateTbd: event.target.checked }))
            }
          />
        </div>

        <div className="grid gap-3">
          <Field
            label="Estimated guests"
            name="estimatedGuests"
            type="number"
            value={form.estimatedGuests}
            disabled={pending || form.guestsTbd}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                estimatedGuests: event.target.value,
              }))
            }
          />
          <CheckboxField
            label="Still working out guest count"
            checked={form.guestsTbd}
            disabled={pending}
            onChange={(event) =>
              setForm((current) => ({ ...current, guestsTbd: event.target.checked }))
            }
          />
        </div>
      </div>

      <div className="grid gap-3">
        <Field
          label="Estimated budget (LKR)"
          name="estimatedBudget"
          type="number"
          value={form.estimatedBudget}
          disabled={pending || form.budgetTbd}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              estimatedBudget: event.target.value,
            }))
          }
        />
        <CheckboxField
          label="Budget still to be confirmed"
          checked={form.budgetTbd}
          disabled={pending}
          onChange={(event) =>
            setForm((current) => ({ ...current, budgetTbd: event.target.checked }))
          }
        />
      </div>

      {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
      <div className="flex flex-wrap gap-3">
        <SubmitButton
          label="Create Wedding"
          pendingLabel="Creating wedding..."
          pending={pending}
        />
        <button
          type="button"
          onClick={() => router.push("/auth?tab=signup")}
          className="rounded-full border border-soft-border px-5 py-3.5 text-sm font-semibold text-charcoal"
        >
          Back
        </button>
      </div>
    </form>
  );
}
