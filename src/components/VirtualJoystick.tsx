import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface VirtualJoystickProps {
  onMove: (vector: THREE.Vector2) => void;
  disabled?: boolean;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, disabled = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const baseCenterRef = useRef({ x: 0, y: 0 });

  // Keyboard controls listener (WASD / Arrows)
  useEffect(() => {
    const keysDown = new Set<string>();

    const updateKeyboardVector = () => {
      let x = 0;
      let y = 0;
      if (keysDown.has('KeyW') || keysDown.has('ArrowUp')) y -= 1;
      if (keysDown.has('KeyS') || keysDown.has('ArrowDown')) y += 1;
      if (keysDown.has('KeyA') || keysDown.has('ArrowLeft')) x -= 1;
      if (keysDown.has('KeyD') || keysDown.has('ArrowRight')) x += 1;

      const vec = new THREE.Vector2(x, y);
      if (vec.lengthSq() > 0) {
        vec.normalize();
      }
      onMove(vec);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      keysDown.add(e.code);
      updateKeyboardVector();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.code);
      updateKeyboardVector();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [disabled, onMove]);

  // Touch Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      baseCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      setIsDragging(true);
      touchIdRef.current = e.pointerId;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      handlePointerMove(e);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || e.pointerId !== touchIdRef.current) return;

    const dx = e.clientX - baseCenterRef.current.x;
    const dy = e.clientY - baseCenterRef.current.y;
    const maxRadius = 45;

    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(maxRadius, dist);
    const angle = Math.atan2(dy, dx);

    const targetX = Math.cos(angle) * clampedDist;
    const targetY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: targetX, y: targetY });

    // Output normalized vector (-1 to 1)
    const normX = targetX / maxRadius;
    const normY = targetY / maxRadius;
    onMove(new THREE.Vector2(normX, normY));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    touchIdRef.current = null;
    setKnobPos({ x: 0, y: 0 });
    onMove(new THREE.Vector2(0, 0));
  };

  return (
    <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center pointer-events-none select-none z-20">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`w-32 h-32 rounded-full border-2 border-white/20 bg-black/35 backdrop-blur-sm flex items-center justify-center pointer-events-auto touch-none relative shadow-xl transition-transform active:scale-95 ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
        }`}
      >
        {/* Directional Guides */}
        <div className="absolute top-2 w-1.5 h-1.5 rounded-full bg-white/30" />
        <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-white/30" />
        <div className="absolute left-2 w-1.5 h-1.5 rounded-full bg-white/30" />
        <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/30" />

        {/* Joystick Center Knob */}
        <div
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 border-2 border-white shadow-lg flex items-center justify-center transition-all duration-75"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        >
          <div className="w-5 h-5 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
};
