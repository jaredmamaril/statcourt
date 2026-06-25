import type { CSSProperties } from "react";
import type { Player, PlayerInsightDisplay } from "../../court-data";
import { PlayerCardFront } from "./player-card-front";
import { PlayerCardBack } from "./player-card-back";
import { PlayerCardRadar } from "./player-card-radar";
import { PlayerCardBackHeader } from "./player-card-back-header";
import { PlayerCardInsights } from "./player-card-insights";
import { PlayerCardSimilarPanel } from "./player-card-similar-panel";
import { PlayerCardAddToCompare } from "./player-card-add-to-compare";
import { PlayerCardShell } from "./player-card-shell";
import type { ApiSportsStatsResponse } from "../../player-api-mappers";

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
  previewApiStats: ApiSportsStatsResponse | null;
  isPreviewApiStatsLoading: boolean;
  onPreviewApiStats: () => void;
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
  previewApiStats,
  isPreviewApiStatsLoading,
  onPreviewApiStats,
}: SelectedPlayerCardProps) {
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
          <PlayerCardBackHeader
            player={player}
            getPlayerNameTextClass={getPlayerNameTextClass}
          />

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

          {process.env.NODE_ENV === "development" && player.apiSportsId && (
            <div className="absolute bottom-[72px] left-1/2 z-190 w-[78%] -translate-x-1/2 rounded-md border border-[#1bc2ec]/30 bg-black/50 p-2 text-center font-michroma backdrop-blur-sm">
              <button
                type="button"
                onClick={onPreviewApiStats}
                className="text-[9px] uppercase text-[#1bc2ec] transition hover:text-white"
              >
                {isPreviewApiStatsLoading
                  ? "Loading API Stats..."
                  : "Preview API Stats"}
              </button>

              {previewApiStats && (
                <p className="mt-1 text-[8px] text-white/55">
                  2023 API: {previewApiStats.stats.ppg} PPG •{" "}
                  {previewApiStats.stats.rpg} RPG • {previewApiStats.stats.apg}{" "}
                  APG
                </p>
              )}
            </div>
          )}

          <PlayerCardAddToCompare
            player={player}
            compareSlots={compareSlots}
            onAddPlayerToCompare={onAddPlayerToCompare}
          />
        </PlayerCardBack>
      </PlayerCardShell>
    </div>
  );
}
