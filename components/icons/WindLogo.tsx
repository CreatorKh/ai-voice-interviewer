import React from 'react';

interface WindLogoProps {
  className?: string;
  size?: number;
  variant?: 'default' | 'hirer';
}

// Wind AI Logo based on the "Wind Mane" reference
// Features: Flowing organic waves/hair with spirals, gradient fill, no circle background
export const WindLogo: React.FC<WindLogoProps> = ({ className = "", size = 32, variant = 'default' }) => {
  const colors = variant === 'hirer' 
    ? { 
        primary: '#db2777', // Pink-600
        secondary: '#9333ea', // Purple-600
        accent: '#fbcfe8', // Pink-200
      }
    : { 
        primary: '#10b981', // Emerald-500
        secondary: '#06b6d4', // Cyan-500
        accent: '#6ee7b7', // Emerald-300
      };
  
  const gradientId = variant === 'hirer' ? 'grad_wind_h' : 'grad_wind_d';

  // Increased viewBox to allow for the wide shape
  // The shape is roughly 2:1 aspect ratio
  return (
    <svg 
      width={size} 
      height={size * 0.6} // Adjust height to maintain aspect ratio if width is dominant, or let CSS handle it
      viewBox="0 0 100 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={colors.secondary} />
          <stop offset="100%" stopColor={colors.primary} />
        </linearGradient>
      </defs>
      
      {/* 
         Main Shape Construction:
         1. Big left swirl base
         2. Flowing top mane
         3. Right side curling down
         4. Underbelly curling back left
      */}
      <path 
        d="M20 45 
           C 5 45, 5 25, 20 20 
           C 35 15, 60 5, 85 15 
           C 95 20, 95 35, 80 40
           C 70 42, 60 35, 65 25
           C 70 15, 40 15, 30 30
           C 25 38, 35 42, 40 45
           C 30 50, 20 45, 20 45 Z" 
        fill={`url(#${gradientId})`}
      />
      
      {/* Highlight Strand (Top) - adds depth/detail */}
      <path 
        d="M25 25
           C 35 15, 60 10, 80 18
           C 85 20, 82 25, 75 22
           C 60 15, 40 20, 35 30
           C 30 32, 28 28, 25 25 Z" 
        fill={colors.accent}
        opacity="0.3"
      />
      
      {/* Left decorative spiral line */}
      <path 
        d="M18 22 C 12 24, 10 35, 16 38" 
        stroke={colors.secondary} 
        strokeWidth="3" 
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Right decorative curl */}
      <path 
        d="M82 38 C 88 35, 92 25, 85 18" 
        stroke={colors.primary} 
        strokeWidth="2" 
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
};

// Compact version - simplified shape
export const WindLogoCompact: React.FC<WindLogoProps> = ({ className = "", size = 24, variant = 'default' }) => {
   const colors = variant === 'hirer' 
    ? { primary: '#db2777', secondary: '#9333ea' }
    : { primary: '#10b981', secondary: '#06b6d4' };
    
   const gradientId = variant === 'hirer' ? 'grad_wind_ch' : 'grad_wind_cd';

  return (
    <svg 
      width={size} 
      height={size * 0.6} 
      viewBox="0 0 100 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={colors.secondary} />
          <stop offset="100%" stopColor={colors.primary} />
        </linearGradient>
      </defs>
      <path 
        d="M20 45 C 5 45, 5 25, 20 20 C 35 15, 60 5, 85 15 C 95 20, 95 35, 80 40 C 70 42, 60 35, 65 25 C 70 15, 40 15, 30 30 C 25 38, 35 42, 40 45 C 30 50, 20 45, 20 45 Z" 
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
};

export default WindLogo;
