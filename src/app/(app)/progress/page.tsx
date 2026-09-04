import CoachClientPage from "@/components/coach/CoachClientPage";
import { getTodayBoard } from "@backend/features/coach";
import { requireUser } from "@backend/shared/api/supabase";

export default async function ProgressPage() {
  let initial = null;
  try {
    const auth = await requireUser();
    initial = await getTodayBoard(undefined, auth);
  } catch {
    /* unsigned — layout sends to sign-in */
  }

  return <CoachClientPage initial={initial} />;
}
