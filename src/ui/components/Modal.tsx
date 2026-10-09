import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidth = 'sm',
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full h-full rounded-none',
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div
        className={`w-full ${maxWidthStyles[maxWidth]} bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150`}
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-2.5">
              {icon && <div className="shrink-0">{icon}</div>}
              <div>
                {title && (
                  <h3 className="text-base font-black text-white uppercase tracking-wide leading-tight">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs text-slate-400 leading-tight mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-all"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Modal Content Body */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Modal Footer Actions */}
        {footer && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex flex-col gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
