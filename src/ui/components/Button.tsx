import React from 'react';
import { sound } from '../../game/Audio';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'gold' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  pulse?: boolean;
  soundType?: 'click' | 'upgrade' | 'none';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  pulse = false,
  soundType = 'click',
  disabled,
  className = '',
  onClick,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (soundType === 'click') sound.playClick();
    if (soundType === 'upgrade') sound.playUpgrade();
    if (onClick) onClick(e);
  };

  // Base mobile ergonomic touch targets (min 44px)
  const baseStyles = 'inline-flex items-center justify-center font-bold font-sans tracking-wide uppercase rounded-2xl select-none transition-all duration-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-md cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-2 min-h-[38px] gap-1.5 rounded-xl',
    md: 'text-sm px-4 py-2.5 min-h-[46px] gap-2 rounded-2xl',
    lg: 'text-base px-6 py-3.5 min-h-[54px] gap-2.5 rounded-2xl shadow-lg',
    xl: 'text-lg px-8 py-4 min-h-[62px] gap-3 rounded-3xl shadow-xl font-black',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white border-t border-blue-400/50 shadow-blue-900/40',
    secondary: 'bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700 shadow-slate-950/50',
    success: 'bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 border-t border-emerald-300 shadow-emerald-950/40 font-black',
    gold: 'bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-t border-amber-200 shadow-amber-950/40 font-black',
    danger: 'bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white border-t border-red-400 shadow-red-950/40',
    ghost: 'bg-transparent hover:bg-white/10 text-slate-300 hover:text-white border-none shadow-none',
  };

  const pulseStyle = pulse && !disabled ? 'animate-pulse' : '';
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${pulseStyle} ${widthStyle} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
