import { NextResponse } from "next/server";
import { getAdminContext } from "@/app/lib/admin-auth";
import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
  createUserRateLimitRules,
} from "@/app/lib/rate-limit";

export const runtime = "nodejs";

async function checkAdminNotificationRateLimit(request: Request, userId: string) {
  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "admin-report-notifications-api", {
      perMinute: 120,
      perDay: 2_000,
    }),
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit, {
      request,
      route: "/api/admin/report-notifications",
      action: "load_report_notifications",
      userId,
      severity: "medium",
      persistent: true,
    });
  }

  const userRateLimit = await checkRateLimit(
    createUserRateLimitRules(userId, "admin-report-notifications-api", {
      perMinute: 120,
      perDay: 2_000,
    }),
  );

  if (!userRateLimit.allowed) {
    return createRateLimitResponse(userRateLimit, {
      request,
      route: "/api/admin/report-notifications",
      action: "load_report_notifications",
      userId,
      severity: "medium",
      persistent: true,
    });
  }

  return null;
}

export async function GET(request: Request) {
  const adminContext = await getAdminContext({
    request,
    route: "/api/admin/report-notifications",
    action: "load_report_notifications",
    unauthorizedEventName: "unauthorized_admin_notification_access",
  });

  if (!adminContext.ok) {
    return NextResponse.json(
      {
        error:
          adminContext.status === 401
            ? "Sign in to access admin notifications."
            : "You are not authorized to access admin notifications.",
      },
      { status: adminContext.status },
    );
  }

  const rateLimitResponse = await checkAdminNotificationRateLimit(
    request,
    adminContext.user.id,
  );

  if (rateLimitResponse) return rateLimitResponse;

  const { count, error } = await adminContext.adminClient
    .from("user_reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");

  if (error) {
    console.error("Failed to load admin report notification count", error);

    return NextResponse.json(
      { error: "Could not load admin notifications." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    openReportCount: count ?? 0,
  });
}
