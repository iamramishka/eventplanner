"use client";

import { useState } from "react";
import { publicLeadService } from "@/lib/services/public-lead-service";
import {
  Field,
  InlineNotice,
  SubmitButton,
  TextareaField,
} from "@/components/shared/form-controls";

export function VendorLeadForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    businessName: "",
    category: "",
    notes: "",
  });
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(null);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setFeedback(null);

        try {
          const response = await publicLeadService.submitVendorLead(form);
          setFeedback({ tone: "success", text: response.message });
          setForm({
            fullName: "",
            email: "",
            businessName: "",
            category: "",
            notes: "",
          });
        } catch (caughtError) {
          setFeedback({
            tone: "error",
            text:
              caughtError instanceof Error
                ? caughtError.message
                : "We couldn't submit your vendor details.",
          });
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Full name"
          name="fullName"
          value={form.fullName}
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
          disabled={pending}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
        />
      </div>
      <Field
        label="Business name"
        name="businessName"
        value={form.businessName}
        disabled={pending}
        onChange={(event) =>
          setForm((current) => ({ ...current, businessName: event.target.value }))
        }
      />
      <Field
        label="Category"
        name="category"
        value={form.category}
        placeholder="Photography, Venue, Planner, Catering..."
        disabled={pending}
        onChange={(event) =>
          setForm((current) => ({ ...current, category: event.target.value }))
        }
      />
      <TextareaField
        label="Notes"
        name="notes"
        value={form.notes}
        placeholder="Tell us what makes your business a strong fit for premium weddings."
        disabled={pending}
        onChange={(event) =>
          setForm((current) => ({ ...current, notes: event.target.value }))
        }
      />
      {feedback ? <InlineNotice tone={feedback.tone}>{feedback.text}</InlineNotice> : null}
      <SubmitButton label="Join as Vendor" pendingLabel="Submitting..." pending={pending} />
    </form>
  );
}
