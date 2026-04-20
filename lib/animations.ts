"use client";

import { Variants } from "framer-motion";

// Easing functions for smooth animations
export const easings = {
  smooth: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  spring: { type: "spring", stiffness: 300, damping: 30 },
} as const;

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
    },
  },
};

// Card stagger animation variants
export const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 16,
    scale: 0.96,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: easings.smooth,
    },
  },
  hover: {
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: easings.smooth,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

// List item variants
export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -12,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: 12,
    transition: {
      duration: 0.2,
    },
  },
};

// Modal/Sheet variants
export const sheetVariants: Variants = {
  initial: {
    opacity: 0,
    x: "100%",
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: {
      duration: 0.25,
      ease: easings.smooth,
    },
  },
};

// Fade in variants
export const fadeInVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Scale in variants (for buttons, badges)
export const scaleInVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: easings.bounce,
    },
  },
};

// Skeleton loading animation
export const skeletonVariants: Variants = {
  initial: {
    opacity: 0.5,
  },
  animate: {
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Stagger children for lists
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: easings.smooth,
    },
  },
};

// Button press animation
export const buttonPressVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.97 },
};

// Number counter animation
export const numberVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.smooth,
    },
  },
};

// Slide up animation for FAB and bottom nav
export const slideUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 50,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easings.smooth,
      delay: 0.2,
    },
  },
};
