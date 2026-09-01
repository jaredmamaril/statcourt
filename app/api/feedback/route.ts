import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
  createUserRateLimitRules,
} from "@/app/lib/rate-limit";
import { cleanPath, cleanText } from "@/app/lib/input-validation";
import {
  createSupabaseAdminClient,
  createSupabaseUserClient,
  getBearerToken,
  getSupabaseServerConfig,
} from "@/app/lib/supabase-server";
import { validateRequestOrigin } from "@/app/lib/request-security";

export const runtime = "nodejs";

const FEEDBACK_TYPES = [
  "bug",
  "feature_request",
  "ui_design",
  "data_issue",
  "other",
] as const;

const MAX_TITLE_LENGTH = 120;
const MAX_DETAILS_LENGTH = 1200;
const MAX_ITEMS = 30;

type FeedbackType = (typeof FEEDBACK_TYPES)[number];

type FeedbackRequestBody = {
  type?: string;
  title?: string;
  details?: string;
  pageUrl?: string | null;
};

function isFeedbackType(value: string): value is FeedbackType {
  return FEEDBACK_TYPES.includes(value as FeedbackType);
}

async function getRequestContext(request: Request) {
  const config = getSupabaseServerConfig();

  if (!config) {
    return {
      error: Response.json(
        { error: "Feedback is not configured on the server." },
        { status: 500 },
      ),
    };
  }

  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return {
      error: Response.json(
        { error: "Sign in to send feedback." },
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

async function getOptionalUserId(request: Request) {
  const config = getSupabaseServerConfig();
  const accessToken = getBearerToken(request);

  if (!config || !accessToken) return null;

  const userClient = createSupabaseUserClient(config, accessToken);
  const {
    data: { user },
  } = await userClient.auth.getUser(accessToken);

  return user?.id ?? null;
}

export async function GET(request: Request) {
  const config = getSupabaseServerConfig();

  if (!config) {
    return Response.json(
      { error: "Feedback is not configured on the server." },
      { status: 500 },
    );
  }

  const rateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "feedback-list-api", {
      perMinute: 120,
      perDay: 2_000,
    }),
  );

  if (!rateLimit.allowed) return createRateLimitResponse(rateLimit);

  const adminClient = createSupabaseAdminClient(config);
  const userId = await getOptionalUserId(request);

  const [{ data: items, error: itemsError }, { data: counts, error: countsError }] =
    await Promise.all([
      adminClient
        .from("public_feedback_items")
        .select("id,type,title,details,status,created_at,updated_at")
        .order("created_at", { ascending: false })
        .limit(MAX_ITEMS),
      adminClient
        .from("public_feedback_vote_counts")
        .select("feedback_item_id,vote_count"),
    ]);

  if (itemsError || countsError) {
    console.error("Failed to load feedback", itemsError ?? countsError);

    return Response.json(
      { error: "Could not load feedback." },
      { status: 500 },
    );
  }

  const voteCounts = new Map(
    (counts ?? []).map((count) => [
      count.feedback_item_id as string,
      Number(count.vote_count ?? 0),
    ]),
  );
  let votedFeedbackIds = new Set<string>();

  if (userId && items?.length) {
    const itemIds = items.map((item) => item.id);
    const { data: votes, error: votesError } = await adminClient
      .from("feedback_votes")
      .select("feedback_item_id")
      .eq("user_id", userId)
      .in("feedback_item_id", itemIds);

    if (votesError) {
      console.error("Failed to load feedback vote state", votesError);
    } else {
      votedFeedbackIds = new Set(
        (votes ?? []).map((vote) => vote.feedback_item_id as string),
      );
    }
  }

  return Response.json({
    items: (items ?? []).map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      details: item.details,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      voteCount: voteCounts.get(item.id) ?? 0,
      hasVoted: votedFeedbackIds.has(item.id),
    })),
  });
}

export async function POST(request: Request) {
  if (!validateRequestOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const context = await getRequestContext(request);

  if ("error" in context) return context.error;

  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "feedback-create-api", {
      perHour: 20,
      perDay: 50,
    }),
  );

  if (!ipRateLimit.allowed) return createRateLimitResponse(ipRateLimit);

  const userRateLimit = await checkRateLimit(
    createUserRateLimitRules(context.user.id, "feedback-create-api", {
      perHour: 8,
      perDay: 20,
    }),
  );

  if (!userRateLimit.allowed) return createRateLimitResponse(userRateLimit);

  let body: FeedbackRequestBody = {};

  try {
    body = (await request.json()) as FeedbackRequestBody;
  } catch {
    body = {};
  }

  const type = cleanText(body.type, 40);
  const title = cleanText(body.title, MAX_TITLE_LENGTH);
  const details = cleanText(body.details, MAX_DETAILS_LENGTH);
  const pageUrl = cleanPath(body.pageUrl, 300);

  if (!isFeedbackType(type)) {
    return Response.json(
      { error: "Choose a feedback type." },
      { status: 400 },
    );
  }

  if (title.length < 3) {
    return Response.json(
      { error: "Feedback title must be at least 3 characters." },
      { status: 400 },
    );
  }

  if (details.length < 10) {
    return Response.json(
      { error: "Feedback details must be at least 10 characters." },
      { status: 400 },
    );
  }

  const { error } = await context.adminClient.from("feedback_items").insert({
    user_id: context.user.id,
    type,
    title,
    details,
    page_url: pageUrl,
    status: "new",
    is_hidden: false,
  });

  if (error) {
    console.error("Failed to create feedback", error);

    return Response.json(
      { error: "Could not send feedback." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true }, { status: 201 });
}
