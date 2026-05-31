import { SiteShell } from "@/components/layout/site-shell";

export default function HandoffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SiteShell compact>{children}</SiteShell>;
}
