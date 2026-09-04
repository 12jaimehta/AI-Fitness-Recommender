"use client";

import { motion, AnimatePresence, modalBackdrop, modalPanel, transition } from "@/components/shared/Motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export default function AppModal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          {...modalBackdrop}
          transition={transition}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-5"
          onClick={onClose}
        >
          <motion.div
            {...modalPanel}
            transition={transition}
            className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[20px] bg-white p-8"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#282828] m-0">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="bg-transparent border-none cursor-pointer p-2 rounded-lg hover:bg-[#282828]/10"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
