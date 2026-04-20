import React from "react";

interface SpiderLogoProps {
  size?: number;
  className?: string;
}

export function SpiderLogo({ size = 24, className = "" }: SpiderLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Spider body */}
      <ellipse
        cx="12"
        cy="12"
        rx="3"
        ry="4"
        fill="currentColor"
        className="text-red-600"
      />
      
      {/* Spider head */}
      <circle
        cx="12"
        cy="8"
        r="2"
        fill="currentColor"
        className="text-red-700"
      />
      
      {/* Spider legs - 8 legs total */}
      {/* Top left legs */}
      <path
        d="M9 10 L6 7 M9 11 L5 9 M9 12 L4 12 M9 13 L5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-red-600"
      />
      
      {/* Top right legs */}
      <path
        d="M15 10 L18 7 M15 11 L19 9 M15 12 L20 12 M15 13 L19 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-red-600"
      />
      
      {/* Eyes - glowing effect */}
      <circle cx="11" cy="7.5" r="0.8" fill="#0891B2" />
      <circle cx="13" cy="7.5" r="0.8" fill="#0891B2" />
      
      {/* Subtle glow */}
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.3"
        className="text-red-500"
      />
    </svg>
  );
}
