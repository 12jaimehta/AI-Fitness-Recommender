"use client";

import React from "react";
import { UnifiedNavbar, UnifiedFooter } from "../shared";
import { motion } from "framer-motion";

interface PageLoaderProps {
  title?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ title }) => {
  return (
    <>
      <UnifiedNavbar />

      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        {/* Motion Loader */}
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-[#162a41]/20 border-t-[#162a41]"
          animate={{
            rotate: 360,
            boxShadow: [
              "0 0 0px rgba(22,42,65,0.0)",
              "0 0 12px rgba(22,42,65,0.25)",
              "0 0 0px rgba(22,42,65,0.0)",
            ]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Text */}
        <motion.p
          className="text-gray-600 mt-6 text-base tracking-wide"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {title || "Loading your progress..."}
        </motion.p>
      </div>

      <UnifiedFooter />
    </>
  );
};

export default PageLoader;
