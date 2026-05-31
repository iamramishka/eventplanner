type CoupleEmptyStateProps = {
  title: string;
  description: string;
  cta?: React.ReactNode;
};

export function CoupleEmptyState({
  title,
  description,
  cta,
}: CoupleEmptyStateProps) {
  return (
    <div className="couple-panel rounded-[2rem] px-6 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8E7EC] text-xl text-rose">
        ✦
      </div>
      <h3 className="mt-5 text-lg font-semibold text-charcoal">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-muted">{description}</p>
      {cta ? <div className="mt-5 flex justify-center">{cta}</div> : null}
    </div>
  );
}
