import { Suspense } from "react";
import { getPlayerForSlug } from "../../components/player-profile-source";
import { PlayerProfileClient } from "./player-profile-client";
import { SimilarPlayers } from "./similar-players";
import { SimilarPlayersFallback } from "./similar-players-list";

type PlayerProfilePageProps = {
  params: Promise<{ slug: string }>;
};

// Server-rendered: fetches just this player (stats, profiles, two-season peak), so the
// HTML has the profile. Similar players need every player and stream in after.
export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { slug } = await params;
  const { player, loadError } = await getPlayerForSlug(slug);

  return (
    <PlayerProfileClient
      player={player}
      loadError={loadError}
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
