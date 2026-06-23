import type { Position } from "../../court-data";
import type { LineupScoutScores, TeamGrades } from "../../lineup-scouting";
import { ScoutLineupSummary } from "./scout-lineup-summary";
import { ScoutOverallSummary } from "./scout-overall-summary";
import { ScoutArchetypeSection } from "./scout-archetype-section";
import { ScoutTraitsGrid } from "./scout-traits-grid";
import { ScoutBottomSummary } from "./scout-bottom-summary";

type ScoutReportModalProps = {
  lineupPositions: Position[];
  customLineup: Record<Position, string>;
  scoutScores: LineupScoutScores;
  scoutArchetypeColor: string;
  scoutSummary: string;
  animatedScoutOverall: number;
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
  lineupPositions,
  customLineup,
  scoutScores,
  scoutArchetypeColor,
  scoutSummary,
  animatedScoutOverall,
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
  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/70 px-4">
      <div
        className="relative w-full max-w-xl animate-[modalIn_260ms_ease-out] rounded-md border bg-[#07111f]"
        style={{
          borderColor: `${scoutArchetypeColor}99`,
          boxShadow: `0 0 35px ${scoutArchetypeColor}40`,
        }}
      >
        <div className="relative max-h-[78vh] overflow-y-auto p-5 scrollbar-none [&::-webkit-scrollbar]:hidden">
          <div className="pr-58">
            <div className="-mt-2">
              <h2 className="font-michroma text-lg text-white">
                Scouting Report
              </h2>

              <div
                className="scout-section-reveal"
                style={{ animationDelay: "80ms" }}
              >
                <p className="mt-1 max-w-60 font-michroma text-[10px] leading-relaxed text-white/35">
                  {scoutSummary}
                </p>
              </div>
            </div>
          </div>

          <ScoutLineupSummary
            lineupPositions={lineupPositions}
            customLineup={customLineup}
            scoutScores={scoutScores}
            scoutArchetypeColor={scoutArchetypeColor}
          />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-4 font-michroma text-lg text-white/40 transition hover:text-red-400"
          >
            x
          </button>

          <div className="mt-1 grid max-w-xl gap-2">
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

        <button
          type="button"
          onClick={onSaveLineup}
          className="absolute -bottom-10.5 right-0 rounded-md border border-[#1bc2ec]/70 bg-[#07111f] px-5 py-3 font-michroma text-xs uppercase text-[#1bc2ec] shadow-[0_0_18px_rgba(27,194,236,0.25)] transition hover:bg-[#1bc2ec]/10"
          style={{
            color: scoutArchetypeColor,
            borderColor: scoutArchetypeColor,
          }}
        >
          Save Lineup
        </button>
      </div>
    </div>
  );
}
