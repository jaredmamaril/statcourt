import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  usernames: new Set(["hooper"]),
  fail: false,
  createClient: vi.fn(),
  queried: [] as string[],
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => {
    db.createClient(...args);

    return {
      from: (table: string) => ({
        select: () => ({
          eq: (column: string, value: string) => ({
            maybeSingle: async () => {
              db.queried.push(`${table}.${column}=${value}`);

              return db.fail
                ? { data: null, error: { message: "db down" } }
                : { data: db.usernames.has(value) ? { id: "u1" } : null, error: null };
            },
          }),
        }),
      }),
    };
  },
}));

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-key");
  db.fail = false;
  db.queried = [];
  db.createClient.mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("normalizePublicUsername", () => {
  it("decodes the URL and strips leading @s, like the profile page", async () => {
    const { normalizePublicUsername } = await import("./public-profile-lookup");

    expect(normalizePublicUsername("hooper")).toBe("hooper");
    expect(normalizePublicUsername("%40hooper")).toBe("hooper");
    expect(normalizePublicUsername("@@hooper")).toBe("hooper");
  });

  it("rejects empty, too long and malformed usernames", async () => {
    const { normalizePublicUsername } = await import("./public-profile-lookup");

    expect(normalizePublicUsername("@")).toBeNull();
    expect(normalizePublicUsername("a".repeat(65))).toBeNull();
    expect(normalizePublicUsername("%E0%A4%A")).toBeNull();
  });
});

describe("publicProfileExists", () => {
  it("finds public profiles in public_profiles with the anon key", async () => {
    const { publicProfileExists } = await import("./public-profile-lookup");

    expect(await publicProfileExists("@hooper")).toBe(true);
    expect(db.queried).toEqual(["public_profiles.username=hooper"]);
    expect(db.createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.anything(),
    );
    expect(JSON.stringify(db.createClient.mock.calls)).not.toContain("service-role-key");
  });

  it("is false for unknown usernames", async () => {
    const { publicProfileExists } = await import("./public-profile-lookup");

    expect(await publicProfileExists("nobody-here")).toBe(false);
  });

  it("doesn't query for usernames that can't exist", async () => {
    const { publicProfileExists } = await import("./public-profile-lookup");

    expect(await publicProfileExists("%E0%A4%A")).toBe(false);
    expect(await publicProfileExists("a".repeat(65))).toBe(false);
    expect(db.queried).toEqual([]);
  });

  it("is null (not a 404) when the lookup fails", async () => {
    const { publicProfileExists } = await import("./public-profile-lookup");

    db.fail = true;
    expect(await publicProfileExists("hooper")).toBeNull();

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    db.fail = false;
    expect(await publicProfileExists("hooper")).toBeNull();
  });
});
