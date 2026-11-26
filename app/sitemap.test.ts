import { describe, expect, it, vi } from "vitest";

vi.mock("./components/player-data-source", () => ({
  getAppPlayerSlugSources: async () => [
    { name: "LaMelo Ball", nbaId: 1630163 },
    { name: "Mike James", nbaId: 2229 },
    { name: "Mike James", nbaId: 1628455 },
  ],
}));

describe("sitemap", () => {
  it("lists player pages but never user profiles (/u/)", async () => {
    const { default: sitemap } = await import("./sitemap");
    const paths = (await sitemap()).map((entry) => new URL(entry.url).pathname);

    expect(paths).toContain("/players/lamelo-ball");
    expect(paths).toContain("/players/mike-james-1628455");
    expect(paths.some((path) => path.startsWith("/u/") || path === "/u")).toBe(false);
  });
});
