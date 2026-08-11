import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
  createUserRateLimitRules,
} from "@/app/lib/rate-limit";
import {
  cleanNumber,
  cleanRecordOfStrings,
  cleanStringArray,
  cleanText,
  cleanUuid,
} from "@/app/lib/input-validation";
import {
  getSecurityClientHash,
  getSecurityRequestId,
  logSecurityEvent,
} from "@/app/lib/security-log";
import {
  createSupabaseAdminClient,
  createSupabaseUserClient,
  getBearerToken,
  getSupabaseServerConfig,
} from "@/app/lib/supabase-server";
import { validateRequestOrigin } from "@/app/lib/request-security";

export const runtime = "nodejs";

type LineupMutationBody = {
  lineups?: Record<string, unknown>[];
  deletedLineupIds?: string[];
};

const LINEUP_SLOTS = ["PG", "SG", "SF", "PF", "C"] as const;
const STAT_PROFILES = new Set(["career", "peak", "current"]);
const GRADE_KEYS = [
  "offense",
  "defense",
  "shooting",
  "playmaking",
  "rebounding",
] as const;
const SCORE_KEYS = [
  "overall",
  "balance",
  "offense",
  "defense",
  "shooting",
  "playmaking",
  "rebounding",
  "starPower",
] as const;

function cleanLineupIds(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map(cleanUuid)
    .filter(Boolean)
    .slice(0, 50);
}

function cleanStatProfile(value: unknown) {
  const profile = cleanText(value, 20);

  return STAT_PROFILES.has(profile) ? profile : "career";
}

function cleanBoolean(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

function cleanDateString(value: unknown) {
  const text = cleanText(value, 40);
  const timestamp = Date.parse(text);

  return Number.isFinite(timestamp)
    ? new Date(timestamp).toISOString()
    : new Date().toISOString();
}

function cleanScores(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const input = value as Record<string, unknown>;

  return SCORE_KEYS.reduce<Record<string, number>>((result, key) => {
    result[key] = cleanNumber(input[key], {
      min: 0,
      max: 100,
      fallback: 0,
      decimals: 1,
    });

    return result;
  }, {});
}

function cleanSimilarLineupMatches(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.slice(0, 5).map((match) => {
    const input =
      match && typeof match === "object" && !Array.isArray(match)
        ? (match as Record<string, unknown>)
        : {};

    return {
      name: cleanText(input.name, 80),
      description: cleanText(input.description, 180),
      matchScore: cleanNumber(input.matchScore, {
        min: 0,
        max: 100,
        fallback: 0,
        decimals: 0,
      }),
      tier: cleanText(input.tier, 20) || undefined,
      archetype: cleanText(input.archetype, 80) || undefined,
    };
  });
}

function cleanLineup(lineup: Record<string, unknown>, userId: string) {
  const id = cleanUuid(lineup.id);
  const name = cleanText(lineup.name, 80);

  if (!id || !name) return null;

  return {
    id,
    user_id: userId,
    name,
    stat_profile: cleanStatProfile(lineup.stat_profile),
    players: cleanRecordOfStrings(lineup.players, LINEUP_SLOTS, 120),
    overall: cleanNumber(lineup.overall, {
      min: 0,
      max: 100,
      fallback: 0,
      decimals: 1,
    }),
    summary: cleanText(lineup.summary, 300),
    tier: cleanText(lineup.tier, 80),
    archetype: cleanText(lineup.archetype, 80),
    team_identity: cleanText(lineup.team_identity, 100),
    strengths: cleanStringArray(lineup.strengths, {
      maxItems: 8,
      maxLength: 80,
    }),
    weaknesses: cleanStringArray(lineup.weaknesses, {
      maxItems: 8,
      maxLength: 80,
    }),
    tradeoff: cleanText(lineup.tradeoff, 260),
    grades: cleanRecordOfStrings(lineup.grades, GRADE_KEYS, 4),
    scores: cleanScores(lineup.scores),
    x_factor_name: cleanText(lineup.x_factor_name, 120),
    x_factor_description: cleanText(lineup.x_factor_description, 220),
    similar_to: cleanText(lineup.similar_to, 120),
    similar_to_description: cleanText(lineup.similar_to_description, 220),
    similar_lineup_matches: cleanSimilarLineupMatches(
      lineup.similar_lineup_matches,
    ),
    court_balance: cleanText(lineup.court_balance, 80),
    court_balance_description: cleanText(lineup.court_balance_description, 220),
    is_public: cleanBoolean(lineup.is_public),
    badges: cleanStringArray(lineup.badges, {
      maxItems: 8,
      maxLength: 60,
    }),
    created_at: cleanDateString(lineup.created_at),
    updated_at: new Date().toISOString(),
  };
}

function cleanLineups(value: unknown, userId: string) {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (lineup): lineup is Record<string, unknown> =>
        Boolean(lineup && typeof lineup === "object" && !Array.isArray(lineup)),
    )
    .slice(0, 50)
    .map((lineup) => cleanLineup(lineup, userId))
    .filter((lineup): lineup is NonNullable<typeof lineup> => Boolean(lineup));
}

type CleanLineup = NonNullable<ReturnType<typeof cleanLineup>>;

function getLineupUpdatePayload(lineup: CleanLineup) {
  const payload: Partial<CleanLineup> = { ...lineup };
  delete payload.id;

  return payload;
}

async function getRequestContext(request: Request) {
  const config = getSupabaseServerConfig();

  if (!config) {
    return {
      error: Response.json(
        { error: "Saved lineups are not configured on the server." },
        { status: 500 },
      ),
    };
  }

  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return {
      error: Response.json(
        { error: "Sign in to save lineups." },
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

async function checkLineupRateLimit(
  request: Request,
  userId: string,
  action: "save" | "delete",
) {
  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, `lineup-${action}-api`, {
      perHour: 80,
      perDay: 200,
    }),
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit, {
      request,
      route: "/api/lineups",
      action: `${action}_lineup`,
      severity: action === "delete" ? "high" : "medium",
      persistent: true,
    });
  }

  const userRateLimit = await checkRateLimit(
    createUserRateLimitRules(userId, `lineup-${action}-api`, {
      perHour: action === "delete" ? 30 : 40,
      perDay: action === "delete" ? 100 : 120,
    }),
  );

  if (!userRateLimit.allowed) {
    return createRateLimitResponse(userRateLimit, {
      request,
      route: "/api/lineups",
      action: `${action}_lineup`,
      userId,
      severity: action === "delete" ? "high" : "medium",
      persistent: true,
    });
  }

  return null;
}

async function saveOwnedLineups(
  context: Exclude<Awaited<ReturnType<typeof getRequestContext>>, { error: Response }>,
  lineups: CleanLineup[],
  request: Request,
) {
  const lineupIds = Array.from(new Set(lineups.map((lineup) => lineup.id)));
  const lineupNames = Array.from(new Set(lineups.map((lineup) => lineup.name)));

  const { data: existingIdRows, error: idLookupError } =
    await context.adminClient
      .from("saved_lineups")
      .select("id, user_id")
      .in("id", lineupIds);

  if (idLookupError) {
    console.error("Failed to verify saved lineup ownership by id", idLookupError);

    return Response.json(
      { error: "Could not save lineups." },
      { status: 500 },
    );
  }

  const ownedLineupIds = new Set<string>();
  const hasForeignLineupId = (existingIdRows ?? []).some((row) => {
    if (row.user_id === context.user.id) {
      ownedLineupIds.add(row.id);
      return false;
    }

    return true;
  });

  if (hasForeignLineupId) {
    void logSecurityEvent({
      eventName: "foreign_lineup_access",
      severity: "high",
      userId: context.user.id,
      route: "/api/lineups",
      action: "save_lineup",
      outcome: "blocked",
      reasonCode: "foreign_lineup_id",
      requestId: getSecurityRequestId(request),
      clientHash: getSecurityClientHash(request),
    });

    return Response.json(
      { error: "Could not save lineups." },
      { status: 403 },
    );
  }

  const { data: existingNameRows, error: nameLookupError } =
    await context.adminClient
      .from("saved_lineups")
      .select("id, name")
      .eq("user_id", context.user.id)
      .in("name", lineupNames);

  if (nameLookupError) {
    console.error(
      "Failed to resolve saved lineup ownership by name",
      nameLookupError,
    );

    return Response.json(
      { error: "Could not save lineups." },
      { status: 500 },
    );
  }

  const ownedLineupIdByName = new Map(
    (existingNameRows ?? []).map((row) => [row.name, row.id] as const),
  );

  for (const lineup of lineups) {
    const ownedTargetId =
      ownedLineupIds.has(lineup.id) ? lineup.id : ownedLineupIdByName.get(lineup.name);

    if (ownedTargetId) {
      const { error } = await context.adminClient
        .from("saved_lineups")
        .update(getLineupUpdatePayload(lineup))
        .eq("id", ownedTargetId)
        .eq("user_id", context.user.id);

      if (error) {
        console.error("Failed to update saved lineup", error);

        return Response.json(
          { error: "Could not save lineups." },
          { status: 500 },
        );
      }

      continue;
    }

    const { error } = await context.adminClient
      .from("saved_lineups")
      .insert(lineup);

    if (error) {
      console.error("Failed to insert saved lineup", error);

      return Response.json(
        { error: "Could not save lineups." },
        { status: 500 },
      );
    }
  }

  return null;
}

export async function PATCH(request: Request) {
  if (!validateRequestOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const context = await getRequestContext(request);

  if ("error" in context) return context.error;

  let body: LineupMutationBody = {};

  try {
    body = (await request.json()) as LineupMutationBody;
  } catch {
    body = {};
  }

  const deletedLineupIds = cleanLineupIds(body.deletedLineupIds);
  const lineups = cleanLineups(body.lineups, context.user.id);

  if (deletedLineupIds.length > 0) {
    const deleteRateLimit = await checkLineupRateLimit(
      request,
      context.user.id,
      "delete",
    );

    if (deleteRateLimit) return deleteRateLimit;
  }

  if (lineups.length > 0) {
    const saveRateLimit = await checkLineupRateLimit(
      request,
      context.user.id,
      "save",
    );

    if (saveRateLimit) return saveRateLimit;
  }

  if (deletedLineupIds.length > 0) {
    const { error } = await context.adminClient
      .from("saved_lineups")
      .delete()
      .eq("user_id", context.user.id)
      .in("id", deletedLineupIds);

    if (error) {
      return Response.json(
        { error: "Could not delete saved lineups." },
        { status: 500 },
      );
    }
  }

  if (lineups.length > 0) {
    const saveResponse = await saveOwnedLineups(context, lineups, request);

    if (saveResponse) return saveResponse;
  }

  return Response.json({ ok: true });
}
