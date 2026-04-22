"use client";

import { useState } from "react";
import { publicLeadService } from "@/lib/services/public-lead-service";
import {
  Field,
  InlineNotice,
  SubmitButton,
  TextareaField,
} from "@/components/shared/form-controls";

export function ContactForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
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
          const response = await publicLeadService.submitContact(form);
          setFeedback({ tone: "success", text: response.message });
          setForm({ fullName: "", email: "", subject: "", message: "" });
        } catch (caughtError) {
          setFeedback({
            tone: "error",
            text:
              caughtError instanceof Error
                ? caughtError.message
                : "We couldn't submit your message.",
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
        label="Subject"
        name="subject"
        value={form.subject}
        disabled={pending}
        onChange={(event) =>
          setForm((current) => ({ ...current, subject: event.target.value }))
        }
      />
      <TextareaField
        label="Message"
        name="message"
        value={form.message}
        disabled={pending}
        onChange={(event) =>
          setForm((current) => ({ ...current, message: event.target.value }))
        }
      />
      {feedback ? <InlineNotice tone={feedback.tone}>{feedback.text}</InlineNotice> : null}
      <SubmitButton label="Send Message" pendingLabel="Sending..." pending={pending} />
    </form>
  );
}
