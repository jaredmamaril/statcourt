import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase-client";

const USER_ACTIVITY_LIMIT = 20;

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

  const { error } = await supabase.from("user_activity").insert({
    user_id: user.id,
    activity_type: activityType,
    label,
    href,
    metadata,
  });

  if (error) {
    console.error("Failed to log user activity", error);
    return;
  }

  const { data: activityRows, error: loadError } = await supabase
    .from("user_activity")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(USER_ACTIVITY_LIMIT, USER_ACTIVITY_LIMIT + 99);

  if (loadError) {
    console.error("Failed to load old user activity", loadError);
    return;
  }

  const oldActivityIds = (activityRows ?? []).map((row) => row.id);

  if (oldActivityIds.length === 0) return;

  const { error: deleteError } = await supabase
    .from("user_activity")
    .delete()
    .in("id", oldActivityIds);

  if (deleteError) {
    console.error("Failed to delete old user activity", deleteError);
  }
}
