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
