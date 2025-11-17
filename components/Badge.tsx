import React from 'react';

const Badge: React.FC<{children: React.ReactNode}> = ({children}) => {
  return <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{children}</span>;
}

export default Badge;
