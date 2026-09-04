import BillingClientPage from "@/components/billing/BillingClientPage";
import { getMembershipView } from "@backend/features/billing";

export default async function BillingPage() {
  let initial = null;
  try {
    initial = await getMembershipView();
  } catch {
    /* unsigned — layout sends to sign-in */
  }
  return <BillingClientPage initial={initial} />;
}
