export function getSafeInternalRedirectPath(
  value: string | null | undefined,
  fallbackRedirectPath = "/players",
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/signin") ||
    value.startsWith("/auth/callback") ||
    value.startsWith("/reset-password")
  ) {
    return fallbackRedirectPath;
  }

  return value;
}
