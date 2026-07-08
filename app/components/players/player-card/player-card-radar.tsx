import type { Player, StatMode } from "../../court-data";
import {
  getReadableTeamColor,
  normalizeStat,
  statMaxValues,
} from "../../court-data";
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
  statMode: StatMode;
  isCardFlipped: boolean;
};

function StatLabel({ label, value, color, align = "left" }: StatLabelProps) {
  return (
    <div
      className={`flex flex-col ${
        align === "right" ? "items-end" : "items-start"
      }`}
    >
      <span className="font-michroma text-[6px] text-white sm:text-[10px]">
        {label}
      </span>

      <span
        className="font-michroma text-[8px] font-bold sm:text-xs"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}

function getRadarStats(player: Player, statMode: StatMode) {
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

export function PlayerCardRadar({
  player,
  statMode,
  isCardFlipped,
}: PlayerCardRadarProps) {
  const stats = getRadarStats(player, statMode);

  if (!isCardFlipped) return null;

  const radarData = [
    {
      stat: "PPG",
      value: normalizeStat(stats.ppg ?? 0, statMaxValues.ppg),
    },
    {
      stat: "RPG",
      value: normalizeStat(stats.rpg ?? 0, statMaxValues.rpg),
    },
    {
      stat: "APG",
      value: normalizeStat(stats.apg ?? 0, statMaxValues.apg),
    },
    {
      stat: "FG%",
      value: normalizeStat(stats.fgPercent ?? 0, statMaxValues.fgPercent),
    },
    {
      stat: "3PT%",
      value: normalizeStat(stats.threePercent ?? 0, statMaxValues.threePercent),
    },
    {
      stat: "FT%",
      value: normalizeStat(stats.ftPercent ?? 0, statMaxValues.ftPercent),
    },
  ];

  const teamColor = getReadableTeamColor(player.team);

  return (
    <div className="relative z-10 mt-1 h-40 w-full sm:mt-2 sm:h-48">
      <div className="absolute left-0 top-0 z-10 ml-3 flex h-full flex-col justify-around py-1 sm:ml-6 sm:py-2">
        <StatLabel label="FT%" value={stats.ftPercent ?? 0} color={teamColor} />
        <StatLabel
          label="3PT%"
          value={stats.threePercent ?? 0}
          color={teamColor}
        />
        <StatLabel label="FG%" value={stats.fgPercent ?? 0} color={teamColor} />
      </div>

      <div className="absolute right-0 top-0 z-10 mr-3 flex h-full flex-col justify-around py-1 sm:mr-6 sm:py-2">
        <StatLabel
          label="PPG"
          value={stats.ppg ?? 0}
          color={teamColor}
          align="right"
        />
        <StatLabel
          label="RPG"
          value={stats.rpg ?? 0}
          color={teamColor}
          align="right"
        />
        <StatLabel
          label="APG"
          value={stats.apg ?? 0}
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
              fontSize: 7,
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
