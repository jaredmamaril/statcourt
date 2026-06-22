import Image from "next/image";
import type { CSSProperties } from "react";
import type { PlayerInsightDisplay } from "./court-data";
import { normalizeStat, statMaxValues } from "./court-data";
import { teamColors, teamLogos, type Player } from "./court-data";
import { getPlayerHeadshot } from "./player-images";
import PlayerImage from "./player-image";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

type PlayerCardFrontProps = {
  player: Player;
  isCardFlipped: boolean;
};

export function PlayerCardFront({
  player,
  isCardFlipped,
}: PlayerCardFrontProps) {
  return (
    <div
      className={`absolute inset-0 min-h-134 rounded-3xl border border-[#1bc2ec]/10 bg-black/30 p-6 ${
        isCardFlipped ? "pointer-events-none" : "pointer-events-auto"
      }`}
      style={{ backfaceVisibility: "hidden" }}
    >
      <svg
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <mask id={`team-frame-mask-${player.id}`}>
            <rect width="100" height="100" fill="white" />
            <polygon points="8,8 82,8 92,18 92,92 18,92 8,82" fill="black" />
          </mask>
        </defs>

        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill={teamColors[player.team]}
          mask={`url(#team-frame-mask-${player.id})`}
        />

        <polygon
          points="8,8 82,8 92,18 92,92 18,92 8,82"
          fill="none"
          stroke="white"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="absolute -inset-30 z-10 rotate-90 opacity-50">
        <Image
          src="/court.svg"
          alt="Court background"
          fill
          className="object-contain"
        />
      </div>

      <div
        className="absolute top-18 right-14 z-30"
        style={{ color: teamColors[player.team] }}
      >
        <div className="flex flex-col items-center">
          <span className="font-michroma text-3xl font-bold opacity-70">
            #{player.jerseyNumber}
          </span>
          <span className="font-michroma text-2xl font-bold text-white opacity-70">
            {player.position}
          </span>
        </div>
      </div>

      <div className="absolute top-15 left-12 z-30 opacity-70">
        <Image
          src={teamLogos[player.team]}
          alt={`${player.team} logo`}
          width={32}
          height={32}
          className="h-24 w-24 object-contain"
        />
      </div>

      <div className="absolute inset-0 z-20 flex -top-18 items-center justify-center">
        <PlayerImage
          src={getPlayerHeadshot(player)}
          alt={player.name}
          width={520}
          height={380}
          className="h-84 w-84 rounded-md object-cover"
        />
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-30 flex items-center justify-center px-6 text-center">
        <span className="w-full wrap-break-word py-11 font-michroma text-xl font-bold uppercase tracking-wide text-white">
          {player.name}
        </span>
      </div>
    </div>
  );
}

type PlayerCardBackHeaderProps = {
  player: Player;
  getPlayerNameTextClass: (name: string) => string;
};

export function PlayerCardBackHeader({
  player,
  getPlayerNameTextClass,
}: PlayerCardBackHeaderProps) {
  return (
    <div className="relative z-10 grid grid-cols-[88px_1fr_52px] items-center gap-4 px-3 pt-1 font-michroma uppercase">
      <PlayerImage
        src={getPlayerHeadshot(player)}
        alt={player.name}
        width={88}
        height={88}
        className="h-22 w-22 rounded-md object-contain"
      />

      <div className="flex min-w-0 justify-center text-center">
        <p
          className={`line-clamp-2 text-center font-bold text-white ${getPlayerNameTextClass(
            player.name,
          )}`}
        >
          {player.name}
        </p>
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="shrink-0 text-xs text-white/55">{player.position}</p>
        <p className="shrink-0 text-xs text-white/55">{player.team}</p>
        <p className="shrink-0 text-xs text-white/55">#{player.jerseyNumber}</p>
      </div>
    </div>
  );
}

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

  return (
    <div className="relative z-10 mt-2 h-48 w-full">
      <div className="absolute left-0 top-0 z-10 ml-6 flex h-full flex-col justify-around py-2">
        <StatLabel
          label="FG%"
          value={player.stats.fgPercent}
          color={teamColors[player.team]}
        />
        <StatLabel
          label="3PT%"
          value={player.stats.threePercent}
          color={teamColors[player.team]}
        />
        <StatLabel
          label="FT%"
          value={player.stats.ftPercent}
          color={teamColors[player.team]}
        />
      </div>

      <div className="absolute right-0 top-0 z-10 mr-6 flex h-full flex-col justify-around py-2">
        <StatLabel
          label="PPG"
          value={player.stats.ppg}
          color={teamColors[player.team]}
          align="right"
        />
        <StatLabel
          label="RPG"
          value={player.stats.rpg}
          color={teamColors[player.team]}
          align="right"
        />
        <StatLabel
          label="APG"
          value={player.stats.apg}
          color={teamColors[player.team]}
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
            stroke={teamColors[player.team]}
            strokeWidth={2}
            fill={teamColors[player.team]}
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

type PlayerCardInsightsProps = {
  playerInsights: {
    archetype: PlayerInsightDisplay | null;
    traits: PlayerInsightDisplay[];
  };
  getInsightRarityStyles: (
    insight: PlayerInsightDisplay,
    isArchetype?: boolean,
  ) => React.CSSProperties;
  getInsightRarityLabel: (rarity: PlayerInsightDisplay["rarity"]) => string;
};

export function PlayerCardInsights({
  playerInsights,
  getInsightRarityStyles,
  getInsightRarityLabel,
}: PlayerCardInsightsProps) {
  return (
    <div className="flex w-fit flex-col items-center gap-1">
      <span className="font-michroma text-[14px] uppercase tracking-wide text-white">
        Insights
      </span>

      <span className="font-michroma text-[6px] uppercase tracking-wide text-white">
        Archetype
      </span>

      {playerInsights.archetype && (
        <div className="group relative z-100 w-fit">
          <div
            className="ml-2 w-fit rounded border px-2 py-1 text-center font-michroma text-[10px] font-bold uppercase tracking-wide"
            style={getInsightRarityStyles(playerInsights.archetype, true)}
          >
            {playerInsights.archetype.label}
          </div>

          <div className="pointer-events-none absolute left-1/2 top-full z-999 mt-2 w-56 -translate-x-1/2 rounded-md border border-[#1bc2ec]/50 bg-black/90 p-2 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <p className="font-michroma text-[10px] font-bold text-white/80">
              {playerInsights.archetype.label}
            </p>
            <p className="mt-1 font-michroma text-[9px] text-white/60">
              Tier: {getInsightRarityLabel(playerInsights.archetype.rarity)}
            </p>
            <p className="mt-1 font-michroma text-[9px] text-white/80">
              {playerInsights.archetype.description}
            </p>
          </div>
        </div>
      )}

      <span className="font-michroma text-[6px] uppercase tracking-wide text-white">
        Traits
      </span>

      <div className="flex flex-col items-center gap-1">
        {playerInsights.traits.map((trait) => (
          <span
            key={trait.label}
            className="group relative z-90 w-fit hover:z-300"
          >
            <span
              className="block w-fit rounded border px-1.5 py-0.5 font-michroma text-[10px]"
              style={getInsightRarityStyles(trait)}
            >
              {trait.label}
            </span>

            <span className="pointer-events-none absolute left-1/2 top-full z-999 mt-2 w-56 -translate-x-1/2 rounded-md border border-[#1bc2ec]/50 bg-black/90 p-2 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="block font-michroma text-[10px] font-bold text-white/80">
                {trait.label}
              </span>
              <span className="mt-1 block font-michroma text-[9px] text-white/60">
                Tier: {getInsightRarityLabel(trait.rarity)}
              </span>
              <span className="mt-1 block font-michroma text-[9px] text-white/80">
                {trait.description}
              </span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
