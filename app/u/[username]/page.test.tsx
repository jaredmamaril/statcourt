import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  class NotFoundSignal extends Error {}

  return { NotFoundSignal, exists: true as boolean | null };
});

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new mocks.NotFoundSignal();
  },
}));
vi.mock("../../lib/public-profile-lookup", () => ({
  publicProfileExists: async () => mocks.exists,
}));
vi.mock("./public-profile-client", () => ({
  PublicProfileClient: () => null,
}));

async function renderPage(username: string) {
  const { default: PublicProfilePage } = await import("./page");

  try {
    await PublicProfilePage({ params: Promise.resolve({ username }) });

    return "rendered";
  } catch (error) {
    if (error instanceof mocks.NotFoundSignal) return "not-found";
    throw error;
  }
}

beforeEach(() => {
  mocks.exists = true;
});

describe("public profile page", () => {
  it("renders a public profile", async () => {
    expect(await renderPage("hooper")).toBe("rendered");
  });

  it("calls notFound() for an unknown or private username", async () => {
    mocks.exists = false;

    expect(await renderPage("nobody-here")).toBe("not-found");
  });

  it("still renders when the lookup fails, instead of a 404", async () => {
    mocks.exists = null;

    expect(await renderPage("hooper")).toBe("rendered");
  });
});

describe("public profile metadata", () => {
  it("marks every profile noindex", async () => {
    const { generateMetadata } = await import("./layout");
    const metadata = await generateMetadata({ params: Promise.resolve({ username: "hooper" }) });

    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.title).toBe("@hooper");
  });
});
