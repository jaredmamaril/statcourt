import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase-client";

export type UserActivityType =
  | "view_player"
  | "view_lineup"
  | "save_lineup"
  | "delete_lineup"
  | "scout_lineup"
  | "compare_players"
  | "search"
  | "favorite_player"
  | "unfavorite_player";

type UserActivityInput = {
  user: User | null;
  activityType: UserActivityType;
  label: string;
  href?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logUserActivity({
  user,
  activityType,
  label,
  href = null,
  metadata = {},
}: UserActivityInput) {
  if (!user) return;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) return;

  const response = await fetch("/api/activity", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      activityType,
      label,
      href,
      metadata,
    }),
  });

  if (!response.ok) {
    const result = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    console.error("Failed to log user activity", result.error ?? response.status);
    return;
  }
}
