import ProgressClientPage from "@/components/progress/ProgressClientPage";
import { getDailyProgress } from "@backend/features/progress/daily";
import { getProgressAnalytics } from "@backend/features/progress/analytics";
import { requireUser } from "@backend/shared/api/supabase";

export default async function ProgressPage() {
  let initialDaily = null;
  let initialAnalytics = null;
  try {
    const auth = await requireUser();
    const [daily, analytics] = await Promise.all([
      getDailyProgress(undefined, auth),
      getProgressAnalytics("month", undefined, auth),
    ]);
    initialDaily = daily;
    initialAnalytics = analytics;
  } catch {
    /* unsigned — layout sends to sign-in */
  }

  return <ProgressClientPage initialDaily={initialDaily} initialAnalytics={initialAnalytics} />;
}
