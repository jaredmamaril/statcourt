import Image from "next/image";
import { getReadableTeamColor, type Player } from "../../court-data";

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
  const teamColor = getReadableTeamColor(player.team);
  return (
    <div
      className={`absolute inset-0 h-full rounded-2xl border bg-black/30 lg:min-h-134 lg:rounded-3xl ${
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
