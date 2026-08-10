import {
  checkRateLimit,
  createIpRateLimitRules,
  createRateLimitResponse,
  createUserRateLimitRules,
} from "@/app/lib/rate-limit";
import { cleanNullableText, cleanText } from "@/app/lib/input-validation";
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

export const runtime = "nodejs";

const USERNAME_CHANGE_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;
const MAX_DISPLAY_NAME_LENGTH = 40;
const MAX_USERNAME_LENGTH = 24;
const MAX_AVATAR_URL_LENGTH = 500;

type ProfilePatchBody = {
  displayName?: string;
  username?: string;
  publicProfileEnabled?: boolean;
  avatarUrl?: string;
};

type UserProfileRow = {
  username: string | null;
  username_updated_at: string | null;
};

function isAllowedAvatarUrl(value: string, supabaseUrl: string) {
  try {
    const avatarUrl = new URL(value);
    const configuredSupabaseUrl = new URL(supabaseUrl);

    if (
      avatarUrl.protocol !== "https:" ||
      configuredSupabaseUrl.protocol !== "https:"
    ) {
      return false;
    }

    const isSupabaseAvatar =
      avatarUrl.hostname === configuredSupabaseUrl.hostname &&
      avatarUrl.pathname.startsWith("/storage/v1/object/public/avatars/");
    const isGoogleAvatar = avatarUrl.hostname === "lh3.googleusercontent.com";

    return isSupabaseAvatar || isGoogleAvatar;
  } catch {
    return false;
  }
}

function normalizeUsername(value: unknown) {
  const username = cleanText(value, MAX_USERNAME_LENGTH).toLowerCase();

  return username || null;
}

function getUsernameCooldownDate(updatedAt: string | null) {
  if (!updatedAt) return null;

  const updatedAtTime = new Date(updatedAt).getTime();

  if (!Number.isFinite(updatedAtTime)) return null;

  const cooldownUntil = new Date(updatedAtTime + USERNAME_CHANGE_COOLDOWN_MS);

  return cooldownUntil.getTime() > Date.now() ? cooldownUntil : null;
}

export async function PATCH(request: Request) {
  const ipRateLimit = await checkRateLimit(
    createIpRateLimitRules(request, "profile-update-api", {
      perHour: 60,
      perDay: 200,
    }),
  );

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit, {
      request,
      route: "/api/profile",
      action: "update_profile",
      severity: "medium",
      persistent: true,
    });
  }

  const config = getSupabaseServerConfig();

  if (!config) {
    return Response.json(
      { error: "Profile updates are not configured on the server." },
      { status: 500 },
    );
  }

  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return Response.json(
      { error: "Sign in to update your profile." },
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
    createUserRateLimitRules(user.id, "profile-update-api", {
      perHour: 20,
      perDay: 60,
    }),
  );

  if (!userRateLimit.allowed) {
    return createRateLimitResponse(userRateLimit, {
      request,
      route: "/api/profile",
      action: "update_profile",
      userId: user.id,
      severity: "medium",
      persistent: true,
    });
  }

  let body: ProfilePatchBody = {};

  try {
    body = (await request.json()) as ProfilePatchBody;
  } catch {
    body = {};
  }

  const updates: Record<string, string | boolean | null> = {
    id: user.id,
    updated_at: new Date().toISOString(),
  };
  const authMetadata: Record<string, string | boolean | null> = {};

  const displayName = cleanNullableText(
    body.displayName,
    MAX_DISPLAY_NAME_LENGTH,
  );

  if (displayName !== null) {
    if (displayName.length < 2) {
      return Response.json(
        { error: "Use at least 2 characters." },
        { status: 400 },
      );
    }

    updates.display_name = displayName;
    authMetadata.name = displayName;
  }

  const username = normalizeUsername(body.username);

  if (username !== null) {
    if (username.length < 3) {
      return Response.json(
        { error: "Use at least 3 characters." },
        { status: 400 },
      );
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      return Response.json(
        { error: "Use letters, numbers, or underscores." },
        { status: 400 },
      );
    }
  }

  const shouldUpdateAvatar = Object.hasOwn(body, "avatarUrl");
  const avatarUrl = cleanNullableText(body.avatarUrl, MAX_AVATAR_URL_LENGTH);

  if (shouldUpdateAvatar && avatarUrl === null) {
    updates.avatar_url = null;
    authMetadata.avatar_url = null;
    authMetadata.picture = null;
  } else if (avatarUrl !== null) {
    if (!isAllowedAvatarUrl(avatarUrl, config.supabaseUrl)) {
      void logSecurityEvent({
        eventName: "profile_security_change",
        severity: "medium",
        userId: user.id,
        route: "/api/profile",
        action: "update_avatar",
        outcome: "blocked",
        reasonCode: "blocked_avatar_url_origin",
        requestId: getSecurityRequestId(request),
        clientHash: getSecurityClientHash(request),
      });

      return Response.json(
        { error: "Use a StatCourt avatar upload or Google profile image." },
        { status: 400 },
      );
    }

    updates.avatar_url = avatarUrl;
    authMetadata.avatar_url = avatarUrl;
    authMetadata.picture = avatarUrl;
  }

  if (typeof body.publicProfileEnabled === "boolean") {
    updates.public_profile_enabled = body.publicProfileEnabled;
  }

  const adminClient = createSupabaseAdminClient(config);

  if (username !== null) {
    const usernameRateLimit = await checkRateLimit(
      createUserRateLimitRules(user.id, "profile-username-update-api", {
        perDay: 3,
      }),
    );

    if (!usernameRateLimit.allowed) {
      return createRateLimitResponse(usernameRateLimit, {
        request,
        route: "/api/profile",
        action: "update_username",
        userId: user.id,
        severity: "medium",
        persistent: true,
      });
    }

    const { data: currentProfile, error: currentProfileError } =
      await adminClient
        .from("user_profiles")
        .select("username, username_updated_at")
        .eq("id", user.id)
        .maybeSingle();

    if (currentProfileError) {
      return Response.json(
        { error: "Could not verify username status." },
        { status: 500 },
      );
    }

    const profile = currentProfile as UserProfileRow | null;

    if (profile?.username && profile.username !== username) {
      const cooldownUntil = getUsernameCooldownDate(
        profile.username_updated_at,
      );

      if (cooldownUntil) {
        return Response.json(
          {
            error: `You can change username again ${cooldownUntil.toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            )}.`,
          },
          { status: 429 },
        );
      }
    }

    if (profile?.username === username) {
      return Response.json(
        { error: "Username already saved." },
        { status: 400 },
      );
    }

    updates.username = username;
    updates.username_updated_at = new Date().toISOString();
    authMetadata.username = username;
  }

  const { data: updatedProfile, error: profileError } = await adminClient
    .from("user_profiles")
    .upsert(updates, { onConflict: "id" })
    .select(
      "display_name, username, username_updated_at, avatar_url, public_profile_enabled",
    )
    .single();

  if (profileError) {
    const errorMessage = profileError.message?.toLowerCase() ?? "";
    const isDuplicateUsername =
      profileError.code === "23505" ||
      errorMessage.includes("duplicate") ||
      errorMessage.includes("unique");

    return Response.json(
      {
        error: isDuplicateUsername
          ? "Username is already taken."
          : "Could not save profile.",
      },
      { status: isDuplicateUsername ? 409 : 500 },
    );
  }

  if (Object.keys(authMetadata).length > 0) {
    await adminClient.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        ...authMetadata,
      },
    });
  }

  if (typeof body.publicProfileEnabled === "boolean") {
    void logSecurityEvent({
      eventName: "profile_security_change",
      severity: "medium",
      userId: user.id,
      route: "/api/profile",
      action: "public_profile_visibility",
      outcome: "success",
      requestId: getSecurityRequestId(request),
      clientHash: getSecurityClientHash(request),
      metadata: {
        enabled: body.publicProfileEnabled,
      },
    });
  }

  return Response.json({
    profile: updatedProfile,
  });
}
