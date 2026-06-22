import type { Player } from "../court-data";

export function getBestLineupFits(player: Player) {
  const fits: string[] = [];

  if (player.stats.ppg >= 25 && player.stats.apg >= 5) {
    fits.push("Transition Attack");
  }

  if (player.stats.apg >= 7) {
    fits.push("Showtime Offense");
  }

  if (player.starPower >= 95) {
    fits.push("Star-Powered Contender");
  }

  if (player.stats.threePercent >= 38) {
    fits.push("Spacing Superteam");
  }

  if (player.defenseRating >= 90) {
    fits.push("Defensive Powerhouse");
  }

  if (player.stats.rpg >= 10 || player.position === "C") {
    fits.push("Paint Control Unit");
  }

  if (player.stats.ppg >= 22 && player.defenseRating >= 88) {
    fits.push("Two-Way Dynasty");
  }

  return fits.slice(0, 3);
}
