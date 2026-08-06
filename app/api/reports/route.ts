import { createClient } from "@supabase/supabase-js";
import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
  createUserRateLimitRules,
} from "@/app/lib/rate-limit";

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

function getSupabaseServerConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return null;
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
  };
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "profile-report-api", {
      perHour: 5,
      perDay: 20,
    }),
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit);
  }

  const config = getSupabaseServerConfig();

  if (!config) {
    return Response.json(
      { error: "Reports are not configured on the server." },
      { status: 500 },
    );
  }

  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.replace(/^Bearer\s+/i, "");

  if (!accessToken) {
    return Response.json(
      { error: "Sign in to report this profile." },
      { status: 401 },
    );
  }

  const userClient = createClient(
    config.supabaseUrl,
    config.supabaseAnonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    },
  );

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
    return createRateLimitResponse(userRateLimit);
  }

  let body: ReportRequestBody = {};

  try {
    body = (await request.json()) as ReportRequestBody;
  } catch {
    body = {};
  }

  const reportedUserId = cleanText(body.reportedUserId, 80);
  const reportedUsername =
    cleanText(body.reportedUsername, MAX_USERNAME_LENGTH) || null;
  const reason = cleanText(body.reason, MAX_REASON_LENGTH);
  const details = cleanText(body.details, MAX_REPORT_DETAILS_LENGTH) || null;

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

  const adminClient = createClient(
    config.supabaseUrl,
    config.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const { error } = await adminClient.from("user_reports").insert({
    reporter_id: user.id,
    reported_user_id: reportedUserId,
    reported_username: reportedUsername,
    reason,
    details,
    status: "open",
  });

  if (error) {
    return Response.json(
      { error: "Could not send report." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
