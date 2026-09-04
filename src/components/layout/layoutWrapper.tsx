"use client";
import UnifiedNavbar from "@/components/shared/UnifiedNavbar";
import UnifiedFooter from "@/components/shared/UnifiedFooter";
import PageLoader from "@/components/ui/PageLoader";
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

  if (userLoading || !isSignedIn) {
    return (
      <div className="min-h-screen bg-[#161616]">
        <UnifiedNavbar />
        <div className="pt-24">
          <PageLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fyte-page">
      <UnifiedNavbar />
      {children}
      <UnifiedFooter />
    </div>
  );
}
