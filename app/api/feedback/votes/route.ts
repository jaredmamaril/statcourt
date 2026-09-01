import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
  createUserRateLimitRules,
} from "@/app/lib/rate-limit";
import { cleanUuid } from "@/app/lib/input-validation";
import {
  createSupabaseAdminClient,
  createSupabaseUserClient,
  getBearerToken,
  getSupabaseServerConfig,
} from "@/app/lib/supabase-server";
import { validateRequestOrigin } from "@/app/lib/request-security";

export const runtime = "nodejs";

type FeedbackVoteRequestBody = {
  feedbackItemId?: string;
};

async function getRequestContext(request: Request) {
  const config = getSupabaseServerConfig();

  if (!config) {
    return {
      error: Response.json(
        { error: "Feedback voting is not configured on the server." },
        { status: 500 },
      ),
    };
  }

  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return {
      error: Response.json(
        { error: "Sign in to vote on feedback." },
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

  return {
    adminClient: createSupabaseAdminClient(config),
    user,
  };
}

async function getFeedbackItemId(request: Request) {
  let body: FeedbackVoteRequestBody = {};

  try {
    body = (await request.json()) as FeedbackVoteRequestBody;
  } catch {
    body = {};
  }

  return cleanUuid(body.feedbackItemId);
}

async function checkFeedbackVoteRateLimit(request: Request, userId: string) {
  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "feedback-vote-api", {
      perHour: 240,
      perDay: 1_000,
    }),
  );

  if (!ipRateLimit.allowed) return createRateLimitResponse(ipRateLimit);

  const userRateLimit = await checkRateLimit(
    createUserRateLimitRules(userId, "feedback-vote-api", {
      perHour: 120,
      perDay: 500,
    }),
  );

  if (!userRateLimit.allowed) return createRateLimitResponse(userRateLimit);

  return null;
}

export async function POST(request: Request) {
  if (!validateRequestOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const context = await getRequestContext(request);

  if ("error" in context) return context.error;

  const rateLimitResponse = await checkFeedbackVoteRateLimit(
    request,
    context.user.id,
  );

  if (rateLimitResponse) return rateLimitResponse;

  const feedbackItemId = await getFeedbackItemId(request);

  if (!feedbackItemId) {
    return Response.json(
      { error: "Choose feedback to vote on." },
      { status: 400 },
    );
  }

  const { error } = await context.adminClient.from("feedback_votes").upsert(
    {
      feedback_item_id: feedbackItemId,
      user_id: context.user.id,
    },
    { onConflict: "feedback_item_id,user_id" },
  );

  if (error) {
    console.error("Failed to vote on feedback", error);

    return Response.json(
      { error: "Could not update feedback vote." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!validateRequestOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const context = await getRequestContext(request);

  if ("error" in context) return context.error;

  const rateLimitResponse = await checkFeedbackVoteRateLimit(
    request,
    context.user.id,
  );

  if (rateLimitResponse) return rateLimitResponse;

  const feedbackItemId = await getFeedbackItemId(request);

  if (!feedbackItemId) {
    return Response.json(
      { error: "Choose feedback to remove your vote from." },
      { status: 400 },
    );
  }

  const { error } = await context.adminClient
    .from("feedback_votes")
    .delete()
    .eq("feedback_item_id", feedbackItemId)
    .eq("user_id", context.user.id);

  if (error) {
    console.error("Failed to remove feedback vote", error);

    return Response.json(
      { error: "Could not update feedback vote." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
