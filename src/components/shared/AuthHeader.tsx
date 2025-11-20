"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useCurrentUser } from "@/lib/use-current-user";
import { createClient } from "@/lib/supabase-client";

export default function AuthHeader() {
  const { isSignedIn, user } = useCurrentUser();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh(); // Refresh to update the UI
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      {isSignedIn ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            padding: '8px 16px',
            borderRadius: '50px',
            border: '2px solid rgba(102, 126, 234, 0.2)',
            boxShadow: '0 4px 20px -2px rgba(102, 126, 234, 0.15)'
          }}
        >
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1a1a1a'
          }}>
            {user?.email?.split("@")[0]}
          </span>
          <button
            onClick={handleSignOut}
            style={{
              borderRadius: '9999px',
              border: 'none',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              background: '#162a41',
              color: '#ffffff',
            }}
          >
            Sign out
          </button>
        </motion.div>
      ) : (
        <motion.button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '50px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 20px -2px rgba(102, 126, 234, 0.25)'
          }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 8px 25px -5px rgba(102, 126, 234, 0.3)'
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/sign-in")}
        >
          <Sparkles size={16} />
          Sign In
        </motion.button>
      )}
    </div>
  );
}