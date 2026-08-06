"use client";

import { supabase } from "../components/supabase-client";

export type UserProfileApiRow = {
  display_name: string | null;
  username: string | null;
  username_updated_at: string | null;
  avatar_url: string | null;
  public_profile_enabled: boolean | null;
};

type UpdateProfileInput = {
  displayName?: string;
  username?: string;
  publicProfileEnabled?: boolean;
  avatarUrl?: string;
};

export async function updateUserProfile(input: UpdateProfileInput) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return {
      profile: null,
      error: "Sign in again to update your profile.",
    };
  }

  const response = await fetch("/api/profile", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const result = (await response.json().catch(() => ({}))) as {
    profile?: UserProfileApiRow;
    error?: string;
  };

  if (!response.ok || !result.profile) {
    return {
      profile: null,
      error: result.error ?? "Could not save profile.",
    };
  }

  return {
    profile: result.profile,
    error: null,
  };
}
