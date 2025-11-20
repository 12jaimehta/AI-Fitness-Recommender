// components/ui/FormCardWrapper.tsx
"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function FormCardWrapper({ children, className = "" }: Props) {
  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl border bg-white/70 backdrop-blur-md p-8 md:p-10 max-w-4xl mx-auto shadow-[0_32px_64px_-12px_rgba(102,126,234,0.18)] border-[rgba(102,126,234,0.12)] " +
        className
      }
    >
      {children}
    </div>
  );
}
