import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type { RadarStatRow } from "../court-data";

type PlayerComparisonRadarProps = {
  radarData: RadarStatRow[];
  selectedLeftPlayerName: string;
  selectedRightPlayerName: string;
  leftColor: string;
  rightColor: string;
};

export function PlayerComparisonRadar({
  radarData,
  selectedLeftPlayerName,
  selectedRightPlayerName,
  leftColor,
  rightColor,
}: PlayerComparisonRadarProps) {
  function customTooltip({ active, payload, label }: TooltipContentProps) {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const data = payload[0].payload as RadarStatRow;

    return (
      <div className="rounded-md border border-[#347A99]/50 bg-[#07111f]/90 px-2.5 py-2 text-[10px] shadow-[0_0_14px_rgba(27,194,236,0.12)] sm:px-3 sm:py-2.5 sm:text-xs">
        <p className="font-michroma text-xs font-bold text-[#1bc2ec] sm:text-sm">
          {label}
        </p>

        <p
          className="mt-1.5 font-michroma brightness-125"
          style={{ color: leftColor }}
        >
          {selectedLeftPlayerName || "Player 1"}: {data.playerOneActual}
        </p>

        <p
          className="mt-1 font-michroma brightness-125"
          style={{ color: rightColor }}
        >
          {selectedRightPlayerName || "Player 2"}: {data.playerTwoActual}
        </p>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto h-70 w-full max-w-70 sm:h-85 sm:max-w-85 lg:h-110 lg:max-w-130">
      <div className="flex h-full w-full items-center justify-center rounded-full bg-black/40 animate-[courtRadarIn_700ms_ease-out_150ms_both]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.25)" />
            <PolarAngleAxis
              dataKey="stat"
              tick={{ fill: "white", fontSize: 8, fontFamily: "Michroma" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Tooltip content={customTooltip} />
            <Radar
              name={selectedLeftPlayerName || "Player One"}
              dataKey="playerOne"
              stroke={leftColor}
              strokeWidth={2}
              fill={leftColor}
              fillOpacity={0.14}
              isAnimationActive={true}
              animationDuration={900}
              animationEasing="ease-out"
            />

            <Radar
              name={selectedRightPlayerName || "Player Two"}
              dataKey="playerTwo"
              stroke={rightColor}
              strokeWidth={2}
              fill={rightColor}
              fillOpacity={0.22}
              isAnimationActive={true}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
