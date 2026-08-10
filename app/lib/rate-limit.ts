import "server-only";

import { createHash } from "crypto";
import {
  getSecurityClientHash,
  getSecurityRequestId,
  logSecurityEvent,
} from "./security-log";

type RateLimitRule = {
  id: string;
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  headers: Headers;
  message?: string;
  status?: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitSecurityLogOptions = {
  request: Request;
  route: string;
  action: string;
  userId?: string | null;
  severity?: "low" | "medium" | "high" | "critical";
  persistent?: boolean;
};

type RedisPipelineResponse = {
  result?: unknown;
  error?: string;
}[];

const buckets = new Map<string, Bucket>();

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanupAt = 0;

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  return {
    url: url.replace(/\/$/, ""),
    token,
  };
}

function cleanupExpiredBuckets(now: number) {
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return;

  lastCleanupAt = now;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    firstForwardedIp ||
    "unknown"
  );
}

function getUtcDayResetMs(now: number) {
  const date = new Date(now);
  const resetDate = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + 1,
  );

  return resetDate - now;
}

function hitBucket(rule: RateLimitRule, now: number) {
  const bucketKey = `${rule.id}:${rule.key}`;
  const existing = buckets.get(bucketKey);

  if (!existing || existing.resetAt <= now) {
    const nextBucket = {
      count: 1,
      resetAt: now + rule.windowMs,
    };

    buckets.set(bucketKey, nextBucket);
    return nextBucket;
  }

  existing.count += 1;
  return existing;
}

function getRedisKey(rule: RateLimitRule) {
  const hashedKey = createHash("sha256").update(rule.key).digest("hex");

  return `statcourt:rate-limit:${rule.id}:${hashedKey}`;
}

async function hitRedisBucket(rule: RateLimitRule) {
  const config = getRedisConfig();

  if (!config) return null;

  const redisKey = getRedisKey(rule);
  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", redisKey],
      ["PEXPIRE", redisKey, rule.windowMs, "NX"],
      ["PTTL", redisKey],
    ]),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Redis rate limit request failed: ${response.status}`);
  }

  const results = (await response.json()) as RedisPipelineResponse;
  const count = Number(results[0]?.result ?? 1);
  const ttl = Number(results[2]?.result ?? rule.windowMs);
  const remainingTtl = ttl > 0 ? ttl : rule.windowMs;

  return {
    count,
    resetAt: Date.now() + remainingTtl,
  };
}

export function getRateLimitIp(request: Request) {
  return getClientIp(request);
}

function createLimitedResult(rule: RateLimitRule, bucket: Bucket, now: number) {
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((bucket.resetAt - now) / 1000),
  );
  const headers = new Headers({
    "Retry-After": String(retryAfterSeconds),
    "X-RateLimit-Limit": String(rule.limit),
    "X-RateLimit-Remaining": "0",
    "X-RateLimit-Reset": String(Math.ceil(bucket.resetAt / 1000)),
  });

  return {
    allowed: false,
    headers,
    message: "Too many requests. Try again later.",
    status: 429,
  } satisfies RateLimitResult;
}

async function checkRedisRateLimit(rules: RateLimitRule[]) {
  const now = Date.now();
  let lowestRemaining = Number.POSITIVE_INFINITY;
  let nextResetAt = now;

  for (const rule of rules) {
    const bucket = await hitRedisBucket(rule);

    if (!bucket) return null;

    const remaining = Math.max(rule.limit - bucket.count, 0);

    lowestRemaining = Math.min(lowestRemaining, remaining);
    nextResetAt = Math.max(nextResetAt, bucket.resetAt);

    if (bucket.count > rule.limit) {
      return createLimitedResult(rule, bucket, now);
    }
  }

  return {
    allowed: true,
    headers: new Headers({
      "X-RateLimit-Remaining": String(
        Number.isFinite(lowestRemaining) ? lowestRemaining : 0,
      ),
      "X-RateLimit-Reset": String(Math.ceil(nextResetAt / 1000)),
    }),
  } satisfies RateLimitResult;
}

function checkMemoryRateLimit(rules: RateLimitRule[]): RateLimitResult {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  let lowestRemaining = Number.POSITIVE_INFINITY;
  let nextResetAt = now;

  for (const rule of rules) {
    const bucket = hitBucket(rule, now);
    const remaining = Math.max(rule.limit - bucket.count, 0);

    lowestRemaining = Math.min(lowestRemaining, remaining);
    nextResetAt = Math.max(nextResetAt, bucket.resetAt);

    if (bucket.count > rule.limit) {
      return createLimitedResult(rule, bucket, now);
    }
  }

  const headers = new Headers({
    "X-RateLimit-Remaining": String(
      Number.isFinite(lowestRemaining) ? lowestRemaining : 0,
    ),
    "X-RateLimit-Reset": String(Math.ceil(nextResetAt / 1000)),
  });

  return {
    allowed: true,
    headers,
  };
}

export async function checkRateLimit(
  rules: RateLimitRule[],
): Promise<RateLimitResult> {
  if (getRedisConfig()) {
    try {
      const redisResult = await checkRedisRateLimit(rules);

      if (redisResult) return redisResult;
    } catch (error) {
      console.warn("Redis rate limit unavailable, using memory fallback", error);
    }
  }

  return checkMemoryRateLimit(rules);
}

export function createRateLimitResponse(
  result: RateLimitResult,
  securityLogOptions?: RateLimitSecurityLogOptions,
) {
  if (securityLogOptions?.persistent) {
    void logSecurityEvent({
      eventName: "rate_limit_exceeded",
      severity: securityLogOptions.severity ?? "medium",
      userId: securityLogOptions.userId ?? null,
      route: securityLogOptions.route,
      action: securityLogOptions.action,
      outcome: "blocked",
      reasonCode: "rate_limit_exceeded",
      requestId: getSecurityRequestId(securityLogOptions.request),
      clientHash: getSecurityClientHash(securityLogOptions.request),
    });
  }

  return Response.json(
    {
      error: result.message ?? "Too many requests. Try again later.",
    },
    {
      status: result.status ?? 429,
      headers: result.headers,
    },
  );
}

export function createIpRateLimitRules(
  request: Request,
  namespace: string,
  options: {
    perMinute?: number;
    perHour?: number;
    perDay?: number;
  },
) {
  const ip = getClientIp(request);
  const rules: RateLimitRule[] = [];

  if (options.perMinute) {
    rules.push({
      id: `${namespace}:ip:minute`,
      key: ip,
      limit: options.perMinute,
      windowMs: 60_000,
    });
  }

  if (options.perHour) {
    rules.push({
      id: `${namespace}:ip:hour`,
      key: ip,
      limit: options.perHour,
      windowMs: 60 * 60_000,
    });
  }

  if (options.perDay) {
    rules.push({
      id: `${namespace}:ip:day`,
      key: ip,
      limit: options.perDay,
      windowMs: getUtcDayResetMs(Date.now()),
    });
  }

  return rules;
}

export function createUserRateLimitRules(
  userId: string,
  namespace: string,
  options: {
    perMinute?: number;
    perHour?: number;
    perDay?: number;
  },
) {
  const rules: RateLimitRule[] = [];

  if (options.perMinute) {
    rules.push({
      id: `${namespace}:user:minute`,
      key: userId,
      limit: options.perMinute,
      windowMs: 60_000,
    });
  }

  if (options.perHour) {
    rules.push({
      id: `${namespace}:user:hour`,
      key: userId,
      limit: options.perHour,
      windowMs: 60 * 60_000,
    });
  }

  if (options.perDay) {
    rules.push({
      id: `${namespace}:user:day`,
      key: userId,
      limit: options.perDay,
      windowMs: getUtcDayResetMs(Date.now()),
    });
  }

  return rules;
}
