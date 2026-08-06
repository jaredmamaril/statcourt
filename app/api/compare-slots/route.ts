import { createClient } from "@supabase/supabase-js";
import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
  createUserRateLimitRules,
} from "@/app/lib/rate-limit";

export const runtime = "nodejs";

type CompareSlotsRequestBody = {
  left?: string;
  right?: string;
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

function cleanPlayerName(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 120) : "";
}

async function getRequestContext(request: Request) {
  const config = getSupabaseServerConfig();

  if (!config) {
    return {
      error: Response.json(
        { error: "Compare slots are not configured on the server." },
        { status: 500 },
      ),
    };
  }

  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.replace(/^Bearer\s+/i, "");

  if (!accessToken) {
    return {
      error: Response.json(
        { error: "Sign in to update compare slots." },
        { status: 401 },
      ),
    };
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
    return {
      error: Response.json(
        { error: "Could not verify your signed-in account." },
        { status: 401 },
      ),
    };
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

  return {
    adminClient,
    user,
  };
}

async function checkCompareSlotRateLimit(request: Request, userId: string) {
  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "compare-slot-api", {
      perHour: 240,
      perDay: 1_000,
    }),
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit);
  }

  const userRateLimit = await checkRateLimit(
    createUserRateLimitRules(userId, "compare-slot-api", {
      perHour: 120,
      perDay: 500,
    }),
  );

  if (!userRateLimit.allowed) {
    return createRateLimitResponse(userRateLimit);
  }

  return null;
}

export async function PATCH(request: Request) {
  const context = await getRequestContext(request);

  if ("error" in context) return context.error;

  const rateLimitResponse = await checkCompareSlotRateLimit(
    request,
    context.user.id,
  );

  if (rateLimitResponse) return rateLimitResponse;

  let body: CompareSlotsRequestBody = {};

  try {
    body = (await request.json()) as CompareSlotsRequestBody;
  } catch {
    body = {};
  }

  const { error } = await context.adminClient.from("user_compare_slots").upsert({
    user_id: context.user.id,
    left_player_name: cleanPlayerName(body.left),
    right_player_name: cleanPlayerName(body.right),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return Response.json(
      { error: "Could not update compare slots." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
