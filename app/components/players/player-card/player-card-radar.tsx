import type { CSSProperties } from "react";
import type { Player } from "../../court-data";
import { getTeamColor, normalizeStat, statMaxValues } from "../../court-data";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

type StatLabelProps = {
  label: string;
  value: number;
  color: string;
  align?: "left" | "right";
};

type PlayerCardRadarProps = {
  player: Player;
  isCardFlipped: boolean;
};

function StatLabel({ label, value, color, align = "left" }: StatLabelProps) {
  return (
    <div
      className={`flex flex-col ${
        align === "right" ? "items-end" : "items-start"
      }`}
    >
      <span className="font-michroma text-[10px] text-white">{label}</span>
      <span className="font-michroma text-xs font-bold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

export function PlayerCardRadar({
  player,
  isCardFlipped,
}: PlayerCardRadarProps) {
  if (!isCardFlipped) return null;

  const radarData = [
    {
      stat: "PPG",
      value: normalizeStat(player.stats.ppg, statMaxValues.ppg),
    },
    {
      stat: "RPG",
      value: normalizeStat(player.stats.rpg, statMaxValues.rpg),
    },
    {
      stat: "APG",
      value: normalizeStat(player.stats.apg, statMaxValues.apg),
    },
    {
      stat: "FG%",
      value: normalizeStat(player.stats.fgPercent, statMaxValues.fgPercent),
    },
    {
      stat: "3PT%",
      value: normalizeStat(
        player.stats.threePercent,
        statMaxValues.threePercent,
      ),
    },
    {
      stat: "FT%",
      value: normalizeStat(player.stats.ftPercent, statMaxValues.ftPercent),
    },
  ];

  const teamColor = getTeamColor(player.team);

  return (
    <div className="relative z-10 mt-2 h-48 w-full">
      <div className="absolute left-0 top-0 z-10 ml-6 flex h-full flex-col justify-around py-2">
        <StatLabel
          label="FG%"
          value={player.stats.fgPercent}
          color={teamColor}
        />
        <StatLabel
          label="3PT%"
          value={player.stats.threePercent}
          color={teamColor}
        />
        <StatLabel
          label="FT%"
          value={player.stats.ftPercent}
          color={teamColor}
        />
      </div>

      <div className="absolute right-0 top-0 z-10 mr-6 flex h-full flex-col justify-around py-2">
        <StatLabel
          label="PPG"
          value={player.stats.ppg}
          color={teamColor}
          align="right"
        />
        <StatLabel
          label="RPG"
          value={player.stats.rpg}
          color={teamColor}
          align="right"
        />
        <StatLabel
          label="APG"
          value={player.stats.apg}
          color={teamColor}
          align="right"
        />
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData}>
          <PolarGrid stroke="rgba(255,255,255,0.2)" />
          <PolarAngleAxis
            dataKey="stat"
            tick={{
              fill: "white",
              fontSize: 10,
              fontFamily: "Michroma",
            }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke={teamColor}
            strokeWidth={2}
            fill={teamColor}
            fillOpacity={0.2}
            isAnimationActive={true}
            animationBegin={500}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
