import type { Metadata } from "next";
import { createStatCourtMetadata } from "../lib/seo";

export const metadata: Metadata = createStatCourtMetadata({
  title: "Court",
  description:
    "Compare NBA players side by side with StatCourt radar charts, matchup edges, stat profiles, and player insight panels.",
  path: "/court",
});

export default function CourtLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
