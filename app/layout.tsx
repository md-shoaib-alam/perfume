import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bakhoorbliss.in'),
  title: {
    default: "BakhoorBliss | Luxury Extrait De Parfum & Artisanal Attars",
    template: "%s | BakhoorBliss",
  },
  description: "Experience artisanal extrait de parfums, pure concentrated attars, and luxury Middle Eastern fragrance oils crafted with master perfumers.",
  keywords: [
    "BakhoorBliss",
    "luxury perfume",
    "extrait de parfum",
    "attar",
    "oud fragrance",
    "bakhoor",
    "artisanal perfumery",
    "long lasting perfume",
    "niche fragrance India",
  ],
  authors: [{ name: "BakhoorBliss Luxury Perfumery" }],
  creator: "BakhoorBliss",
  publisher: "BakhoorBliss",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "BakhoorBliss | Luxury Extrait De Parfum & Artisanal Attars",
    description: "Experience artisanal extrait de parfums, pure concentrated attars, and luxury Middle Eastern fragrance oils crafted with master perfumers.",
    url: "https://bakhoorbliss.in",
    siteName: "BakhoorBliss",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BakhoorBliss | Luxury Extrait De Parfum & Artisanal Attars",
    description: "Experience artisanal extrait de parfums, pure concentrated attars, and luxury Middle Eastern fragrance oils crafted with master perfumers.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import { ConfirmProvider } from "./components/CustomConfirmModal";
import { UserSyncGlobal } from "./components/UserSyncGlobal";
import { QueryProvider } from "./providers/QueryProvider";
import { ScrollToTop } from "./components/ScrollToTop";

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
          <QueryProvider>
            <ScrollToTop />
            <UserSyncGlobal />
            <ConfirmProvider>
              {children}
            </ConfirmProvider>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}