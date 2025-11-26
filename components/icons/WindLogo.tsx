import React from 'react';

interface WindLogoProps {
  className?: string;
  size?: number;
  variant?: 'default' | 'hirer'; // default = green/cyan, hirer = purple/pink
}

// Wind AI Logo inspired by Windranger from Dota 2
// Features: Arrow/bow motif with flowing wind lines
export const WindLogo: React.FC<WindLogoProps> = ({ className = "", size = 32, variant = 'default' }) => {
  const gradientId = variant === 'hirer' ? 'windGradientHirer' : 'windGradient';
  const colors = variant === 'hirer' 
    ? { start: '#a855f7', mid: '#ec4899', end: '#8b5cf6' }
    : { start: '#34d399', mid: '#22d3ee', end: '#10b981' };
  
  return (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background glow */}
    <defs>
      <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={colors.start} />
        <stop offset="50%" stopColor={colors.mid} />
        <stop offset="100%" stopColor={colors.end} />
      </linearGradient>
      <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#000" />
        <stop offset="100%" stopColor="#1a1a1a" />
      </linearGradient>
    </defs>
    
    {/* Main circle background */}
    <circle cx="24" cy="24" r="22" fill={`url(#${gradientId})`} />
    
    {/* Arrow - Windranger's signature */}
    <path 
      d="M12 24 L36 24 M32 20 L36 24 L32 28" 
      stroke="url(#arrowGradient)" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    
    {/* Wind flow lines - dynamic motion */}
    <path 
      d="M10 18 Q16 18, 20 15" 
      stroke="#000" 
      strokeWidth="2" 
      strokeLinecap="round"
      opacity="0.7"
    />
    <path 
      d="M10 30 Q16 30, 20 33" 
      stroke="#000" 
      strokeWidth="2" 
      strokeLinecap="round"
      opacity="0.7"
    />
    
    {/* Small accent wind line */}
    <path 
      d="M14 24 Q18 21, 22 24" 
      stroke="#000" 
      strokeWidth="1.5" 
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
  );
};

// Compact version for smaller spaces
export const WindLogoCompact: React.FC<WindLogoProps> = ({ className = "", size = 24, variant = 'default' }) => {
  const gradientId = variant === 'hirer' ? 'windGradientCompactHirer' : 'windGradientCompact';
  const colors = variant === 'hirer' 
    ? { start: '#a855f7', end: '#ec4899' }
    : { start: '#34d399', end: '#22d3ee' };
  
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
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.start} />
          <stop offset="100%" stopColor={colors.end} />
        </linearGradient>
      </defs>
      
      {/* Circle */}
      <circle cx="16" cy="16" r="14" fill={`url(#${gradientId})`} />
      
      {/* Arrow */}
      <path 
        d="M8 16 L24 16 M21 13 L24 16 L21 19" 
        stroke="#000" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Wind lines */}
      <path 
        d="M7 12 Q11 12, 14 10" 
        stroke="#000" 
        strokeWidth="1.5" 
        strokeLinecap="round"
        opacity="0.6"
      />
      <path 
        d="M7 20 Q11 20, 14 22" 
        stroke="#000" 
        strokeWidth="1.5" 
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
};

export default WindLogo;

