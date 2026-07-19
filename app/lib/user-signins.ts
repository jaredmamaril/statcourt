import type { User } from "@supabase/supabase-js";
import { supabase } from "../components/supabase-client";

const DEVICE_ID_STORAGE_KEY = "statcourt_device_id";
const SIGNIN_TRACKING_STORAGE_KEY = "statcourt_last_tracked_signin";
const SIGNIN_CLEAR_STORAGE_KEY = "statcourt_cleared_signin";
const pendingTrackedSignins = new Set<string>();

function getSigninProvider(user: User) {
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

export async function trackUserSignin(user: User | null) {
  if (!user) return;

  const signInKey = `${user.id}:${user.last_sign_in_at ?? "unknown"}`;
  const lastTrackedSignIn = window.localStorage.getItem(
    SIGNIN_TRACKING_STORAGE_KEY,
  );
  const clearedSignIn = window.localStorage.getItem(SIGNIN_CLEAR_STORAGE_KEY);

  if (
    clearedSignIn === signInKey ||
    lastTrackedSignIn === signInKey ||
    pendingTrackedSignins.has(signInKey)
  ) {
    return;
  }

  pendingTrackedSignins.add(signInKey);
  window.localStorage.setItem(SIGNIN_TRACKING_STORAGE_KEY, signInKey);

  const { error } = await supabase.from("user_signins").insert({
    user_id: user.id,
    provider: getSigninProvider(user),
    user_agent: window.navigator.userAgent,
  });

  if (error) {
    console.warn("Failed to track sign-in", error);
    window.localStorage.removeItem(SIGNIN_TRACKING_STORAGE_KEY);
    pendingTrackedSignins.delete(signInKey);
    return;
  }

  pendingTrackedSignins.delete(signInKey);
}

export function suppressCurrentSigninTracking(user: User | null) {
  if (!user) return;

  const signInKey = `${user.id}:${user.last_sign_in_at ?? "unknown"}`;

  window.localStorage.setItem(SIGNIN_CLEAR_STORAGE_KEY, signInKey);
  window.localStorage.setItem(SIGNIN_TRACKING_STORAGE_KEY, signInKey);
  pendingTrackedSignins.delete(signInKey);
}

export async function upsertCurrentUserDevice(user: User | null) {
  if (!user) return;

  const userAgent = window.navigator.userAgent;
  const timestamp = new Date().toISOString();

  const { error } = await supabase.from("user_devices").upsert(
    {
      user_id: user.id,
      device_id: getCurrentDeviceId(),
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
    console.warn("Failed to update current device", error);
  }
}
