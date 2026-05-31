import { Testimonial } from "@/types/public";

type TestimonialCardProps = {
  testimonial: Testimonial;
};

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <article className="soft-card rounded-[2rem] p-6">
      <p className="font-display text-3xl text-rose">“</p>
      <p className="mt-2 text-base leading-8 text-charcoal">{testimonial.quote}</p>
      <div className="mt-6">
        <p className="text-sm font-semibold text-charcoal">{testimonial.name}</p>
        <p className="text-sm text-muted">
          {testimonial.role} · {testimonial.location}
        </p>
      </div>
    </article>
  );
}
