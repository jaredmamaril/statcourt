import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
  createUserRateLimitRules,
} from "@/app/lib/rate-limit";
import { cleanText } from "@/app/lib/input-validation";
import {
  getSecurityClientHash,
  getSecurityRequestId,
  logSecurityEvent,
} from "@/app/lib/security-log";
import { validateRequestOrigin } from "@/app/lib/request-security";
import {
  createSupabaseAdminClient,
  createSupabaseUserClient,
  getBearerToken,
  getSupabaseServerConfig,
} from "@/app/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!validateRequestOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "account-delete-api", {
      perHour: 5,
      perDay: 10,
    }),
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit, {
      request,
      route: "/api/account/delete",
      action: "delete_account",
      severity: "high",
      persistent: true,
    });
  }

  const config = getSupabaseServerConfig();

  if (!config) {
    return Response.json(
      { error: "Delete account is not configured on the server." },
      { status: 500 },
    );
  }

  const accessToken = getBearerToken(request);

  if (!accessToken) {
    void logSecurityEvent({
      eventName: "unauthorized_api_access",
      severity: "high",
      route: "/api/account/delete",
      action: "delete_account",
      outcome: "blocked",
      reasonCode: "missing_access_token",
      requestId: getSecurityRequestId(request),
      clientHash: getSecurityClientHash(request),
    });

    return Response.json(
      { error: "Sign in again before deleting your account." },
      { status: 401 },
    );
  }

  const userClient = createSupabaseUserClient(config, accessToken);

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser(accessToken);

  if (userError || !user) {
    void logSecurityEvent({
      eventName: "unauthorized_api_access",
      severity: "high",
      route: "/api/account/delete",
      action: "delete_account",
      outcome: "blocked",
      reasonCode: "invalid_access_token",
      requestId: getSecurityRequestId(request),
      clientHash: getSecurityClientHash(request),
    });

    return Response.json(
      { error: "Could not verify your signed-in account." },
      { status: 401 },
    );
  }

  const userRateLimit = await checkRateLimit(
    createUserRateLimitRules(user.id, "account-delete-api", {
      perHour: 3,
      perDay: 3,
    }),
  );

  if (!userRateLimit.allowed) {
    return createRateLimitResponse(userRateLimit, {
      request,
      route: "/api/account/delete",
      action: "delete_account",
      userId: user.id,
      severity: "high",
      persistent: true,
    });
  }

  let body: { confirm?: string } = {};

  try {
    body = (await request.json()) as { confirm?: string };
  } catch {
    body = {};
  }

  if (cleanText(body.confirm, 20) !== "DELETE") {
    return Response.json(
      { error: "Type DELETE to confirm account deletion." },
      { status: 400 },
    );
  }

  const adminClient = createSupabaseAdminClient(config);

  const avatarFilesResponse = await adminClient.storage
    .from("avatars")
    .list(user.id);
  const avatarFilesToRemove =
    avatarFilesResponse.data?.map((file) => `${user.id}/${file.name}`) ?? [];

  await Promise.all([
    adminClient.from("saved_lineups").delete().eq("user_id", user.id),
    adminClient.from("favorite_players").delete().eq("user_id", user.id),
    adminClient.from("recent_players").delete().eq("user_id", user.id),
    adminClient.from("user_compare_slots").delete().eq("user_id", user.id),
    adminClient.from("user_activity").delete().eq("user_id", user.id),
    adminClient.from("user_settings").delete().eq("user_id", user.id),
    adminClient.from("user_signins").delete().eq("user_id", user.id),
    adminClient.from("user_devices").delete().eq("user_id", user.id),
    adminClient.from("user_profiles").delete().eq("id", user.id),
    avatarFilesToRemove.length
      ? adminClient.storage.from("avatars").remove(avatarFilesToRemove)
      : Promise.resolve(),
  ]);

  const { error: deleteUserError } =
    await adminClient.auth.admin.deleteUser(user.id);

  if (deleteUserError) {
    console.error("Failed to delete Supabase auth user", deleteUserError);
    void logSecurityEvent({
      eventName: "account_deletion",
      severity: "critical",
      userId: user.id,
      route: "/api/account/delete",
      action: "delete_account",
      outcome: "failed",
      reasonCode: "auth_user_delete_failed",
      requestId: getSecurityRequestId(request),
      clientHash: getSecurityClientHash(request),
    });

    return Response.json(
      { error: "Could not delete account." },
      { status: 500 },
    );
  }

  void logSecurityEvent({
    eventName: "account_deletion",
    severity: "critical",
    userId: user.id,
    route: "/api/account/delete",
    action: "delete_account",
    outcome: "success",
    requestId: getSecurityRequestId(request),
    clientHash: getSecurityClientHash(request),
  });

  return Response.json({ ok: true });
}
