import "server-only";

import { createHash } from "crypto";
import { cleanText, cleanUuid } from "./input-validation";
import {
  createSupabaseAdminClient,
  getSupabaseServerConfig,
} from "./supabase-server";

type SecurityEventSeverity = "low" | "medium" | "high" | "critical";
type SecurityEventOutcome = "success" | "blocked" | "failed";

type SecurityEventInput = {
  eventName: string;
  severity: SecurityEventSeverity;
  userId?: string | null;
  route?: string | null;
  action?: string | null;
  outcome: SecurityEventOutcome;
  reasonCode?: string | null;
  requestId?: string | null;
  clientHash?: string | null;
  metadata?: Record<string, unknown>;
};

const SENSITIVE_METADATA_KEY_PATTERN =
  /token|authorization|cookie|password|secret|oauth|code|session|credential/i;

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    firstForwardedIp ||
    null
  );
}

function sanitizeMetadataValue(value: unknown) {
  if (typeof value === "string") return cleanText(value, 160);
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "boolean") return value;

  return null;
}

function sanitizeMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const metadata: Record<string, string | number | boolean | null> = {};

  Object.entries(value as Record<string, unknown>)
    .slice(0, 20)
    .forEach(([key, entryValue]) => {
      const cleanKey = cleanText(key, 60);

      if (!cleanKey || SENSITIVE_METADATA_KEY_PATTERN.test(cleanKey)) return;

      metadata[cleanKey] = sanitizeMetadataValue(entryValue);
    });

  return metadata;
}

export function getSecurityClientHash(request: Request) {
  const salt = process.env.SECURITY_EVENT_SALT;
  const clientIp = getClientIp(request);

  if (!salt || !clientIp) return null;

  return createHash("sha256")
    .update(`${salt}:${clientIp}`)
    .digest("hex");
}

export function getSecurityRequestId(request: Request) {
  return cleanText(
    request.headers.get("x-request-id") ||
      request.headers.get("x-vercel-id") ||
      request.headers.get("cf-ray"),
    120,
  ) || null;
}

export async function logSecurityEvent({
  eventName,
  severity,
  userId = null,
  route = null,
  action = null,
  outcome,
  reasonCode = null,
  requestId = null,
  clientHash = null,
  metadata = {},
}: SecurityEventInput) {
  try {
    const config = getSupabaseServerConfig();

    if (!config) return;

    const adminClient = createSupabaseAdminClient(config);
    const { error } = await adminClient.from("security_events").insert({
      event_name: cleanText(eventName, 80),
      severity,
      user_id: userId ? cleanUuid(userId) || null : null,
      route: cleanText(route, 160) || null,
      action: cleanText(action, 80) || null,
      outcome,
      reason_code: cleanText(reasonCode, 80) || null,
      request_id: cleanText(requestId, 120) || null,
      client_hash: cleanText(clientHash, 128) || null,
      metadata: sanitizeMetadata(metadata),
    });

    if (error) {
      console.error("Failed to persist security event", error);
    }
  } catch (error) {
    console.error("Security event logger failed", error);
  }
}
