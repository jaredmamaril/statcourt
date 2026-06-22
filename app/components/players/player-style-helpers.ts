import type { CSSProperties } from "react";
import type { PlayerInsightDisplay } from "../court-data";

export function getPlayerNameTextClass(name: string) {
  if (name.length >= 20) {
    return "max-w-72 text-[18px] leading-tight whitespace-normal";
  }

  if (name.length >= 16) {
    return "max-w-80 text-[22px] leading-tight whitespace-normal";
  }

  if (name.length >= 15) {
    return "max-w-80 text-[24px] leading-tight whitespace-normal";
  }

  if (name.length >= 12) {
    return "max-w-80 text-[26px] leading-tight whitespace-normal";
  }

  return "max-w-88 text-2xl leading-none whitespace-nowrap";
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
  let color = "#CBD5E1";

  if (fit === "Transition Attack" || fit === "Showtime Offense") {
    color = "#1bc2ec";
  }

  if (fit === "Defensive Powerhouse") {
    color = "#22C55E";
  }

  if (fit === "Spacing Superteam" || fit === "Floor Spacing Machine") {
    color = "#A855F7";
  }

  if (fit === "Offensive Superteam") {
    color = "#F97316";
  }

  if (fit === "Two-Way Dynasty") {
    color = "#EFBF04";
  }

  if (fit === "Star-Powered Contender") {
    color = "#38BDF8";
  }

  if (fit === "Paint Control Unit") {
    color = "#EF4444";
  }

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
