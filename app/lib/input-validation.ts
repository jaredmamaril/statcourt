import "server-only";

const CONTROL_OR_HTML_CHARS = /[\u0000-\u001F\u007F<>]/g;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";

  return value
    .replace(CONTROL_OR_HTML_CHARS, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function cleanNullableText(value: unknown, maxLength: number) {
  const text = cleanText(value, maxLength);

  return text || null;
}

export function cleanPlayerName(value: unknown) {
  return cleanText(value, 120);
}

export function cleanUuid(value: unknown) {
  const id = cleanText(value, 80);

  return UUID_PATTERN.test(id) ? id : "";
}

export function cleanNumber(
  value: unknown,
  options: {
    min?: number;
    max?: number;
    fallback?: number;
    decimals?: number;
  } = {},
) {
  const numberValue = Number(value);
  const fallback = options.fallback ?? 0;

  if (!Number.isFinite(numberValue)) return fallback;

  const min = options.min ?? Number.NEGATIVE_INFINITY;
  const max = options.max ?? Number.POSITIVE_INFINITY;
  const clamped = Math.max(min, Math.min(max, numberValue));
  const decimals = options.decimals ?? 1;

  return Number(clamped.toFixed(decimals));
}

export function cleanStringArray(
  value: unknown,
  options: {
    maxItems: number;
    maxLength: number;
  },
) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => cleanText(item, options.maxLength))
    .filter(Boolean)
    .slice(0, options.maxItems);
}

export function cleanPath(value: unknown, maxLength = 300) {
  const href = cleanText(value, maxLength);

  if (!href || !href.startsWith("/") || href.startsWith("//")) return null;

  return href;
}

export function cleanRecordOfStrings(
  value: unknown,
  allowedKeys: readonly string[],
  maxLength: number,
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const input = value as Record<string, unknown>;

  return allowedKeys.reduce<Record<string, string>>((result, key) => {
    const text = cleanText(input[key], maxLength);

    if (text) result[key] = text;

    return result;
  }, {});
}

export function cleanMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const input = value as Record<string, unknown>;
  const metadata: Record<string, string | number | boolean> = {};

  Object.entries(input)
    .slice(0, 10)
    .forEach(([key, entryValue]) => {
      const cleanKey = cleanText(key, 40);

      if (!cleanKey) return;

      metadata[cleanKey] =
        typeof entryValue === "number" || typeof entryValue === "boolean"
          ? entryValue
          : cleanText(entryValue, 120);
    });

  return metadata;
}
