import type { Metadata } from "next";
import { createStatCourtMetadata } from "../../lib/seo";

type PublicProfileLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{
    username: string;
  }>;
}>;

export async function generateMetadata({
  params,
}: Pick<PublicProfileLayoutProps, "params">): Promise<Metadata> {
  const { username } = await params;
  const displayUsername = decodeURIComponent(username);

  return createStatCourtMetadata({
    title: displayUsername ? `@${displayUsername}` : "Public Profile",
    description:
      "View a public StatCourt profile with shared lineups, favorite players, basketball identity, and community activity.",
    path: `/u/${encodeURIComponent(username)}`,
  });
}

export default function PublicProfileLayout({
  children,
}: PublicProfileLayoutProps) {
  return children;
}
