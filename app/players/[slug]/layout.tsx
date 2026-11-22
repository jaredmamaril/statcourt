import type { Metadata } from "next";
import { getAppPlayerShareCardSources } from "../../components/player-data-source";
import { getPlayerShareDescription } from "../../lib/player-share-card";
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
  // The share-card list also has every player's name and NBA ID, so one cached
  // read covers the canonical URL and the stat-based description.
  const players = await getAppPlayerShareCardSources("peak");
  const player = findPlayerBySlug(players, slug);
  const playerName = player?.name ?? formatPlayerSlug(slug);
  const shareDescription = player
    ? getPlayerShareDescription(players, slug)
    : null;

  return createStatCourtMetadata({
    title: playerName || "Player Profile",
    description:
      shareDescription ??
      (playerName.length > 0
        ? `View ${playerName}'s StatCourt player profile, ratings, stat profiles, archetype, similar players, and best lineup fits.`
        : "View a StatCourt NBA player profile with ratings, stat profiles, archetype, similar players, and best lineup fits."),
    path: player
      ? getPlayerHref(player, getDuplicatePlayerSlugs(players))
      : getPlayerHref(decodeURIComponent(slug)),
    includeDefaultImage: false,
  });
}

export default function PlayerProfileLayout({
  children,
}: PlayerProfileLayoutProps) {
  return children;
}
