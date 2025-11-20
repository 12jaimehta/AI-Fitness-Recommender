"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import UnifiedNavbar from "@/components/shared/UnifiedNavbar";
import UnifiedFooter from "@/components/shared/UnifiedFooter";

export default function DashboardPage() {
  const { user, loading, isSignedIn } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [loading, isSignedIn, router]);

  if (loading || (!isSignedIn && typeof window !== "undefined")) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <UnifiedNavbar />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Activity size={40} />
        </motion.div>
      </div>
    );
  }

  const firstName = user?.email?.split("@")[0] ?? "there";

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <UnifiedNavbar />

      <main
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "96px 20px 64px",
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 800,
            color: "#1a202c",
            marginBottom: "12px",
          }}
        >
          Welcome back, {firstName} 👋
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          style={{
            fontSize: "16px",
            color: "#4a5568",
            marginBottom: "32px",
          }}
        >
          This is your personalized health hub. Jump back into your AI-powered
          plans or start something new.
        </motion.p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
          }}
        >
          <motion.button
            whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/diet")}
            style={{
              borderRadius: "24px",
              border: "1px solid #e2e8f0",
              padding: "20px",
              background:
                "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.06))",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "8px",
                color: "#1f2933",
              }}
            >
              Diet Planner
            </h2>
            <p style={{ fontSize: "14px", color: "#4b5563" }}>
              Create or update your AI-generated diet plan tailored to your
              goals.
            </p>
          </motion.button>

          <motion.button
            whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/workout")}
            style={{
              borderRadius: "24px",
              border: "1px solid #e2e8f0",
              padding: "20px",
              background: "#ffffff",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "8px",
                color: "#1f2933",
              }}
            >
              Workout Planner
            </h2>
            <p style={{ fontSize: "14px", color: "#4b5563" }}>
              Plan workouts that complement your nutrition for better results.
            </p>
          </motion.button>

          <motion.button
            whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/progress")}
            style={{
              borderRadius: "24px",
              border: "1px solid #e2e8f0",
              padding: "20px",
              background: "#ffffff",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "8px",
                color: "#1f2933",
              }}
            >
              Track Progress
            </h2>
            <p style={{ fontSize: "14px", color: "#4b5563" }}>
              Log your journey and keep an eye on how your health evolves.
            </p>
          </motion.button>
        </div>
      </main>

      <UnifiedFooter />
    </div>
  );
}
