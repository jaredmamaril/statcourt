import { getTeamColor, type Player, type StatMode } from "../court-data";

function formatCategoryList(categories: string[]) {
  if (categories.length === 0) return "";
  if (categories.length === 1) return categories[0];
  if (categories.length === 2) return `${categories[0]} and ${categories[1]}`;

  return `${categories.slice(0, -1).join(", ")}, and ${
    categories[categories.length - 1]
  }`;
}

function getStatModeLabel(statMode: StatMode) {
  if (statMode === "peak") return "3-Year Peak Profile";
  if (statMode === "current") return "Latest Season Profile";
  return "Career Profile";
}

type CourtMatchupSummaryProps = {
  leftPlayer?: Player;
  rightPlayer?: Player;
  statMode: StatMode;
};

type MatchupStats = {
  ppg?: number | null;
  rpg?: number | null;
  apg?: number | null;
  fgPercent?: number | null;
  threePercent?: number | null;
  ftPercent?: number | null;
};

function getStatsByMode(player: Player, statMode: StatMode): MatchupStats {
  if (statMode === "peak") {
    return (
      player.statProfiles?.peak ?? player.statProfiles?.career ?? player.stats
    );
  }

  if (statMode === "current") {
    return (
      player.statProfiles?.current ??
      player.statProfiles?.career ??
      player.stats
    );
  }

  return player.statProfiles?.career ?? player.stats;
}

function getEfficiency(stats: MatchupStats) {
  return (
    (stats.fgPercent ?? 0) * 0.45 +
    (stats.threePercent ?? 0) * 0.35 +
    (stats.ftPercent ?? 0) * 0.2
  );
}

function getWinner(
  leftPlayer: Player,
  rightPlayer: Player,
  leftValue: number,
  rightValue: number,
  tieThreshold = 0.4,
) {
  const difference = Math.abs(leftValue - rightValue);

  if (difference < tieThreshold) return null;

  return leftValue > rightValue ? leftPlayer : rightPlayer;
}

export function CourtMatchupSummary({
  leftPlayer,
  rightPlayer,
  statMode,
}: CourtMatchupSummaryProps) {
  if (!leftPlayer || !rightPlayer) {
    return null;
  }

  const leftStats = getStatsByMode(leftPlayer, statMode);
  const rightStats = getStatsByMode(rightPlayer, statMode);

  const scoringWinner = getWinner(
    leftPlayer,
    rightPlayer,
    leftStats.ppg ?? 0,
    rightStats.ppg ?? 0,
    0.5,
  );

  const playmakingWinner = getWinner(
    leftPlayer,
    rightPlayer,
    leftStats.apg ?? 0,
    rightStats.apg ?? 0,
    0.4,
  );

  const reboundingWinner = getWinner(
    leftPlayer,
    rightPlayer,
    leftStats.rpg ?? 0,
    rightStats.rpg ?? 0,
    0.5,
  );

  const defenseWinner = getWinner(
    leftPlayer,
    rightPlayer,
    leftPlayer.ratings.defense,
    rightPlayer.ratings.defense,
    2,
  );

  const efficiencyWinner = getWinner(
    leftPlayer,
    rightPlayer,
    getEfficiency(leftStats),
    getEfficiency(rightStats),
    1.2,
  );

  const categoryResults = [
    { label: "scoring", winner: scoringWinner },
    { label: "playmaking", winner: playmakingWinner },
    { label: "rebounding", winner: reboundingWinner },
    { label: "defense", winner: defenseWinner },
    { label: "efficiency", winner: efficiencyWinner },
  ];

  const leftCategories = categoryResults
    .filter((result) => result.winner?.name === leftPlayer.name)
    .map((result) => result.label);

  const rightCategories = categoryResults
    .filter((result) => result.winner?.name === rightPlayer.name)
    .map((result) => result.label);

  const leftWins = leftCategories.length;
  const rightWins = rightCategories.length;

  const isBalancedMatchup = leftWins === rightWins;

  const leadPlayer = isBalancedMatchup
    ? null
    : leftWins > rightWins
      ? leftPlayer
      : rightPlayer;

  const supportPlayer = leadPlayer
    ? leadPlayer.name === leftPlayer.name
      ? rightPlayer
      : leftPlayer
    : null;

  const leadColor = leadPlayer ? getTeamColor(leadPlayer.team) : "#1bc2ec";
  const supportColor = supportPlayer
    ? getTeamColor(supportPlayer.team)
    : "#94A3B8";

  const summary =
    leftCategories.length > 0 && rightCategories.length > 0
      ? `${leftPlayer.name} owns the ${formatCategoryList(
          leftCategories,
        )} edge${leftCategories.length > 1 ? "s" : ""}, while ${
          rightPlayer.name
        } counters with ${formatCategoryList(rightCategories)}.`
      : leftCategories.length > 0
        ? `${leftPlayer.name} controls the ${formatCategoryList(
            leftCategories,
          )} edge${leftCategories.length > 1 ? "s" : ""}, giving them the broader matchup profile.`
        : rightCategories.length > 0
          ? `${rightPlayer.name} controls the ${formatCategoryList(
              rightCategories,
            )} edge${rightCategories.length > 1 ? "s" : ""}, giving them the broader matchup profile.`
          : `${leftPlayer.name} and ${rightPlayer.name} split the matchup evenly, creating a balanced scouting comparison.`;

  return (
    <div
      key={`${leftPlayer.id}-${rightPlayer.id}-${statMode}`}
      className="mx-auto mt-4 w-full max-w-5xl rounded-lg border border-[#1bc2ec]/25 bg-[#06131d]/88 p-4 shadow-[0_0_20px_rgba(27,194,236,0.12)] animate-[courtSummaryReveal_320ms_ease-out_both] sm:mt-5 sm:p-5"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="font-michroma text-[9px] uppercase tracking-wide text-[#1bc2ec] sm:text-[10px]">
          Matchup Summary
        </p>

        <p className="font-michroma text-[8px] uppercase text-white/35">
          {getStatModeLabel(statMode)}
        </p>
      </div>

      <p className="font-michroma text-[9px] leading-relaxed text-white/55 sm:text-[10px]">
        {summary}
      </p>

      <div className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-3">
        {isBalancedMatchup ? (
          <div className="flex h-full flex-col justify-center rounded-md border border-[#1bc2ec]/35 bg-black/20 p-3 text-center shadow-[0_0_16px_rgba(27,194,236,0.14)] sm:col-span-2">
            <p className="font-michroma text-[8px] uppercase text-white/70">
              Balanced Matchup
            </p>

            <p className="mt-2 font-michroma text-sm text-[#1bc2ec]">
              Split Profile
            </p>
          </div>
        ) : (
          leadPlayer &&
          supportPlayer && (
            <>
              <div
                className="rounded-md border bg-black/20 p-2.5 sm:p-3"
                style={{
                  borderColor: `${leadColor}55`,
                  boxShadow: `0 0 16px ${leadColor}22`,
                }}
              >
                <p className="font-michroma text-[8px] uppercase text-white/70">
                  {isBalancedMatchup ? "Balanced Profile" : "Overall Edge"}
                </p>

                <p
                  className="mt-1.5 truncate font-michroma text-[12px] sm:mt-2 sm:text-sm"
                  style={{
                    color: leadColor,
                    textShadow: `0 0 12px ${leadColor}66`,
                  }}
                >
                  {leadPlayer.name}
                </p>
              </div>

              <div
                className="rounded-md border bg-black/20 p-2.5 sm:p-3"
                style={{
                  borderColor: `${supportColor}55`,
                  boxShadow: `0 0 16px ${supportColor}22`,
                }}
              >
                <p className="font-michroma text-[8px] uppercase text-white/70">
                  {isBalancedMatchup ? "Split Matchup" : "Counter Strength"}
                </p>

                <p
                  className="mt-1.5 truncate font-michroma text-[12px] sm:mt-2 sm:text-sm"
                  style={{
                    color: supportColor,
                    textShadow: `0 0 12px ${supportColor}66`,
                  }}
                >
                  {supportPlayer.name}
                </p>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
