// components/ui/GenderSelectCard.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image"; 

export const MaleImage = (props: { className?: string }) => (
  <Image
    src="/images/male.png"
    alt="Male icon"
    width={64} 
    height={64} 
    className={cn(props.className, "object-cover rounded-full border-none")}
    priority
  />
);

export const FemaleImage = (props: { className?: string }) => (
  <Image
    src="/images/female.png"
    alt="Female icon"
    width={64} // Set width/height to match the parent div
    height={64} // Ensure these match
    className={cn(props.className, "object-cover rounded-full")} // Add object-cover and rounded-full here
    priority
  />
);

// --- Component Setup ---

type Option = { value: string; icon: React.ReactNode; label: string; description?: string };
type Props = {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
};

const defaultGenderOptions: Option[] = [
  {
    value: "male",
    icon: <MaleImage />, // No need for className here, it's handled inside MaleImage
    label: "Male",
    description: "Plan optimized for male physique and metabolism.",
  },
  {
    value: "female",
    icon: <FemaleImage />, // No need for className here, it's handled inside FemaleImage
    label: "Female",
    description: "Plan optimized for female physique and metabolism.",
  },
];

export default function GenderSelectCard({ options = defaultGenderOptions, value, onChange }: Props) {
  const finalOptions = options.length > 0 ? options : defaultGenderOptions;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {finalOptions.map((opt) => {
        const active = value === opt.value;
        return (
          <motion.button
            type="button"
            key={opt.value}
            onClick={() => onChange(opt.value)}
            whileHover={{ scale: 1.02, boxShadow: active ? undefined : "0 8px 15px rgba(22,42,65,0.1)" }}
            whileTap={{ scale: 0.98 }}
            animate={{
                borderColor: active ? "#282828" : "#e5e7eb",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "relative rounded-xl p-6 text-left border-2 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-[#282828]/20",
              active
                ? "bg-[#282828] text-white shadow-[0_12px_30px_rgba(22,42,65,0.18)]"
                : "bg-white text-gray-800 hover:shadow-lg hover:border-[#454545]"
            )}
          >
            {/* Icon Area - This div now acts as a circular mask */}
            <div className={cn(
                "w-16 h-16 flex items-center justify-center rounded-full mb-4 overflow-hidden transition-colors duration-300", // Add overflow-hidden here
                active ? "bg-white text-[#282828]" : "bg-gray-100 text-gray-600"
            )}>
                {opt.icon}
            </div>

            {/* Label and Description */}
            <div className="font-bold text-xl">{opt.label}</div>
            {opt.description && <div className={cn("text-sm mt-1", active ? "text-gray-300" : "text-gray-500")}>{opt.description}</div>}
            
            {/* Active Checkmark */}
            {active && (
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#282828]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}