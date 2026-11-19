import { describe, expect, it } from "vitest";
import { getPlayerHref, toPlayerSlug } from "./player-slug";

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
