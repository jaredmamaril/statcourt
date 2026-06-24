import type { NewSavedLineupInput, SavedLineup } from "../shared/lineup-types";

export function createSavedLineupInput(
  lineupInput: NewSavedLineupInput,
): NewSavedLineupInput {
  return lineupInput;
}

export function createSavedLineup(
  lineupInput: NewSavedLineupInput,
): SavedLineup {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...lineupInput,
  };
}
