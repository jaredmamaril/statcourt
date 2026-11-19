import type { Metadata } from "next";
import { getAppPlayerSlugSources } from "../../components/player-data-source";
import {
  findPlayerBySlug,
  getDuplicatePlayerSlugs,
  getPlayerHref,
} from "../../lib/player-slug";
import { createStatCourtMetadata } from "../../lib/seo";

type PlayerProfileLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}>;

function formatPlayerSlug(slug: string) {
  return decodeURIComponent(slug)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: Pick<PlayerProfileLayoutProps, "params">): Promise<Metadata> {
  const { slug } = await params;
  const players = await getAppPlayerSlugSources();
  const player = findPlayerBySlug(players, slug);
  const playerName = player?.name ?? formatPlayerSlug(slug);

  return createStatCourtMetadata({
    title: playerName || "Player Profile",
    description:
      playerName.length > 0
        ? `View ${playerName}'s StatCourt player profile, ratings, stat profiles, archetype, similar players, and best lineup fits.`
        : "View a StatCourt NBA player profile with ratings, stat profiles, archetype, similar players, and best lineup fits.",
    path: player
      ? getPlayerHref(player, getDuplicatePlayerSlugs(players))
      : getPlayerHref(decodeURIComponent(slug)),
  });
}

export default function PlayerProfileLayout({
  children,
}: PlayerProfileLayoutProps) {
  return children;
}
