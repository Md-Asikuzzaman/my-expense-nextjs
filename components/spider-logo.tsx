'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SpiderLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export function SpiderLogo({ size = 80, className, animated = true }: SpiderLogoProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const actualSize = isMobile && size > 60 ? 60 : size;

  return (
    <motion.svg
      width={actualSize}
      height={actualSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('transform-gpu', className)}
      initial={animated ? { scale: 0.8, opacity: 0 } : false}
      animate={animated ? { scale: 1, opacity: 1 } : false}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <defs>
        {/* Spider Red Gradient */}
        <linearGradient id="spiderRed" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
        {/* Electric Cyan Gradient */}
        <linearGradient id="electricCyan" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0891B2" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        {/* Glow Filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Spider Web Background */}
      <g opacity="0.3" stroke="url(#spiderRed)" strokeWidth="0.5">
        <line x1="50" y1="10" x2="50" y2="90" />
        <line x1="10" y1="50" x2="90" y2="50" />
        <line x1="20" y1="20" x2="80" y2="80" />
        <line x1="80" y1="20" x2="20" y2="80" />
        <circle cx="50" cy="50" r="15" fill="none" />
        <circle cx="50" cy="50" r="30" fill="none" />
      </g>

      {/* Spider Body */}
      <motion.circle
        cx="50"
        cy="50"
        r="12"
        fill="url(#spiderRed)"
        filter="url(#glow)"
        initial={animated ? { scale: 0 } : false}
        animate={animated ? { scale: 1 } : false}
        transition={{ delay: 0.1, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* Spider Legs - Red/Cyan alternating */}
      <g strokeWidth="2.5" strokeLinecap="round">
        {/* Left legs - Red */}
        <motion.path
          d="M38 42 L20 25"
          stroke="url(#spiderRed)"
          initial={animated ? { pathLength: 0 } : false}
          animate={animated ? { pathLength: 1 } : false}
          transition={{ delay: 0.15, duration: 0.25 }}
        />
        <motion.path
          d="M35 50 L15 45"
          stroke="url(#spiderRed)"
          initial={animated ? { pathLength: 0 } : false}
          animate={animated ? { pathLength: 1 } : false}
          transition={{ delay: 0.2, duration: 0.25 }}
        />
        <motion.path
          d="M38 58 L20 75"
          stroke="url(#spiderRed)"
          initial={animated ? { pathLength: 0 } : false}
          animate={animated ? { pathLength: 1 } : false}
          transition={{ delay: 0.25, duration: 0.25 }}
        />

        {/* Right legs - Cyan */}
        <motion.path
          d="M62 42 L80 25"
          stroke="url(#electricCyan)"
          initial={animated ? { pathLength: 0 } : false}
          animate={animated ? { pathLength: 1 } : false}
          transition={{ delay: 0.15, duration: 0.25 }}
        />
        <motion.path
          d="M65 50 L85 45"
          stroke="url(#electricCyan)"
          initial={animated ? { pathLength: 0 } : false}
          animate={animated ? { pathLength: 1 } : false}
          transition={{ delay: 0.2, duration: 0.25 }}
        />
        <motion.path
          d="M62 58 L80 75"
          stroke="url(#electricCyan)"
          initial={animated ? { pathLength: 0 } : false}
          animate={animated ? { pathLength: 1 } : false}
          transition={{ delay: 0.25, duration: 0.25 }}
        />
      </g>

      {/* Energy pulse effect - desktop only */}
      {!isMobile && animated && (
        <motion.circle
          cx="50"
          cy="50"
          r="12"
          fill="none"
          stroke="url(#spiderRed)"
          strokeWidth="1"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
            ease: 'easeOut',
          }}
        />
      )}
    </motion.svg>
  );
}

export function SpiderLogoSmall({ className }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="spiderRedSmall" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
        <linearGradient id="electricCyanSmall" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0891B2" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="12" fill="url(#spiderRedSmall)" />
      <g strokeWidth="3" strokeLinecap="round">
        <path d="M38 42 L20 25" stroke="url(#spiderRedSmall)" />
        <path d="M35 50 L15 45" stroke="url(#spiderRedSmall)" />
        <path d="M38 58 L20 75" stroke="url(#spiderRedSmall)" />
        <path d="M62 42 L80 25" stroke="url(#electricCyanSmall)" />
        <path d="M65 50 L85 45" stroke="url(#electricCyanSmall)" />
        <path d="M62 58 L80 75" stroke="url(#electricCyanSmall)" />
      </g>
    </svg>
  );
}
