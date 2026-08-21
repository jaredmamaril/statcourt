import type { Metadata } from "next";
import { createStatCourtMetadata } from "../lib/seo";

export const metadata: Metadata = createStatCourtMetadata({
  title: "Rankings",
  description:
    "Explore StatCourt NBA player rankings by overall rating, shooting, scoring, playmaking, rebounding, defense, efficiency, and archetype.",
  path: "/rankings",
});

export default function RankingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
