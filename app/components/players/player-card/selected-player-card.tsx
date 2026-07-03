import type { CSSProperties } from "react";
import type { Player, PlayerInsightDisplay } from "../../court-data";
import { getCareerLegacyTier, getStarPowerTier } from "../../player-ratings";
import { PlayerCardFront } from "./player-card-front";
import { PlayerCardBack } from "./player-card-back";
import { PlayerCardRadar } from "./player-card-radar";
import { PlayerCardBackHeader } from "./player-card-back-header";
import { PlayerCardInsights } from "./player-card-insights";
import { PlayerCardSimilarPanel } from "./player-card-similar-panel";
import { PlayerCardAddToCompare } from "./player-card-add-to-compare";
import { PlayerCardShell } from "./player-card-shell";

type SelectedPlayerCardProps = {
  player: Player;
  isCardFlipped: boolean;
  isGoingToCourt: boolean;
  compareSlots: {
    left: string | null;
    right: string | null;
  };
  playerInsights: {
    archetype: PlayerInsightDisplay | null;
    traits: PlayerInsightDisplay[];
  } | null;
  similarPlayers: {
    player: Player;
    matchScore: number;
  }[];
  bestLineupFits: string[];
  getPlayerNameTextClass: (name: string) => string;
  getInsightRarityStyles: (
    insight: PlayerInsightDisplay,
    isArchetype?: boolean,
  ) => CSSProperties;
  getInsightRarityLabel: (rarity: PlayerInsightDisplay["rarity"]) => string;
  getLineupFitStyles: (fit: string) => CSSProperties;
  onBack: () => void;
  onToggleFlip: () => void;
  onSelectSimilarPlayer: (playerName: string) => void;
  onAddPlayerToCompare: (slot: "left" | "right") => void;
};

export function SelectedPlayerCard({
  player,
  isCardFlipped,
  isGoingToCourt,
  compareSlots,
  playerInsights,
  similarPlayers,
  bestLineupFits,
  getPlayerNameTextClass,
  getInsightRarityStyles,
  getInsightRarityLabel,
  getLineupFitStyles,
  onBack,
  onToggleFlip,
  onSelectSimilarPlayer,
  onAddPlayerToCompare,
}: SelectedPlayerCardProps) {
  const careerLegacy = player.ratings.careerLegacy ?? 0;
  const starPower = player.ratings.starPower ?? 0;

  const careerLegacyTier = getCareerLegacyTier(careerLegacy);
  const starPowerTier = getStarPowerTier(starPower);
  return (
    <div className="flex flex-col items-start gap-2 w-full max-w-md">
      <button
        type="button"
        onClick={onBack}
        className="flex cursor-pointer items-center gap-1 font-michroma text-xs text-white/50 transition-colors duration-200 hover:text-white"
      >
        Back
      </button>

      <PlayerCardShell
        player={player}
        isCardFlipped={isCardFlipped}
        isGoingToCourt={isGoingToCourt}
        onToggleFlip={onToggleFlip}
      >
        <PlayerCardFront player={player} isCardFlipped={isCardFlipped} />

        <PlayerCardBack player={player} isCardFlipped={isCardFlipped}>
          <div className="relative z-20 flex h-full flex-col">
            <div className="statcourt-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4">
              <PlayerCardBackHeader
                player={player}
                getPlayerNameTextClass={getPlayerNameTextClass}
              />

              <div className="relative z-20 mx-auto mt-2 grid w-[90%] grid-cols-2 gap-2 font-michroma">
                <div className="rounded-md border border-[#EFBF04]/30 bg-[#EFBF04]/10 px-2 py-1 text-center">
                  <p className="text-[7px] uppercase text-white/45">
                    Career Legacy
                  </p>
                  <p className="text-sm text-[#EFBF04]">
                    {careerLegacy.toFixed(1)}
                  </p>
                  <p className="text-[7px] uppercase text-white/60">
                    {careerLegacyTier}
                  </p>
                </div>

                <div className="rounded-md border border-[#1bc2ec]/30 bg-[#1bc2ec]/10 px-2 py-1 text-center">
                  <p className="text-[7px] uppercase text-white/45">
                    Star Power
                  </p>
                  <p className="text-sm text-[#1bc2ec]">
                    {starPower.toFixed(0)}
                  </p>
                  <p className="text-[7px] uppercase text-white/60">
                    {starPowerTier}
                  </p>
                </div>
              </div>

              <PlayerCardRadar player={player} isCardFlipped={isCardFlipped} />

              <div className="flex items-start justify-center gap-10">
                {playerInsights && (
                  <PlayerCardInsights
                    playerInsights={playerInsights}
                    getInsightRarityStyles={getInsightRarityStyles}
                    getInsightRarityLabel={getInsightRarityLabel}
                  />
                )}

                <PlayerCardSimilarPanel
                  similarPlayers={similarPlayers}
                  bestLineupFits={bestLineupFits}
                  getLineupFitStyles={getLineupFitStyles}
                  onSelectSimilarPlayer={onSelectSimilarPlayer}
                />
              </div>

              <div className="mt-6 flex justify-center">
                <PlayerCardAddToCompare
                  player={player}
                  compareSlots={compareSlots}
                  onAddPlayerToCompare={onAddPlayerToCompare}
                />
              </div>
            </div>
          </div>
        </PlayerCardBack>
      </PlayerCardShell>
    </div>
  );
}
