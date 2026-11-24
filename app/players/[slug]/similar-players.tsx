import type { Player, StatMode } from "../../components/court-data";
import { getSimilarPlayers } from "../../components/court-data";
import { getAppPlayers } from "../../components/player-data-source";
import { createPlayerHrefResolver } from "../../lib/player-slug";
import { SimilarPlayersList, type SimilarPlayerMatch } from "./similar-players-list";

const STAT_MODES: StatMode[] = ["career", "peak", "current"];

// Streamed in with Suspense: needs every player, so it reads the cached full list and
// sends only the four matches per stat mode, with canonical links.
export async function SimilarPlayers({ player }: { player: Player }) {
  let allPlayers: Player[];

  try {
    allPlayers = await getAppPlayers();
  } catch (error) {
    console.error("Failed to load similar players", error);

    return null;
  }

  const toHref = createPlayerHrefResolver(allPlayers);
  const matchesByMode = Object.fromEntries(
    STAT_MODES.map((mode) => [
      mode,
      getSimilarPlayers(player, allPlayers, 4, mode).map(
        (match): SimilarPlayerMatch => ({
          id: match.player.id,
          name: match.player.name,
          team: match.player.team,
          href: toHref(match.player),
          matchScore: match.matchScore,
        }),
      ),
    ]),
  ) as Record<StatMode, SimilarPlayerMatch[]>;

  return <SimilarPlayersList matchesByMode={matchesByMode} />;
}
