import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Player } from "../court-data";
import {
  createPlayerHrefResolver,
  getCanonicalPlayerPaths,
} from "../../lib/player-slug";
import { RankingPlayerTooltip } from "./ranking-player-tooltip";

function createPlayer(id: number, name: string, nbaId: number): Player {
  return {
    id,
    nbaId,
    name,
    team: "BOS",
    position: "G",
    jerseyNumber: id,
    stats: {
      ppg: 10,
      rpg: 3,
      apg: 3,
      spg: 1,
      bpg: 0.2,
      fgPercent: 45,
      threePercent: 35,
      ftPercent: 80,
    },
    ratings: { defense: 50, starPower: 50 },
  } as Player;
}

const mikeJamesHeat = createPlayer(1, "Mike James", 2229);
const mikeJamesNets = createPlayer(2, "Mike James", 1628455);
const lebron = createPlayer(3, "LeBron James", 2544);
const allPlayers = [mikeJamesHeat, lebron, mikeJamesNets];

describe("rankings player links", () => {
  const toHref = createPlayerHrefResolver(allPlayers);

  it("links both Mike James players to different canonical URLs", () => {
    expect(toHref(mikeJamesHeat)).toBe("/players/mike-james-2229");
    expect(toHref(mikeJamesNets)).toBe("/players/mike-james-1628455");
  });

  it("keeps the clean slug for a unique name", () => {
    expect(toHref(lebron)).toBe("/players/lebron-james");
  });

  it("matches the sitemap URLs for every player", () => {
    const sitemapPaths = getCanonicalPlayerPaths(allPlayers);

    expect(allPlayers.map(toHref).sort()).toEqual([...sitemapPaths].sort());
  });

  it("still uses the ID URL when a filtered list shows only one Mike James", () => {
    // e.g. Current Season mode: the visible list is filtered, but links are built
    // from the full player list, the same list the sitemap uses.
    const visible = [mikeJamesNets, lebron];

    expect(visible.map(toHref)).toEqual([
      "/players/mike-james-1628455",
      "/players/lebron-james",
    ]);
    expect(getCanonicalPlayerPaths(allPlayers)).toContain(
      toHref(mikeJamesNets),
    );
  });

  it("passes the whole player from the Full Profile button, not just the name", () => {
    const onViewPlayer = vi.fn();

    render(
      <RankingPlayerTooltip
        player={mikeJamesNets}
        ratingLabel="Career Overall Rating"
        rating="70.0"
        statProfileFilter="career"
        onViewPlayer={onViewPlayer}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Full Profile" }));

    expect(onViewPlayer).toHaveBeenCalledWith(mikeJamesNets);
    expect(toHref(onViewPlayer.mock.calls[0][0])).toBe(
      "/players/mike-james-1628455",
    );
  });
});
