import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Michroma } from "next/font/google";
import { Habibi } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import { GlobalFooter } from "./components/global-footer";
import { ReducedMotionSync } from "./components/settings/reduced-motion-sync";
import { ThemeSync } from "./components/settings/theme-sync";
import { defaultStatCourtTheme } from "./lib/themes";

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
  title: "StatCourt",
  description: "NBA analytics, player comparisons, and custom rankings.",
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
        {children}
        <GlobalFooter />
      </body>
    </html>
  );
}
