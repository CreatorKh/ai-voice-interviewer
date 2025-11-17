import React from 'react';

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

const Skeleton: React.FC<{className?: string}> = ({className}) => {
  return <div className={cn("animate-pulse rounded-md bg-white/10", className)} />;
}

export default Skeleton;
