import {
  getPlayerInsights,
  normalizeStat,
  statMaxValues,
  type Player,
  type PlayerInsightDisplay,
  type Position,
  type StatMode,
} from "../court-data";
import { getPlayerRating } from "../player-ratings";

function getBroadPosition(position: string): Position {
  if (position === "G" || position === "PG" || position === "SG") {
    return "G";
  }

  if (position === "F" || position === "SF" || position === "PF") {
    return "F";
  }

  return "C";
}

export function getPositionBreakdown(players: Player[]) {
  const breakdown: Record<Position, number> = {
    G: 0,
    F: 0,
    C: 0,
  };

  players.forEach((player) => {
    const position = getBroadPosition(player.position);
    breakdown[position] += 1;
  });

  return breakdown;
}

export function getTopArchetypeDistribution(
  players: Player[],
  statMode: StatMode = "career",
) {
  const archetypeDistribution = players.reduce(
    (counts, player) => {
      const archetype = getPlayerInsights(player, statMode).archetype;
      const label = archetype?.label ?? "Unclassified";
      const rarity = archetype?.rarity ?? "gray";

      if (!counts[label]) {
        counts[label] = {
          count: 0,
          rarity,
        };
      }

      counts[label].count += 1;

      return counts;
    },
    {} as Record<
      string,
      {
        count: number;
        rarity: PlayerInsightDisplay["rarity"];
      }
    >,
  );

  const rarityRank = {
    gold: 5,
    purple: 4,
    blue: 3,
    gray: 2,
    red: 1,
  };

  return Object.entries(archetypeDistribution)
    .filter(([, data]) => data.rarity !== "gray" && data.rarity !== "red")
    .sort(
      (a, b) =>
        rarityRank[b[1].rarity] - rarityRank[a[1].rarity] ||
        b[1].count - a[1].count ||
        a[0].localeCompare(b[0]),
    )
    .slice(0, 4);
}

function getVersatilityScore(player: Player) {
  const ppgScore = normalizeStat(player.stats.ppg, statMaxValues.ppg);
  const rpgScore = normalizeStat(player.stats.rpg, statMaxValues.rpg);
  const apgScore = normalizeStat(player.stats.apg, statMaxValues.apg);
  const threeScore = normalizeStat(
    player.stats.threePercent,
    statMaxValues.threePercent,
  );

  return (
    ppgScore * 0.28 +
    rpgScore * 0.2 +
    apgScore * 0.25 +
    threeScore * 0.12 +
    player.ratings.defense * 0.15
  );
}

export function getPlayerDatabaseLeaders(players: Player[]) {
  const highestOverallPlayer = [...players].sort(
    (a, b) => getPlayerRating(b) - getPlayerRating(a),
  )[0];

  const mostVersatilePlayer = [...players].sort(
    (a, b) => getVersatilityScore(b) - getVersatilityScore(a),
  )[0];

  // GET THREE PT ATTEMPTS FROM NBA API

  const qualifiedShooters = players.filter(
    (player) =>
      (player.stats.games ?? 0) >= 400 &&
      player.stats.threePercent >= 35 &&
      player.stats.ftPercent >= 75 &&
      player.stats.ppg >= 12,
  );

  const getShooterScore = (player: Player) =>
    player.stats.threePercent * 0.55 +
    player.stats.ftPercent * 0.25 +
    normalizeStat(player.stats.ppg, statMaxValues.ppg) * 0.2;

  const bestShooter =
    [...qualifiedShooters].sort(
      (a, b) => getShooterScore(b) - getShooterScore(a),
    )[0] ?? players[0];

  const bestPlaymaker = [...players].sort(
    (a, b) => b.stats.apg - a.stats.apg,
  )[0];

  return {
    highestOverallPlayer,
    mostVersatilePlayer,
    bestShooter,
    bestPlaymaker,
  };
}
