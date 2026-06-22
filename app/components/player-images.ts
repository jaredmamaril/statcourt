import type { Player } from "./court-data";

export function getPlayerSlug(name: string) {
  return name
    .toLowerCase()
    .replaceAll("'", "")
    .replaceAll(".", "")
    .replaceAll(" ", "-");
}

const nbaIdByPlayerSlug: Record<string, number> = {
  "lebron-james": 2544,
  "michael-jordan": 893,
  "kobe-bryant": 977,
  "stephen-curry": 201939,
  "kevin-durant": 201142,
  "shaquille-oneal": 406,
  "magic-johnson": 77142,
  "larry-bird": 1449,
  "tim-duncan": 1495,
  "hakeem-olajuwon": 165,
  "wilt-chamberlain": 76375,
  "giannis-antetokounmpo": 203507,
  "nikola-jokic": 203999,
};

export function getPlayerHeadshot(player: Player) {
  const slug = getPlayerSlug(player.name);
  const nbaId = nbaIdByPlayerSlug[slug];

  if (!nbaId) return player.image;

  return `https://cdn.nba.com/headshots/nba/latest/1040x760/${nbaId}.png`;
}
