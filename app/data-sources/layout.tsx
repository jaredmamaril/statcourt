import type { Metadata } from "next";
import { createStatCourtMetadata } from "../lib/seo";

export const metadata: Metadata = createStatCourtMetadata({
  title: "Data Sources",
  description:
    "Learn how StatCourt combines public basketball data with custom analytics models for player profiles, rankings, and lineup scouting.",
  path: "/data-sources",
});

export default function DataSourcesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
