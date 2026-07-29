import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import SiteNav from '@/components/SiteNav';
import { getServerSession } from "next-auth/next";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import { getAdminSettings } from "@/lib/adminSettings";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export function generateMetadata(): Metadata {
  const { settings } = getAdminSettings();
  return {
    title: `${settings.branding.siteName} - Beautiful Digital Wedding Invitations`,
    description: settings.branding.publicTagline,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const { settings } = getAdminSettings();
  const brandStyle = {
    '--inv-rose': settings.branding.primaryColor,
  } as CSSProperties;

  const isDashboardUser = ['COUPLE', 'VENDOR', 'SUPER_ADMIN'].includes(
    (session?.user as { role?: string } | undefined)?.role ?? ''
  );

  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isDashboardPath = /^\/(couple|vendor|super)(\/|$)/.test(pathname);

  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`} style={brandStyle}>
        <AuthProvider session={session}>
          {!isDashboardUser && !isDashboardPath && <SiteNav settings={settings} />}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
