import type { Metadata } from "next";
import { createStatCourtMetadata } from "../lib/seo";

export const metadata: Metadata = createStatCourtMetadata({
  title: "Contact",
  description:
    "Contact StatCourt for account support, product feedback, privacy questions, technical issues, and public profile concerns.",
  path: "/contact",
});

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
