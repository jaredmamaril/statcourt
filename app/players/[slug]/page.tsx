import type { Metadata } from "next";
import { Suspense } from "react";
import { getPlayerForSlug } from "../../components/player-profile-source";
import { getDuplicatePlayerSlugs, getPlayerHref } from "../../lib/player-slug";
import { parseStatMode } from "../../lib/share";
import { buildPlayerMetadata } from "./player-metadata";
import { PlayerProfileClient } from "./player-profile-client";
import { SimilarPlayers } from "./similar-players";
import { SimilarPlayersFallback } from "./similar-players-list";

type PlayerProfilePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string | string[] }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PlayerProfilePageProps): Promise<Metadata> {
  const [{ slug }, { mode }] = await Promise.all([params, searchParams]);

  return buildPlayerMetadata(slug, parseStatMode(mode));
}

// Server-rendered: fetches just this player (stats, profiles, two-season peak), so the
// HTML has the profile, in the link's stat mode (?mode=...) when it has one. Similar
// players need every player and stream in after.
export default async function PlayerProfilePage({
  params,
  searchParams,
}: PlayerProfilePageProps) {
  const [{ slug }, { mode }] = await Promise.all([params, searchParams]);
  const { player, slugIndex, loadError } = await getPlayerForSlug(slug);

  return (
    <PlayerProfileClient
      player={player}
      loadError={loadError}
      linkMode={parseStatMode(mode)}
      canonicalPath={
        player ? getPlayerHref(player, getDuplicatePlayerSlugs(slugIndex)) : null
      }
      similarPlayers={
        player ? (
          <Suspense fallback={<SimilarPlayersFallback />}>
            <SimilarPlayers player={player} />
          </Suspense>
        ) : null
      }
    />
  );
}
