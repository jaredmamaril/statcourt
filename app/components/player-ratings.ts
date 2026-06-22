import { normalizeStat, statMaxValues, type Player } from "./court-data";

export type PlayerRatingCategory =
  | "overall"
  | "scoring"
  | "shooting"
  | "playmaking"
  | "rebounding"
  | "efficiency";

function toDisplayRating(rawScore: number) {
  return 70 + rawScore * 0.3;
}

export function getPlayerRating(
  player: Player,
  category: PlayerRatingCategory = "overall",
) {
  const ppgScore = normalizeStat(player.stats.ppg, statMaxValues.ppg);
  const rpgScore = normalizeStat(player.stats.rpg, statMaxValues.rpg);
  const apgScore = normalizeStat(player.stats.apg, statMaxValues.apg);
  const fgScore = normalizeStat(
    player.stats.fgPercent,
    statMaxValues.fgPercent,
  );
  const threeScore = normalizeStat(
    player.stats.threePercent,
    statMaxValues.threePercent,
  );
  const ftScore = normalizeStat(
    player.stats.ftPercent,
    statMaxValues.ftPercent,
  );

  const scoringScore = ppgScore * 0.75 + fgScore * 0.15 + ftScore * 0.1;
  const shootingScore = threeScore * 0.65 + ftScore * 0.25 + fgScore * 0.1;
  const playmakingScore =
    apgScore * 0.75 + scoringScore * 0.15 + threeScore * 0.1;
  const reboundingScore = rpgScore * 0.9 + fgScore * 0.1;
  const efficiencyScore = fgScore * 0.45 + threeScore * 0.3 + ftScore * 0.25;

  if (category === "scoring") return toDisplayRating(scoringScore);
  if (category === "shooting") return toDisplayRating(shootingScore);
  if (category === "playmaking") return toDisplayRating(playmakingScore);
  if (category === "rebounding") return toDisplayRating(reboundingScore);
  if (category === "efficiency") return toDisplayRating(efficiencyScore);

  const starCategories = [
    ppgScore >= 70,
    rpgScore >= 55,
    apgScore >= 55,
    fgScore >= 70,
    threeScore >= 70,
    ftScore >= 75,
  ].filter(Boolean).length;

  const versatilityBonus = starCategories * 2;

  const overallScore =
    scoringScore * 0.3 +
    efficiencyScore * 0.23 +
    playmakingScore * 0.19 +
    reboundingScore * 0.15 +
    shootingScore * 0.13 +
    versatilityBonus;

  return toDisplayRating(overallScore);
}
