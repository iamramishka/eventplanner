import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import SiteNav from '@/components/SiteNav';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "WedPlan — Wedding Planning, Simplified",
  description: "The all-in-one wedding planning, invitation, guest, and vendor platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable}`}>
        <AuthProvider session={session}>
          <SiteNav />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
