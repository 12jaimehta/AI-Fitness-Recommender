"use client";

import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";

interface AIInsightCardProps {
  title: string;
  message: string;
  type: 'warning' | 'success' | 'info';
}

export default function AIInsightCard({ title, message, type }: AIInsightCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  const colors = {
    warning: 'bg-amber-50 border-amber-100 text-amber-900',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-900',
    info: 'bg-blue-50 border-blue-100 text-blue-900',
  };

  const icons = {
    warning: <Sparkles size={18} className="text-amber-600" />,
    success: <Sparkles size={18} className="text-emerald-600" />,
    info: <Sparkles size={18} className="text-blue-600" />,
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`p-4 rounded-xl border ${colors[type]} flex gap-4 items-start shadow-sm relative group`}
    >
      <div className="mt-0.5 shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-sm mb-1 flex justify-between items-center">
          {title}
        </h4>
        <p className="text-sm opacity-90 leading-relaxed">{message}</p>
      </div>
      
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/5 rounded-full"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}