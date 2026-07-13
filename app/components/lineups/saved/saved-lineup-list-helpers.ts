import type { SavedLineup } from "../shared/lineup-types";

export function getLineupsAfterDelete(
  savedLineups: SavedLineup[],
  lineupId: string,
) {
  return savedLineups.filter((lineup) => lineup.id !== lineupId);
}

function normalizeLineupName(lineupName: string) {
  return lineupName.trim().toLowerCase();
}

export function getLineupNameConflict(
  savedLineups: SavedLineup[],
  lineupName: string,
  ignoredLineupId?: string,
) {
  const normalizedLineupName = normalizeLineupName(lineupName);

  if (!normalizedLineupName) {
    return null;
  }

  return (
    savedLineups.find(
      (lineup) =>
        lineup.id !== ignoredLineupId &&
        normalizeLineupName(lineup.name) === normalizedLineupName,
    ) ?? null
  );
}

export function getLineupsAfterSave(
  savedLineups: SavedLineup[],
  lineupToSave: SavedLineup,
  overwriteLineupId?: string,
) {
  const normalizedLineupName = normalizeLineupName(lineupToSave.name);

  return [
    lineupToSave,
    ...savedLineups.filter(
      (lineup) =>
        lineup.id !== overwriteLineupId &&
        normalizeLineupName(lineup.name) !== normalizedLineupName,
    ),
  ];
}

export function getLineupsAfterRename(
  savedLineups: SavedLineup[],
  lineupId: string,
  newName: string,
) {
  const lineupToRename = savedLineups.find((lineup) => lineup.id === lineupId);

  if (!lineupToRename) {
    return savedLineups;
  }

  const nextName = newName.trim() || lineupToRename.name;
  const normalizedNextName = normalizeLineupName(nextName);

  return savedLineups
    .filter(
      (lineup) =>
        lineup.id === lineupId ||
        normalizeLineupName(lineup.name) !== normalizedNextName,
    )
    .map((lineup) =>
      lineup.id === lineupId
        ? {
            ...lineup,
            name: nextName,
          }
        : lineup,
    );
}
