import type { Metadata } from "next";
import { createStatCourtMetadata } from "../lib/seo";

export const metadata: Metadata = createStatCourtMetadata({
  title: "Community",
  description:
    "Discover public StatCourt profiles, browse basketball identities, and explore shared lineups and favorite player profiles.",
  path: "/community",
});

export default function CommunityLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
