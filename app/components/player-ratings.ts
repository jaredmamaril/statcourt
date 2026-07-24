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

export type PlayerStatProfileMode = "career" | "peak" | "current";

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

function getStatsForCategory(
  player: Player,
  category: PlayerRatingCategory,
  statProfileMode: PlayerStatProfileMode = "career",
) {
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

  if (statProfileMode === "peak") {
    return (
      player.statProfiles?.peak ?? player.statProfiles?.career ?? player.stats
    );
  }

  if (statProfileMode === "current") {
    return (
      player.statProfiles?.current ??
      player.statProfiles?.career ??
      player.stats
    );
  }

  return player.statProfiles?.career ?? player.stats;
}

function getProfileMinimums(statProfileMode: PlayerStatProfileMode) {
  if (statProfileMode === "career") {
    return {
      shootingGames: 250,
      efficiencyGames: 250,
      minutesPerGame: 12,
    };
  }

  if (statProfileMode === "peak") {
    return {
      shootingGames: 120,
      efficiencyGames: 120,
      minutesPerGame: 18,
    };
  }

  return {
    shootingGames: 25,
    efficiencyGames: 25,
    minutesPerGame: 15,
  };
}

function hasEnoughSample(
  stats: { games?: number | null; minutesPerGame?: number | null },
  minimumGames: number,
  minimumMinutes: number,
) {
  const games = safeNumber(stats.games, 0);
  const minutesPerGame = stats.minutesPerGame;

  const hasEnoughGames = games >= minimumGames;
  const hasEnoughMinutes =
    minutesPerGame == null || safeNumber(minutesPerGame, 0) >= minimumMinutes;

  return hasEnoughGames && hasEnoughMinutes;
}

function hasRealShootingProfile(
  stats: {
    games?: number | null;
    minutesPerGame?: number | null;
    ppg?: number | null;
    threePercent?: number | null;
    ftPercent?: number | null;
    threeAttemptsPerGame?: number | null;
  },
  statProfileMode: PlayerStatProfileMode,
) {
  const minimums = getProfileMinimums(statProfileMode);
  const hasSample = hasEnoughSample(
    stats,
    minimums.shootingGames,
    minimums.minutesPerGame,
  );

  if (!hasSample) return false;

  const threePercent = safeNumber(stats.threePercent, 0);
  const ftPercent = safeNumber(stats.ftPercent, 0);
  const threeAttemptsPerGame = stats.threeAttemptsPerGame;

  if (threeAttemptsPerGame == null) {
    return false;
  }

  const minimumThreeAttempts =
    statProfileMode === "career" ? 1.5 : statProfileMode === "peak" ? 3 : 3.5;

  return (
    safeNumber(threeAttemptsPerGame, 0) >= minimumThreeAttempts &&
    threePercent >= 32 &&
    ftPercent >= 65
  );
}

function hasRealEfficiencyProfile(
  stats: {
    games?: number | null;
    minutesPerGame?: number | null;
    ppg?: number | null;
    fgPercent?: number | null;
    ftPercent?: number | null;
  },
  statProfileMode: PlayerStatProfileMode,
) {
  const minimums = getProfileMinimums(statProfileMode);
  const hasSample = hasEnoughSample(
    stats,
    minimums.efficiencyGames,
    minimums.minutesPerGame,
  );

  if (!hasSample) return false;

  const minimumPpg =
    statProfileMode === "career" ? 8 : statProfileMode === "peak" ? 10 : 10;

  return (
    safeNumber(stats.ppg, 0) >= minimumPpg &&
    safeNumber(stats.fgPercent, 0) >= 42 &&
    safeNumber(stats.ftPercent, 0) >= 50
  );
}

function hasStableShootingHistory(
  player: Player,
  activeStats: {
    ppg?: number | null;
    threePercent?: number | null;
    ftPercent?: number | null;
  },
) {
  const careerStats = player.statProfiles?.career ?? player.stats;
  const careerThreePercent = safeNumber(careerStats.threePercent, 0);
  const careerFtPercent = safeNumber(careerStats.ftPercent, 0);
  const activePpg = safeNumber(activeStats.ppg, 0);
  const activeThreePercent = safeNumber(activeStats.threePercent, 0);
  const activeFtPercent = safeNumber(activeStats.ftPercent, 0);

  if (careerThreePercent >= 34 && careerFtPercent >= 72) {
    return true;
  }

  if (
    careerThreePercent >= 32 &&
    careerFtPercent >= 78 &&
    activeThreePercent >= 36
  ) {
    return true;
  }

  return activePpg >= 18 && activeThreePercent >= 36 && activeFtPercent >= 78;
}

export function getPlayerRating(
  player: Player,
  category: PlayerRatingCategory = "careerOverall",
  statProfileMode: PlayerStatProfileMode = "career",
) {
  const activeStats = getStatsForCategory(player, category, statProfileMode);

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
  const shootingThreePercent = Math.min(
    safeNumber(activeStats.threePercent, 0),
    45,
  );
  const shootingFtPercent = Math.min(safeNumber(activeStats.ftPercent, 0), 92);
  const threeAttemptsPerGame = safeNumber(activeStats.threeAttemptsPerGame, 0);
  const threeAttemptsScore = normalizeStat(threeAttemptsPerGame, 10);
  const hasMeaningfulThreeVolume =
    activeStats.threeAttemptsPerGame != null &&
    threeAttemptsPerGame >=
      (statProfileMode === "career" ? 1.5 : statProfileMode === "peak" ? 2.5 : 3);
  const lowVolumePenalty =
    activeStats.threeAttemptsPerGame != null
      ? Math.max(0, 4 - threeAttemptsPerGame) * 5
      : 0;
  const threeScore = normalizeStat(
    shootingThreePercent,
    statMaxValues.threePercent,
  );
  const ftScore = normalizeStat(
    shootingFtPercent,
    statMaxValues.ftPercent,
  );

  const scoringScore = ppgScore;
  const shootingScore =
    activeStats.threeAttemptsPerGame != null
      ? threeScore * 0.45 +
        ftScore * 0.15 +
        threeAttemptsScore * 0.4 -
        lowVolumePenalty
      : threeScore * 0.7 + ftScore * 0.3;
  const playmakingScore = apgScore;
  const reboundingScore = rpgScore;
  const efficiencyThreeScore = hasMeaningfulThreeVolume ? threeScore : 0;
  const efficiencyScoringScore = normalizeStat(
    safeNumber(activeStats.ppg, 0),
    28,
  );
  const efficiencyScore =
    fgScore * 0.4 +
    ftScore * 0.2 +
    efficiencyThreeScore * 0.2 +
    efficiencyScoringScore * 0.2;
  const defenseScore = safeNumber(player.ratings.defense, 70);
  const starPowerScore = safeNumber(player.ratings.starPower, 40);
  const careerLegacyScore = safeNumber(player.ratings.careerLegacy, 30);

  const qualifiesForShootingRating = hasRealShootingProfile(
    activeStats,
    statProfileMode,
  ) && hasStableShootingHistory(player, activeStats);

  const qualifiesForEfficiencyRating = hasRealEfficiencyProfile(
    activeStats,
    statProfileMode,
  );

  if (category === "scoring") return toCategoryRating(scoringScore);
  if (category === "shooting") {
    return qualifiesForShootingRating ? toCategoryRating(shootingScore) : 0;
  }
  if (category === "playmaking") return toCategoryRating(playmakingScore);
  if (category === "rebounding") return toCategoryRating(reboundingScore);
  if (category === "defense") return defenseScore;
  if (category === "efficiency") {
    return qualifiesForEfficiencyRating ? toCategoryRating(efficiencyScore) : 0;
  }
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

  if (category === "currentOverall") {
    const currentOverallScore =
      scoringScore * 0.22 +
      defenseScore * 0.17 +
      playmakingScore * 0.14 +
      efficiencyScore * 0.13 +
      shootingScore * 0.1 +
      reboundingScore * 0.08 +
      starPowerScore * 0.12 +
      careerLegacyScore * 0.04;

    const currentOverall = toOverallRating(currentOverallScore);

    return Number.isFinite(currentOverall)
      ? Number(currentOverall.toFixed(1))
      : 55;
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
