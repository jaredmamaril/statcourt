import {
  normalizeStat,
  statMaxValues,
  type Player,
  type RadarStatRow,
} from "../court-data";

export function getRadarData(
  leftPlayer: Player | undefined,
  rightPlayer: Player | undefined,
): RadarStatRow[] {
  return [
    {
      stat: "PPG",
      playerOne: leftPlayer
        ? normalizeStat(leftPlayer.stats.ppg, statMaxValues.ppg)
        : 0,
      playerTwo: rightPlayer
        ? normalizeStat(rightPlayer.stats.ppg, statMaxValues.ppg)
        : 0,
      playerOneActual: leftPlayer ? leftPlayer.stats.ppg : 0,
      playerTwoActual: rightPlayer ? rightPlayer.stats.ppg : 0,
    },
    {
      stat: "RPG",
      playerOne: leftPlayer
        ? normalizeStat(leftPlayer.stats.rpg, statMaxValues.rpg)
        : 0,
      playerTwo: rightPlayer
        ? normalizeStat(rightPlayer.stats.rpg, statMaxValues.rpg)
        : 0,
      playerOneActual: leftPlayer ? leftPlayer.stats.rpg : 0,
      playerTwoActual: rightPlayer ? rightPlayer.stats.rpg : 0,
    },
    {
      stat: "APG",
      playerOne: leftPlayer
        ? normalizeStat(leftPlayer.stats.apg, statMaxValues.apg)
        : 0,
      playerTwo: rightPlayer
        ? normalizeStat(rightPlayer.stats.apg, statMaxValues.apg)
        : 0,
      playerOneActual: leftPlayer ? leftPlayer.stats.apg : 0,
      playerTwoActual: rightPlayer ? rightPlayer.stats.apg : 0,
    },
    {
      stat: "FG%",
      playerOne: leftPlayer
        ? normalizeStat(leftPlayer.stats.fgPercent, statMaxValues.fgPercent)
        : 0,
      playerTwo: rightPlayer
        ? normalizeStat(rightPlayer.stats.fgPercent, statMaxValues.fgPercent)
        : 0,
      playerOneActual: leftPlayer ? leftPlayer.stats.fgPercent : 0,
      playerTwoActual: rightPlayer ? rightPlayer.stats.fgPercent : 0,
    },
    {
      stat: "3PT%",
      playerOne: leftPlayer
        ? normalizeStat(
            leftPlayer.stats.threePercent,
            statMaxValues.threePercent,
          )
        : 0,
      playerTwo: rightPlayer
        ? normalizeStat(
            rightPlayer.stats.threePercent,
            statMaxValues.threePercent,
          )
        : 0,
      playerOneActual: leftPlayer ? leftPlayer.stats.threePercent : 0,
      playerTwoActual: rightPlayer ? rightPlayer.stats.threePercent : 0,
    },
    {
      stat: "FT%",
      playerOne: leftPlayer
        ? normalizeStat(leftPlayer.stats.ftPercent, statMaxValues.ftPercent)
        : 0,
      playerTwo: rightPlayer
        ? normalizeStat(rightPlayer.stats.ftPercent, statMaxValues.ftPercent)
        : 0,
      playerOneActual: leftPlayer ? leftPlayer.stats.ftPercent : 0,
      playerTwoActual: rightPlayer ? rightPlayer.stats.ftPercent : 0,
    },
  ];
}
