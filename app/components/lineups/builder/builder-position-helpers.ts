import type { LineupSlot, Player } from "../../court-data";
import {
  getPlayerRating,
  type PlayerRatingCategory,
  type PlayerStatProfileMode,
} from "../../player-ratings";

export type BuilderStatProfileMode = PlayerStatProfileMode;
export type PositionFit = "natural" | "flex" | "reach" | "mismatch";

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

function applyStatBasedFitAdjustment(
  player: Player,
  slot: LineupSlot,
  fit: PositionFit,
): PositionFit {
  const ppg = player.stats.ppg ?? 0;
  const rpg = player.stats.rpg ?? 0;
  const apg = player.stats.apg ?? 0;
  const threePercent = player.stats.threePercent ?? 0;
  const bpg = player.stats.bpg ?? 0;

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

  if (player.position === "G" && slot === "SF") {
    if (fit === "reach" && isGoodDefender && isGoodShooter) {
      adjustedFit = upgradeFit(adjustedFit);
    }

    if (fit === "flex" && defense < 65 && rpg < 4) {
      adjustedFit = downgradeFit(adjustedFit);
    }
  }

  if (player.position === "G" && slot === "PF") {
    if (fit === "reach" && isStrongDefender && rpg >= 5) {
      adjustedFit = upgradeFit(adjustedFit);
    }
  }

  if (player.position === "F" && slot === "SG") {
    if (fit === "reach" && isStrongShooter && (isPlaymaker || ppg >= 24)) {
      adjustedFit = upgradeFit(adjustedFit);
    }

    if (fit === "flex" && threePercent < 32 && apg < 3 && ppg < 20) {
      adjustedFit = downgradeFit(adjustedFit);
    }
  }

  if (player.position === "F" && slot === "C") {
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

  if (player.position === "C" && slot === "PF") {
    if (fit === "reach" && (isGoodShooter || isPlaymaker)) {
      adjustedFit = upgradeFit(adjustedFit);
    }

    if (fit === "flex" && threePercent < 28 && apg < 2 && defense < 75) {
      adjustedFit = downgradeFit(adjustedFit);
    }
  }

  if (slot === "PG" && player.position === "F") {
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

export function getPositionFit(player: Player, slot: LineupSlot): PositionFit {
  const height = player.heightInches ?? 0;
  const weight = player.weightPounds ?? 0;

  const hasHeight = height > 0;
  const hasWeight = weight > 0;

  let baseFit: PositionFit = "mismatch";

  if (player.position === "G") {
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

  if (player.position === "F") {
    if (slot === "SF" || slot === "PF") baseFit = "natural";
    else if (slot === "SG") {
      baseFit =
        hasHeight && height <= 80 && (!hasWeight || weight <= 235)
          ? "flex"
          : "reach";
    } else if (slot === "C") {
      if (hasHeight && height >= 80 && (!hasWeight || weight >= 230)) {
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

  if (player.position === "C") {
    if (slot === "C") baseFit = "natural";
    else if (slot === "PF") {
      baseFit =
        hasHeight && height <= 84 && (!hasWeight || weight <= 260)
          ? "flex"
          : "reach";
    }
  }

  return applyStatBasedFitAdjustment(player, slot, baseFit);
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
    getPositionPenalty(getPositionFit(player, slot))
  );
}
