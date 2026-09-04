"use client";

import { createClient } from "@frontend/shared/api/supabase";
import { dropUserPlanCache } from "@frontend/features/plan-cache";
import { clearQueryCache } from "@frontend/shared/lib/query-cache";
import { useAuthContext } from "./AuthProvider";

export { AuthProvider } from "./AuthProvider";
export { startGoogleOAuth, requestPasswordReset, resetPassword } from "./api";

export function useUser() {
  return useAuthContext();
}

export function useCurrentUser() {
  const { user, isSignedIn, isLoading } = useUser();
  return {
    user,
    isSignedIn,
    loading: isLoading,
  };
}

export async function signOutAndClearCache() {
  await dropUserPlanCache();
  clearQueryCache();
  const supabase = createClient();
  await supabase.auth.signOut();
}
