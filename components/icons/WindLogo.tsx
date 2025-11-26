import React from 'react';

interface WindLogoProps {
  className?: string;
  size?: number;
  variant?: 'default' | 'hirer'; // default = green/cyan, hirer = purple/pink
}

// Wind AI Logo inspired by Windranger Arcana from Dota 2
// Swirling wind vortex effect like the wind around her feet
export const WindLogo: React.FC<WindLogoProps> = ({ className = "", size = 32, variant = 'default' }) => {
  const id = variant === 'hirer' ? 'h' : 'd';
  const colors = variant === 'hirer' 
    ? { bg1: '#7c3aed', bg2: '#db2777', accent: '#f0abfc', line: '#fff' }
    : { bg1: '#059669', bg2: '#0891b2', accent: '#6ee7b7', line: '#fff' };
  
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
        <linearGradient id={`ws${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors.line} stopOpacity="0.3" />
          <stop offset="50%" stopColor={colors.line} stopOpacity="1" />
          <stop offset="100%" stopColor={colors.accent} stopOpacity="0.8" />
        </linearGradient>
      </defs>
      
      {/* Circle background */}
      <circle cx="24" cy="24" r="22" fill={`url(#wg${id})`} />
      
      {/* Swirling vortex - Arcana style wind spiral */}
      {/* Outer spiral */}
      <path 
        d="M12 28 
           Q8 24, 12 18 
           Q16 12, 24 12 
           Q32 12, 36 18
           Q40 24, 36 30"
        stroke={`url(#ws${id})`}
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Middle spiral - main swirl */}
      <path 
        d="M16 30 
           Q12 26, 16 20 
           Q20 14, 26 16 
           Q32 18, 34 24
           Q36 30, 32 34"
        stroke={colors.line}
        strokeWidth="3" 
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Inner spiral - tight center */}
      <path 
        d="M20 28 
           Q18 24, 22 22 
           Q26 20, 28 24
           Q30 28, 26 30"
        stroke={colors.line}
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      
      {/* Center swirl dot */}
      <circle cx="24" cy="26" r="2" fill={colors.accent} />
      
      {/* Floating wind particles */}
      <circle cx="14" cy="16" r="1.5" fill={colors.line} opacity="0.6" />
      <circle cx="34" cy="14" r="1" fill={colors.line} opacity="0.5" />
      <circle cx="38" cy="32" r="1.5" fill={colors.accent} opacity="0.7" />
    </svg>
  );
};

// Compact version for smaller spaces
export const WindLogoCompact: React.FC<WindLogoProps> = ({ className = "", size = 24, variant = 'default' }) => {
  const id = variant === 'hirer' ? 'hc' : 'dc';
  const colors = variant === 'hirer' 
    ? { bg1: '#7c3aed', bg2: '#db2777', accent: '#f0abfc', line: '#fff' }
    : { bg1: '#059669', bg2: '#0891b2', accent: '#6ee7b7', line: '#fff' };
  
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
      
      {/* Swirling vortex - simplified */}
      <path 
        d="M8 18 Q6 14, 10 11 Q14 8, 18 10 Q22 12, 24 16 Q26 20, 22 23"
        stroke={colors.line}
        strokeWidth="2" 
        strokeLinecap="round"
        fill="none"
      />
      
      <path 
        d="M12 19 Q10 16, 14 14 Q18 12, 20 16 Q22 20, 18 21"
        stroke={colors.line}
        strokeWidth="2.5" 
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Center */}
      <circle cx="16" cy="17" r="1.5" fill={colors.accent} />
      
      {/* Particles */}
      <circle cx="10" cy="10" r="1" fill={colors.line} opacity="0.6" />
      <circle cx="24" cy="22" r="1" fill={colors.accent} opacity="0.7" />
    </svg>
  );
};

export default WindLogo;

