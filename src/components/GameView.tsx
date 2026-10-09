/**
 * Sector Quarantine: Active Game Screen Container
 * Manages canvas rendering, touch gestures, HUD bindings, and engine lifecycle.
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameHUD } from './GameHUD';
import { SummaryModal } from './EndlessSummaryModal';
import { GameEngine } from '../game/engine';
import {
  GameMode,
  GamePhase,
  MissionLocation,
  PlayerProfile,
  PlayerStats,
  WeaponId,
  WeaponStats,
} from '../types/game';
import { getCalculatedWeaponStats } from '../utils/storage';

interface GameViewProps {
  location: MissionLocation;
  mode: GameMode;
  profile: PlayerProfile;
  onUpdateProfile: (profile: PlayerProfile) => void;
  onMissionCleared: (missionId: string, stars: number) => void;
  onReturnToBase: () => void;
}

export const GameView: React.FC<GameViewProps> = ({
  location,
  mode,
  profile,
  onUpdateProfile,
  onMissionCleared,
  onReturnToBase,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [phase, setPhase] = useState<GamePhase>('DEFENSE');
  const [currentWave, setCurrentWave] = useState(1);
  const [totalWaves, setTotalWaves] = useState(location.wavesCount);
  const [zombiesRemaining, setZombiesRemaining] = useState(0);
  const [barricadeHp, setBarricadeHp] = useState(500);
  const [maxBarricadeHp, setMaxBarricadeHp] = useState(500);

  const primaryWeaponId: WeaponId = (Object.keys(profile.weapons) as WeaponId[]).find(
    (w) => profile.weapons[w].unlocked
  ) || 'pistol';
  const initialWeapon = getCalculatedWeaponStats(primaryWeaponId, profile);

  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    hp: 100,
    maxHp: 100,
    stamina: 100,
    maxStamina: 100,
    x: 210,
    aimAngle: -Math.PI / 2,
    currentWeaponId: primaryWeaponId,
    ammoInMag: initialWeapon.magazineSize,
    reserveAmmo: initialWeapon.magazineSize * 4,
    isReloading: false,
    reloadProgress: 0,
    activeReloadSuccess: false,
  });

  const [currentWeapon, setCurrentWeapon] = useState<WeaponStats>(initialWeapon);

  // Summary Modal States
  const [summaryData, setSummaryData] = useState<{
    show: boolean;
    type: 'VICTORY' | 'DEFEAT';
    stars: number;
    coins: number;
    scrap: number;
    stats: { kills: number; headshots: number; waveReached?: number };
  }>({
    show: false,
    type: 'VICTORY',
    stars: 1,
    coins: 0,
    scrap: 0,
    stats: { kills: 0, headshots: 0 },
  });

  const [isPaused, setIsPaused] = useState(false);

  // Initialize engine on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(location, mode, profile, {
      onPhaseChange: (newPhase) => setPhase(newPhase),
      onWaveChange: (curr, tot) => {
        setCurrentWave(curr);
        setTotalWaves(tot);
      },
      onZombiesRemainingChange: (rem) => setZombiesRemaining(rem),
      onBarricadeChange: (hp, max) => {
        setBarricadeHp(hp);
        setMaxBarricadeHp(max);
      },
      onPlayerStatsChange: (p) => {
        setPlayerStats({ ...p });
      },
      onMissionComplete: (stars, coinsEarned, scrapEarned, stats) => {
        // Update profile
        const newProfile = { ...profile };
        newProfile.coins += coinsEarned;
        newProfile.scrap += scrapEarned;
        newProfile.totalKills += stats.kills;
        newProfile.headshots += stats.headshots;
        newProfile.missionsCompleted++;

        onUpdateProfile(newProfile);
        onMissionCleared(location.id, stars);

        setSummaryData({
          show: true,
          type: 'VICTORY',
          stars,
          coins: coinsEarned,
          scrap: scrapEarned,
          stats,
        });
      },
      onGameOver: (stats) => {
        const newProfile = { ...profile };
        newProfile.totalKills += stats.kills;
        newProfile.headshots += stats.headshots;
        if (mode === 'ENDLESS' && stats.waveReached) {
          newProfile.endlessHighScoreWave = Math.max(
            newProfile.endlessHighScoreWave,
            stats.waveReached
          );
        }
        onUpdateProfile(newProfile);

        setSummaryData({
          show: true,
          type: 'DEFEAT',
          stars: 0,
          coins: Math.round(stats.kills * 5),
          scrap: Math.round(stats.kills * 1.5),
          stats,
        });
      },
    });

    engineRef.current = engine;
    engine.init(canvasRef.current);
    setCurrentWeapon(engine.currentWeapon);

    // Keyboard support for desktop testing
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'ArrowLeft') engine.movePlayer(-20);
      if (e.key === 'd' || e.key === 'ArrowRight') engine.movePlayer(20);
      if (e.key === 'r') engine.triggerReloadOrActiveSweetSpot();
      if (e.key === ' ' || e.key === 'Enter') engine.fireWeapon();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      engine.destroy();
      engineRef.current = null;
    };
  }, [location, mode]);

  // Touch and pointer interaction coordinates mapping
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 210, y: 300 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!engineRef.current || isPaused) return;
    const { x, y } = getCanvasCoords(e);
    engineRef.current.handlePointerDown(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!engineRef.current || isPaused) return;
    const { x, y } = getCanvasCoords(e);
    engineRef.current.handlePointerMove(x, y);
  };

  const handlePointerUp = () => {
    if (!engineRef.current) return;
    engineRef.current.handlePointerUp();
  };

  const handleSwitchWeapon = (id: WeaponId) => {
    if (!engineRef.current) return;
    engineRef.current.switchWeapon(id);
    setCurrentWeapon(engineRef.current.currentWeapon);
  };

  const handleReload = () => {
    if (!engineRef.current) return;
    engineRef.current.triggerReloadOrActiveSweetSpot();
  };

  const handleRepair = () => {
    if (!engineRef.current) return;
    engineRef.current.repairBarricade();
  };

  const handleMoveLeft = () => {
    if (!engineRef.current) return;
    engineRef.current.movePlayer(-22);
  };

  const handleMoveRight = () => {
    if (!engineRef.current) return;
    engineRef.current.movePlayer(22);
  };

  const handleTogglePause = () => {
    if (!engineRef.current) return;
    const next = !isPaused;
    setIsPaused(next);
    engineRef.current.phase = next ? 'PAUSED' : phase;
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center select-none touch-none">
      {/* 2D Canvas Viewport */}
      <canvas
        ref={canvasRef}
        width={420}
        height={750}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full object-contain cursor-crosshair"
      />

      {/* Touch-Optimized HUD */}
      {!summaryData.show && (
        <GameHUD
          phase={phase}
          currentWave={currentWave}
          totalWaves={totalWaves}
          zombiesRemaining={zombiesRemaining}
          barricadeHp={barricadeHp}
          maxBarricadeHp={maxBarricadeHp}
          player={playerStats}
          weapon={currentWeapon}
          profile={profile}
          onFireTap={() => engineRef.current?.fireWeapon()}
          onReloadTap={handleReload}
          onSwitchWeapon={handleSwitchWeapon}
          onRepairTap={handleRepair}
          onMoveLeft={handleMoveLeft}
          onMoveRight={handleMoveRight}
          onPause={handleTogglePause}
        />
      )}

      {/* Pause Overlay */}
      {isPaused && !summaryData.show && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center gap-3 p-4">
          <h2 className="text-2xl font-bold uppercase text-zinc-100">OPERATION PAUSED</h2>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <button
              onClick={handleTogglePause}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs"
            >
              RESUME COMBAT
            </button>
            <button
              onClick={onReturnToBase}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs"
            >
              ABORT TO BASE
            </button>
          </div>
        </div>
      )}

      {/* Victory or Defeat Summary Modal */}
      {summaryData.show && (
        <SummaryModal
          type={summaryData.type}
          starsEarned={summaryData.stars}
          coinsEarned={summaryData.coins}
          scrapEarned={summaryData.scrap}
          stats={summaryData.stats}
          onRetry={() => {
            setSummaryData((prev) => ({ ...prev, show: false }));
            if (canvasRef.current) {
              engineRef.current?.destroy();
              const engine = new GameEngine(location, mode, profile, {
                onPhaseChange: setPhase,
                onWaveChange: (c, t) => {
                  setCurrentWave(c);
                  setTotalWaves(t);
                },
                onZombiesRemainingChange: setZombiesRemaining,
                onBarricadeChange: (hp, max) => {
                  setBarricadeHp(hp);
                  setMaxBarricadeHp(max);
                },
                onPlayerStatsChange: (p) => setPlayerStats({ ...p }),
                onMissionComplete: (stars, coinsEarned, scrapEarned, stats) => {
                  setSummaryData({
                    show: true,
                    type: 'VICTORY',
                    stars,
                    coins: coinsEarned,
                    scrap: scrapEarned,
                    stats,
                  });
                },
                onGameOver: (stats) => {
                  setSummaryData({
                    show: true,
                    type: 'DEFEAT',
                    stars: 0,
                    coins: Math.round(stats.kills * 5),
                    scrap: Math.round(stats.kills * 1.5),
                    stats,
                  });
                },
              });
              engineRef.current = engine;
              engine.init(canvasRef.current);
            }
          }}
          onNextOrContinue={onReturnToBase}
          onReturnToBase={onReturnToBase}
        />
      )}
    </div>
  );
};
