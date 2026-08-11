import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
  createUserRateLimitRules,
} from "@/app/lib/rate-limit";
import {
  cleanNullableText,
  cleanText,
  cleanUuid,
} from "@/app/lib/input-validation";
import {
  getSecurityClientHash,
  getSecurityRequestId,
  logSecurityEvent,
} from "@/app/lib/security-log";
import {
  createSupabaseAdminClient,
  createSupabaseUserClient,
  getBearerToken,
  getSupabaseServerConfig,
} from "@/app/lib/supabase-server";
import { validateRequestOrigin } from "@/app/lib/request-security";

export const runtime = "nodejs";

const MAX_REPORT_DETAILS_LENGTH = 1_000;
const MAX_REASON_LENGTH = 120;
const MAX_USERNAME_LENGTH = 80;

type ReportRequestBody = {
  reportedUserId?: string;
  reportedUsername?: string | null;
  reason?: string;
  details?: string | null;
};

export async function POST(request: Request) {
  if (!validateRequestOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "profile-report-api", {
      perHour: 5,
      perDay: 20,
    }),
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit, {
      request,
      route: "/api/reports",
      action: "create_report",
      severity: "medium",
      persistent: true,
    });
  }

  const config = getSupabaseServerConfig();

  if (!config) {
    return Response.json(
      { error: "Reports are not configured on the server." },
      { status: 500 },
    );
  }

  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return Response.json(
      { error: "Sign in to report this profile." },
      { status: 401 },
    );
  }

  const userClient = createSupabaseUserClient(config, accessToken);

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser(accessToken);

  if (userError || !user) {
    return Response.json(
      { error: "Could not verify your signed-in account." },
      { status: 401 },
    );
  }

  const userRateLimit = await checkRateLimit(
    createUserRateLimitRules(user.id, "profile-report-api", {
      perHour: 3,
      perDay: 10,
    }),
  );

  if (!userRateLimit.allowed) {
    return createRateLimitResponse(userRateLimit, {
      request,
      route: "/api/reports",
      action: "create_report",
      userId: user.id,
      severity: "medium",
      persistent: true,
    });
  }

  let body: ReportRequestBody = {};

  try {
    body = (await request.json()) as ReportRequestBody;
  } catch {
    body = {};
  }

  const reportedUserId = cleanUuid(body.reportedUserId);
  const reportedUsername = cleanNullableText(
    body.reportedUsername,
    MAX_USERNAME_LENGTH,
  );
  const reason = cleanText(body.reason, MAX_REASON_LENGTH);
  const details = cleanNullableText(
    body.details,
    MAX_REPORT_DETAILS_LENGTH,
  );

  if (!reportedUserId || !reason) {
    return Response.json(
      { error: "Choose a report reason before submitting." },
      { status: 400 },
    );
  }

  if (reportedUserId === user.id) {
    return Response.json(
      { error: "You cannot report your own profile." },
      { status: 400 },
    );
  }

  const adminClient = createSupabaseAdminClient(config);

  const { error } = await adminClient.from("user_reports").insert({
    reporter_id: user.id,
    reported_user_id: reportedUserId,
    reported_username: reportedUsername,
    reason,
    details,
    status: "open",
  });

  if (error) {
    if (error.code === "23505") {
      void logSecurityEvent({
        eventName: "user_report",
        severity: "medium",
        userId: user.id,
        route: "/api/reports",
        action: "create_report",
        outcome: "blocked",
        reasonCode: "duplicate_open_report",
        requestId: getSecurityRequestId(request),
        clientHash: getSecurityClientHash(request),
        metadata: {
          reason,
        },
      });

      return Response.json(
        { error: "Report already submitted." },
        { status: 409 },
      );
    }

    return Response.json(
      { error: "Could not send report." },
      { status: 500 },
    );
  }

  void logSecurityEvent({
    eventName: "user_report",
    severity: "medium",
    userId: user.id,
    route: "/api/reports",
    action: "create_report",
    outcome: "success",
    requestId: getSecurityRequestId(request),
    clientHash: getSecurityClientHash(request),
    metadata: {
      reason,
    },
  });

  return Response.json({ ok: true });
}
