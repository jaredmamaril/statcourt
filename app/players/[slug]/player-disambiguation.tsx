import Link from "next/link";
import type { Player } from "../../components/court-data";
import { PlayerPageNav, PlayerPageShell } from "./player-page-nav";

// /players/{name} when several players share that name (e.g. two Mike Jameses):
// lists each one, linking to their ID-suffixed profile. Newest first.

const positionLabels: Record<string, string> = {
  G: "Guard",
  F: "Forward",
  C: "Center",
};

export type DisambiguationChoice = { player: Player; href: string };

function getLastSeason(player: Player) {
  const label = player.statProfiles?.current?.seasonLabel;

  return label && /^\d{4}-\d{2}$/.test(label) ? label : null;
}

export function sortChoicesNewestFirst(choices: DisambiguationChoice[]) {
  return [...choices].sort((a, b) =>
    (getLastSeason(b.player) ?? "").localeCompare(getLastSeason(a.player) ?? ""),
  );
}

export function PlayerDisambiguation({
  name,
  choices,
}: {
  name: string;
  choices: DisambiguationChoice[];
}) {
  return (
    <PlayerPageShell>
      <PlayerPageNav />

      <div className="mx-auto mt-8 max-w-md">
        <h1 className="text-center font-michroma text-sm uppercase text-white">
          Which {name}?
        </h1>
        <p className="mt-3 text-center font-michroma text-[9px] leading-relaxed text-white/45">
          More than one NBA player has this name. Choose a profile.
        </p>

        <ul className="mt-5 grid gap-3">
          {sortChoicesNewestFirst(choices).map(({ player, href }) => {
            const lastSeason = getLastSeason(player);
            const details = [
              player.team === "FA" ? "Free Agent" : player.team,
              positionLabels[player.position] ?? player.position,
              lastSeason && `Last season ${lastSeason}`,
            ].filter(Boolean);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded-lg border border-[rgb(var(--court-accent-rgb)/0.4)] bg-[color:color-mix(in_srgb,var(--court-panel)_86%,transparent)] p-4 transition hover:border-[rgb(var(--court-accent-rgb)/0.8)] hover:bg-[rgb(var(--court-accent-rgb)/0.12)]"
                >
                  <span className="block font-michroma text-xs uppercase text-white">
                    {player.name}
                  </span>
                  <span className="mt-2 block font-michroma text-[9px] uppercase text-white/55">
                    {details.join(" · ")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </PlayerPageShell>
  );
}
