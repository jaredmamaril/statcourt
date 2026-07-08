import type { CSSProperties } from "react";
import { useState } from "react";
import type { Player, PlayerInsightDisplay, StatMode } from "../../court-data";
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
  statMode: StatMode;
  statModeLabel: string;
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
  statMode,
  statModeLabel,
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
  const [openCardTooltip, setOpenCardTooltip] = useState<string | null>(null);

  function toggleCardTooltip(id: string) {
    setOpenCardTooltip((current) => (current === id ? null : id));
  }

  const careerLegacy = player.ratings.careerLegacy ?? 0;
  const starPower = player.ratings.starPower ?? 0;

  const careerLegacyTier = getCareerLegacyTier(careerLegacy);
  const starPowerTier = getStarPowerTier(starPower);

  return (
    <div className="mx-auto flex w-full max-w-75 flex-col items-start gap-2 sm:max-w-md">
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

              <div className="relative z-20 -mt-1 flex justify-center">
                <div className="relative z-20 mt-1 flex justify-center">
                  <div className="rounded border border-white/10 bg-white/5 px-2.5 py-0.5 font-michroma text-[7px] uppercase tracking-wide text-white/45 sm:px-3 sm:py-1 sm:text-[8px]">
                    {statModeLabel} Profile
                  </div>
                </div>
              </div>

              <div className="relative z-20 mx-auto mt-1.5 grid w-[84%] grid-cols-2 gap-1.5 font-michroma sm:mt-2 sm:w-[90%] sm:gap-2">
                <div className="rounded-md border border-[#EFBF04]/30 bg-[#EFBF04]/10 px-1.5 py-1 text-center sm:px-2">
                  <p className="text-[6px] uppercase text-white/45 sm:text-[7px]">
                    Career Legacy
                  </p>

                  <p className="text-[11px] leading-tight text-[#EFBF04] sm:text-sm">
                    {careerLegacy.toFixed(1)}
                  </p>

                  <p className="text-[6px] uppercase leading-tight text-white/60 sm:text-[7px]">
                    {careerLegacyTier}
                  </p>
                </div>

                <div className="rounded-md border border-[#1bc2ec]/30 bg-[#1bc2ec]/10 px-1.5 py-1 text-center sm:px-2">
                  <p className="text-[6px] uppercase text-white/45 sm:text-[7px]">
                    Star Power
                  </p>

                  <p className="text-[11px] leading-tight text-[#1bc2ec] sm:text-sm">
                    {starPower.toFixed(0)}
                  </p>

                  <p className="text-[6px] uppercase leading-tight text-white/60 sm:text-[7px]">
                    {starPowerTier}
                  </p>
                </div>
              </div>

              <PlayerCardRadar
                player={player}
                statMode={statMode}
                isCardFlipped={isCardFlipped}
              />

              <div className="flex items-start justify-center gap-6 sm:gap-10">
                {playerInsights && (
                  <PlayerCardInsights
                    openTooltip={openCardTooltip}
                    onToggleTooltip={toggleCardTooltip}
                    statModeLabel={statModeLabel}
                    playerInsights={playerInsights}
                    getInsightRarityStyles={getInsightRarityStyles}
                    getInsightRarityLabel={getInsightRarityLabel}
                  />
                )}

                <PlayerCardSimilarPanel
                  openTooltip={openCardTooltip}
                  onToggleTooltip={toggleCardTooltip}
                  statModeLabel={statModeLabel}
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
