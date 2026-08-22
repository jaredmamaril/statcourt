import "server-only";

import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "./supabase-ssr";
import {
  createSupabaseAdminClient,
  createSupabaseUserClient,
  getBearerToken,
  getSupabaseServerConfig,
} from "./supabase-server";
import {
  getSecurityClientHash,
  getSecurityRequestId,
  logSecurityEvent,
} from "./security-log";

type AdminAuthFailureReason =
  | "server_not_configured"
  | "unauthenticated"
  | "unauthorized";

type AdminAuthFailure = {
  ok: false;
  status: 401 | 403 | 500;
  reason: AdminAuthFailureReason;
  userId?: string | null;
};

export type AdminContext = {
  ok: true;
  adminClient: ReturnType<typeof createSupabaseAdminClient>;
  user: User;
};

type AdminContextOptions = {
  request?: Request;
  route: string;
  action: string;
  unauthorizedEventName?: string;
};

function logUnauthorizedAdminAccess({
  request,
  route,
  action,
  reason,
  unauthorizedEventName = "unauthorized_admin_access",
  userId = null,
}: AdminContextOptions & {
  reason: AdminAuthFailureReason;
  userId?: string | null;
}) {
  void logSecurityEvent({
    eventName: unauthorizedEventName,
    severity: reason === "unauthorized" ? "high" : "medium",
    userId,
    route,
    action,
    outcome: "blocked",
    reasonCode: reason,
    requestId: request ? getSecurityRequestId(request) : null,
    clientHash: request ? getSecurityClientHash(request) : null,
  });
}

export async function getAdminContext({
  request,
  route,
  action,
  unauthorizedEventName,
}: AdminContextOptions): Promise<AdminContext | AdminAuthFailure> {
  const config = getSupabaseServerConfig();

  if (!config) {
    logUnauthorizedAdminAccess({
      request,
      route,
      action,
      unauthorizedEventName,
      reason: "server_not_configured",
    });

    return {
      ok: false,
      status: 500,
      reason: "server_not_configured",
    };
  }

  let user: User | null = null;

  if (request) {
    const accessToken = getBearerToken(request);

    if (!accessToken) {
      logUnauthorizedAdminAccess({
        request,
        route,
        action,
        unauthorizedEventName,
        reason: "unauthenticated",
      });

      return {
        ok: false,
        status: 401,
        reason: "unauthenticated",
      };
    }

    const userClient = createSupabaseUserClient(config, accessToken);
    const {
      data: { user: requestUser },
      error,
    } = await userClient.auth.getUser(accessToken);

    if (error || !requestUser) {
      logUnauthorizedAdminAccess({
        request,
        route,
        action,
        unauthorizedEventName,
        reason: "unauthenticated",
      });

      return {
        ok: false,
        status: 401,
        reason: "unauthenticated",
      };
    }

    user = requestUser;
  } else {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: serverUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !serverUser) {
      logUnauthorizedAdminAccess({
        route,
        action,
        unauthorizedEventName,
        reason: "unauthenticated",
      });

      return {
        ok: false,
        status: 401,
        reason: "unauthenticated",
      };
    }

    user = serverUser;
  }

  const adminClient = createSupabaseAdminClient(config);
  const { data: adminRow, error: adminError } = await adminClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !adminRow) {
    logUnauthorizedAdminAccess({
      request,
      route,
      action,
      unauthorizedEventName,
      reason: "unauthorized",
      userId: user.id,
    });

    return {
      ok: false,
      status: 403,
      reason: "unauthorized",
      userId: user.id,
    };
  }

  return {
    ok: true,
    adminClient,
    user,
  };
}
