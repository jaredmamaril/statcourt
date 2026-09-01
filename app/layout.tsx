import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Michroma } from "next/font/google";
import { Habibi } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Navbar from "./components/navbar";
import { GlobalFooter } from "./components/global-footer";
import { ReducedMotionSync } from "./components/settings/reduced-motion-sync";
import { ThemeSync } from "./components/settings/theme-sync";
import { defaultStatCourtTheme } from "./lib/themes";
import {
  defaultOgImage,
  defaultSeoDescription,
  defaultSeoTitle,
  siteName,
  siteUrl,
} from "./lib/seo";

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: "400",
});

const habibi = Habibi({
  variable: "--font-habibi",
  subsets: ["latin"],
  weight: "400",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultSeoTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultSeoDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: defaultSeoTitle,
    description: defaultSeoDescription,
    url: "/",
    siteName,
    images: [
      {
        url: defaultOgImage,
        width: 2048,
        height: 1024,
        alt: "StatCourt NBA player comparison preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultSeoTitle,
    description: defaultSeoDescription,
    images: [defaultOgImage],
  },
  applicationName: siteName,
};

const statCourtJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteName,
  applicationCategory: "SportsApplication",
  operatingSystem: "Web",
  url: siteUrl,
  description: defaultSeoDescription,
  isAccessibleForFree: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-statcourt-theme={defaultStatCourtTheme.id}
      className={`${geistSans.variable} ${geistMono.variable} ${michroma.variable} ${habibi.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Future: consider implementing a theme provider to allow users to switch between light and dark modes, and to manage other global styles or settings across the app */}
        <ThemeSync />
        <ReducedMotionSync />
        <Navbar />
        <script
          id="statcourt-json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(statCourtJsonLd),
          }}
        />
        {children}
        <GlobalFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
