import type { Metadata } from "next";
import { createStatCourtMetadata } from "../lib/seo";

export const metadata: Metadata = createStatCourtMetadata({
  title: "Privacy",
  description:
    "Review how StatCourt handles account data, public profile visibility, recent activity, saved lineups, and privacy controls.",
  path: "/privacy",
});

export default function PrivacyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
