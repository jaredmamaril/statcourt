import { normalizeStat, statMaxValues, type Player } from "./court-data";

export type PlayerRatingCategory =
  | "careerOverall"
  | "peakOverall"
  | "currentOverall"
  | "scoring"
  | "shooting"
  | "playmaking"
  | "rebounding"
  | "defense"
  | "efficiency"
  | "careerLegacy"
  | "starPower";

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function toCategoryRating(rawScore: number) {
  return clamp(50 + rawScore * 0.5);
}

function toOverallRating(rawScore: number) {
  if (rawScore >= 85) return clamp(96 + (rawScore - 85) * 0.25);
  if (rawScore >= 78) return clamp(92 + (rawScore - 78) * 0.57);
  if (rawScore >= 70) return clamp(86 + (rawScore - 70) * 0.75);
  if (rawScore >= 60) return clamp(78 + (rawScore - 60) * 0.8);
  if (rawScore >= 50) return clamp(68 + (rawScore - 50));
  return clamp(45 + rawScore * 0.46);
}

function safeNumber(value: number | null | undefined, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getPeakOverallScore({
  scoringScore,
  playmakingScore,
  reboundingScore,
  efficiencyScore,
  shootingScore,
  defenseScore,
  starPowerScore,
  careerLegacyScore,
}: {
  scoringScore: number;
  playmakingScore: number;
  reboundingScore: number;
  efficiencyScore: number;
  shootingScore: number;
  defenseScore: number;
  starPowerScore: number;
  careerLegacyScore: number;
}) {
  const bestSkillScore = Math.max(
    scoringScore,
    playmakingScore,
    reboundingScore,
    efficiencyScore,
    shootingScore,
    defenseScore,
  );

  const peakScore =
    scoringScore * 0.24 +
    defenseScore * 0.16 +
    playmakingScore * 0.15 +
    efficiencyScore * 0.13 +
    shootingScore * 0.1 +
    reboundingScore * 0.08 +
    starPowerScore * 0.08 +
    careerLegacyScore * 0.06 +
    Math.min(bestSkillScore * 0.08, 8);

  return toOverallRating(peakScore);
}

function getStatsForCategory(player: Player, category: PlayerRatingCategory) {
  if (category === "peakOverall") {
    return (
      player.statProfiles?.peak ?? player.statProfiles?.career ?? player.stats
    );
  }

  if (category === "currentOverall") {
    return (
      player.statProfiles?.current ??
      player.statProfiles?.career ??
      player.stats
    );
  }

  return player.statProfiles?.career ?? player.stats;
}

export function getPlayerRating(
  player: Player,
  category: PlayerRatingCategory = "careerOverall",
) {
  const activeStats = getStatsForCategory(player, category);

  const ppgScore = normalizeStat(
    safeNumber(activeStats.ppg, 0),
    statMaxValues.ppg,
  );
  const rpgScore = normalizeStat(
    safeNumber(activeStats.rpg, 0),
    statMaxValues.rpg,
  );
  const apgScore = normalizeStat(
    safeNumber(activeStats.apg, 0),
    statMaxValues.apg,
  );
  const fgScore = normalizeStat(
    safeNumber(activeStats.fgPercent, 0),
    statMaxValues.fgPercent,
  );
  const threeScore = normalizeStat(
    safeNumber(activeStats.threePercent, 0),
    statMaxValues.threePercent,
  );
  const ftScore = normalizeStat(
    safeNumber(activeStats.ftPercent, 0),
    statMaxValues.ftPercent,
  );

  const scoringScore = ppgScore;
  const shootingScore = threeScore * 0.7 + ftScore * 0.3;
  const playmakingScore = apgScore;
  const reboundingScore = rpgScore;
  const efficiencyScore = fgScore * 0.5 + threeScore * 0.25 + ftScore * 0.25;
  const defenseScore = safeNumber(player.ratings.defense, 70);
  const starPowerScore = safeNumber(player.ratings.starPower, 40);
  const careerLegacyScore = safeNumber(player.ratings.careerLegacy, 30);

  if (category === "scoring") return toCategoryRating(scoringScore);
  if (category === "shooting") return toCategoryRating(shootingScore);
  if (category === "playmaking") return toCategoryRating(playmakingScore);
  if (category === "rebounding") return toCategoryRating(reboundingScore);
  if (category === "defense") return defenseScore;
  if (category === "efficiency") return toCategoryRating(efficiencyScore);
  if (category === "careerLegacy") return careerLegacyScore;
  if (category === "starPower") return starPowerScore;
  if (category === "peakOverall") {
    const peakOverall = getPeakOverallScore({
      scoringScore,
      playmakingScore,
      reboundingScore,
      efficiencyScore,
      shootingScore,
      defenseScore,
      starPowerScore,
      careerLegacyScore,
    });

    return Number.isFinite(peakOverall) ? Number(peakOverall.toFixed(1)) : 55;
  }

  const starCategories = [
    ppgScore >= 70,
    rpgScore >= 55,
    apgScore >= 55,
    fgScore >= 70,
    threeScore >= 70,
    ftScore >= 75,
  ].filter(Boolean).length;

  const versatilityBonus = Math.min(starCategories * 0.35, 2.1);

  const games = safeNumber(activeStats.games, 0);

  const careerSamplePenalty =
    games < 250 ? 3.5 : games < 500 ? 2.0 : games < 750 ? 0.8 : 0;

  const overallScore =
    scoringScore * 0.18 +
    defenseScore * 0.16 +
    playmakingScore * 0.13 +
    efficiencyScore * 0.11 +
    shootingScore * 0.09 +
    reboundingScore * 0.08 +
    starPowerScore * 0.08 +
    careerLegacyScore * 0.16 +
    versatilityBonus -
    careerSamplePenalty;

  const overall = toOverallRating(overallScore);

  const legacyFloor =
    careerLegacyScore >= 98
      ? 88
      : careerLegacyScore >= 95
        ? 86
        : careerLegacyScore >= 90
          ? 84
          : careerLegacyScore >= 85
            ? 82
            : careerLegacyScore >= 80
              ? 80
              : 0;

  const finalOverall = Math.max(overall, legacyFloor);

  return Number.isFinite(finalOverall) ? Number(finalOverall.toFixed(1)) : 55;
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

export function getStarPowerTier(score: number | null | undefined) {
  const safeScore = score ?? 0;

  if (safeScore >= 98) return "Global Icon";
  if (safeScore >= 90) return "Legendary Superstar";
  if (safeScore >= 80) return "Superstar";
  if (safeScore >= 70) return "Star";
  if (safeScore >= 60) return "Notable Name";
  if (safeScore >= 50) return "Recognizable Player";
  if (safeScore >= 40) return "Rotation Name";
  return "Low Recognition";
}
