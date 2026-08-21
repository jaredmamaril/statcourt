import type { Metadata } from "next";
import { createStatCourtMetadata } from "../lib/seo";

export const metadata: Metadata = createStatCourtMetadata({
  title: "Photo Credits",
  description:
    "Review StatCourt photo credits for player headshots, uploaded avatars, local assets, third-party imagery, and rights notices.",
  path: "/photo-credits",
});

export default function PhotoCreditsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
