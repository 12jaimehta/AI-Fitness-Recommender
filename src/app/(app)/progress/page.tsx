import CoachClientPage from "@/components/coach/CoachClientPage";
import { getMembershipView } from "@backend/features/billing";
import { getTodayBoard } from "@backend/features/coach";
import { requireUser } from "@backend/shared/api/supabase";

export default async function ProgressPage() {
  let initial = null;
  let membership = null;
  try {
    const auth = await requireUser();
    const [board, member] = await Promise.all([getTodayBoard(undefined, auth), getMembershipView(auth)]);
    initial = board;
    membership = member;
  } catch {
    /* unsigned — layout sends to sign-in */
  }

  return <CoachClientPage initial={initial} membership={membership} />;
}
