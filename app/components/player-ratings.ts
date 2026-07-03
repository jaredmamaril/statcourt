import { normalizeStat, statMaxValues, type Player } from "./court-data";

export type PlayerRatingCategory =
  | "overall"
  | "scoring"
  | "shooting"
  | "playmaking"
  | "rebounding"
  | "efficiency"
  | "careerLegacy";

function toDisplayRating(rawScore: number) {
  return 55 + rawScore * 0.42;
}

function safeNumber(value: number | null | undefined, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
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

  const scoringScore = ppgScore;
  const shootingScore = threeScore * 0.7 + ftScore * 0.3;
  const playmakingScore = apgScore;
  const reboundingScore = rpgScore;
  const efficiencyScore = fgScore * 0.5 + threeScore * 0.25 + ftScore * 0.25;
  const defenseScore = safeNumber(player.ratings.defense, 70);
  const starPowerScore = safeNumber(player.ratings.starPower, 70);
  const careerLegacyScore = safeNumber(player.ratings.careerLegacy, 70);

  if (category === "scoring") return toDisplayRating(scoringScore);
  if (category === "shooting") return toDisplayRating(shootingScore);
  if (category === "playmaking") return toDisplayRating(playmakingScore);
  if (category === "rebounding") return toDisplayRating(reboundingScore);
  if (category === "efficiency") return toDisplayRating(efficiencyScore);
  if (category === "careerLegacy") return careerLegacyScore;

  const starCategories = [
    ppgScore >= 70,
    rpgScore >= 55,
    apgScore >= 55,
    fgScore >= 70,
    threeScore >= 70,
    ftScore >= 75,
  ].filter(Boolean).length;

  const versatilityBonus = Math.min(starCategories * 0.35, 2.1);

  const overallScore =
    scoringScore * 0.22 +
    defenseScore * 0.18 +
    playmakingScore * 0.14 +
    efficiencyScore * 0.12 +
    shootingScore * 0.1 +
    reboundingScore * 0.1 +
    starPowerScore * 0.07 +
    careerLegacyScore * 0.07 +
    versatilityBonus;

  const overall = toDisplayRating(overallScore);

  return Number.isFinite(overall) ? overall : 55;
}

export function getCareerLegacyTier(score: number | null | undefined) {
  const safeScore = score ?? 0;

  if (safeScore >= 95) return "Pantheon Legend";
  if (safeScore >= 90) return "All-Time Great";
  if (safeScore >= 80) return "Historic Superstar";
  if (safeScore >= 70) return "Franchise Legend";
  if (safeScore >= 60) return "Elite Career";
  if (safeScore >= 50) return "Strong Legacy";
  if (safeScore >= 40) return "Notable Career";
  if (safeScore >= 30) return "Established Veteran";
  return "Career Role Player";
}
