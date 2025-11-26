import React from 'react';
import { TransactionStatus } from '../types';

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

interface BadgeProps {
  children: React.ReactNode;
  status?: TransactionStatus;
}

const Badge: React.FC<BadgeProps> = ({ children, status }) => {
  const statusClasses = {
    Approved: "bg-green-500/10 text-green-400 border-green-500/20",
    Declined: "bg-red-500/10 text-red-400 border-red-500/20",
    Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  }[status || 'Pending'];

  return (
    <span
      className={cn(
        "text-xs px-2.5 py-1 rounded-full font-medium border capitalize",
        status ? statusClasses : "bg-white/5 border-white/10"
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
