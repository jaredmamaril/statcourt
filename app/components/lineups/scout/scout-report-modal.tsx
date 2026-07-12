import type { LineupSlot, Player } from "../../court-data";
import type { LineupScoutScores, TeamGrades } from "../../lineup-scouting";
import { ScoutLineupSummary } from "./scout-lineup-summary";
import { ScoutOverallSummary } from "./scout-overall-summary";
import { ScoutArchetypeSection } from "./scout-archetype-section";
import { ScoutTraitsGrid } from "./scout-traits-grid";
import { ScoutBottomSummary } from "./scout-bottom-summary";
import { ScoutReportHeader } from "./scout-report-header";
import { ScoutReportSaveButton } from "./scout-report-save-button";
import { useAnimatedScoutOverall } from "./use-animated-scout-overall";

type ScoutReportModalProps = {
  players: Player[];
  lineupPositions: LineupSlot[];
  customLineup: Record<LineupSlot, string>;
  scoutScores: LineupScoutScores;
  scoutArchetypeColor: string;
  scoutSummary: string;
  statProfileLabel: string;
  displayedScoutOverall: number;
  lineupTier: string;
  scoutTierColor: string;
  lineupBadges: string[];
  lineupArchetype: string;
  scoutReason: string;
  teamIdentity: string;
  lineupStrengths: string[];
  lineupWeaknesses: string[];
  lineupTradeoff: string;
  teamGrades: TeamGrades;
  xFactorName: string;
  xFactorDescription: string;
  similarLineup: string;
  similarToDescription: string;
  courtBalance: string;
  courtBalanceDescription: string;
  courtBalanceColor: string;
  onClose: () => void;
  onSaveLineup: () => void;
};

export function ScoutReportModal({
  players,
  lineupPositions,
  customLineup,
  scoutScores,
  scoutArchetypeColor,
  scoutSummary,
  statProfileLabel,
  displayedScoutOverall,
  lineupTier,
  scoutTierColor,
  lineupBadges,
  lineupArchetype,
  scoutReason,
  teamIdentity,
  lineupStrengths,
  lineupWeaknesses,
  lineupTradeoff,
  teamGrades,
  xFactorName,
  xFactorDescription,
  similarLineup,
  similarToDescription,
  courtBalance,
  courtBalanceDescription,
  courtBalanceColor,
  onClose,
  onSaveLineup,
}: ScoutReportModalProps) {
  const animatedScoutOverall = useAnimatedScoutOverall(
    true,
    displayedScoutOverall,
  );

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/70 px-2 lg:px-4">
      <div
        className="relative w-full max-w-85 animate-[modalIn_260ms_ease-out] rounded-md border bg-[#07111f] lg:max-w-xl"
        style={{
          borderColor: `${scoutArchetypeColor}99`,
        }}
      >
        <div className="relative max-h-[78vh] overflow-y-auto p-3 scrollbar-none lg:max-h-[68vh] lg:p-5 [&::-webkit-scrollbar]:hidden">
          <ScoutReportHeader
            scoutSummary={scoutSummary}
            statProfileLabel={statProfileLabel}
            onClose={onClose}
          />

          <ScoutLineupSummary
            players={players}
            lineupPositions={lineupPositions}
            customLineup={customLineup}
            scoutScores={scoutScores}
            scoutArchetypeColor={scoutArchetypeColor}
          />

          <div className="mt-1 grid max-w-xl gap-1.5 lg:gap-2">
            <ScoutOverallSummary
              animatedScoutOverall={animatedScoutOverall}
              lineupTier={lineupTier}
              scoutTierColor={scoutTierColor}
              lineupBadges={lineupBadges}
              scoutArchetypeColor={scoutArchetypeColor}
            />

            <ScoutArchetypeSection
              lineupArchetype={lineupArchetype}
              scoutReason={scoutReason}
              teamIdentity={teamIdentity}
              scoutArchetypeColor={scoutArchetypeColor}
            />

            <ScoutTraitsGrid
              lineupStrengths={lineupStrengths}
              lineupWeaknesses={lineupWeaknesses}
              lineupTradeoff={lineupTradeoff}
              teamGrades={teamGrades}
            />

            <ScoutBottomSummary
              xFactorName={xFactorName}
              xFactorDescription={xFactorDescription}
              similarLineup={similarLineup}
              similarToDescription={similarToDescription}
              courtBalance={courtBalance}
              courtBalanceDescription={courtBalanceDescription}
              courtBalanceColor={courtBalanceColor}
            />
          </div>
        </div>

        <ScoutReportSaveButton
          scoutArchetypeColor={scoutArchetypeColor}
          onSaveLineup={onSaveLineup}
        />
      </div>
    </div>
  );
}
