type VendorPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function VendorPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: VendorPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--vendor-primary)]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--vendor-text)] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--vendor-muted)] sm:text-base">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
