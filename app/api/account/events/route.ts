import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
  createUserRateLimitRules,
} from "@/app/lib/rate-limit";
import { cleanText } from "@/app/lib/input-validation";
import {
  createSupabaseAdminClient,
  createSupabaseUserClient,
  getBearerToken,
  getSupabaseServerConfig,
} from "@/app/lib/supabase-server";

export const runtime = "nodejs";

type AccountEventRequestBody = {
  eventType?: string;
  provider?: string | null;
  deviceId?: string | null;
};

function getDeviceLabel(userAgent: string) {
  if (/iPhone/i.test(userAgent)) return "iPhone";
  if (/iPad/i.test(userAgent)) return "iPad";
  if (/Android/i.test(userAgent)) return "Android";
  if (/Windows/i.test(userAgent)) return "Windows PC";
  if (/Macintosh|Mac OS X/i.test(userAgent)) return "Mac";
  if (/Linux/i.test(userAgent)) return "Linux";

  return "Unknown device";
}

function getBrowserLabel(userAgent: string) {
  if (/Edg/i.test(userAgent)) return "Microsoft Edge";
  if (/Chrome/i.test(userAgent)) return "Chrome";
  if (/Firefox/i.test(userAgent)) return "Firefox";
  if (/Safari/i.test(userAgent)) return "Safari";

  return "Unknown browser";
}

async function getRequestContext(request: Request) {
  const config = getSupabaseServerConfig();

  if (!config) {
    return {
      error: Response.json(
        { error: "Account tracking is not configured on the server." },
        { status: 500 },
      ),
    };
  }

  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return {
      error: Response.json(
        { error: "Sign in to track account activity." },
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

async function checkAccountEventRateLimit(
  request: Request,
  userId: string,
  eventType: string,
) {
  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, `account-${eventType}-api`, {
      perHour: 120,
      perDay: 500,
    }),
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit, {
      request,
      route: "/api/account/events",
      action: eventType,
      severity: "medium",
      persistent: true,
    });
  }

  const userRateLimit = await checkRateLimit(
    createUserRateLimitRules(userId, `account-${eventType}-api`, {
      perHour: eventType === "signin" ? 40 : 120,
      perDay: eventType === "signin" ? 120 : 500,
    }),
  );

  if (!userRateLimit.allowed) {
    return createRateLimitResponse(userRateLimit, {
      request,
      route: "/api/account/events",
      action: eventType,
      userId,
      severity: "medium",
      persistent: true,
    });
  }

  return null;
}

export async function POST(request: Request) {
  const context = await getRequestContext(request);

  if ("error" in context) return context.error;

  let body: AccountEventRequestBody = {};

  try {
    body = (await request.json()) as AccountEventRequestBody;
  } catch {
    body = {};
  }

  const eventType = cleanText(body.eventType, 30);
  const userAgent = request.headers.get("user-agent") ?? "";

  if (eventType !== "signin" && eventType !== "device_seen") {
    return Response.json({ error: "Invalid account event." }, { status: 400 });
  }

  const rateLimitResponse = await checkAccountEventRateLimit(
    request,
    context.user.id,
    eventType,
  );

  if (rateLimitResponse) return rateLimitResponse;

  if (eventType === "signin") {
    const provider = cleanText(body.provider, 40) || null;
    const { error } = await context.adminClient.from("user_signins").insert({
      user_id: context.user.id,
      provider,
      user_agent: userAgent,
    });

    if (error) {
      return Response.json(
        { error: "Could not track sign-in." },
        { status: 500 },
      );
    }

    return Response.json({ ok: true });
  }

  const deviceId = cleanText(body.deviceId, 80);

  if (!deviceId) {
    return Response.json({ error: "Missing device id." }, { status: 400 });
  }

  const timestamp = new Date().toISOString();
  const { error } = await context.adminClient.from("user_devices").upsert(
    {
      user_id: context.user.id,
      device_id: deviceId,
      device_label: getDeviceLabel(userAgent),
      browser_label: getBrowserLabel(userAgent),
      user_agent: userAgent,
      last_seen_at: timestamp,
      signed_out_at: null,
      updated_at: timestamp,
    },
    {
      onConflict: "user_id,device_id",
    },
  );

  if (error) {
    return Response.json(
      { error: "Could not update device." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
