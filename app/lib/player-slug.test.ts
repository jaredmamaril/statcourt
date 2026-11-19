import { describe, expect, it } from "vitest";
import {
  findPlayerBySlug,
  getCanonicalPlayerSlug,
  getDuplicatePlayerSlugs,
  getPlayerHref,
  toPlayerSlug,
} from "./player-slug";

describe("toPlayerSlug", () => {
  it("lowercases names and joins words with hyphens", () => {
    expect(toPlayerSlug("Aaron Wiggins")).toBe("aaron-wiggins");
    expect(toPlayerSlug("  Aaron   Wiggins  ")).toBe("aaron-wiggins");
  });

  it("replaces apostrophes with hyphens", () => {
    expect(toPlayerSlug("De'Aaron Fox")).toBe("de-aaron-fox");
    expect(toPlayerSlug("Royce O'Neale")).toBe("royce-o-neale");
  });

  it("handles periods in initials", () => {
    expect(toPlayerSlug("P.J. Washington")).toBe("p-j-washington");
    expect(toPlayerSlug("O.G. Anunoby")).toBe("o-g-anunoby");
  });

  it("strips accents", () => {
    expect(toPlayerSlug("Nikola Jokić")).toBe("nikola-jokic");
    expect(toPlayerSlug("Luka Dončić")).toBe("luka-doncic");
    expect(toPlayerSlug("Dāvis Bertāns")).toBe("davis-bertans");
  });

  it("keeps generational suffixes as plain words", () => {
    expect(toPlayerSlug("Jaren Jackson Jr.")).toBe("jaren-jackson-jr");
    expect(toPlayerSlug("Gary Trent Jr")).toBe("gary-trent-jr");
    expect(toPlayerSlug("Robert Williams III")).toBe("robert-williams-iii");
  });

  it("is stable when given an existing slug", () => {
    expect(toPlayerSlug("aaron-wiggins")).toBe("aaron-wiggins");
    expect(toPlayerSlug(toPlayerSlug("Jaren Jackson Jr."))).toBe(
      "jaren-jackson-jr",
    );
  });
});

describe("getPlayerHref", () => {
  it("builds the canonical player profile path", () => {
    expect(getPlayerHref("Aaron Wiggins")).toBe("/players/aaron-wiggins");
  });
});

describe("duplicate player names", () => {
  const players = [
    { name: "Mike James", nbaId: 2229 },
    { name: "LeBron James", nbaId: 2544 },
    { name: "Mike James", nbaId: 1628455 },
  ];
  const duplicateSlugs = getDuplicatePlayerSlugs(players);

  it("only flags slugs shared by more than one player", () => {
    expect([...duplicateSlugs]).toEqual(["mike-james"]);
  });

  it("adds the NBA ID suffix only for clashing names", () => {
    expect(getPlayerHref(players[0], duplicateSlugs)).toBe(
      "/players/mike-james-2229",
    );
    expect(getPlayerHref(players[2], duplicateSlugs)).toBe(
      "/players/mike-james-1628455",
    );
    expect(getPlayerHref(players[1], duplicateSlugs)).toBe(
      "/players/lebron-james",
    );
  });

  it("falls back to the bare slug when a clashing player has no NBA ID", () => {
    expect(
      getCanonicalPlayerSlug({ name: "Mike James", nbaId: null }, duplicateSlugs),
    ).toBe("mike-james");
  });

  it("resolves each ID URL to the matching player", () => {
    expect(findPlayerBySlug(players, "mike-james-2229")).toBe(players[0]);
    expect(findPlayerBySlug(players, "mike-james-1628455")).toBe(players[2]);
  });

  it("keeps the bare slug and encoded name resolving to the first match", () => {
    expect(findPlayerBySlug(players, "mike-james")).toBe(players[0]);
    expect(findPlayerBySlug(players, "Mike%20James")).toBe(players[0]);
  });

  it("still resolves unique players by slug or encoded name", () => {
    expect(findPlayerBySlug(players, "lebron-james")).toBe(players[1]);
    expect(findPlayerBySlug(players, "LeBron%20James")).toBe(players[1]);
    expect(findPlayerBySlug(players, "unknown-player")).toBeUndefined();
  });
});
