import type { Metadata } from "next";
import type { Player } from "../../components/court-data";
import { getAppPlayerShareCardSources } from "../../components/player-data-source";
import { getPlayerForSlug } from "../../components/player-profile-source";
import {
  buildPlayerShareCardSources,
  getPlayerShareDescription,
  type PlayerShareCardSource,
} from "../../lib/player-share-card";
import { getDuplicatePlayerSlugs, getPlayerHref } from "../../lib/player-slug";
import { createStatCourtMetadata } from "../../lib/seo";

type PlayerProfileLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}>;

// The "#N best peak ever" rank needs every player's peak. Use it only if that cached
// list answers quickly (it's warm); otherwise describe the player without the rank
// instead of waiting for the full build. A cold build keeps going in the background.
const RANKED_DESCRIPTION_WAIT_MS = 150;

async function getWarmPeakSources() {
  const sources = getAppPlayerShareCardSources("peak");

  sources.catch(() => {});

  return Promise.race([
    sources,
    new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), RANKED_DESCRIPTION_WAIT_MS),
    ),
  ]).catch(() => null);
}

function getUnrankedSources(player: Player): PlayerShareCardSource[] {
  return buildPlayerShareCardSources([player], "peak").map((source) => ({
    ...source,
    rank: null,
  }));
}

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
  // Same one-player lookup as the page (shared per request).
  const { player, slugIndex } = await getPlayerForSlug(slug);
  const playerName = player?.name ?? formatPlayerSlug(slug);
  const peakSources = player ? await getWarmPeakSources() : null;
  const shareDescription = player
    ? (peakSources && getPlayerShareDescription(peakSources, slug)) ??
      getPlayerShareDescription(getUnrankedSources(player), slug)
    : null;

  return createStatCourtMetadata({
    title: playerName || "Player Profile",
    description:
      shareDescription ??
      (playerName.length > 0
        ? `View ${playerName}'s StatCourt player profile, ratings, stat profiles, archetype, similar players, and best lineup fits.`
        : "View a StatCourt NBA player profile with ratings, stat profiles, archetype, similar players, and best lineup fits."),
    path: player
      ? getPlayerHref(player, getDuplicatePlayerSlugs(slugIndex))
      : getPlayerHref(decodeURIComponent(slug)),
    includeDefaultImage: false,
  });
}

export default function PlayerProfileLayout({
  children,
}: PlayerProfileLayoutProps) {
  return children;
}
