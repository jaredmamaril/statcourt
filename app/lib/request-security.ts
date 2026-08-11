import "server-only";

function normalizeOrigin(value: string | undefined) {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins() {
  const configuredSiteOrigin = normalizeOrigin(
    process.env.NEXT_PUBLIC_SITE_URL,
  );
  const developmentOrigins =
    process.env.NODE_ENV === "development"
      ? ["http://localhost:3000", "http://127.0.0.1:3000"]
      : [];

  return new Set(
    [configuredSiteOrigin, ...developmentOrigins].filter(
      (origin): origin is string => Boolean(origin),
    ),
  );
}

export function validateRequestOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);

  if (!normalizedOrigin) return false;

  return getAllowedOrigins().has(normalizedOrigin);
}
