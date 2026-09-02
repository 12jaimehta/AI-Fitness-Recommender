import DashboardClientPage from "@/components/dashboard/DashboardClientPage";
import { getDailyProgress } from "@backend/features/progress/daily";
import { getProfile } from "@backend/features/progress";
import { requireUser } from "@backend/shared/api/supabase";

export default async function DashboardPage() {
  let initialDaily = null;
  let initialProfile = null;
  try {
    const auth = await requireUser();
    const [daily, profile] = await Promise.all([getDailyProgress(undefined, auth), getProfile(auth)]);
    initialDaily = daily;
    initialProfile = profile;
  } catch {
    /* unsigned — layout sends to sign-in */
  }

  return <DashboardClientPage initialDaily={initialDaily} initialProfile={initialProfile} />;
}
