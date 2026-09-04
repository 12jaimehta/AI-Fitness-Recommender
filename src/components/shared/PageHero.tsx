"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { motion, enter } from "@/components/shared/Motion";
import { cn } from "@/lib/utils";

export type HeroPhoto = "diet" | "workout" | "coach" | "profile" | "connect" | "docs";

const PHOTOS: Record<HeroPhoto, string> = {
  diet: "/home/photos/photo1.jpg",
  workout: "/home/photos/photo2.jpg",
  coach: "/home/photos/photo3.jpg",
  profile: "/home/photos/photo4.jpg",
  connect: "/home/photos/photo2.jpg",
  docs: "/home/photos/photo4.jpg",
};

/**
 * Dark photographic band that opens every inner page, so the whole app
 * reads like the landing page. Sits under the fixed navbar.
 */
export default function PageHero({
  kicker,
  title,
  subtitle,
  photo = "coach",
  actions,
  aside,
  size = "md",
  align = "left",
  className,
}: {
  kicker?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  photo?: HeroPhoto;
  actions?: ReactNode;
  aside?: ReactNode;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
  className?: string;
}) {
  const pad = size === "lg" ? "pt-36 pb-24 lg:pt-44 lg:pb-32" : size === "sm" ? "pt-28 pb-10 lg:pt-32 lg:pb-12" : "pt-32 pb-14 lg:pt-36 lg:pb-20";
  const centered = align === "center";

  return (
    <section className={cn("relative isolate overflow-hidden bg-black text-white", className)}>
      <Image
        src={PHOTOS[photo]}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/45 to-black/80" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-fyte-page/90 to-transparent" />

      <div className={cn("relative mx-auto max-w-6xl px-5 sm:px-8", pad)}>
        <div className={cn("flex flex-col gap-8", centered ? "items-center text-center" : "lg:flex-row lg:items-end lg:justify-between")}>
          <div className={cn("max-w-2xl", centered && "mx-auto")}>
            {kicker ? (
              <motion.p {...enter(0)} className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                {kicker}
              </motion.p>
            ) : null}
            <motion.h1
              {...enter(0.04)}
              className={cn(
                "font-extrabold leading-[1.05] tracking-tight text-shadow-lg",
                size === "lg" ? "text-[clamp(36px,7vw,72px)]" : size === "sm" ? "text-[clamp(28px,4vw,40px)]" : "text-[clamp(32px,5vw,56px)]"
              )}
            >
              {title}
            </motion.h1>
            {subtitle ? (
              <motion.div {...enter(0.08)} className="mt-4 max-w-xl text-base leading-7 text-white/80 text-shadow-md sm:text-lg">
                {subtitle}
              </motion.div>
            ) : null}
            {actions ? (
              <motion.div {...enter(0.12)} className={cn("mt-8 flex flex-wrap gap-3", centered && "justify-center")}>
                {actions}
              </motion.div>
            ) : null}
          </div>
          {aside ? (
            <motion.div {...enter(0.1)} className="w-full lg:w-auto">
              {aside}
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
