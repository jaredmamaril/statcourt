import type { User } from "@supabase/supabase-js";

function getStringMetadataValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function getUserDisplayName(user: User | null) {
  return (
    getStringMetadataValue(user?.user_metadata?.name) ??
    getStringMetadataValue(user?.user_metadata?.full_name) ??
    user?.email?.split("@")[0] ??
    "Player"
  );
}

export function getUserInitial(user: User | null) {
  return getUserDisplayName(user).charAt(0).toUpperCase();
}

export function getUserAvatarUrl(user: User | null) {
  return (
    getStringMetadataValue(user?.user_metadata?.avatar_url) ??
    getStringMetadataValue(user?.user_metadata?.picture)
  );
}

export function hasConnectedProvider(user: User | null, provider: string) {
  return (
    user?.identities?.some((identity) => identity.provider === provider) ??
    false
  );
}

export function getPrimaryAuthProviderLabel(user: User | null) {
  const provider = getStringMetadataValue(user?.app_metadata?.provider);

  if (provider === "email") return "Email/password";
  if (provider === "google") return "Google";

  return provider ?? "Not connected";
}

export function getAuthProviderLabel(user: User | null) {
  const primaryProvider = getPrimaryAuthProviderLabel(user);
  const hasGoogleProvider = hasConnectedProvider(user, "google");

  if (hasGoogleProvider && primaryProvider === "Google") return "Google";
  if (hasGoogleProvider) return `${primaryProvider} + Google`;

  return primaryProvider;
}
