import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Droplet,
  Flame,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Undo2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { LevelDef, PourMove, TubeData } from '../types/waterSort';
import { WATER_COLORS } from '../utils/waterSortColors';
import { getLevel, PRESET_LEVELS } from '../utils/waterSortLevels';
import { waterAudio } from '../utils/waterSortAudio';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  color: string;
  size: number;
}

export const WaterSortGame: React.FC = () => {
  // Level State
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(11); // Start directly on Level 11 (the exact special level from user's video!)
  const [levelDef, setLevelDef] = useState<LevelDef>(() => getLevel(11));
  const [tubes, setTubes] = useState<TubeData[]>([]);
  const [selectedTubeId, setSelectedTubeId] = useState<number | null>(null);

  // Pouring Animation States
  const [isPouring, setIsPouring] = useState<boolean>(false);
  const [pouringSourceId, setPouringSourceId] = useState<number | null>(null);
  const [pouringTargetId, setPouringTargetId] = useState<number | null>(null);
  const [pouringColor, setPouringColor] = useState<string | null>(null);
  const [pourStreamActive, setPourStreamActive] = useState<boolean>(false);

  // Boosters & History
  const [undoCount, setUndoCount] = useState<number>(5);
  const [moveHistory, setMoveHistory] = useState<{ tubes: string[][]; move: PourMove }[]>([]);
  const [hasAddedTube, setHasAddedTube] = useState<boolean>(false);

  // Modals & UI Flow
  const [showStartModal, setShowStartModal] = useState<boolean>(true);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  // Tube refs to calculate pour positions
  const tubeRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const streamCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize level
  const loadLevel = (lvlNum: number, openModal = true) => {
    const lvl = getLevel(lvlNum);
    setLevelDef(lvl);
    setCurrentLevelNumber(lvlNum);
    setSelectedTubeId(null);
    setIsPouring(false);
    setPouringSourceId(null);
    setPouringTargetId(null);
    setMoveHistory([]);
    setHasAddedTube(false);
    setShowVictoryModal(false);
    setShowStartModal(openModal);

    const initialTubes: TubeData[] = lvl.tubes.map((colors, idx) => ({
      id: idx,
      capacity: lvl.tubeCapacity,
      colors: [...colors],
      isCompleted: colors.length === lvl.tubeCapacity && colors.every((c) => c === colors[0]),
    }));

    setTubes(initialTubes);
  };

  useEffect(() => {
    loadLevel(currentLevelNumber, true);
  }, []);

  // Confetti Physics Loop
  useEffect(() => {
    if (confetti.length === 0) return;
    let animId: number;

    const updateConfetti = () => {
      setConfetti((prev) => {
        if (prev.length === 0) return [];
        return prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.35, // Gravity
            rot: p.rot + p.vRot,
          }))
          .filter((p) => p.y < window.innerHeight + 50);
      });
      animId = requestAnimationFrame(updateConfetti);
    };

    animId = requestAnimationFrame(updateConfetti);
    return () => cancelAnimationFrame(animId);
  }, [confetti]);

  const spawnConfetti = (centerX?: number, centerY?: number) => {
    const colors = ['#ef4444', '#8b5cf6', '#fbbf24', '#3b82f6', '#22c55e', '#ec4899', '#06b6d4'];
    const cx = centerX ?? window.innerWidth / 2;
    const cy = centerY ?? window.innerHeight / 2.5;

    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      pieces.push({
        id: Math.random(),
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        rot: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
      });
    }
    setConfetti((prev) => [...prev, ...pieces]);
  };

  // Check victory condition
  const checkVictory = (currentTubes: TubeData[]) => {
    const allSolved = currentTubes.every((tube) => {
      if (tube.colors.length === 0) return true; // Empty tubes are valid
      if (tube.colors.length !== tube.capacity) return false;
      const firstColor = tube.colors[0];
      return tube.colors.every((c) => c === firstColor);
    });

    if (allSolved) {
      setTimeout(() => {
        waterAudio.playVictory();
        spawnConfetti();
        setShowVictoryModal(true);
      }, 500);
    }
  };

  // User Tube Tap Handler
  const handleTubeClick = (targetTubeId: number) => {
    if (isPouring || showVictoryModal || showStartModal) return;

    // 1. If no tube is currently selected
    if (selectedTubeId === null) {
      const tube = tubes.find((t) => t.id === targetTubeId);
      if (!tube || tube.colors.length === 0) return; // Cannot select empty tube as source
      if (tube.isCompleted) return; // Already sorted tube

      waterAudio.playSelect();
      setSelectedTubeId(targetTubeId);
      return;
    }

    // 2. If user taps the SAME selected tube -> deselect it
    if (selectedTubeId === targetTubeId) {
      waterAudio.playClick();
      setSelectedTubeId(null);
      return;
    }

    // 3. Attempt Pour from selectedTubeId to targetTubeId
    const sourceTube = tubes.find((t) => t.id === selectedTubeId);
    const targetTube = tubes.find((t) => t.id === targetTubeId);

    if (!sourceTube || !targetTube) {
      setSelectedTubeId(null);
      return;
    }

    // Validate pour logic
    if (sourceTube.colors.length === 0) {
      setSelectedTubeId(null);
      return;
    }

    const sourceTopColor = sourceTube.colors[sourceTube.colors.length - 1];
    const targetTopColor = targetTube.colors.length > 0 ? targetTube.colors[targetTube.colors.length - 1] : null;
    const targetFreeSpace = targetTube.capacity - targetTube.colors.length;

    // Must have free space and match color (or pour into empty tube)
    if (targetFreeSpace <= 0 || (targetTopColor !== null && targetTopColor !== sourceTopColor)) {
      // Invalid target -> Switch selection to the tapped tube if valid
      if (targetTube.colors.length > 0 && !targetTube.isCompleted) {
        waterAudio.playSelect();
        setSelectedTubeId(targetTubeId);
      } else {
        waterAudio.playClick();
        setSelectedTubeId(null);
      }
      return;
    }

    // Count how many contiguous top layers of the same color can be poured
    let contiguousCount = 0;
    for (let i = sourceTube.colors.length - 1; i >= 0; i--) {
      if (sourceTube.colors[i] === sourceTopColor) {
        contiguousCount++;
      } else {
        break;
      }
    }
    const transferCount = Math.min(contiguousCount, targetFreeSpace);
    if (transferCount <= 0) return;

    // Save history for Undo
    const snapshot = tubes.map((t) => [...t.colors]);
    setMoveHistory((prev) => [
      ...prev,
      {
        tubes: snapshot,
        move: {
          fromTubeId: selectedTubeId,
          toTubeId: targetTubeId,
          color: sourceTopColor,
          count: transferCount,
        },
      },
    ]);

    // Execute Pour Animation Sequence
    executePourAnimation(selectedTubeId, targetTubeId, sourceTopColor, transferCount);
  };

  const executePourAnimation = (
    fromId: number,
    toId: number,
    color: string,
    count: number
  ) => {
    setIsPouring(true);
    setPouringSourceId(fromId);
    setPouringTargetId(toId);
    setPouringColor(color);
    setSelectedTubeId(null);

    // Audio effects
    waterAudio.playPour(count / 4);
    setTimeout(() => waterAudio.playGlug(), 200);

    // Step 1: Start stream
    setTimeout(() => {
      setPourStreamActive(true);
    }, 150);

    // Step 2: Transfer liquid layers
    setTimeout(() => {
      setTubes((prev) => {
        const next = prev.map((t) => {
          if (t.id === fromId) {
            return {
              ...t,
              colors: t.colors.slice(0, t.colors.length - count),
            };
          }
          if (t.id === toId) {
            const added = Array(count).fill(color);
            const newColors = [...t.colors, ...added];
            const isCompleted = newColors.length === t.capacity && newColors.every((c) => c === newColors[0]);
            return {
              ...t,
              colors: newColors,
              isCompleted,
            };
          }
          return t;
        });

        // Check if destination tube was completed!
        const dest = next.find((t) => t.id === toId);
        if (dest && dest.isCompleted) {
          setTimeout(() => {
            waterAudio.playCompleted();
            spawnConfetti();
          }, 250);
        }

        checkVictory(next);
        return next;
      });
    }, 450);

    // Step 3: End stream and return tube
    setTimeout(() => {
      setPourStreamActive(false);
    }, 600);

    setTimeout(() => {
      setIsPouring(false);
      setPouringSourceId(null);
      setPouringTargetId(null);
      setPouringColor(null);
    }, 850);
  };

  // Undo Button Handler
  const handleUndo = () => {
    if (isPouring || moveHistory.length === 0 || undoCount <= 0) return;

    const lastState = moveHistory[moveHistory.length - 1];
    setMoveHistory((prev) => prev.slice(0, prev.length - 1));
    setUndoCount((prev) => Math.max(0, prev - 1));
    waterAudio.playUndo();

    setTubes((prev) =>
      prev.map((t, idx) => {
        const restoredColors = lastState.tubes[idx] || [];
        const isCompleted =
          restoredColors.length === t.capacity && restoredColors.every((c) => c === restoredColors[0]);
        return {
          ...t,
          colors: [...restoredColors],
          isCompleted,
        };
      })
    );
  };

  // Add Extra Tube Booster (`+1 🧪`)
  const handleAddTube = () => {
    if (hasAddedTube || isPouring) return;
    waterAudio.playUpgrade();
    setHasAddedTube(true);

    const newId = tubes.length;
    setTubes((prev) => [
      ...prev,
      {
        id: newId,
        capacity: levelDef.tubeCapacity,
        colors: [],
        isCompleted: false,
      },
    ]);
  };

  // Restart Level
  const handleRestart = () => {
    waterAudio.playClick();
    loadLevel(currentLevelNumber, false);
  };

  // Toggle Audio
  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    waterAudio.setSoundEnabled(next);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 flex flex-col justify-between select-none overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#020617] pointer-events-none" />

      {/* Confetti Particle Layer */}
      {confetti.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm pointer-events-none z-50 shadow-sm"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}

      {/* ==========================================
          1. TOP HEADER & FOREST BANNER (FROM VIDEO)
          ========================================== */}
      <header className="relative z-20 w-full flex flex-col items-center">
        {/* Top Control Action Bar */}
        <div className="w-full max-w-md mx-auto px-4 pt-3 pb-2 flex items-center justify-between gap-2">
          {/* Home / Back */}
          <button
            onClick={() => loadLevel(1, true)}
            className="w-11 h-11 rounded-2xl bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 hover:text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer backdrop-blur-md"
            title="Menu Inicial"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Center Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Restart Button */}
            <button
              onClick={handleRestart}
              className="w-11 h-11 rounded-2xl bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 hover:text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer backdrop-blur-md"
              title="Reiniciar Nível"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Undo Move with Counter Badge */}
            <button
              onClick={handleUndo}
              disabled={moveHistory.length === 0 || undoCount <= 0}
              className={`h-11 px-3.5 rounded-2xl border flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer backdrop-blur-md ${
                moveHistory.length > 0 && undoCount > 0
                  ? 'bg-purple-900/70 border-purple-500/60 text-purple-200 hover:text-white'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
              }`}
              title="Desfazer Jogada"
            >
              <Undo2 className="w-5 h-5" />
              <span className="font-black text-sm text-yellow-300 font-mono">{undoCount}</span>
            </button>

            {/* +1 Extra Tube Booster */}
            <button
              onClick={handleAddTube}
              disabled={hasAddedTube}
              className={`h-11 px-3.5 rounded-2xl border flex items-center gap-1 shadow-lg active:scale-95 transition-all cursor-pointer backdrop-blur-md ${
                !hasAddedTube
                  ? 'bg-purple-900/80 border-purple-400 text-purple-200 hover:text-white hover:bg-purple-800'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
              }`}
              title="Adicionar Tubo Vazio"
            >
              <span className="font-black text-xs text-yellow-300 font-mono">+1</span>
              <span className="text-sm">🧪</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="w-11 h-11 rounded-2xl bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 hover:text-white flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer backdrop-blur-md"
          >
            {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-red-400" />}
          </button>
        </div>

        {/* Forest & Deer Silhouette Header Banner (Identical to Video) */}
        <div className="relative w-full max-w-md mx-auto h-24 overflow-hidden rounded-b-3xl bg-gradient-to-b from-[#064e3b] via-[#065f46] to-[#042f2e] border-b border-emerald-500/30 flex flex-col justify-end p-3 shadow-2xl">
          {/* Moon & Stars in Banner */}
          <div className="absolute top-2 right-8 w-6 h-6 rounded-full bg-amber-100/90 shadow-[0_0_12px_#fef08a]" />
          <div className="absolute top-3 left-10 w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
          <div className="absolute top-6 left-24 w-1 h-1 rounded-full bg-white/60 animate-pulse" />
          <div className="absolute top-4 right-20 w-1 h-1 rounded-full bg-white/60 animate-pulse" />

          {/* Deer & Pines Silhouette (SVG) */}
          <div className="absolute right-4 bottom-1 flex items-end gap-1 opacity-90">
            <svg viewBox="0 0 100 60" className="w-24 h-14 fill-emerald-950">
              <path d="M10 60 L18 35 L26 60 Z M22 60 L30 30 L38 60 Z M5 60 L12 40 L19 60 Z" />
              {/* Deer shape */}
              <path d="M60 48 L62 38 L68 34 L72 26 L76 28 L72 35 L74 44 L78 58 L74 58 L71 47 L65 48 L64 58 L60 58 Z M74 24 L76 18 M76 24 L80 18" stroke="#022c22" strokeWidth="1.5" />
              <path d="M82 52 L84 45 L88 42 L91 36 L94 37 L91 42 L92 48 L95 58 L92 58 L90 50 L86 51 L85 58 L82 58 Z" stroke="#022c22" strokeWidth="1.2" />
            </svg>
          </div>

          {/* Level Title & Special Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono tracking-widest text-emerald-300 font-bold uppercase drop-shadow">
                {levelDef.name}
              </div>
              <h2 className="text-xl font-black text-white tracking-wider flex items-center gap-1.5 drop-shadow-md">
                {levelDef.isSpecial ? 'NÍVEL ESPECIAL' : 'SEPARAR CORES'}
                {levelDef.isSpecial && <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />}
              </h2>
            </div>

            {/* Glowing Water Drop Icon in Circle */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 border-2 border-purple-300/80 flex items-center justify-center shadow-[0_0_15px_#8b5cf6] animate-pulse">
              <Droplet className="w-5 h-5 text-white fill-white" />
            </div>
          </div>
        </div>
      </header>

      {/* ==========================================
          2. MAIN GAME CANVAS / TEST TUBES (CENTRAL)
          ========================================== */}
      <main className="relative z-10 flex-1 w-full max-w-md mx-auto flex flex-col items-center justify-center px-4 py-4">
        {/* Test Tubes Layout Grid */}
        <div className="w-full flex items-center justify-center gap-2.5 sm:gap-3.5 flex-wrap max-w-sm mx-auto">
          {tubes.map((tube) => {
            const isSelected = selectedTubeId === tube.id;
            const isSource = pouringSourceId === tube.id;
            const isTarget = pouringTargetId === tube.id;

            // Tilt angle calculation during pour
            let transform = 'translateY(0) rotate(0deg)';
            let zIndex = 10;

            if (isSelected) {
              transform = 'translateY(-32px) scale(1.04)';
              zIndex = 25;
            } else if (isSource && pouringTargetId !== null) {
              const sourceIdx = tubes.findIndex((t) => t.id === tube.id);
              const targetIdx = tubes.findIndex((t) => t.id === pouringTargetId);
              const isPouringRight = targetIdx > sourceIdx;
              const angle = isPouringRight ? 68 : -68;
              const offsetX = (targetIdx - sourceIdx) * 36;
              transform = `translate(${offsetX}px, -48px) rotate(${angle}deg)`;
              zIndex = 40;
            }

            return (
              <div
                key={tube.id}
                ref={(el) => {
                  if (el) tubeRefs.current.set(tube.id, el);
                }}
                onClick={() => handleTubeClick(tube.id)}
                className="relative cursor-pointer transition-all duration-300 ease-out"
                style={{
                  transform,
                  zIndex,
                }}
              >
                {/* Test Tube Container */}
                <div
                  className={`relative w-12 sm:w-14 h-56 sm:h-64 rounded-b-full border-2 overflow-hidden flex flex-col justify-end transition-all shadow-xl ${
                    isSelected
                      ? 'border-yellow-300 shadow-[0_0_20px_#fde047]'
                      : tube.isCompleted
                      ? 'border-emerald-400/90 shadow-[0_0_15px_#4ade80]'
                      : 'border-slate-500/70 bg-slate-900/30'
                  }`}
                  style={{
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {/* Glass Highlights / Reflections */}
                  <div className="absolute inset-0 pointer-events-none z-20">
                    {/* Left vertical glare highlight */}
                    <div className="absolute left-1 top-2 bottom-3 w-1 bg-white/20 rounded-full" />
                    {/* Right thin glare */}
                    <div className="absolute right-1 top-2 bottom-3 w-0.5 bg-white/10 rounded-full" />
                  </div>

                  {/* Tube Top Lip / Rim Collar */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-slate-400/40 border-b border-white/30 z-30" />

                  {/* Completed Badge Checkmark */}
                  {tube.isCompleted && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-7 h-7 rounded-full bg-emerald-500/90 border border-white flex items-center justify-center shadow-lg animate-bounce">
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    </div>
                  )}

                  {/* Liquid Segments (From Bottom to Top) */}
                  <div className="w-full flex flex-col-reverse relative z-10 overflow-hidden rounded-b-full">
                    {tube.colors.map((colorKey, cIdx) => {
                      const colDef = WATER_COLORS[colorKey] || WATER_COLORS['blue'];
                      const isTopSegment = cIdx === tube.colors.length - 1;
                      const segmentHeight = `${100 / tube.capacity}%`;

                      return (
                        <div
                          key={cIdx}
                          className="w-full relative transition-all duration-300"
                          style={{
                            height: '42px',
                            background: `linear-gradient(to bottom, ${colDef.gradientTop}, ${colDef.gradientBottom})`,
                            boxShadow: `inset 0 -2px 6px rgba(0,0,0,0.3), 0 0 10px ${colDef.glow}`,
                          }}
                        >
                          {/* Top surface meniscus highlight */}
                          {isTopSegment && (
                            <div
                              className="absolute top-0 left-0 right-0 h-1.5 rounded-full opacity-80"
                              style={{
                                backgroundColor: colDef.gradientTop,
                                boxShadow: '0 0 4px white',
                              }}
                            />
                          )}

                          {/* Inner bubbly gloss */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Animated Pouring Stream */}
                {isSource && pourStreamActive && pouringColor && (
                  <div
                    className="absolute -top-6 left-1/2 w-2.5 h-36 rounded-full pointer-events-none z-50 animate-pulse shadow-lg"
                    style={{
                      background: `linear-gradient(to bottom, ${WATER_COLORS[pouringColor]?.gradientTop || '#3b82f6'}, ${WATER_COLORS[pouringColor]?.gradientBottom || '#1d4ed8'})`,
                      boxShadow: `0 0 12px ${WATER_COLORS[pouringColor]?.glow || 'rgba(59,130,246,0.8)'}`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* ==========================================
          3. RIGHT-SIDE FLOATING "INICIAR" / ACTION BUTTON
          (Requested specifically by user: "somente um botão do lado direito escrito inicia")
          ========================================== */}
      <div className="absolute right-4 bottom-8 z-30 flex flex-col items-end gap-2">
        <button
          onClick={() => {
            waterAudio.playClick();
            if (showStartModal) {
              setShowStartModal(false);
            } else {
              loadLevel(currentLevelNumber, true);
            }
          }}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm tracking-wider uppercase shadow-[0_6px_20px_rgba(251,191,36,0.6)] border-2 border-yellow-200 active:scale-95 transition-all flex items-center gap-2 cursor-pointer animate-pulse"
        >
          <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
          <span>INICIAR</span>
        </button>
      </div>

      {/* ==========================================
          4. START LEVEL MODAL (EXACTLY LIKE VIDEO)
          ========================================== */}
      {showStartModal && (
        <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-slate-900/95 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-5 relative overflow-hidden">
            {/* Header Badge */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-mono font-bold text-amber-400 tracking-widest uppercase">
                {levelDef.name}
              </span>
              <h3 className="text-2xl font-black text-white tracking-wide">
                {levelDef.isSpecial ? 'NÍVEL ESPECIAL' : 'SEPARAR ÁGUAS'}
              </h3>
            </div>

            {/* Glowing Tubes Preview Graphic (Like Video) */}
            <div className="w-full py-4 px-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-center gap-2">
              {[0, 1, 2, 3, 4].map((idx) => {
                const colors = [
                  ['#ef4444', '#3b82f6', '#8b5cf6', '#fbbf24'],
                  ['#8b5cf6', '#fbbf24', '#ec4899', '#ef4444'],
                  ['#ef4444', '#fbbf24', '#3b82f6', '#8b5cf6'],
                  ['#8b5cf6', '#ec4899', '#fbbf24', '#3b82f6'],
                  [],
                ][idx];

                return (
                  <div
                    key={idx}
                    className="w-5 h-20 rounded-b-full border border-slate-600 bg-slate-900/50 flex flex-col-reverse overflow-hidden"
                  >
                    {colors.map((c, cI) => (
                      <div
                        key={cI}
                        className="w-full h-4"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons: JOGAR (Yellow) & PULAR (Blue) */}
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => {
                  waterAudio.playClick();
                  setShowStartModal(false);
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-lg tracking-wider uppercase shadow-[0_6px_25px_rgba(251,191,36,0.6)] border-2 border-yellow-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>JOGAR</span>
              </button>

              <button
                onClick={() => {
                  waterAudio.playClick();
                  const nextLvl = currentLevelNumber + 1;
                  loadLevel(nextLvl, false);
                }}
                className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-black text-sm tracking-wider uppercase shadow-md border border-sky-400 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>PULAR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          5. VICTORY MODAL (NÍVEL CONCLUÍDO)
          ========================================== */}
      {showVictoryModal && (
        <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-xs bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-emerald-400/60 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-5 text-center">
            {/* Victory Trophy Badge */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-yellow-400 border-2 border-white flex items-center justify-center shadow-[0_0_25px_#22c55e] animate-bounce">
              <Trophy className="w-9 h-9 text-slate-950 fill-slate-950" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-widest uppercase block">
                EXCELENTE TRABALHO!
              </span>
              <h3 className="text-2xl font-black text-white tracking-wide">
                NÍVEL {currentLevelNumber} CONCLUÍDO
              </h3>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2.5">
              <button
                onClick={() => {
                  waterAudio.playClick();
                  const nextLvl = currentLevelNumber + 1;
                  loadLevel(nextLvl, true);
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-base tracking-wider uppercase shadow-[0_4px_20px_rgba(34,197,94,0.5)] border border-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>PRÓXIMO NÍVEL</span>
                <ChevronRight className="w-5 h-5 stroke-[3]" />
              </button>

              <button
                onClick={() => {
                  waterAudio.playClick();
                  loadLevel(currentLevelNumber, false);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs tracking-wider uppercase border border-slate-700 active:scale-95 transition-all cursor-pointer"
              >
                JOGAR NOVAMENTE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
