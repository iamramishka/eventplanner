type VendorBadgeProps = {
  label: string;
  tone?: "default" | "success" | "warning" | "danger" | "accent";
};

export function VendorBadge({ label, tone = "default" }: VendorBadgeProps) {
  const toneClasses =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "warning"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : tone === "danger"
          ? "bg-rose-50 text-rose-700 border-rose-200"
          : tone === "accent"
            ? "bg-teal-50 text-teal-700 border-teal-200"
            : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses}`}>
      {label}
    </span>
  );
}
