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

// Canonical profile links for a set of players: names shared by more than one player
// in the set get the NBA ID suffix. Pass the full player list (not a filtered view)
// so links match the sitemap.
export function createPlayerHrefResolver(players: readonly PlayerSlugSource[]) {
  const duplicateSlugs = getDuplicatePlayerSlugs(players);

  return (player: PlayerSlugSource) => getPlayerHref(player, duplicateSlugs);
}

// Every canonical player profile path, as listed in the sitemap.
export function getCanonicalPlayerPaths(players: readonly PlayerSlugSource[]) {
  const toHref = createPlayerHrefResolver(players);

  return Array.from(new Set(players.map(toHref)));
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
