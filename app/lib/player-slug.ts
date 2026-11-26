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

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    // Malformed escapes (e.g. "%E0%A4%A") match no player.
    return null;
  }
}

export type PlayerSlugMatch<T> =
  // One player. `canonicalSlug` may differ from the URL (wrong case, encoded name,
  // ID suffix on a unique name); the page redirects there.
  | { status: "found"; player: T; canonicalSlug: string }
  // A bare name slug shared by several players, e.g. /players/mike-james.
  | { status: "ambiguous"; players: T[]; canonicalSlug: string }
  | { status: "not-found" };

// Accepts /players/{slug}-{nbaId}, /players/{slug}, and /players/{Encoded Name}.
export function matchPlayerSlug<T extends PlayerSlugSource>(
  players: readonly T[],
  slugParam: string,
  duplicateSlugs: ReadonlySet<string> = getDuplicatePlayerSlugs(players),
): PlayerSlugMatch<T> {
  const decodedParam = safeDecode(slugParam);

  if (decodedParam === null) return { status: "not-found" };

  const requestedSlug = toPlayerSlug(decodedParam);

  if (!requestedSlug) return { status: "not-found" };

  const idMatch = players.find((candidate) => getPlayerIdSlug(candidate) === requestedSlug);
  const matches = idMatch
    ? [idMatch]
    : players.filter(
        (candidate) =>
          toPlayerSlug(candidate.name) === requestedSlug ||
          candidate.name.toLowerCase() === decodedParam.toLowerCase(),
      );

  if (matches.length === 0) return { status: "not-found" };

  if (matches.length > 1) {
    return { status: "ambiguous", players: matches, canonicalSlug: requestedSlug };
  }

  return {
    status: "found",
    player: matches[0],
    canonicalSlug: getCanonicalPlayerSlug(matches[0], duplicateSlugs),
  };
}

// Like matchPlayerSlug, but a bare slug shared by several players resolves to the
// first one, as before (share cards, which always need a single player).
export function findPlayerBySlug<T extends PlayerSlugSource>(
  players: readonly T[],
  slugParam: string,
) {
  const match = matchPlayerSlug(players, slugParam);

  if (match.status === "found") return match.player;
  if (match.status === "ambiguous") return match.players[0];

  return undefined;
}
