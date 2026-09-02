import { redirect } from "next/navigation";
import { SIGNED_IN_HOME } from "@/shared/lib/app-home";

export default function DashboardPage() {
  redirect(SIGNED_IN_HOME);
}
