"use client";

import { motion } from "framer-motion";

export default function PageLoader({
  title = "Loading...",
  subtitle,
  overlay = false,
}: {
  title?: string;
  subtitle?: string;
  overlay?: boolean;
}) {
  const body = (
    <div
      className={`flex flex-col items-center justify-center bg-gray-50 ${
        overlay ? "min-h-screen" : "min-h-[70vh]"
      }`}
    >
      <motion.div
        className="h-16 w-16 rounded-full border-4 border-[#282828]/20 border-t-[#282828]"
        animate={{
          rotate: 360,
          boxShadow: [
            "0 0 0px rgba(22,42,65,0.0)",
            "0 0 12px rgba(22,42,65,0.25)",
            "0 0 0px rgba(22,42,65,0.0)",
          ],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.p
        className="mt-6 text-base tracking-wide text-gray-600"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.p>
      {subtitle ? <p className="mt-2 text-sm text-gray-500">{subtitle}</p> : null}
    </div>
  );

  if (overlay) {
    return <div className="fixed inset-0 z-60 bg-gray-50">{body}</div>;
  }

  return body;
}
