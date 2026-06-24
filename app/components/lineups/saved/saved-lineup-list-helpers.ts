import type { SavedLineup } from "../shared/lineup-types";

export function getLineupsAfterDelete(
  savedLineups: SavedLineup[],
  lineupId: string,
) {
  return savedLineups.filter((lineup) => lineup.id !== lineupId);
}

export function getLineupsAfterRename(
  savedLineups: SavedLineup[],
  lineupId: string,
  newName: string,
) {
  return savedLineups.map((lineup) =>
    lineup.id === lineupId
      ? {
          ...lineup,
          name: newName.trim() || lineup.name,
        }
      : lineup,
  );
}
