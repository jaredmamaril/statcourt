import type { Metadata } from "next";
import { createStatCourtMetadata } from "../lib/seo";

export const metadata: Metadata = createStatCourtMetadata({
  title: "Terms",
  description:
    "Read the StatCourt terms for account use, saved data, public profiles, basketball analytics, and platform responsibilities.",
  path: "/terms",
});

export default function TermsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
