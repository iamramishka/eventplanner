import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import SiteNav from '@/components/SiteNav';
import { getAdminSettings } from "@/lib/adminSettings";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export function generateMetadata(): Metadata {
  const { settings } = getAdminSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

  return {
    metadataBase: new URL(siteUrl),
    title: `${settings.branding.siteName} - Beautiful Digital Wedding Invitations`,
    description: settings.branding.publicTagline,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { settings } = getAdminSettings();
  const brandStyle = {
    '--inv-rose': settings.branding.primaryColor,
  } as CSSProperties;

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable}`} style={brandStyle} suppressHydrationWarning>
        <AuthProvider>
          <SiteNav settings={settings} />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
