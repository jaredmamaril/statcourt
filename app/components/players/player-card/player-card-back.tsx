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
      className={`absolute inset-0 h-full rounded-2xl border bg-[color:color-mix(in_srgb,var(--court-panel)_90%,black)] lg:min-h-134 lg:rounded-3xl ${
        isCardFlipped ? "pointer-events-auto" : "pointer-events-none"
      } ${isCardFlipped ? "animate-[cardFaceIn_180ms_ease-out_both]" : ""}`}
      style={{
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
        borderColor: teamColor,
      }}
    >
      <div
        className="absolute -inset-1 z-0 bg-cover bg-center opacity-35"
        style={{ backgroundImage: "var(--court-pattern)" }}
      />

      {children}
    </div>
  );
}
