export const duration = {
  fast: 0.16,
  base: 0.2,
  slow: 0.32,
} as const;

export const easeOut = [0.22, 1, 0.36, 1] as [number, number, number, number];

export const transition = {
  duration: duration.base,
  ease: easeOut,
};

export const fillTransition = {
  duration: duration.slow,
  ease: easeOut,
};

export const stagger = 0.04;

export function delay(index: number, base = 0) {
  return base + index * stagger;
}

export const press = {
  whileHover: { scale: 1.015 },
  whileTap: { scale: 0.985 },
};

export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
};

export const stepSwap = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
};

export const collapse = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto" as const, opacity: 1 },
  exit: { height: 0, opacity: 0 },
};

export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalPanel = {
  initial: { opacity: 0, scale: 0.98, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 8 },
};

export const popIn = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
};

export function withDelay(seconds = 0) {
  return { ...transition, delay: seconds };
}

export function enter(seconds = 0) {
  return {
    ...fadeUp,
    transition: withDelay(seconds),
  };
}

export function enterPop(seconds = 0) {
  return {
    ...popIn,
    transition: withDelay(seconds),
  };
}

export function pressWhen(enabled = true) {
  return enabled ? press : {};
}

export const hoverLift = {
  whileHover: { y: -2 },
};

export const staggerList = {
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger },
  },
};

export const staggerItem = {
  hidden: fadeUp.initial,
  visible: { ...fadeUp.animate, transition },
};

export const viewportOnce = { once: true, amount: 0.15 } as const;

export const crossfade = {
  duration: duration.slow,
  ease: easeOut,
};
