import type { User } from "@supabase/supabase-js";
import { supabase } from "../components/supabase-client";

const DEVICE_ID_STORAGE_KEY = "statcourt_device_id";
const DEVICE_TRACKING_STORAGE_KEY = "statcourt_last_tracked_device";
const SIGNIN_TRACKING_STORAGE_KEY = "statcourt_last_tracked_signin";
const SIGNIN_CLEAR_STORAGE_KEY = "statcourt_cleared_signin";
const PENDING_AUTH_PROVIDER_STORAGE_KEY = "statcourt_pending_auth_provider";
const DEVICE_TRACKING_INTERVAL_MS = 15 * 60 * 1000;
const pendingTrackedSignins = new Set<string>();
const pendingTrackedDevices = new Set<string>();

function getSigninProvider(
  user: User,
  providerOverride?: string | null,
  pendingProvider?: string | null,
) {
  if (providerOverride) return providerOverride;

  if (pendingProvider) return pendingProvider;

  const provider = user.app_metadata?.provider;

  return typeof provider === "string" ? provider : null;
}

export function getCurrentDeviceId() {
  const existingDeviceId = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);

  if (existingDeviceId) return existingDeviceId;

  const nextDeviceId = window.crypto.randomUUID();

  window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, nextDeviceId);

  return nextDeviceId;
}

async function postAccountEvent(body: Record<string, unknown>) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Missing signed-in session.");
  }

  const response = await fetch("/api/account/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new Error(data?.error ?? "Could not track account event.");
  }
}

export async function trackUserSignin(
  user: User | null,
  providerOverride?: string | null,
) {
  if (!user) return;

  const baseSignInKey = `${user.id}:${user.last_sign_in_at ?? "unknown"}`;
  const lastTrackedSignIn = window.localStorage.getItem(
    SIGNIN_TRACKING_STORAGE_KEY,
  );
  const clearedSignIn = window.localStorage.getItem(SIGNIN_CLEAR_STORAGE_KEY);
  const pendingProvider = providerOverride ? null : consumePendingAuthProvider();
  const signinProvider = getSigninProvider(
    user,
    providerOverride,
    pendingProvider,
  );
  const signInKey = `${baseSignInKey}:${signinProvider ?? "unknown"}`;

  if (!providerOverride && lastTrackedSignIn?.startsWith(`${baseSignInKey}:`)) {
    return;
  }

  if (
    clearedSignIn === signInKey ||
    lastTrackedSignIn === signInKey ||
    pendingTrackedSignins.has(signInKey)
  ) {
    return;
  }

  pendingTrackedSignins.add(signInKey);
  window.localStorage.setItem(SIGNIN_TRACKING_STORAGE_KEY, signInKey);

  try {
    await postAccountEvent({
      eventType: "signin",
      provider: signinProvider,
    });
  } catch (error) {
    console.warn("Failed to track sign-in", error);
    window.localStorage.removeItem(SIGNIN_TRACKING_STORAGE_KEY);
    pendingTrackedSignins.delete(signInKey);
    return;
  }

  pendingTrackedSignins.delete(signInKey);
}

export function suppressCurrentSigninTracking(user: User | null) {
  if (!user) return;

  const signinProvider = getSigninProvider(user);
  const signInKey = `${user.id}:${user.last_sign_in_at ?? "unknown"}:${signinProvider ?? "unknown"}`;

  window.localStorage.setItem(SIGNIN_CLEAR_STORAGE_KEY, signInKey);
  window.localStorage.setItem(SIGNIN_TRACKING_STORAGE_KEY, signInKey);
  pendingTrackedSignins.delete(signInKey);
}

export function setPendingAuthProvider(provider: string) {
  window.sessionStorage.setItem(PENDING_AUTH_PROVIDER_STORAGE_KEY, provider);
}

export function consumePendingAuthProvider() {
  const provider = window.sessionStorage.getItem(
    PENDING_AUTH_PROVIDER_STORAGE_KEY,
  );

  window.sessionStorage.removeItem(PENDING_AUTH_PROVIDER_STORAGE_KEY);

  return provider;
}

export function clearPendingAuthProvider() {
  window.sessionStorage.removeItem(PENDING_AUTH_PROVIDER_STORAGE_KEY);
}

export async function upsertCurrentUserDevice(user: User | null) {
  if (!user) return;

  const deviceId = getCurrentDeviceId();
  const deviceTrackingKey = `${user.id}:${deviceId}`;
  const lastTrackedDevice = window.localStorage.getItem(
    DEVICE_TRACKING_STORAGE_KEY,
  );
  const [lastTrackedKey, lastTrackedAt] = lastTrackedDevice?.split(":at:") ?? [];
  const lastTrackedTimestamp = Number(lastTrackedAt ?? 0);

  if (
    pendingTrackedDevices.has(deviceTrackingKey) ||
    (lastTrackedKey === deviceTrackingKey &&
      Date.now() - lastTrackedTimestamp < DEVICE_TRACKING_INTERVAL_MS)
  ) {
    return;
  }

  pendingTrackedDevices.add(deviceTrackingKey);
  window.localStorage.setItem(
    DEVICE_TRACKING_STORAGE_KEY,
    `${deviceTrackingKey}:at:${Date.now()}`,
  );

  try {
    await postAccountEvent({
      eventType: "device_seen",
      deviceId,
    });
  } catch (error) {
    pendingTrackedDevices.delete(deviceTrackingKey);

    if (error instanceof Error && /too many requests/i.test(error.message)) {
      return;
    }

    console.warn("Failed to update current device", error);
    return;
  }

  pendingTrackedDevices.delete(deviceTrackingKey);
}
