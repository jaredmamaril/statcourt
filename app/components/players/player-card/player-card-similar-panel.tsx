import { getTeamColor, type Player } from "../../court-data";
import { Info } from "lucide-react";

export const lineupFitDescriptions: Record<string, string> = {
  "Transition Attack":
    "Best for fast-paced lineups built around downhill pressure, open-floor scoring, and quick decision-making.",

  "Showtime Offense":
    "Best for lineups built around elite passing, pace, and highlight-level shot creation.",

  "Star-Powered Contender":
    "Best for lineups driven by elite individual talent and high-end shot creation.",

  "Spacing Superteam":
    "Best for lineups that maximize shooting gravity, floor spacing, and perimeter pressure.",

  "Defensive Powerhouse":
    "Best for lineups built around stops, physicality, and defensive control.",

  "Paint Control Unit":
    "Best for lineups that dominate inside through rebounding, rim pressure, and interior scoring.",

  "Isolation Scoring Core":
    "Best for lineups that need a go-to scorer who can create offense without relying heavily on teammates.",

  "Two-Way Dynasty":
    "Best for lineups with elite balance between offensive firepower and defensive impact.",

  "Lead Guard Engine":
    "Best for lineups that rely on a primary guard to control pace, create shots, and organize the offense.",

  "Perimeter Guard Unit":
    "Best for guard-heavy lineups that use scoring, shooting, and ball pressure from the backcourt.",

  "Point-of-Attack Defense":
    "Best for lineups that need a guard to pressure ball handlers and disrupt the offense early.",

  "Versatile Wing Core":
    "Best for lineups built around wings who can score, rebound, defend, and fit multiple roles.",

  "Floor-Spacing Wing":
    "Best for lineups that need a forward who can stretch the floor and keep driving lanes open.",

  "Switchable Defense":
    "Best for lineups that rely on defensive versatility, matchup flexibility, and wing coverage.",

  "High-Post Hub":
    "Best for lineups that run offense through a skilled frontcourt passer from the elbows or high post.",

  "Interior Support Unit":
    "Best for lineups that need efficient finishing, rebounding, and reliable frontcourt production.",

  "Backline Defense":
    "Best for lineups that need size, rim protection, rebounding, and defensive support behind the play.",

  "Rim Pressure Attack":
    "Best for lineups that attack the basket, collapse defenses, and create pressure through downhill scoring.",

  "Off-Ball Shooting Unit":
    "Best for lineups that use movement, spacing, and catch-and-shoot threats around primary creators.",

  "Balanced Contender":
    "Best for lineups that need all-around production without relying on one extreme strength.",

  "Secondary Spacing":
    "Best for lineups that need extra shooting around higher-usage stars.",

  "Secondary Creator Unit":
    "Best for lineups that need another player who can score, pass, and keep the offense moving.",

  "Rebounding Support":
    "Best for lineups that need extra possession control through rebounding and physical activity.",

  "Defensive Role Balance":
    "Best for lineups that need a reliable defender who can still contribute enough offense.",

  "Guard Depth Unit":
    "Best for lineups that need guard depth, ball handling, and smaller-role backcourt production.",

  "Wing Depth Unit":
    "Best for lineups that need wing depth, size, activity, and flexible supporting production.",

  "Frontcourt Depth Unit":
    "Best for lineups that need backup size, rebounding, finishing, and interior presence.",

  "Spacing Support":
    "Best for lineups that need low-usage shooting to improve spacing around stars.",

  "Defensive Support":
    "Best for lineups that need additional defensive activity without requiring a high-usage role.",

  "Bench Scoring Unit":
    "Best for lineups that need extra scoring punch from a secondary or bench-style role.",

  "Energy Lineup":
    "Best for lineups that need activity, rebounding, hustle, and physical support minutes.",
};

type PlayerCardSimilarPanelProps = {
  statModeLabel: string;
  similarPlayers: {
    player: Player;
    matchScore: number;
  }[];
  bestLineupFits: string[];
  getLineupFitStyles: (fit: string) => React.CSSProperties;
  onSelectSimilarPlayer: (playerName: string) => void;
};

export function PlayerCardSimilarPanel({
  statModeLabel,
  similarPlayers,
  bestLineupFits,
  getLineupFitStyles,
  onSelectSimilarPlayer,
}: PlayerCardSimilarPanelProps) {
  return (
    <div className="relative z-30 flex w-40 flex-col items-center gap-0.5">
      <span className="font-michroma text-[12px] uppercase tracking-wide text-white/50">
        Similar To
      </span>
      <span className="-mt-1 font-michroma text-[6px] text-white/45">
        {statModeLabel} Playstyle Match
      </span>

      <div className="mt-1 flex flex-col items-center gap-0.5 brightness-125">
        {similarPlayers.map(({ player, matchScore }) => {
          const teamColor = getTeamColor(player.team);

          return (
            <button
              key={player.id}
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSimilarPlayer(player.name);
              }}
              className="mr-2 flex w-44 cursor-pointer items-center justify-between gap-2 rounded border px-1.5 py-0.5 font-michroma text-[9px] text-white/70 transition-all duration-150 hover:brightness-150"
              style={{
                borderColor: teamColor,
                backgroundColor: `${teamColor}50`,
              }}
            >
              <span className="min-w-0 flex-1 truncate text-left text-white">
                {player.name}
              </span>
              <span className="shrink-0 text-white/60">{matchScore}%</span>
            </button>
          );
        })}
      </div>

      <div className="mt-1 flex flex-col items-center gap-0.5">
        <div className="group/fitLegend relative flex items-center justify-center gap-1">
          <span className="font-michroma text-[9px] uppercase tracking-wide text-white/50">
            Best Lineup Fits
          </span>

          <Info className="h-3 w-3 cursor-help text-[#1bc2ec]/50 transition group-hover/fitLegend:text-[#1bc2ec]" />

          <div className="pointer-events-none absolute bottom-full left-1/2 z-999 mb-1 w-56 -translate-x-1/2 rounded-md border border-white/15 bg-black/95 p-2 text-left font-michroma text-[7px] leading-relaxed text-white/55 opacity-0 shadow-[0_0_18px_rgba(0,0,0,0.55)] transition-opacity duration-200 group-hover/fitLegend:opacity-100">
            <p>
              <span className="text-[#1bc2ec]">Cyan</span> - pace, passing, and
              transition offense.
            </p>
            <p>
              <span className="text-[#A855F7]">Purple</span> - shooting and
              floor spacing.
            </p>
            <p>
              <span className="text-[#22C55E]">Green</span> - defensive
              identity.
            </p>
            <p>
              <span className="text-[#EFBF04]">Gold</span> - elite two-way
              dynasty fit.
            </p>
            <p>
              <span className="text-[#38BDF8]">Blue</span> - star-powered roster
              fit.
            </p>
            <p>
              <span className="text-[#EF4444]">Red</span> - paint control and
              interior dominance.
            </p>
            <p>
              <span className="text-[#F97316]">Orange</span> - offensive
              firepower.
            </p>
          </div>
        </div>

        {bestLineupFits.map((fit) => (
          <div key={fit} className="group/fit relative cursor-help">
            <span
              className="block cursor-help rounded border px-2 py-0.5 font-michroma text-[9px] brightness-125 truncate"
              style={getLineupFitStyles(fit)}
            >
              ✓ {fit}
            </span>

            <div className="pointer-events-none cursor- absolute left-1/2 bottom-full z-999 mt-1 w-52 -translate-x-1/2 rounded-md border border-white/15 bg-black/95 p-2 text-left font-michroma text-[7px] leading-relaxed text-white/55 opacity-0 shadow-[0_0_18px_rgba(0,0,0,0.55)] transition-opacity duration-200 group-hover/fit:opacity-100">
              {lineupFitDescriptions[fit] ??
                "Recommended lineup fit based on this player's statistical profile."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
