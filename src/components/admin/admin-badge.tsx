type AdminBadgeProps = {
  label: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
};

const toneClasses: Record<NonNullable<AdminBadgeProps["tone"]>, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
  info: "bg-sky-100 text-sky-700",
};

export function AdminBadge({ label, tone = "default" }: AdminBadgeProps) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {label}
    </span>
  );
}
