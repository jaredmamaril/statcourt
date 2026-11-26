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

// Metadata for /players/{slug}, optionally for a shared stat mode (?mode=...).
// - The canonical URL never includes ?mode (one page per player for search engines).
// - og:url, og:image, twitter:image and the description follow the shared mode; with
//   no mode they show the Peak card, as before mode links existed.
export async function buildPlayerMetadata(
  slug: string,
  linkMode: StatMode | null,
): Promise<Metadata> {
  const mode = linkMode ?? DEFAULT_SHARE_MODE;
  const { player, match, slugIndex, newestSeason } = await getPlayerForSlug(slug);

  // A bare name shared by several players: the "Which Mike James?" page. Not in the
  // sitemap and not indexed; its links to each profile are followed.
  if (match.status === "ambiguous") {
    const name = match.players[0].name;

    return {
      ...createStatCourtMetadata({
        title: `Which ${name}?`,
        description: `More than one NBA player is named ${name}. Choose a StatCourt player profile.`,
        path: `/players/${match.canonicalSlug}`,
      }),
      robots: { index: false, follow: true },
    };
  }

  // The page answers with a 404 (not-found.tsx); never throw from metadata.
  if (!player) {
    return {
      title: "Player Not Found",
      robots: { index: false, follow: true },
    };
  }

  const canonicalPath = getPlayerHref(player, getDuplicatePlayerSlugs(slugIndex));
  const warmSources = await getWarmShareSources(mode);
  const shareDescription =
    (warmSources && getPlayerShareDescription(warmSources, slug, mode)) ??
    getPlayerShareDescription(getUnrankedSources(player, mode, newestSeason), slug, mode);

  return createStatCourtMetadata({
    title: player.name,
    description:
      shareDescription ??
      `View ${player.name}'s StatCourt player profile, ratings, stat profiles, archetype, similar players, and best lineup fits.`,
    path: canonicalPath,
    shareUrl: linkMode ? withModeParam(canonicalPath, linkMode) : canonicalPath,
    includeDefaultImage: false,
    image: {
      url: getShareImagePath(canonicalPath, mode),
      width: 1200,
      height: 630,
      alt: `${player.name} StatCourt player card`,
    },
  });
}
