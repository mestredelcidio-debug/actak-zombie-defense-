/**
 * Sector Quarantine: Mobile Device Frame Wrapper
 * Provides an ergonomic portrait mobile viewport with simulated chassis on desktop and seamless fit on phones.
 */

import React, { useState } from 'react';
import { Maximize2, Minimize2, Smartphone } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [fullscreenMobile, setFullscreenMobile] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-0 sm:p-4 select-none overflow-hidden">
      {/* Top desktop header bar (only visible on wide screens) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-[440px] mb-2 px-2 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold text-zinc-300">SECTOR QUARANTINE</span>
          <span className="text-zinc-600">·</span>
          <span>MOBILE TACTICAL</span>
        </div>
        <button
          onClick={() => setFullscreenMobile(!fullscreenMobile)}
          className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
        >
          {fullscreenMobile ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          <span>{fullscreenMobile ? 'Windowed' : 'Fill View'}</span>
        </button>
      </div>

      {/* Mobile Device Chassis */}
      <div
        className={`relative bg-zinc-950 transition-all duration-200 overflow-hidden ${
          fullscreenMobile
            ? 'w-full h-screen rounded-none'
            : 'w-full max-w-[420px] h-[100dvh] sm:h-[840px] sm:max-h-[92vh] sm:rounded-[36px] sm:border-4 sm:border-zinc-800 sm:shadow-2xl sm:shadow-black'
        }`}
      >
        {/* Mobile Camera Island / Speaker Notch (only visible in desktop simulated mode) */}
        <div className="hidden sm:flex absolute top-2 left-1/2 -translate-x-1/2 z-50 w-24 h-4 bg-zinc-900 rounded-full items-center justify-center gap-2 pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-zinc-950 border border-zinc-800" />
          <div className="w-8 h-1 rounded-full bg-zinc-800" />
        </div>

        {/* Content Viewport */}
        <div className="w-full h-full relative flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};
