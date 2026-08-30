"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@frontend/shared/api/supabase";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user ?? null);
      } catch (err) {
        console.error("Auth session error:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    isSignedIn: !!user,
    isLoading,
  };
}

export function useCurrentUser() {
  const { user, isSignedIn, isLoading } = useUser();
  return {
    user,
    isSignedIn,
    loading: isLoading,
  };
}
