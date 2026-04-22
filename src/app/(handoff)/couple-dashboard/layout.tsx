import { CoupleGuard } from "@/components/couple/couple-guard";
import { CoupleShell } from "@/components/couple/couple-shell";

export default function CoupleDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CoupleGuard>
      <CoupleShell>{children}</CoupleShell>
    </CoupleGuard>
  );
}
