import "server-only";

import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

// Server-side check that /u/{username} is a public profile, so unknown usernames get a
// real 404. It reads the same public_profiles view as the profile page does in the
// browser, with the anon key (RLS applies; never the service role key), and without
// cookies, so the result can be cached and shared across visitors.

// Short, so a newly created or newly public profile stops 404ing within a minute.
const PROFILE_EXISTS_REVALIDATE_SECONDS = 60;
const MAX_USERNAME_LENGTH = 64;

// The username the profile page looks up: URL-decoded, leading "@"s removed (so
// /u/@name works). Null for anything that can't be a username.
export function normalizePublicUsername(param: string) {
  let decoded: string;

  try {
    decoded = decodeURIComponent(param);
  } catch {
    return null;
  }

  const username = decoded.replace(/^@+/, "");

  return username.length > 0 && username.length <= MAX_USERNAME_LENGTH ? username : null;
}

async function queryPublicProfileExists(username: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase public environment variables");
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase
    .from("public_profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data !== null;
}

// Errors throw, so they're never cached.
const getCachedPublicProfileExists = unstable_cache(
  queryPublicProfileExists,
  ["statcourt-public-profile-exists-v1"],
  { revalidate: PROFILE_EXISTS_REVALIDATE_SECONDS, tags: ["statcourt-public-profiles"] },
);

// true: a public profile. false: no such public profile (404).
// null: couldn't check (database down, missing config); the page renders as before.
export async function publicProfileExists(usernameParam: string): Promise<boolean | null> {
  const username = normalizePublicUsername(usernameParam);

  if (!username) return false;

  try {
    return await getCachedPublicProfileExists(username);
  } catch (error) {
    console.error("Failed to look up public profile", error);

    return null;
  }
}
