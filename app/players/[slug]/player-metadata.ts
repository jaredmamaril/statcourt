import "server-only";

import type { Metadata } from "next";
import type { Player, StatMode } from "../../components/court-data";
import { getAppPlayerShareCardSources } from "../../components/player-data-source";
import { getPlayerForSlug } from "../../components/player-profile-source";
import {
  buildPlayerShareCardSources,
  getPlayerShareDescription,
  type PlayerShareCardSource,
} from "../../lib/player-share-card";
import { getSeasonStartYear } from "../../lib/player-season";
import { getDuplicatePlayerSlugs, getPlayerHref } from "../../lib/player-slug";
import { createStatCourtMetadata } from "../../lib/seo";
import { DEFAULT_SHARE_MODE, getShareImagePath, withModeParam } from "../../lib/share";

// The "#N" rank in the description needs every player. Use it only if that cached
// list answers quickly (it's warm); otherwise describe the player without the rank
// instead of waiting for the full build. A cold build keeps going in the background.
const RANKED_DESCRIPTION_WAIT_MS = 150;

async function getWarmShareSources(mode: StatMode) {
  const sources = getAppPlayerShareCardSources(mode);

  sources.catch(() => {});

  return Promise.race([
    sources,
    new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), RANKED_DESCRIPTION_WAIT_MS),
    ),
  ]).catch(() => null);
}

function getUnrankedSources(
  player: Player,
  mode: StatMode,
  newestSeason: string | null,
): PlayerShareCardSource[] {
  return buildPlayerShareCardSources([player], mode, {
    latestSeasonStartYear: getSeasonStartYear(newestSeason),
  }).map((source) => ({ ...source, rank: null }));
}

function formatPlayerSlug(slug: string) {
  return decodeURIComponent(slug)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// Metadata for /players/{slug}, optionally for a shared stat mode (?mode=...).
// - The canonical URL never includes ?mode (one page per player for search engines).
// - og:url, og:image, twitter:image and the description follow the shared mode; with
//   no mode they show the Peak card, as before mode links existed.
export async function buildPlayerMetadata(
  slug: string,
  linkMode: StatMode | null,
): Promise<Metadata> {
  const mode = linkMode ?? DEFAULT_SHARE_MODE;
  const { player, slugIndex, newestSeason } = await getPlayerForSlug(slug);
  const playerName = player?.name ?? formatPlayerSlug(slug);
  const canonicalPath = player
    ? getPlayerHref(player, getDuplicatePlayerSlugs(slugIndex))
    : getPlayerHref(decodeURIComponent(slug));
  const warmSources = player ? await getWarmShareSources(mode) : null;
  const shareDescription = player
    ? (warmSources && getPlayerShareDescription(warmSources, slug, mode)) ??
      getPlayerShareDescription(getUnrankedSources(player, mode, newestSeason), slug, mode)
    : null;

  return createStatCourtMetadata({
    title: playerName || "Player Profile",
    description:
      shareDescription ??
      (playerName.length > 0
        ? `View ${playerName}'s StatCourt player profile, ratings, stat profiles, archetype, similar players, and best lineup fits.`
        : "View a StatCourt NBA player profile with ratings, stat profiles, archetype, similar players, and best lineup fits."),
    path: canonicalPath,
    shareUrl: linkMode ? withModeParam(canonicalPath, linkMode) : canonicalPath,
    // Unknown players keep the default site preview image.
    includeDefaultImage: !player,
    image: player
      ? {
          url: getShareImagePath(canonicalPath, mode),
          width: 1200,
          height: 630,
          alt: `${player.name} StatCourt player card`,
        }
      : undefined,
  });
}
