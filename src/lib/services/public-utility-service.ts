"use client";

import { eventDirectory } from "@/data/mock-content";
import { FindEventPayload, FindEventResult } from "@/types/public";

function wait(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const publicUtilityService = {
  async findEvent(payload: FindEventPayload): Promise<FindEventResult> {
    await wait();

    const inviteCode = payload.inviteCode.trim().toUpperCase();
    if (inviteCode.length < 4) {
      return {
        status: "invalid",
        message: "Enter the invite code exactly as it appears on your invitation.",
      };
    }

    const match = eventDirectory.find((event) => event.inviteCode === inviteCode);
    if (!match) {
      return {
        status: "not-found",
        message: "We couldn’t find a matching event for that code.",
      };
    }

    return {
      status: "found",
      inviteCode: match.inviteCode,
      eventName: match.eventName,
      weddingSlug: match.weddingSlug,
      weddingDate: match.weddingDate,
      location: match.location,
    };
  },
};
