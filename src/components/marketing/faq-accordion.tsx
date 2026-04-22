"use client";

import { useState } from "react";
import { FAQItem } from "@/types/public";

type FAQAccordionProps = {
  items: FAQItem[];
};

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openId, setOpenId] = useState(items[0]?.id);

  return (
    <div className="grid gap-4">
      {items.map((item) => {
        const isOpen = item.id === openId;

        return (
          <article
            key={item.id}
            className="soft-card rounded-[1.75rem] p-2"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? "" : item.id)}
              className="focus-ring flex w-full items-center justify-between rounded-[1.25rem] px-4 py-4 text-left"
            >
              <span className="pr-4 text-base font-semibold text-charcoal">
                {item.question}
              </span>
              <span className="text-2xl text-rose">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen ? (
              <div className="px-4 pb-4 pt-2 text-sm leading-7 text-muted">
                {item.answer}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
