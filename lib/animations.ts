'use client';

import { Variants } from 'framer-motion';

// Mobile-first optimized easings (faster, snappier)
export const easings = {
  smooth: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  spring: { type: 'spring', stiffness: 400, damping: 35 },
  instant: [0, 0, 0.2, 1],
} as const;

// Page transition variants - 250-300ms as per spec
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.18,
    },
  },
};

// Card stagger animation variants - optimized for mobile
export const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.98,
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
  hover: {
    y: -2,
    transition: {
      duration: 0.18,
      ease: easings.smooth,
    },
  },
  tap: {
    scale: 0.99,
    transition: {
      duration: 0.1,
    },
  },
};

// List item variants - faster for mobile
export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -8,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: 8,
    transition: {
      duration: 0.15,
    },
  },
};

// Modal/Sheet variants - snappy mobile feel
export const sheetVariants: Variants = {
  initial: {
    opacity: 0,
    x: '100%',
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    x: '100%',
    transition: {
      duration: 0.2,
      ease: easings.smooth,
    },
  },
};

// Fade in variants - instant feel
export const fadeInVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

// Scale in variants - reduced bounce for performance
export const scaleInVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: easings.smooth,
    },
  },
};

// Skeleton loading animation - faster pulse
export const skeletonVariants: Variants = {
  initial: {
    opacity: 0.5,
  },
  animate: {
    opacity: [0.5, 0.75, 0.5],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Stagger children for lists - tighter stagger
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

export const staggerItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: easings.smooth,
    },
  },
};

// Button press animation - fast tap feedback
export const buttonPressVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// Number counter animation
export const numberVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easings.smooth,
    },
  },
};

// Slide up animation for FAB - quick entrance
export const slideUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: easings.smooth,
      delay: 0.15,
    },
  },
};
