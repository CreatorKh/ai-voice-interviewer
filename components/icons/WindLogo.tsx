import React from 'react';

interface WindLogoProps {
  className?: string;
  size?: number;
  variant?: 'default' | 'hirer'; // default = green/cyan, hirer = purple/pink
}

// Wind AI Logo - Explicit "Wind Gust" iconography
// Instantly readable: horizontal speed lines with curled ends
export const WindLogo: React.FC<WindLogoProps> = ({ className = "", size = 32, variant = 'default' }) => {
  const id = variant === 'hirer' ? 'h' : 'd';
  const colors = variant === 'hirer' 
    ? { bg1: '#a855f7', bg2: '#ec4899', line: '#fff' }
    : { bg1: '#10b981', bg2: '#06b6d4', line: '#fff' };
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`wg${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.bg1} />
          <stop offset="100%" stopColor={colors.bg2} />
        </linearGradient>
      </defs>
      
      {/* Circle background */}
      <circle cx="24" cy="24" r="22" fill={`url(#wg${id})`} />
      
      {/* Iconic Wind Streams */}
      {/* Top stream */}
      <path 
        d="M11 15 H31 C34 15 35 13 33 11" 
        stroke={colors.line} 
        strokeWidth="3" 
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Middle stream - longest */}
      <path 
        d="M7 24 H37 C40 24 41 22 39 20" 
        stroke={colors.line} 
        strokeWidth="3" 
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Bottom stream */}
      <path 
        d="M11 33 H29 C32 33 33 31 31 29" 
        stroke={colors.line} 
        strokeWidth="3" 
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

// Compact version
export const WindLogoCompact: React.FC<WindLogoProps> = ({ className = "", size = 24, variant = 'default' }) => {
  const id = variant === 'hirer' ? 'hc' : 'dc';
  const colors = variant === 'hirer' 
    ? { bg1: '#a855f7', bg2: '#ec4899', line: '#fff' }
    : { bg1: '#10b981', bg2: '#06b6d4', line: '#fff' };
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`wgc${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.bg1} />
          <stop offset="100%" stopColor={colors.bg2} />
        </linearGradient>
      </defs>
      
      {/* Circle */}
      <circle cx="16" cy="16" r="14" fill={`url(#wgc${id})`} />
      
      {/* Wind Streams */}
      <path 
        d="M7 10 H21 C23 10 24 8 22 7" 
        stroke={colors.line} 
        strokeWidth="2" 
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path 
        d="M5 16 H25 C27 16 28 14 26 13" 
        stroke={colors.line} 
        strokeWidth="2" 
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path 
        d="M7 22 H19 C21 22 22 20 20 19" 
        stroke={colors.line} 
        strokeWidth="2" 
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default WindLogo;
