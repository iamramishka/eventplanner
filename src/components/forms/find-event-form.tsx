"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { publicUtilityService } from "@/lib/services/public-utility-service";
import { Field, InlineNotice, SubmitButton } from "@/components/shared/form-controls";

export function FindEventForm() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{
    tone: "error" | "success" | "default";
    text: string;
  } | null>(null);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setMessage(null);

        const result = await publicUtilityService.findEvent({ inviteCode });
        if (result.status === "found") {
          setMessage({
            tone: "success",
            text: `Found ${result.eventName}. Opening the live invitation now.`,
          });
          router.push(`/w/${result.weddingSlug}?from=find-event&code=${result.inviteCode}`);
          return;
        }

        setMessage({
          tone: "error",
          text: result.message,
        });
        setPending(false);
      }}
    >
      <Field
        label="Invite code"
        name="inviteCode"
        value={inviteCode}
        placeholder="Enter your exact invite code"
        helperText="For the MVP, guest lookup is an exact-code search."
        disabled={pending}
        onChange={(event) => setInviteCode(event.target.value)}
      />
      <InlineNotice tone="default">
        Try <strong>AMAYA2026</strong> or <strong>KAVIN2026</strong> to test the live handoff flow.
      </InlineNotice>
      {message ? <InlineNotice tone={message.tone}>{message.text}</InlineNotice> : null}
      <SubmitButton label="Find My Event" pendingLabel="Searching..." pending={pending} />
    </form>
  );
}
