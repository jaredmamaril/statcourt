export type PlayerSlugSource = {
  name: string;
  nbaId?: number | null;
};

export function toPlayerSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getPlayerIdSlug(player: PlayerSlugSource) {
  return player.nbaId == null
    ? null
    : `${toPlayerSlug(player.name)}-${player.nbaId}`;
}

// Base slugs shared by more than one player, e.g. two players named "Mike James".
export function getDuplicatePlayerSlugs(players: readonly PlayerSlugSource[]) {
  const counts = new Map<string, number>();

  for (const player of players) {
    const slug = toPlayerSlug(player.name);
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }

  return new Set(
    [...counts].filter(([, count]) => count > 1).map(([slug]) => slug),
  );
}

// Clashing names get an NBA ID suffix; every other player keeps the bare slug.
export function getCanonicalPlayerSlug(
  player: PlayerSlugSource,
  duplicateSlugs?: ReadonlySet<string>,
) {
  const slug = toPlayerSlug(player.name);

  if (!duplicateSlugs?.has(slug)) {
    return slug;
  }

  return getPlayerIdSlug(player) ?? slug;
}

export function getPlayerHref(
  player: string | PlayerSlugSource,
  duplicateSlugs?: ReadonlySet<string>,
) {
  const source = typeof player === "string" ? { name: player } : player;

  return `/players/${getCanonicalPlayerSlug(source, duplicateSlugs)}`;
}

// Accepts /players/{slug}-{nbaId}, /players/{slug}, and /players/{Encoded Name}.
// A bare slug shared by several players resolves to the first one, as before.
export function findPlayerBySlug<T extends PlayerSlugSource>(
  players: readonly T[],
  slugParam: string,
) {
  const decodedParam = decodeURIComponent(slugParam);
  const requestedSlug = toPlayerSlug(decodedParam);

  return (
    players.find((candidate) => getPlayerIdSlug(candidate) === requestedSlug) ??
    players.find((candidate) => {
      return (
        toPlayerSlug(candidate.name) === requestedSlug ||
        candidate.name.toLowerCase() === decodedParam.toLowerCase()
      );
    })
  );
}
