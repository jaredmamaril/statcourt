import type { LineupSlot, Player, PlayerStats } from "../../court-data";
import {
  getPlayerRating,
  type PlayerRatingCategory,
  type PlayerStatProfileMode,
} from "../../player-ratings";

export type BuilderStatProfileMode = PlayerStatProfileMode;
export type PositionFit = "natural" | "flex" | "reach" | "mismatch";

function getStatsByMode(
  player: Player,
  statProfileMode: BuilderStatProfileMode,
): PlayerStats {
  const profile =
    statProfileMode === "peak"
      ? (player.statProfiles?.peak ?? player.statProfiles?.career)
      : statProfileMode === "current"
        ? (player.statProfiles?.current ?? player.statProfiles?.career)
        : player.statProfiles?.career;

  return {
    games: profile?.games ?? player.stats.games,
    ppg: profile?.ppg ?? player.stats.ppg,
    rpg: profile?.rpg ?? player.stats.rpg,
    apg: profile?.apg ?? player.stats.apg,
    spg: profile?.spg ?? player.stats.spg,
    bpg: profile?.bpg ?? player.stats.bpg,
    fgPercent: profile?.fgPercent ?? player.stats.fgPercent,
    threePercent: profile?.threePercent ?? player.stats.threePercent,
    ftPercent: profile?.ftPercent ?? player.stats.ftPercent,
  };
}

function upgradeFit(fit: PositionFit): PositionFit {
  if (fit === "mismatch") return "reach";
  if (fit === "reach") return "flex";
  return fit;
}

function downgradeFit(fit: PositionFit): PositionFit {
  if (fit === "natural") return "flex";
  if (fit === "flex") return "reach";
  if (fit === "reach") return "mismatch";
  return "mismatch";
}

function getBuilderPrimaryPosition(player: Player): Player["position"] {
  const height = player.heightInches ?? 0;
  const weight = player.weightPounds ?? 0;
  const apiPosition = player.apiPosition?.toLowerCase() ?? "";
  const apg = player.stats.apg ?? 0;
  const isApiForward = apiPosition.includes("forward");
  const isApiCenter = apiPosition.includes("center");
  const isMixedForwardCenter = isApiForward && isApiCenter;

  const isCenterProfile =
    (isApiCenter && !isApiForward) ||
    (isMixedForwardCenter && (height >= 86 || weight >= 260)) ||
    (!isApiForward && height >= 84) ||
    (height >= 82 && weight >= 260);

  const isForwardProfile =
    isApiForward || (height >= 79 && weight >= 200);

  if (player.position === "F" && isCenterProfile) {
    return "C";
  }

  if (player.position === "C" && isMixedForwardCenter && !isCenterProfile) {
    return "F";
  }

  if (player.position === "G" && isForwardProfile && apg < 6.5) {
    return "F";
  }

  return player.position;
}

function applyStatBasedFitAdjustment(
  player: Player,
  slot: LineupSlot,
  fit: PositionFit,
  statProfileMode: BuilderStatProfileMode,
): PositionFit {
  const builderPosition = getBuilderPrimaryPosition(player);
  const stats = getStatsByMode(player, statProfileMode);
  const ppg = stats.ppg ?? 0;
  const rpg = stats.rpg ?? 0;
  const apg = stats.apg ?? 0;
  const threePercent = stats.threePercent ?? 0;
  const bpg = stats.bpg ?? 0;

  const defense = player.ratings.defense ?? 0;

  const isGoodShooter = threePercent >= 36;
  const isStrongShooter = threePercent >= 38;
  const isPlaymaker = apg >= 5;
  const isElitePlaymaker = apg >= 7;
  const isStrongRebounder = rpg >= 8;
  const isGoodDefender = defense >= 78;
  const isStrongDefender = defense >= 85;
  const hasRimProtection = bpg >= 0.8;

  let adjustedFit = fit;

  if (builderPosition === "G" && slot === "SF") {
    if (fit === "reach" && isGoodDefender && isGoodShooter) {
      adjustedFit = upgradeFit(adjustedFit);
    }

    if (fit === "flex" && defense < 65 && rpg < 4) {
      adjustedFit = downgradeFit(adjustedFit);
    }
  }

  if (builderPosition === "G" && slot === "PF") {
    if (fit === "reach" && isStrongDefender && rpg >= 5) {
      adjustedFit = upgradeFit(adjustedFit);
    }
  }

  if (builderPosition === "F" && slot === "SG") {
    if (fit === "reach" && isStrongShooter && (isPlaymaker || ppg >= 24)) {
      adjustedFit = upgradeFit(adjustedFit);
    }

    if (fit === "flex" && threePercent < 32 && apg < 3 && ppg < 20) {
      adjustedFit = downgradeFit(adjustedFit);
    }
  }

  if (builderPosition === "F" && slot === "C") {
    if (
      fit === "reach" &&
      isStrongRebounder &&
      isStrongDefender &&
      hasRimProtection
    ) {
      adjustedFit = upgradeFit(adjustedFit);
    }

    if (fit === "flex" && rpg < 5 && defense < 72) {
      adjustedFit = downgradeFit(adjustedFit);
    }
  }

  if (builderPosition === "C" && slot === "PF") {
    if (
      fit === "reach" &&
      (isGoodShooter ||
        isPlaymaker ||
        (isStrongRebounder && (isGoodDefender || hasRimProtection)))
    ) {
      adjustedFit = upgradeFit(adjustedFit);
    }

    if (fit === "flex" && threePercent < 28 && apg < 2 && defense < 75) {
      adjustedFit = downgradeFit(adjustedFit);
    }
  }

  if (slot === "PG" && builderPosition === "F") {
    if (isElitePlaymaker && ppg >= 18) {
      adjustedFit = "flex";
    }
  }

  return adjustedFit;
}

function getBuilderRatingCategory(
  statProfileMode: PlayerStatProfileMode,
): PlayerRatingCategory {
  if (statProfileMode === "peak") return "peakOverall";
  if (statProfileMode === "current") return "currentOverall";
  return "careerOverall";
}

export function getBuilderPlayerRating(
  player: Player,
  statProfileMode: BuilderStatProfileMode,
) {
  return getPlayerRating(
    player,
    getBuilderRatingCategory(statProfileMode),
    statProfileMode,
  );
}

export function getPositionFit(
  player: Player,
  slot: LineupSlot,
  statProfileMode: BuilderStatProfileMode = "career",
): PositionFit {
  const builderPosition = getBuilderPrimaryPosition(player);
  const height = player.heightInches ?? 0;
  const weight = player.weightPounds ?? 0;

  const hasHeight = height > 0;
  const hasWeight = weight > 0;

  let baseFit: PositionFit = "mismatch";

  if (builderPosition === "G") {
    if (slot === "PG" || slot === "SG") baseFit = "natural";
    else if (slot === "SF") {
      baseFit = hasHeight && height >= 77 ? "flex" : "reach";
    } else if (slot === "PF") {
      baseFit =
        hasHeight && height >= 79 && (!hasWeight || weight >= 220)
          ? "reach"
          : "mismatch";
    }
  }

  if (builderPosition === "F") {
    if (slot === "SF" || slot === "PF") baseFit = "natural";
    else if (slot === "SG") {
      baseFit =
        hasHeight && height <= 80 && (!hasWeight || weight <= 235)
          ? "flex"
          : "reach";
    } else if (slot === "C") {
      if (hasHeight && height >= 82 && (!hasWeight || weight >= 245)) {
        baseFit = "flex";
      } else if (hasHeight && height >= 80) {
        baseFit = "reach";
      } else {
        baseFit = "mismatch";
      }
    } else if (slot === "PG") {
      baseFit = "mismatch";
    }
  }

  if (builderPosition === "C") {
    if (slot === "C") baseFit = "natural";
    else if (slot === "PF") {
      baseFit =
        hasHeight && height <= 84 && (!hasWeight || weight <= 260)
          ? "flex"
          : "reach";
    }
  }

  return applyStatBasedFitAdjustment(player, slot, baseFit, statProfileMode);
}

export function getPositionPenalty(fit: PositionFit) {
  if (fit === "natural") return 0;
  if (fit === "flex") return 2;
  if (fit === "reach") return 5;
  return 10;
}

export function getBuilderPlayerRatingForPosition(
  player: Player,
  slot: LineupSlot,
  statProfileMode: BuilderStatProfileMode,
) {
  return (
    getBuilderPlayerRating(player, statProfileMode) -
    getPositionPenalty(getPositionFit(player, slot, statProfileMode))
  );
}
