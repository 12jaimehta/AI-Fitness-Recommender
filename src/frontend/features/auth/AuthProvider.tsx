"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@frontend/shared/api/supabase";
import {
  clearClientPlanCache,
  dropUserPlanCache,
  persistClientPlans,
  purgeLegacyPlanStorage,
} from "@frontend/features/plan-cache";
import { clearQueryCache } from "@frontend/shared/lib/query-cache";
import { withTimeout } from "@/shared/lib/timed-fetch";

type AuthValue = {
  user: User | null;
  isSignedIn: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      try {
        const { data } = await withTimeout(supabase.auth.getSession(), 5_000);
        setUser(data.session?.user ?? null);
      } catch (err) {
        console.error("Auth session error:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (event === "SIGNED_OUT") {
        clearClientPlanCache();
        clearQueryCache();
      }
      if (event === "SIGNED_IN") {
        purgeLegacyPlanStorage();
        void persistClientPlans();
      }
      if (event === "USER_UPDATED") {
        void dropUserPlanCache();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      isSignedIn: !!user,
      isLoading,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useUser must be used within AuthProvider");
  }
  return ctx;
}
