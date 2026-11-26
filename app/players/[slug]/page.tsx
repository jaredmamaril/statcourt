import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import {
  getPlayerForSlug,
  getPlayersForSlugEntries,
} from "../../components/player-profile-source";
import { getDuplicatePlayerSlugs, getPlayerHref } from "../../lib/player-slug";
import { parseStatMode } from "../../lib/share";
import { PlayerDisambiguation } from "./player-disambiguation";
import { buildPlayerMetadata } from "./player-metadata";
import { PlayerProfileClient } from "./player-profile-client";
import { SimilarPlayers } from "./similar-players";
import { SimilarPlayersFallback } from "./similar-players-list";

type PlayerProfilePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PlayerProfilePageProps): Promise<Metadata> {
  const [{ slug }, { mode }] = await Promise.all([params, searchParams]);

  return buildPlayerMetadata(slug, parseStatMode(mode));
}

// The same query string (?mode=, utm_*, ...) on the canonical path.
function withSearchParams(
  path: string,
  searchParams: Record<string, string | string[] | undefined>,
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) query.append(key, item);
    }
  }

  const search = query.toString();

  return search ? `${path}?${search}` : path;
}

// Server-rendered: fetches just this player (stats, profiles, two-season peak), so the
// HTML has the profile, in the link's stat mode (?mode=...) when it has one. Similar
// players need every player and stream in after.
// - Unknown slug: a real 404 (not-found.tsx).
// - Non-canonical slug for one player (wrong case, encoded name, ID suffix on a unique
//   name): 308 to the canonical URL.
// - A bare name shared by several players: "Which Mike James?" page.
export default async function PlayerProfilePage({
  params,
  searchParams,
}: PlayerProfilePageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const { player, match, slugIndex, loadError } = await getPlayerForSlug(slug);

  if (match.status === "not-found" || (match.status === "found" && !player)) {
    // With the database down only the fallback players exist; don't tell search
    // engines that every other player is gone (a 5xx is retried, a 404 is dropped).
    if (loadError) throw new Error(loadError);

    notFound();
  }

  if (slug !== match.canonicalSlug) {
    permanentRedirect(withSearchParams(`/players/${match.canonicalSlug}`, query));
  }

  const duplicateSlugs = getDuplicatePlayerSlugs(slugIndex);

  if (match.status === "ambiguous") {
    const players = await getPlayersForSlugEntries(match.players);

    return (
      <PlayerDisambiguation
        name={match.players[0].name}
        choices={players.map((choice) => ({
          player: choice,
          href: getPlayerHref(choice, duplicateSlugs),
        }))}
      />
    );
  }

  return (
    <PlayerProfileClient
      player={player}
      loadError={loadError}
      linkMode={parseStatMode(query.mode)}
      canonicalPath={player ? getPlayerHref(player, duplicateSlugs) : null}
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
