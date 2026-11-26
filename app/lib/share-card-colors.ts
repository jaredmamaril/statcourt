import { getReadableTeamColor, getTeamColor } from "../components/court-data";

// Colors for the share card's monogram circle. Current-season cards use the player's
// team color; many team primaries (MIN, BKN, UTA navy/black, ...) almost disappear on
// the card's dark background, so the circle must keep enough contrast:
// 1. the team's primary color, if it has enough contrast;
// 2. otherwise the team's lighter "readable" color (getReadableTeamColor), if that does;
// 3. otherwise the primary color with a ring in the StatCourt accent color.

// WCAG 2 minimum contrast for graphical objects (non-text).
export const MIN_MONOGRAM_CONTRAST = 3;

const LIGHT_TEXT = "#ffffff";

function parseHex(hex: string) {
  const value = hex.replace("#", "");

  if (!/^[0-9a-f]{6}$/i.test(value)) return null;

  return [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
}

// WCAG relative luminance, 0 (black) to 1 (white).
export function getRelativeLuminance(hex: string) {
  const channels = parseHex(hex);

  if (!channels) return null;

  const [r, g, b] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(a: string, b: string) {
  const la = getRelativeLuminance(a);
  const lb = getRelativeLuminance(b);

  if (la === null || lb === null) return 1;

  const [lighter, darker] = la > lb ? [la, lb] : [lb, la];

  return (lighter + 0.05) / (darker + 0.05);
}

export type MonogramColors = {
  fill: string;
  // Outer ring around the circle (the fill again, or the accent when it's needed).
  ring: string;
  // Initials: white or the card's dark background color, whichever contrasts more.
  text: string;
  source: "primary" | "readable" | "accent-ring" | "accent";
};

export function getMonogramColors(
  team: string | null,
  { background, accent }: { background: string; accent: string },
): MonogramColors {
  const textFor = (fill: string) =>
    getContrastRatio(fill, LIGHT_TEXT) >= getContrastRatio(fill, background)
      ? LIGHT_TEXT
      : background;

  // Peak and Career cards don't show a team, so the circle uses the accent.
  if (!team) {
    return { fill: accent, ring: accent, text: textFor(accent), source: "accent" };
  }

  const primary = getTeamColor(team);

  if (!primary) {
    return { fill: accent, ring: accent, text: textFor(accent), source: "accent" };
  }

  if (getContrastRatio(primary, background) >= MIN_MONOGRAM_CONTRAST) {
    return { fill: primary, ring: primary, text: textFor(primary), source: "primary" };
  }

  const readable = getReadableTeamColor(team);

  if (readable && getContrastRatio(readable, background) >= MIN_MONOGRAM_CONTRAST) {
    return { fill: readable, ring: readable, text: textFor(readable), source: "readable" };
  }

  return { fill: primary, ring: accent, text: textFor(primary), source: "accent-ring" };
}
