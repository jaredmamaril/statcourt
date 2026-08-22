import { NextResponse } from "next/server";
import { getAdminContext } from "@/app/lib/admin-auth";
import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
  createUserRateLimitRules,
} from "@/app/lib/rate-limit";
import { cleanText, cleanUuid } from "@/app/lib/input-validation";
import { validateRequestOrigin } from "@/app/lib/request-security";
import {
  getSecurityClientHash,
  getSecurityRequestId,
  logSecurityEvent,
} from "@/app/lib/security-log";

export const runtime = "nodejs";

const ADMIN_REPORT_STATUSES = [
  "open",
  "reviewed",
  "resolved",
  "dismissed",
] as const;

const ADMIN_REPORT_FILTERS = [...ADMIN_REPORT_STATUSES, "all"] as const;
const ADMIN_REPORT_LIMIT = 100;

type AdminReportStatus = (typeof ADMIN_REPORT_STATUSES)[number];
type AdminReportFilter = (typeof ADMIN_REPORT_FILTERS)[number];

type UserReportRow = {
  id: string;
  created_at: string | null;
  reporter_id: string;
  reported_user_id: string;
  reported_username: string | null;
  reason: string;
  details: string | null;
  status: string;
};

type PublicProfileRow = {
  id: string;
  display_name: string | null;
  username: string | null;
};

type ReportStatusRequestBody = {
  reportId?: string;
  status?: string;
};

function isReportStatus(value: string): value is AdminReportStatus {
  return ADMIN_REPORT_STATUSES.includes(value as AdminReportStatus);
}

function getReportFilter(value: string | null): AdminReportFilter {
  const cleanValue = cleanText(value, 24);

  return ADMIN_REPORT_FILTERS.includes(cleanValue as AdminReportFilter)
    ? (cleanValue as AdminReportFilter)
    : "open";
}

function getDisplayProfile(
  profileById: Map<string, PublicProfileRow>,
  userId: string,
  fallbackUsername?: string | null,
) {
  const profile = profileById.get(userId);
  const label =
    profile?.display_name?.trim() ||
    profile?.username?.trim() ||
    fallbackUsername?.trim() ||
    `User ${userId.slice(0, 8)}`;

  return {
    id: userId,
    label,
    username: profile?.username ?? fallbackUsername ?? null,
  };
}

async function checkAdminReportRateLimit(request: Request, userId: string) {
  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "admin-reports-api", {
      perMinute: 60,
      perDay: 1_000,
    }),
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit, {
      request,
      route: "/api/admin/reports",
      action: "admin_reports",
      userId,
      severity: "high",
      persistent: true,
    });
  }

  const userRateLimit = await checkRateLimit(
    createUserRateLimitRules(userId, "admin-reports-api", {
      perMinute: 60,
      perDay: 1_000,
    }),
  );

  if (!userRateLimit.allowed) {
    return createRateLimitResponse(userRateLimit, {
      request,
      route: "/api/admin/reports",
      action: "admin_reports",
      userId,
      severity: "high",
      persistent: true,
    });
  }

  return null;
}

async function getAdminReportsPayload(
  adminContext: Extract<Awaited<ReturnType<typeof getAdminContext>>, { ok: true }>,
  filter: AdminReportFilter,
) {
  let reportQuery = adminContext.adminClient
    .from("user_reports")
    .select(
      "id, created_at, reporter_id, reported_user_id, reported_username, reason, details, status",
    )
    .order("created_at", { ascending: false })
    .limit(ADMIN_REPORT_LIMIT);

  if (filter !== "all") {
    reportQuery = reportQuery.eq("status", filter);
  }

  const [
    { data: reportRows, error: reportError },
    { count: openCount, error: openCountError },
  ] = await Promise.all([
    reportQuery,
    adminContext.adminClient
      .from("user_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
  ]);

  if (reportError || openCountError) {
    console.error("Failed to load admin reports", reportError ?? openCountError);

    return {
      error: NextResponse.json(
        { error: "Could not load reports." },
        { status: 500 },
      ),
    };
  }

  const reports = ((reportRows ?? []) as UserReportRow[]).filter((report) =>
    Boolean(report.id),
  );
  const profileIds = Array.from(
    new Set(
      reports.flatMap((report) => [
        report.reporter_id,
        report.reported_user_id,
      ]),
    ),
  );
  const profileById = new Map<string, PublicProfileRow>();

  if (profileIds.length > 0) {
    const { data: profileRows, error: profileError } =
      await adminContext.adminClient
        .from("public_profiles")
        .select("id, display_name, username")
        .in("id", profileIds);

    if (profileError) {
      console.error("Failed to load report profile labels", profileError);
    }

    ((profileRows ?? []) as PublicProfileRow[]).forEach((profile) => {
      profileById.set(profile.id, profile);
    });
  }

  return {
    reports: reports.map((report) => ({
      ...report,
      reporter: getDisplayProfile(profileById, report.reporter_id),
      reportedUser: getDisplayProfile(
        profileById,
        report.reported_user_id,
        report.reported_username,
      ),
    })),
    openCount: openCount ?? 0,
    limit: ADMIN_REPORT_LIMIT,
  };
}

export async function GET(request: Request) {
  const adminContext = await getAdminContext({
    request,
    route: "/api/admin/reports",
    action: "load_reports",
  });

  if (!adminContext.ok) {
    return NextResponse.json(
      {
        error:
          adminContext.status === 401
            ? "Sign in to access admin reports."
            : "You are not authorized to access admin reports.",
      },
      { status: adminContext.status },
    );
  }

  const rateLimitResponse = await checkAdminReportRateLimit(
    request,
    adminContext.user.id,
  );

  if (rateLimitResponse) return rateLimitResponse;

  const url = new URL(request.url);
  const filter = getReportFilter(url.searchParams.get("status"));
  const payload = await getAdminReportsPayload(adminContext, filter);

  if ("error" in payload) return payload.error;

  return NextResponse.json({
    filter,
    ...payload,
  });
}

export async function PATCH(request: Request) {
  if (!validateRequestOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  }

  const adminContext = await getAdminContext({
    request,
    route: "/api/admin/reports",
    action: "change_report_status",
  });

  if (!adminContext.ok) {
    return NextResponse.json(
      {
        error:
          adminContext.status === 401
            ? "Sign in to update reports."
            : "You are not authorized to update reports.",
      },
      { status: adminContext.status },
    );
  }

  const rateLimitResponse = await checkAdminReportRateLimit(
    request,
    adminContext.user.id,
  );

  if (rateLimitResponse) return rateLimitResponse;

  let body: ReportStatusRequestBody = {};

  try {
    body = (await request.json()) as ReportStatusRequestBody;
  } catch {
    body = {};
  }

  const reportId = cleanUuid(body.reportId);
  const nextStatus = cleanText(body.status, 24);

  if (!reportId || !isReportStatus(nextStatus)) {
    return NextResponse.json(
      { error: "Choose a valid report status." },
      { status: 400 },
    );
  }

  const { data: currentReport, error: currentReportError } =
    await adminContext.adminClient
      .from("user_reports")
      .select("id, status")
      .eq("id", reportId)
      .maybeSingle();

  if (currentReportError) {
    console.error("Failed to load report before status update", currentReportError);

    return NextResponse.json(
      { error: "Could not update report." },
      { status: 500 },
    );
  }

  if (!currentReport) {
    return NextResponse.json(
      { error: "Could not update report." },
      { status: 404 },
    );
  }

  const oldStatus = cleanText(
    (currentReport as { status?: string }).status,
    24,
  );

  const { error: updateError } = await adminContext.adminClient
    .from("user_reports")
    .update({ status: nextStatus })
    .eq("id", reportId);

  if (updateError) {
    console.error("Failed to update report status", updateError);

    return NextResponse.json(
      { error: "Could not update report." },
      { status: 500 },
    );
  }

  void logSecurityEvent({
    eventName: "report_status_changed",
    severity: "medium",
    userId: adminContext.user.id,
    route: "/api/admin/reports",
    action: "change_report_status",
    outcome: "success",
    requestId: getSecurityRequestId(request),
    clientHash: getSecurityClientHash(request),
    metadata: {
      reportId,
      oldStatus,
      newStatus: nextStatus,
    },
  });

  return NextResponse.json({
    ok: true,
    reportId,
    status: nextStatus,
  });
}
