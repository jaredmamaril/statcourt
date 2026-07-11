import { getTeamColor, type Player } from "../../court-data";
import { Info } from "lucide-react";

export const lineupFitDescriptions: Record<string, string> = {
  "Transition Attack":
    "Best for fast-paced lineups built around downhill pressure, open-floor scoring, and quick decision-making.",

  "Showtime Offense":
    "Best for lineups built around elite passing, pace, and highlight-level shot creation.",

  "Star-Powered Contender":
    "Best for lineups driven by elite individual talent and high-end shot creation.",

  "Floor Spacing Machine":
    "Best for lineups that maximize shooting gravity, floor spacing, and perimeter pressure.",

  "Defensive Powerhouse":
    "Best for lineups built around stops, physicality, and defensive control.",

  "Paint Control Unit":
    "Best for lineups that dominate inside through rebounding, rim pressure, and interior scoring.",

  "Offensive Superteam":
    "Best for lineups built around multiple elite scorers who can pressure defenses in different ways.",

  "Iso Superteam":
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

  "Point-Center Offense":
    "Best for lineups that run offense through a skilled frontcourt passer from the elbows or high post.",

  "Interior Support Unit":
    "Best for lineups that need efficient finishing, rebounding, and reliable frontcourt production.",

  "Backline Defense":
    "Best for lineups that need size, rim protection, rebounding, and defensive support behind the play.",

  "Rim Pressure Unit":
    "Best for lineups that attack the basket, collapse defenses, and create pressure through downhill scoring.",

  "Off-Ball Shooting Unit":
    "Best for lineups that use movement, spacing, and catch-and-shoot threats around primary creators.",

  "Positionless Basketball":
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
  openTooltip: string | null;
  onToggleTooltip: (id: string) => void;
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
  openTooltip,
  onToggleTooltip,
  statModeLabel,
  similarPlayers,
  bestLineupFits,
  getLineupFitStyles,
  onSelectSimilarPlayer,
}: PlayerCardSimilarPanelProps) {
  function toggleSimilarInfoOnTouch(event: React.PointerEvent) {
    if (event.pointerType === "mouse") return;

    event.stopPropagation();
    onToggleTooltip("similar-info");
  }

  function toggleLineupLegendOnTouch(event: React.PointerEvent) {
    if (event.pointerType === "mouse") return;

    event.stopPropagation();
    onToggleTooltip("lineup-legend");
  }

  function toggleLineupFitOnTouch(event: React.PointerEvent, fit: string) {
    if (event.pointerType === "mouse") return;

    event.stopPropagation();
    onToggleTooltip(`lineup-fit-${fit}`);
  }

  return (
    <div
      className={`relative flex w-34 flex-col items-center gap-0.5 sm:w-40 ${
        openTooltip === "similar-info" ||
        openTooltip === "lineup-legend" ||
        openTooltip?.startsWith("lineup-fit-")
          ? "z-9999"
          : "z-30"
      }`}
    >
      <div className="group/similarInfo relative flex items-center justify-center gap-1">
        <span className="font-michroma text-[9px] uppercase tracking-wide text-white/50 sm:text-[12px]">
          Similar To
        </span>

        <Info
          className="h-2.5 w-2.5 cursor-help text-[#1bc2ec]/50 transition group-hover/similarInfo:text-[#1bc2ec] sm:h-3 sm:w-3"
          onPointerDown={toggleSimilarInfoOnTouch}
          onClick={(event) => {
            event.stopPropagation();
          }}
        />

        <div
          className={`pointer-events-none absolute bottom-full right-0 z-999 mb-1 w-40 rounded-md border border-white/15 bg-black/95 p-2 text-left font-michroma text-[6px] leading-relaxed text-white/80 shadow-[0_0_18px_rgba(0,0,0,0.55)] transition-opacity duration-200 sm:left-1/2 sm:right-auto sm:w-52 sm:-translate-x-1/2 sm:text-[7px] ${
            openTooltip === "similar-info"
              ? "opacity-100"
              : "opacity-0 group-hover/similarInfo:opacity-100"
          }`}
        >
          Similar players are matched by the selected stat profile, playstyle,
          archetype, role, and statistical shape.
        </div>
      </div>

      <span className="-mt-1 font-michroma text-[5px] text-white/45 sm:text-[6px]">
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
              className="flex w-32 cursor-pointer items-center justify-between gap-1 rounded border px-1.5 py-0.5 font-michroma text-[7px] text-white/70 transition-all duration-150 hover:brightness-150 sm:w-44 sm:gap-2 sm:text-[9px]"
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
          <span className="font-michroma text-[7px] uppercase tracking-wide text-white/50 sm:text-[9px]">
            Best Lineup Fits
          </span>

          <Info
            className="h-2.5 w-2.5 cursor-help text-[#1bc2ec]/50 transition group-hover/fitLegend:text-[#1bc2ec] sm:h-3 sm:w-3"
            onPointerDown={toggleLineupLegendOnTouch}
            onClick={(event) => {
              event.stopPropagation();
            }}
          />

          <div
            className={`pointer-events-none absolute bottom-full right-0 z-999 mb-1 w-44 rounded-md border border-white/15 bg-black/95 p-2 text-left font-michroma text-[6px] leading-relaxed text-white/80 shadow-[0_0_18px_rgba(0,0,0,0.55)] transition-opacity duration-200 sm:left-1/2 sm:right-auto sm:w-56 sm:-translate-x-1/2 sm:text-[7px] ${
              openTooltip === "lineup-legend"
                ? "opacity-100"
                : "opacity-0 group-hover/fitLegend:opacity-100"
            }`}
          >
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
          <div
            key={fit}
            className={`group/fit relative cursor-help ${
              openTooltip === `lineup-fit-${fit}` ? "z-500" : "z-30"
            }`}
            onPointerDown={(event) => {
              toggleLineupFitOnTouch(event, fit);
            }}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <span
              className="block max-w-36 cursor-help truncate rounded border px-1.5 py-0.5 font-michroma text-[7px] brightness-125 sm:max-w-44 sm:px-2 sm:text-[9px]"
              style={getLineupFitStyles(fit)}
            >
              ✓ {fit}
            </span>

            <div
              className={`pointer-events-none absolute bottom-full right-0 z-999 mb-1 w-44 rounded-md border border-white/15 bg-black/95 p-2 text-left font-michroma text-[6px] leading-relaxed text-white/80 shadow-[0_0_18px_rgba(0,0,0,0.55)] transition-opacity duration-200 sm:left-1/2 sm:right-auto sm:w-52 sm:-translate-x-1/2 sm:text-[7px] ${
                openTooltip === `lineup-fit-${fit}`
                  ? "opacity-100"
                  : "opacity-0 group-hover/fit:opacity-100"
              }`}
            >
              {lineupFitDescriptions[fit] ??
                "Recommended lineup fit based on this player's statistical profile."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
