import React from 'react';

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

const Stepper: React.FC<{current: number; total?: number}> = ({current=1, total=3}) => {
  return (
    <div className="flex items-center gap-2 select-none">
      {Array.from({length:total}).map((_,i)=>(
        <div key={i} className={cn("h-1.5 w-full rounded-full", i < current ? "bg-cyan-400" : "bg-white/10")} />
      ))}
    </div>
  );
}

export default Stepper;
