"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../components/supabase-client";
import { trackUserSignin, upsertCurrentUserDevice } from "./user-signins";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;

      setUser(data.user);
      setIsLoadingUser(false);
      void upsertCurrentUserDevice(data.user);
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoadingUser(false);
      if (event === "SIGNED_IN") {
        void trackUserSignin(session?.user ?? null);
      }
      void upsertCurrentUserDevice(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { user, isLoadingUser };
}
