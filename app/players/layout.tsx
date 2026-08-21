import type { Metadata } from "next";
import { createStatCourtMetadata } from "../lib/seo";

export const metadata: Metadata = createStatCourtMetadata({
  title: "Players",
  description:
    "Browse NBA player profiles, stat profiles, archetypes, ratings, favorites, and full StatCourt player scouting details.",
  path: "/players",
});

export default function PlayersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
