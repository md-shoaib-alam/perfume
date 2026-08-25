import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEESH™ Perfumes | Luxury Extrait De Parfum & Attars",
  description: "Experience global award-winning luxury perfumes, fine fragrances, and artisanal attars crafted with master perfumers.",
  icons: {
    icon: "/favicon.svg",
  },
};

import { ConfirmProvider } from "./components/CustomConfirmModal";
import { UserSyncGlobal } from "./components/UserSyncGlobal";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-white text-slate-900">
        <ClerkProvider>
          <UserSyncGlobal />
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}