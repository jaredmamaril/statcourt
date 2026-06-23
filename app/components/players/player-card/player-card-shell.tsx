import { type Player } from "../../court-data";

type PlayerCardShellProps = {
  player: Player;
  isCardFlipped: boolean;
  isGoingToCourt: boolean;
  onToggleFlip: () => void;
  children: React.ReactNode;
};

export function PlayerCardShell({
  player,
  isCardFlipped,
  isGoingToCourt,
  onToggleFlip,
  children,
}: PlayerCardShellProps) {
  return (
    <div
      key={player.id}
      className={`relative w-full max-w-md min-h-134 overflow-hidden rounded-3xl animate-[cardIn_500ms_ease-out] transition-all duration-500 ${
        isGoingToCourt
          ? "scale-90 translate-y-20 opacity-0"
          : "scale-100 translate-y-0 opacity-100"
      }`}
      style={{ perspective: "1000px" }}
      onClick={(e) => {
        if (e.target instanceof HTMLElement && e.target.closest("button")) {
          return;
        }

        onToggleFlip();
      }}
      onKeyDown={(e) => {
        if (e.target instanceof HTMLElement && e.target.closest("button")) {
          return;
        }

        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggleFlip();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${player.name} player card - click to flip`}
    >
      <div
        className="relative w-full min-h-134"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.5s ease-out",
          transform: isCardFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
