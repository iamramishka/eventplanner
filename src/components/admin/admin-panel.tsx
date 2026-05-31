type AdminPanelProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminPanel({ children, className = "" }: AdminPanelProps) {
  return <section className={`admin-panel rounded-3xl ${className}`}>{children}</section>;
}
