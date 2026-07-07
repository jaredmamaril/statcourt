import {
  normalizeStat,
  statMaxValues,
  type Player,
  type PlayerStats,
  type RadarStatRow,
  type StatMode,
} from "../court-data";

function getStatsByMode(player: Player, statMode: StatMode): PlayerStats {
  const profile =
    statMode === "peak"
      ? (player.statProfiles?.peak ?? player.statProfiles?.career)
      : statMode === "current"
        ? (player.statProfiles?.current ?? player.statProfiles?.career)
        : player.statProfiles?.career;

  return {
    games: profile?.games ?? player.stats.games,
    ppg: profile?.ppg ?? player.stats.ppg,
    rpg: profile?.rpg ?? player.stats.rpg,
    apg: profile?.apg ?? player.stats.apg,
    spg: profile?.spg ?? player.stats.spg,
    bpg: profile?.bpg ?? player.stats.bpg,
    fgPercent: profile?.fgPercent ?? player.stats.fgPercent,
    threePercent: profile?.threePercent ?? player.stats.threePercent,
    ftPercent: profile?.ftPercent ?? player.stats.ftPercent,
  };
}

export function getRadarData(
  leftPlayer: Player | undefined,
  rightPlayer: Player | undefined,
  statMode: StatMode,
): RadarStatRow[] {
  const leftStats = leftPlayer ? getStatsByMode(leftPlayer, statMode) : null;
  const rightStats = rightPlayer ? getStatsByMode(rightPlayer, statMode) : null;

  return [
    {
      stat: "PPG",
      playerOne: leftStats
        ? normalizeStat(leftStats.ppg, statMaxValues.ppg)
        : 0,
      playerTwo: rightStats
        ? normalizeStat(rightStats.ppg, statMaxValues.ppg)
        : 0,
      playerOneActual: leftStats ? leftStats.ppg : 0,
      playerTwoActual: rightStats ? rightStats.ppg : 0,
    },
    {
      stat: "RPG",
      playerOne: leftStats
        ? normalizeStat(leftStats.rpg, statMaxValues.rpg)
        : 0,
      playerTwo: rightStats
        ? normalizeStat(rightStats.rpg, statMaxValues.rpg)
        : 0,
      playerOneActual: leftStats ? leftStats.rpg : 0,
      playerTwoActual: rightStats ? rightStats.rpg : 0,
    },
    {
      stat: "APG",
      playerOne: leftStats
        ? normalizeStat(leftStats.apg, statMaxValues.apg)
        : 0,
      playerTwo: rightStats
        ? normalizeStat(rightStats.apg, statMaxValues.apg)
        : 0,
      playerOneActual: leftStats ? leftStats.apg : 0,
      playerTwoActual: rightStats ? rightStats.apg : 0,
    },
    {
      stat: "FG%",
      playerOne: leftStats
        ? normalizeStat(leftStats.fgPercent, statMaxValues.fgPercent)
        : 0,
      playerTwo: rightStats
        ? normalizeStat(rightStats.fgPercent, statMaxValues.fgPercent)
        : 0,
      playerOneActual: leftStats ? leftStats.fgPercent : 0,
      playerTwoActual: rightStats ? rightStats.fgPercent : 0,
    },
    {
      stat: "3PT%",
      playerOne: leftStats
        ? normalizeStat(
            leftStats.threePercent,
            statMaxValues.threePercent,
          )
        : 0,
      playerTwo: rightStats
        ? normalizeStat(
            rightStats.threePercent,
            statMaxValues.threePercent,
          )
        : 0,
      playerOneActual: leftStats ? leftStats.threePercent : 0,
      playerTwoActual: rightStats ? rightStats.threePercent : 0,
    },
    {
      stat: "FT%",
      playerOne: leftStats
        ? normalizeStat(leftStats.ftPercent, statMaxValues.ftPercent)
        : 0,
      playerTwo: rightStats
        ? normalizeStat(rightStats.ftPercent, statMaxValues.ftPercent)
        : 0,
      playerOneActual: leftStats ? leftStats.ftPercent : 0,
      playerTwoActual: rightStats ? rightStats.ftPercent : 0,
    },
  ];
}
