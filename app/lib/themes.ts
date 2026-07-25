export const statcourtThemes = {
  courtDark: {
    id: "court-dark",
    label: "Court Blue",
    background: "#08111f",
    foreground: "#f8fafc",
    panel: "#06131d",
    panelAlt: "#071827",
    accent: "#1bc2ec",
    accentRgb: "27 194 236",
    pattern: "/court-pattern-blue.svg",
  },
  arenaGold: {
    id: "arena-gold",
    label: "Arena Gold",
    background: "#100d07",
    foreground: "#fff7ed",
    panel: "#171106",
    panelAlt: "#201706",
    accent: "#f4b400",
    accentRgb: "244 180 0",
    pattern: "/court-pattern-gold.svg",
  },
  neonViolet: {
    id: "neon-violet",
    label: "Neon Violet",
    background: "#17051f",
    foreground: "#fff7ff",
    panel: "#21072d",
    panelAlt: "#330b45",
    accent: "#f472ff",
    accentRgb: "244 114 255",
    pattern: "/court-pattern-violet.svg",
  },
} as const;

export type StatCourtThemeId =
  (typeof statcourtThemes)[keyof typeof statcourtThemes]["id"];

export const defaultStatCourtTheme = statcourtThemes.courtDark;

export const statcourtThemeOptions = Object.values(statcourtThemes);
export const statcourtThemeStorageKey = "statcourt:theme";
export const statcourtThemeChangedEvent = "statcourt:theme-changed";

export function isStatCourtThemeId(value: string): value is StatCourtThemeId {
  return statcourtThemeOptions.some((theme) => theme.id === value);
}

function setThemeCssVariables(themeId: StatCourtThemeId) {
  const theme = statcourtThemeOptions.find((option) => option.id === themeId);

  if (!theme) return;

  const root = document.documentElement;

  root.style.setProperty("--background", theme.background);
  root.style.setProperty("--foreground", theme.foreground);
  root.style.setProperty("--court-panel", theme.panel);
  root.style.setProperty("--court-panel-alt", theme.panelAlt);
  root.style.setProperty("--court-accent", theme.accent);
  root.style.setProperty("--court-accent-rgb", theme.accentRgb);
  root.style.setProperty("--court-pattern", `url("${theme.pattern}")`);
}

export function applyStatCourtTheme(themeId: StatCourtThemeId, notify = true) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(statcourtThemeStorageKey, themeId);
  document.documentElement.setAttribute("data-statcourt-theme", themeId);
  setThemeCssVariables(themeId);

  if (notify) {
    window.dispatchEvent(new Event(statcourtThemeChangedEvent));
  }
}

export function resetStatCourtTheme() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(statcourtThemeStorageKey);
  document.documentElement.setAttribute(
    "data-statcourt-theme",
    defaultStatCourtTheme.id,
  );
  setThemeCssVariables(defaultStatCourtTheme.id);
  window.dispatchEvent(new Event(statcourtThemeChangedEvent));
}
