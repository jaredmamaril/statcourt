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
      className={`relative h-[calc(100vh-155px)] w-full max-w-71.25 overflow-hidden rounded-2xl animate-[cardIn_500ms_ease-out] transition-all duration-500 sm:max-w-md lg:h-auto lg:min-h-134 lg:rounded-3xl ${
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
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggleFlip();
        }}
        className="absolute right-2 top-2 z-50 flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[rgb(var(--court-accent-rgb)/0.45)] bg-[color:color-mix(in_srgb,var(--court-panel)_88%,black)] px-2 font-michroma text-[7px] uppercase text-[var(--court-accent)] opacity-80 transition hover:opacity-100 lg:right-3 lg:top-3 lg:text-[8px]"
        aria-label={`${isCardFlipped ? "Show front of" : "Show back of"} ${player.name} player card`}
      >
        Flip
      </button>

      <div
        className="relative h-full w-full lg:min-h-134"
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
