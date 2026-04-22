"use client";

import { saveContact, saveVendorLead } from "@/lib/services/browser-store";
import { ContactInquiryPayload, VendorLeadPayload } from "@/types/public";

function wait(ms = 450) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const publicLeadService = {
  async submitVendorLead(payload: VendorLeadPayload) {
    await wait();

    if (!payload.fullName || !payload.email || !payload.businessName || !payload.category) {
      throw new Error("Please complete the required vendor details.");
    }

    saveVendorLead(payload);
    return {
      message: "Thank you. We’ve captured your interest and will follow up with next steps.",
    };
  },

  async submitContact(payload: ContactInquiryPayload) {
    await wait();

    if (!payload.fullName || !payload.email || !payload.subject || !payload.message) {
      throw new Error("Please complete all contact form fields.");
    }

    saveContact(payload);
    return {
      message: "Your message has been received. We’ll be in touch shortly.",
    };
  },
};
