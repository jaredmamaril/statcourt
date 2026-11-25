import { describe, expect, it } from "vitest";
import {
  buildRedditShareUrl,
  buildXShareUrl,
  getShareImagePath,
  parseStatMode,
  withModeParam,
} from "./share";

describe("parseStatMode", () => {
  it("accepts exactly career, peak and current", () => {
    expect(parseStatMode("career")).toBe("career");
    expect(parseStatMode("peak")).toBe("peak");
    expect(parseStatMode("current")).toBe("current");
  });

  it("falls back (null) for anything else", () => {
    for (const value of [undefined, null, "", "PEAK", "Peak", "latest", "peak ", 3, {}]) {
      expect(parseStatMode(value)).toBeNull();
    }
  });

  it("uses the first value of a repeated param", () => {
    expect(parseStatMode(["current", "peak"])).toBe("current");
    expect(parseStatMode(["nope", "peak"])).toBeNull();
  });
});

describe("mode links", () => {
  it("adds or replaces ?mode on a path and keeps other params", () => {
    expect(withModeParam("/players/lamelo-ball", "peak")).toBe("/players/lamelo-ball?mode=peak");
    expect(withModeParam("/rankings?mode=career", "current")).toBe("/rankings?mode=current");
    expect(withModeParam("/rankings?tab=scoring", "peak")).toBe("/rankings?tab=scoring&mode=peak");
  });

  it("keeps absolute URLs absolute", () => {
    expect(withModeParam("https://statcourt.app/players/lamelo-ball", "career")).toBe(
      "https://statcourt.app/players/lamelo-ball?mode=career",
    );
  });

  it("builds the share image path for the mode", () => {
    expect(getShareImagePath("/players/mike-james-1628455", "current")).toBe(
      "/players/mike-james-1628455/share-image?mode=current",
    );
  });
});

describe("share URLs", () => {
  const url = "https://statcourt.app/players/lamelo-ball?mode=peak";
  const text = "LaMelo Ball's Peak & more: 22.1 PPG #69";

  it("encodes the X intent URL", () => {
    const shareUrl = buildXShareUrl({ url, text });
    const parsed = new URL(shareUrl);

    expect(parsed.origin + parsed.pathname).toBe("https://x.com/intent/post");
    expect(parsed.searchParams.get("url")).toBe(url);
    expect(parsed.searchParams.get("text")).toBe(text);
    // The page URL's own query and the text's &, # and ' can't leak into the intent URL.
    expect(shareUrl).toContain(
      "url=https%3A%2F%2Fstatcourt.app%2Fplayers%2Flamelo-ball%3Fmode%3Dpeak",
    );
    expect(shareUrl).not.toContain("#");
    expect([...parsed.searchParams.keys()]).toEqual(["text", "url"]);
  });

  it("encodes the Reddit submit URL", () => {
    const shareUrl = buildRedditShareUrl({ url, title: text });
    const parsed = new URL(shareUrl);

    expect(parsed.origin + parsed.pathname).toBe("https://www.reddit.com/submit");
    expect(parsed.searchParams.get("url")).toBe(url);
    expect(parsed.searchParams.get("title")).toBe(text);
    expect([...parsed.searchParams.keys()]).toEqual(["url", "title"]);
  });
});
