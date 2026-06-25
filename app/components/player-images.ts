import type { Player } from "./court-data";

export function getPlayerHeadshot(player: Player) {
  if (!player.nbaId) return player.fallbackImage ?? "/blank-player.svg";

  return `https://cdn.nba.com/headshots/nba/latest/1040x760/${player.nbaId}.png`;
}

export function getPlayerFallbackHeadshot(player: Player) {
  return player.fallbackImage ?? "/blank-player.svg";
}
