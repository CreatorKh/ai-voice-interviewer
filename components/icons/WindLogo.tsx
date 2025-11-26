import React from 'react';

interface WindLogoProps {
  className?: string;
  size?: number;
  variant?: 'default' | 'hirer'; // default = green/cyan, hirer = purple/pink
}

// Wind AI Logo inspired by Windranger from Dota 2
// Beautiful flowing wind streams
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
      
      {/* Wind streams - elegant flowing curves */}
      {/* Top wind stream */}
      <path 
        d="M10 16 Q18 16, 22 12 Q26 8, 34 10" 
        stroke={colors.line} 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      
      {/* Middle wind stream - main, thicker */}
      <path 
        d="M8 24 Q16 24, 22 20 Q28 16, 38 20" 
        stroke={colors.line} 
        strokeWidth="3.5" 
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Bottom wind stream */}
      <path 
        d="M12 32 Q20 32, 26 28 Q32 24, 40 28" 
        stroke={colors.line} 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      
      {/* Small accent swirl */}
      <path 
        d="M14 40 Q20 38, 24 36" 
        stroke={colors.line} 
        strokeWidth="2" 
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
};

// Compact version for smaller spaces
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
      
      {/* Wind streams */}
      <path 
        d="M6 11 Q12 11, 15 8 Q18 5, 24 7" 
        stroke={colors.line} 
        strokeWidth="2" 
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <path 
        d="M5 16 Q11 16, 15 13 Q19 10, 26 13" 
        stroke={colors.line} 
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
      />
      <path 
        d="M7 21 Q13 21, 17 18 Q21 15, 27 18" 
        stroke={colors.line} 
        strokeWidth="2" 
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
    </svg>
  );
};

export default WindLogo;

