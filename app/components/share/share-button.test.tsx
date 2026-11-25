import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShareButton } from "./share-button";

const trackShare = vi.hoisted(() => vi.fn());

vi.mock("../../lib/share", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/share")>()),
  trackShare,
}));

function renderShareButton() {
  render(
    <ShareButton
      path="/players/lamelo-ball"
      mode="peak"
      slug="lamelo-ball"
      title="LaMelo Ball | StatCourt"
      text="LaMelo Ball's Peak profile on StatCourt"
      imagePath="/players/lamelo-ball/share-image?mode=peak"
    />,
  );
}

const expectedUrl = `${window.location.origin}/players/lamelo-ball?mode=peak`;

beforeEach(() => {
  trackShare.mockClear();
  // Desktop: no Web Share API, no Clipboard API, and a fine (mouse) pointer.
  vi.stubGlobal("navigator", { ...navigator, share: undefined, clipboard: undefined });
  window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as never;
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ShareButton without Web Share", () => {
  it("opens a menu with copy, X, Reddit and download", () => {
    renderShareButton();
    fireEvent.click(screen.getByRole("button", { name: "Share" }));

    expect(screen.getByRole("menu", { name: "Share options" })).toBeTruthy();
    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "Copy link",
      "Share on X",
      "Share on Reddit",
      "Download image",
    ]);
  });

  it("copies the mode link with the Clipboard API and confirms inline", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("navigator", { ...navigator, share: undefined, clipboard: { writeText } });
    renderShareButton();
    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Copy link" }));

    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Link copied"));
    expect(writeText).toHaveBeenCalledWith(expectedUrl);
    expect(trackShare).toHaveBeenCalledWith("copy", "peak", "lamelo-ball");
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("falls back to a hidden textarea when the Clipboard API is missing", async () => {
    let copiedValue = "";
    const execCommand = vi.fn(() => {
      copiedValue = (document.activeElement as HTMLTextAreaElement | null)?.value ?? "";
      return true;
    });

    document.execCommand = execCommand as never;
    renderShareButton();
    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Copy link" }));

    await waitFor(() => expect(screen.getByRole("status").textContent).toBe("Link copied"));
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(copiedValue).toBe(expectedUrl);
    expect(document.querySelector("textarea")).toBeNull();
  });

  it("opens X and Reddit with the encoded mode link", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);

    renderShareButton();
    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Share on X" }));
    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Share on Reddit" }));

    const [xUrl, redditUrl] = open.mock.calls.map((call) => new URL(String(call[0])));

    expect(xUrl.searchParams.get("url")).toBe(expectedUrl);
    expect(redditUrl.searchParams.get("url")).toBe(expectedUrl);
    expect(open.mock.calls[0][2]).toBe("noopener,noreferrer");
    expect(trackShare.mock.calls.map((call) => call[0])).toEqual(["x", "reddit"]);
    open.mockRestore();
  });

  it("closes the menu on Escape", () => {
    renderShareButton();
    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("menu")).toBeNull();
  });
});

describe("ShareButton with Web Share on a touch device", () => {
  it("uses the native share sheet with the title, text and mode link", async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal("navigator", { ...navigator, share });
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as never;
    renderShareButton();
    fireEvent.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        title: "LaMelo Ball | StatCourt",
        text: "LaMelo Ball's Peak profile on StatCourt",
        url: expectedUrl,
      }),
    );
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trackShare).toHaveBeenCalledWith("native", "peak", "lamelo-ball");
  });
});
