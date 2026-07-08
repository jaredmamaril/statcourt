import type { CSSProperties } from "react";
import type { PlayerInsightDisplay } from "../court-data";

export function getPlayerNameTextClass(name: string) {
  if (name.length >= 20) {
    return "max-w-32 text-[11px] leading-tight whitespace-normal lg:max-w-72 lg:text-[18px]";
  }

  if (name.length >= 16) {
    return "max-w-34 text-[12px] leading-tight whitespace-normal lg:max-w-80 lg:text-[22px]";
  }

  if (name.length >= 15) {
    return "max-w-36 text-[13px] leading-tight whitespace-normal lg:max-w-80 lg:text-[24px]";
  }

  if (name.length >= 12) {
    return "max-w-38 text-[14px] leading-tight whitespace-normal lg:max-w-80 lg:text-[26px]";
  }

  return "max-w-38 text-base leading-none whitespace-nowrap lg:max-w-88 lg:text-2xl";
}

export function getInsightRarityStyles(
  insight: PlayerInsightDisplay,
  isArchetype = false,
): CSSProperties {
  const backgroundOpacity = isArchetype ? "99" : "33";

  if (insight.rarity === "gold") {
    return {
      borderColor: "#EFBF04",
      backgroundColor: `#EFBF04${backgroundOpacity}`,
      color: "#FFE88A",
    };
  }

  if (insight.rarity === "purple") {
    return {
      borderColor: "#A855F7",
      backgroundColor: `#A855F7${backgroundOpacity}`,
      color: "#E9D5FF",
    };
  }

  if (insight.rarity === "blue") {
    return {
      borderColor: "#38BDF8",
      backgroundColor: `#38BDF8${backgroundOpacity}`,
      color: "#E0F2FE",
    };
  }

  if (insight.rarity === "red") {
    return {
      borderColor: "#EF4444",
      backgroundColor: `#EF4444${backgroundOpacity}`,
      color: "#FECACA",
    };
  }

  return {
    borderColor: "#94A3B8",
    backgroundColor: `#94A3B8${backgroundOpacity}`,
    color: "#E2E8F0",
  };
}

export function getRarityColor(rarity: PlayerInsightDisplay["rarity"]) {
  if (rarity === "gold") return "#EFBF04";
  if (rarity === "purple") return "#A855F7";
  if (rarity === "blue") return "#1bc2ec";
  if (rarity === "red") return "#EF4444";

  return "#94A3B8";
}

export function getLineupFitStyles(fit: string): CSSProperties {
  const fitColors: Record<string, string> = {
    // Pace / playmaking
    "Transition Attack": "#1BC2EC",
    "Showtime Offense": "#1BC2EC",
    "Lead Guard Engine": "#1BC2EC",
    "High-Post Hub": "#1BC2EC",
    "Secondary Creator Unit": "#1BC2EC",

    // Shooting / spacing
    "Spacing Superteam": "#A855F7",
    "Floor-Spacing Wing": "#A855F7",
    "Secondary Spacing": "#A855F7",
    "Spacing Support": "#A855F7",
    "Off-Ball Shooting Unit": "#A855F7",
    "Perimeter Guard Unit": "#A855F7",

    // Star / scoring
    "Star-Powered Contender": "#F97316",
    "Isolation Scoring Core": "#F97316",
    "Bench Scoring Unit": "#F97316",

    // Defense
    "Defensive Powerhouse": "#22C55E",
    "Point-of-Attack Defense": "#22C55E",
    "Switchable Defense": "#22C55E",
    "Backline Defense": "#22C55E",
    "Defensive Role Balance": "#22C55E",
    "Defensive Support": "#22C55E",

    // Interior / physicality
    "Paint Control Unit": "#EF4444",
    "Interior Support Unit": "#EF4444",
    "Rim Pressure Attack": "#EF4444",
    "Rebounding Support": "#EF4444",
    "Interior Pressure Frontcourt": "#EF4444",

    // Elite balance
    "Two-Way Dynasty": "#EFBF04",
    "Balanced Contender": "#EFBF04",

    // Depth / energy
    "Guard Depth Unit": "#CBD5E1",
    "Wing Depth Unit": "#CBD5E1",
    "Frontcourt Depth Unit": "#CBD5E1",
    "Energy Lineup": "#CBD5E1",
  };

  const color = fitColors[fit] ?? "#CBD5E1";

  return {
    color,
    borderColor: `${color}99`,
    backgroundColor: `${color}33`,
  };
}

export function getInsightRarityLabel(rarity: PlayerInsightDisplay["rarity"]) {
  if (rarity === "gold") return "Generational";
  if (rarity === "purple") return "Historic";
  if (rarity === "blue") return "Elite";
  if (rarity === "red") return "Weakness";

  return "Basic";
}
