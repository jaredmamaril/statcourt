import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
  createUserRateLimitRules,
} from "@/app/lib/rate-limit";
import {
  createSupabaseAdminClient,
  createSupabaseUserClient,
  getBearerToken,
  getSupabaseServerConfig,
} from "@/app/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "account-delete-api", {
      perHour: 5,
      perDay: 10,
    }),
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit);
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
    return createRateLimitResponse(userRateLimit);
  }

  let body: { confirm?: string } = {};

  try {
    body = (await request.json()) as { confirm?: string };
  } catch {
    body = {};
  }

  if (body.confirm !== "DELETE") {
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
    return Response.json(
      { error: deleteUserError.message || "Could not delete account." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
