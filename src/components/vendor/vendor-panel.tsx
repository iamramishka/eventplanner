type VendorPanelProps = {
  children: React.ReactNode;
  className?: string;
};

export function VendorPanel({ children, className = "" }: VendorPanelProps) {
  return <section className={`vendor-panel rounded-[1.75rem] ${className}`}>{children}</section>;
}
