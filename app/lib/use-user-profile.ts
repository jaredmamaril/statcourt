"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../components/supabase-client";
import { useAuthUser } from "./use-auth-user";
import {
  getUserAvatarUrl,
  getUserDisplayName,
  getUserInitial,
} from "./auth-display";

export type UserProfile = {
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  publicProfileEnabled: boolean;
};

type UserProfileRow = {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  public_profile_enabled: boolean | null;
};

function getMetadataUsername(user: User | null) {
  const value = user?.user_metadata?.username;

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function mapRowToProfile(row: UserProfileRow | null, user: User | null) {
  return {
    displayName: row?.display_name?.trim() || getUserDisplayName(user),
    username: row?.username ?? getMetadataUsername(user),
    avatarUrl: row?.avatar_url?.trim() || getUserAvatarUrl(user),
    publicProfileEnabled: row?.public_profile_enabled ?? false,
  };
}

function getProfileSeed(user: User) {
  return {
    id: user.id,
    display_name: getUserDisplayName(user),
    username: getMetadataUsername(user),
    avatar_url: getUserAvatarUrl(user),
    updated_at: new Date().toISOString(),
  };
}

export function useUserProfile() {
  const { user, isLoadingUser } = useAuthUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);

  useEffect(() => {
    function refreshProfile() {
      setProfileRefreshKey((currentKey) => currentKey + 1);
    }

    window.addEventListener("statcourt-profile-updated", refreshProfile);

    return () => {
      window.removeEventListener("statcourt-profile-updated", refreshProfile);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      if (isLoadingUser) return;

      setIsLoadingProfile(true);

      if (!user) {
        setProfile(null);
        setIsLoadingProfile(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("display_name, username, avatar_url, public_profile_enabled")
        .eq("id", user.id)
        .maybeSingle();

      if (!isActive) return;

      if (error) {
        console.warn("Failed to load user profile", error);
        setProfile(mapRowToProfile(null, user));
        setIsLoadingProfile(false);
        return;
      }

      if (data) {
        setProfile(mapRowToProfile(data as UserProfileRow, user));
        setIsLoadingProfile(false);
        return;
      }

      const { data: insertedProfile, error: insertError } = await supabase
        .from("user_profiles")
        .upsert(getProfileSeed(user), { onConflict: "id" })
        .select("display_name, username, avatar_url, public_profile_enabled")
        .single();

      if (!isActive) return;

      if (insertError) {
        console.warn("Failed to create user profile", insertError);
        setProfile(mapRowToProfile(null, user));
      } else {
        setProfile(mapRowToProfile(insertedProfile as UserProfileRow, user));
      }

      setIsLoadingProfile(false);
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [isLoadingUser, profileRefreshKey, user]);

  const displayName = profile?.displayName ?? getUserDisplayName(user);
  const username = profile?.username ?? getMetadataUsername(user);
  const avatarUrl = profile?.avatarUrl ?? getUserAvatarUrl(user);
  const initial = useMemo(
    () => displayName.charAt(0).toUpperCase() || getUserInitial(user),
    [displayName, user],
  );

  return {
    user,
    isLoadingUser,
    profile,
    displayName,
    username,
    avatarUrl,
    initial,
    isLoadingProfile,
  };
}
