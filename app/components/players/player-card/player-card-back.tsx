import Image from "next/image";
import { getTeamColor, type Player } from "../../court-data";

type PlayerCardBackProps = {
  player: Player;
  isCardFlipped: boolean;
  children: React.ReactNode;
};

export function PlayerCardBack({
  player,
  isCardFlipped,
  children,
}: PlayerCardBackProps) {
  const teamColor = getTeamColor(player.team);
  return (
    <div
      className={`absolute inset-0 min-h-134 rounded-3xl border bg-black/30 ${
        isCardFlipped ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
        borderColor: teamColor,
      }}
    >
      <div className="absolute -inset-1 z-0 opacity-50">
        <Image
          src="/court-pattern.svg"
          alt="Court background"
          fill
          className="object-cover"
        />
      </div>

      {children}
    </div>
  );
}
