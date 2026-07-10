import {
  getCourtBalanceColor,
  getLineupScoutReport,
  getLineupTierColor,
  getScoutReason,
} from "../../lineup-scouting";
import { getSavedLineupArchetypeColor } from "../shared/lineup-style-helpers";
import type { SavedLineup } from "../shared/lineup-types";
import type { SelectedCustomPlayerSlot } from "../builder/builder-lineup-helpers";
import type { PlayerStatProfileMode } from "../../player-ratings";

type GetScoutReportDisplayParams = {
  selectedCustomPlayerSlots: SelectedCustomPlayerSlot[];
  scoutedSavedLineup: SavedLineup | null;
  statProfileMode: PlayerStatProfileMode;
};

export function getScoutReportDisplay({
  selectedCustomPlayerSlots,
  scoutedSavedLineup,
  statProfileMode,
}: GetScoutReportDisplayParams) {
  const scoutReport = getLineupScoutReport(
    selectedCustomPlayerSlots,
    statProfileMode,
  );

  const savedScores = scoutedSavedLineup?.scores;

  const scoutScores =
    savedScores && typeof savedScores.overall === "number"
      ? savedScores
      : scoutReport.scores;

  const archetype = scoutedSavedLineup?.archetype ?? scoutReport.archetype;
  const tier = scoutedSavedLineup?.tier ?? scoutReport.tier;
  const courtBalance =
    scoutedSavedLineup?.courtBalance ?? scoutReport.courtBalance;

  return {
    scoutReport,
    lineupArchetype: archetype,
    lineupTier: tier,
    scoutArchetypeColor: getSavedLineupArchetypeColor(archetype),
    scoutTierColor: getLineupTierColor(tier),
    scoutSummary: scoutedSavedLineup?.summary ?? scoutReport.summary,
    teamIdentity: scoutedSavedLineup?.teamIdentity ?? scoutReport.teamIdentity,
    lineupStrengths: scoutedSavedLineup?.strengths ?? scoutReport.strengths,
    lineupWeaknesses: scoutedSavedLineup?.weaknesses ?? scoutReport.weaknesses,
    lineupTradeoff: scoutedSavedLineup?.tradeoff ?? scoutReport.tradeoff,
    xFactorName:
      scoutedSavedLineup?.xFactorName ??
      scoutReport.xFactor?.player.name ??
      "--",
    xFactorDescription:
      scoutedSavedLineup?.xFactorDescription ??
      scoutReport.xFactor?.description ??
      "--",
    similarLineup: scoutedSavedLineup?.similarTo ?? scoutReport.similarTo,
    similarToDescription:
      scoutedSavedLineup?.similarToDescription ??
      scoutReport.similarToDescription,
    similarLineupMatches:
      scoutedSavedLineup?.similarLineupMatches ??
      scoutReport.similarLineupMatches,
    courtBalance,
    courtBalanceDescription:
      scoutedSavedLineup?.courtBalanceDescription ??
      scoutReport.courtBalanceDescription,
    courtBalanceColor: getCourtBalanceColor(courtBalance),
    teamGrades: scoutedSavedLineup?.grades ?? scoutReport.grades,
    scoutScores,
    scoutReason: getScoutReason(archetype),
    lineupBadges: scoutedSavedLineup?.badges ?? scoutReport.badges,
  };
}
