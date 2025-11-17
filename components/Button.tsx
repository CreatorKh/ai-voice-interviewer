import React from 'react';

const cn = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
}

const Button: React.FC<ButtonProps> = ({ className, variant = "primary", ...rest }) => {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 disabled:opacity-50 disabled:pointer-events-none";
  const styles = {
    primary: "bg-cyan-400 text-black hover:bg-cyan-300",
    outline: "bg-transparent border border-white/10 hover:border-cyan-400/40",
    ghost: "bg-transparent hover:bg-white/5"
  }[variant];
  return <button className={cn(base, styles, className)} {...rest}/>;
}

export default Button;
