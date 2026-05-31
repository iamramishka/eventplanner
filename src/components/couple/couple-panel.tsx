type CouplePanelProps = {
  children: React.ReactNode;
  className?: string;
};

export function CouplePanel({ children, className = "" }: CouplePanelProps) {
  return <section className={`couple-panel rounded-[2rem] ${className}`}>{children}</section>;
}
