type CoupleBadgeProps = {
  label: string;
  tone?: "default" | "success" | "warning" | "danger" | "accent";
};

const toneClasses: Record<NonNullable<CoupleBadgeProps["tone"]>, string> = {
  default: "bg-[#F4ECE8] text-[#7D6F6A]",
  success: "bg-[#E6F3E8] text-[#4F8A5B]",
  warning: "bg-[#FFF0DA] text-[#C98313]",
  danger: "bg-[#FDE7E7] text-[#C45A5A]",
  accent: "bg-[#F8E7EC] text-[#B35470]",
};

export function CoupleBadge({ label, tone = "default" }: CoupleBadgeProps) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {label}
    </span>
  );
}
