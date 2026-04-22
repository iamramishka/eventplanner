import { VendorGuard } from "@/components/vendor/vendor-guard";
import { VendorShell } from "@/components/vendor/vendor-shell";

export default function VendorPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VendorGuard>
      <VendorShell>{children}</VendorShell>
    </VendorGuard>
  );
}
