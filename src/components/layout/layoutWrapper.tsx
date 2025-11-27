"use client"; 
import UnifiedNavbar from "@/components/shared/UnifiedNavbar";
import UnifiedFooter from "@/components/shared/UnifiedFooter";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/use-user";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isSignedIn, isLoading: userLoading } = useUser();

  useEffect(() => {
    if (!userLoading && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [user, isSignedIn, userLoading, router]);

  return (
    <div className="min-h-screen bg-white">
      <UnifiedNavbar />
      <div className="">{children}</div>
      <UnifiedFooter />
    </div>
  );
}
