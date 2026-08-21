import type { Metadata } from "next";
import { createStatCourtMetadata } from "../lib/seo";

export const metadata: Metadata = createStatCourtMetadata({
  title: "Lineup Builder",
  description:
    "Build custom NBA lineups, compare position fit, save teams, scout lineup archetypes, and explore featured StatCourt lineups.",
  path: "/lineups",
});

export default function LineupsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
