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

type FollowRequestBody = {
  followingId?: string;
};

function cleanUserId(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 80) : "";
}

async function getRequestContext(request: Request) {
  const config = getSupabaseServerConfig();

  if (!config) {
    return {
      error: Response.json(
        { error: "Follows are not configured on the server." },
        { status: 500 },
      ),
    };
  }

  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return {
      error: Response.json(
        { error: "Sign in to follow profiles." },
        { status: 401 },
      ),
    };
  }

  const userClient = createSupabaseUserClient(config, accessToken);

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser(accessToken);

  if (userError || !user) {
    return {
      error: Response.json(
        { error: "Could not verify your signed-in account." },
        { status: 401 },
      ),
    };
  }

  const adminClient = createSupabaseAdminClient(config);

  return {
    adminClient,
    user,
  };
}

async function getFollowingId(request: Request) {
  let body: FollowRequestBody = {};

  try {
    body = (await request.json()) as FollowRequestBody;
  } catch {
    body = {};
  }

  return cleanUserId(body.followingId);
}

async function checkFollowRateLimit(request: Request, userId: string) {
  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "profile-follow-api", {
      perHour: 30,
      perDay: 100,
    }),
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit);
  }

  const userRateLimit = await checkRateLimit(
    createUserRateLimitRules(userId, "profile-follow-api", {
      perHour: 20,
      perDay: 80,
    }),
  );

  if (!userRateLimit.allowed) {
    return createRateLimitResponse(userRateLimit);
  }

  return null;
}

export async function POST(request: Request) {
  const context = await getRequestContext(request);

  if ("error" in context) return context.error;

  const rateLimitResponse = await checkFollowRateLimit(request, context.user.id);

  if (rateLimitResponse) return rateLimitResponse;

  const followingId = await getFollowingId(request);

  if (!followingId) {
    return Response.json(
      { error: "Choose a profile to follow." },
      { status: 400 },
    );
  }

  if (followingId === context.user.id) {
    return Response.json(
      { error: "You cannot follow your own profile." },
      { status: 400 },
    );
  }

  const { error } = await context.adminClient.from("user_follows").insert({
    follower_id: context.user.id,
    following_id: followingId,
  });

  if (error) {
    return Response.json(
      {
        error:
          error.code === "23505" ? "Already following" : "Could not follow.",
      },
      { status: error.code === "23505" ? 409 : 500 },
    );
  }

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const context = await getRequestContext(request);

  if ("error" in context) return context.error;

  const rateLimitResponse = await checkFollowRateLimit(request, context.user.id);

  if (rateLimitResponse) return rateLimitResponse;

  const followingId = await getFollowingId(request);

  if (!followingId) {
    return Response.json(
      { error: "Choose a profile to unfollow." },
      { status: 400 },
    );
  }

  const { error } = await context.adminClient
    .from("user_follows")
    .delete()
    .eq("follower_id", context.user.id)
    .eq("following_id", followingId);

  if (error) {
    return Response.json(
      { error: "Could not unfollow." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
