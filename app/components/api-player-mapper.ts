import type { Player } from "./court-data";

type BalldontliePlayer = {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  team: {
    abbreviation: string;
  };
};

export function mapBalldontliePlayerToStatCourtPlayer(
  apiPlayer: BalldontliePlayer,
): Player {
  return {
    id: apiPlayer.id,
    name: `${apiPlayer.first_name} ${apiPlayer.last_name}`,
    team: apiPlayer.team.abbreviation as Player["team"],
    position: apiPlayer.position as Player["position"],
    jerseyNumber: 0,
    defenseRating: 70,
    starPower: 70,
    stats: {
      ppg: 0,
      rpg: 0,
      apg: 0,
      fgPercent: 0,
      threePercent: 0,
      ftPercent: 0,
    },
  };
}
