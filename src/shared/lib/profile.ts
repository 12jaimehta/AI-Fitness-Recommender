import type { UserProfile } from "@/shared/types";

export function hasRequiredProfileDetails(
  profile: Partial<UserProfile> | null | undefined
): boolean {
  if (!profile) return false;
  const name = (profile.full_name || "").trim();
  const goals = profile.goals;
  const hasGoals = Array.isArray(goals) ? goals.length > 0 : Boolean(goals);
  return Boolean(
    name &&
      profile.age &&
      profile.gender &&
      profile.height &&
      profile.initial_weight &&
      profile.fitness_level &&
      hasGoals
  );
}

export function isProfileComplete(profile: Partial<UserProfile> | null | undefined): boolean {
  if (!profile) return false;
  return Boolean(profile.profile_completed) || hasRequiredProfileDetails(profile);
}

export function profileAllowedPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/my-profile") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api")
  );
}
