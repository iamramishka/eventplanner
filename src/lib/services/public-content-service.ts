import {
  faqs,
  pricingPlans,
  templateShowcases,
  testimonials,
} from "@/data/mock-content";

const contentDelay = 80;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const publicContentService = {
  async getTemplates() {
    await wait(contentDelay);
    return templateShowcases;
  },
  async getFaqs() {
    await wait(contentDelay);
    return faqs;
  },
  async getTestimonials() {
    await wait(contentDelay);
    return testimonials;
  },
  async getPricing() {
    await wait(contentDelay);
    return pricingPlans;
  },
};
