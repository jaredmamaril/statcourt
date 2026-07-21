import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

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

export async function POST(request: Request) {
  const config = getSupabaseServerConfig();

  if (!config) {
    return Response.json(
      { error: "Delete account is not configured on the server." },
      { status: 500 },
    );
  }

  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.replace(/^Bearer\s+/i, "");

  if (!accessToken) {
    return Response.json(
      { error: "Sign in again before deleting your account." },
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
