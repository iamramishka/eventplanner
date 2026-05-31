type CouplePageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function CouplePageHeader({
  eyebrow,
  title,
  description,
  actions,
}: CouplePageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-display text-4xl leading-tight text-charcoal sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
