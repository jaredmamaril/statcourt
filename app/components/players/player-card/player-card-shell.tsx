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
      className={`relative h-[540px] max-h-[calc(100svh-155px)] min-h-0 w-full max-w-71.25 overflow-hidden rounded-2xl animate-[cardIn_500ms_ease-out] transition-all duration-500 sm:h-[620px] sm:max-w-md lg:h-auto lg:max-h-none lg:min-h-134 lg:rounded-3xl ${
        isGoingToCourt
          ? "scale-90 translate-y-20 opacity-0"
          : "scale-100 translate-y-0 opacity-100"
      }`}
      style={{ perspective: "1000px", WebkitPerspective: "1000px" }}
      onClick={(e) => {
        if (e.target instanceof HTMLElement && e.target.closest("button")) {
          return;
        }

        onToggleFlip();
      }}
    >
      <div
        className="relative h-full min-h-0 w-full lg:min-h-134"
        style={{
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          transition: "transform 0.5s ease-out",
          transform: isCardFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          WebkitTransform: isCardFlipped
            ? "rotateY(180deg)"
            : "rotateY(0deg)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
