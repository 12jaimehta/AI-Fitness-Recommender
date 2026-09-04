"use client";

import { motion, AnimatePresence, MotionConfig, type HTMLMotionProps } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import {
  collapse,
  fade,
  fadeUp,
  fillTransition,
  press,
  stepSwap,
  transition,
  withDelay,
} from "@/shared/lib/motion";

export { motion, AnimatePresence };
export {
  press,
  pressWhen,
  delay,
  withDelay,
  enter,
  enterPop,
  hoverLift,
  transition,
  duration,
  fade,
  fadeUp,
  popIn,
  collapse,
  modalBackdrop,
  modalPanel,
  staggerList,
  staggerItem,
  viewportOnce,
  crossfade,
} from "@/shared/lib/motion";

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={transition}>
      {children}
    </MotionConfig>
  );
}

type FadeProps = HTMLMotionProps<"div"> & { delay?: number };

export function FadeIn({ delay = 0, ...props }: FadeProps) {
  return <motion.div {...fadeUp} transition={withDelay(delay)} {...props} />;
}

export function Fade({ delay = 0, ...props }: FadeProps) {
  return <motion.div {...fade} transition={withDelay(delay)} {...props} />;
}

export function FadeInView({ delay = 0, ...props }: FadeProps) {
  return (
    <motion.div
      initial={fadeUp.initial}
      whileInView={fadeUp.animate}
      viewport={{ once: true, amount: 0.15 }}
      transition={withDelay(delay)}
      {...props}
    />
  );
}

export function StepSwap({
  id,
  children,
  className,
}: {
  id: string | number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={id} className={className} {...stepSwap} transition={transition}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function Collapse({ open, children, className }: { open: boolean; children: ReactNode; className?: string }) {
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div className={className ?? "overflow-hidden"} {...collapse} transition={transition}>
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function FillX({
  pct,
  className,
  style,
}: {
  pct: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={false}
      animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      transition={fillTransition}
    />
  );
}

export function FillY({
  pct,
  className,
  style,
}: {
  pct: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={false}
      animate={{ height: `${Math.max(0, Math.min(100, pct))}%` }}
      transition={fillTransition}
    />
  );
}

export function Press({
  enabled = true,
  ...props
}: HTMLMotionProps<"button"> & { enabled?: boolean }) {
  return <motion.button {...(enabled ? press : {})} {...props} />;
}
