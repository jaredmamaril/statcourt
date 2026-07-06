import type { Player, StatMode } from "../court-data";

function getStatsByMode(player: Player, statMode: StatMode) {
  if (statMode === "peak") {
    return (
      player.statProfiles?.peak ?? player.statProfiles?.career ?? player.stats
    );
  }

  if (statMode === "current") {
    return (
      player.statProfiles?.current ??
      player.statProfiles?.career ??
      player.stats
    );
  }

  return player.statProfiles?.career ?? player.stats;
}

type LineupFitTier = "premium" | "strong" | "support" | "depth";

type LineupFit = {
  label: string;
  score: number;
  tier: LineupFitTier;
};

const tierPriority: Record<LineupFitTier, number> = {
  premium: 4,
  strong: 3,
  support: 2,
  depth: 1,
};

export function getBestLineupFits(
  player: Player,
  statMode: StatMode = "career",
) {
  const stats = getStatsByMode(player, statMode);
  const fits: LineupFit[] = [];

  const ppg = stats.ppg ?? 0;
  const rpg = stats.rpg ?? 0;
  const apg = stats.apg ?? 0;
  const fgPercent = stats.fgPercent ?? 0;
  const threePercent = stats.threePercent ?? 0;

  const defense = player.ratings.defense;
  const starPower = player.ratings.starPower;

  const isGuard = player.position === "G";
  const isForward = player.position === "F";
  const isCenter = player.position === "C";
  const isBig = isForward || isCenter;

  const isStar = starPower >= 88 || ppg >= 18;
  const isSuperstar = starPower >= 94 || ppg >= 23;

  function addFit(label: string, score: number, tier: LineupFitTier) {
    fits.push({ label, score, tier });
  }

  // Premium star / identity fits
  if (isSuperstar) {
    addFit("Star-Powered Contender", starPower + ppg, "premium");
  }

  if (ppg >= 22 && defense >= 86) {
    addFit("Two-Way Dynasty", ppg + defense, "premium");
  }

  if (ppg >= 22 && apg >= 4.5 && fgPercent >= 46) {
    addFit("Transition Attack", ppg + apg * 3 + fgPercent / 2, "premium");
  }

  if (apg >= 6.5 || (isStar && apg >= 5.5)) {
    addFit("Showtime Offense", apg * 6 + ppg, "premium");
  }

  if (threePercent >= 37 && ppg >= 14) {
    addFit("Spacing Superteam", threePercent + ppg + starPower / 3, "premium");
  }

  if (defense >= 88) {
    addFit("Defensive Powerhouse", defense + rpg, "premium");
  }

  if ((rpg >= 9 && fgPercent >= 48) || isCenter) {
    addFit("Paint Control Unit", rpg * 4 + fgPercent, "premium");
  }

  if (ppg >= 24 && apg < 6) {
    addFit("Isolation Scoring Core", ppg * 3 + starPower / 2, "premium");
  }

  // Strong non-gray fits
  if (isGuard && apg >= 4.5) {
    addFit("Lead Guard Engine", apg * 5 + ppg, "strong");
  }

  if (isGuard && ppg >= 14 && threePercent >= 34) {
    addFit("Perimeter Guard Unit", ppg + threePercent, "strong");
  }

  if (isGuard && defense >= 86 && (apg >= 4 || ppg >= 12)) {
    addFit("Point-of-Attack Defense", defense + apg + ppg / 2, "strong");
  }

  if (isForward && ppg >= 14 && rpg >= 4.5) {
    addFit("Versatile Wing Core", ppg + rpg * 3 + defense / 2, "strong");
  }

  if (isForward && threePercent >= 34) {
    addFit("Floor-Spacing Wing", threePercent + ppg + defense / 3, "strong");
  }

  if (isForward && defense >= 86 && rpg >= 5 && ppg >= 10) {
    addFit("Switchable Defense", defense + rpg + ppg / 2, "strong");
  }

  if (isBig && apg >= 3.5 && rpg >= 6) {
    addFit("High-Post Hub", apg * 6 + rpg * 2, "strong");
  }

  if (isBig && rpg >= 6.5 && fgPercent >= 48) {
    addFit("Interior Support Unit", rpg * 4 + fgPercent, "strong");
  }

  if ((isCenter || rpg >= 7 || (stats.bpg ?? 0) >= 0.8) && defense >= 82) {
    addFit("Backline Defense", defense + rpg * 2, "strong");
  }

  if (ppg >= 18 && fgPercent >= 50 && threePercent < 34) {
    addFit("Rim Pressure Attack", ppg + fgPercent + rpg * 2, "strong");
  }

  if (threePercent >= 37 && apg < 5 && ppg >= 10) {
    addFit("Off-Ball Shooting Unit", threePercent + ppg * 2, "strong");
  }

  if (ppg >= 16 && rpg >= 4 && apg >= 3 && defense >= 78) {
    addFit(
      "Balanced Contender",
      ppg + rpg * 2 + apg * 3 + defense / 2,
      "strong",
    );
  }

  // Support fits for role players
  if (ppg >= 9 && threePercent >= 33) {
    addFit("Secondary Spacing", ppg + threePercent, "support");
  }

  if (ppg >= 9 && apg >= 2.5) {
    addFit("Secondary Creator Unit", ppg + apg * 4, "support");
  }

  if (rpg >= 5 && defense >= 76) {
    addFit("Rebounding Support", rpg * 5 + defense / 2, "support");
  }

  if (defense >= 78 && ppg >= 6) {
    addFit("Defensive Role Balance", defense + ppg, "support");
  }

  // Depth fallback only if player has no better fits
  if (fits.length === 0) {
    if (isGuard) {
      addFit("Guard Depth Unit", ppg + apg * 3 + threePercent / 2, "depth");
    } else if (isForward) {
      addFit("Wing Depth Unit", ppg + rpg * 2 + defense / 2, "depth");
    } else {
      addFit(
        "Frontcourt Depth Unit",
        rpg * 3 + fgPercent + defense / 2,
        "depth",
      );
    }
  }

  // Fill to 3 only if needed
  if (fits.length < 3) {
    if (threePercent >= 32) {
      addFit("Spacing Support", threePercent + ppg, "support");
    }

    if (defense >= 74) {
      addFit("Defensive Support", defense + rpg, "support");
    }

    if (ppg >= 7) {
      addFit("Bench Scoring Unit", ppg * 3, "support");
    }

    if (rpg >= 4) {
      addFit("Energy Lineup", rpg * 4 + defense / 2, "support");
    }
  }

  return fits
    .sort(
      (a, b) =>
        tierPriority[b.tier] - tierPriority[a.tier] || b.score - a.score,
    )
    .map((fit) => fit.label)
    .slice(0, 3);
}
