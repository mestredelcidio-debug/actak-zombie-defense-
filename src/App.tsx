import React, { useEffect, useRef, useState } from 'react';
import { VectorGameEngine } from './zombieroad/vector/VectorGameEngine';
import { CharacterDef, CharacterId, GameState, PlayerStats, RunSummary, WeaponDef, WeaponId } from './zombieroad/types';
import { CHARACTERS_CATALOG } from './zombieroad/data/characters';
import { WEAPONS_CATALOG } from './zombieroad/data/weapons';
import { sound } from './zombieroad/audio/SoundSystem';
import { loadSavedPlayerStats, resetPlayerStats, savePlayerStats } from './zombieroad/storage/saveData';

// UI Components
import { HUD } from './zombieroad/ui/HUD';
import { MainMenu } from './zombieroad/ui/MainMenu';
import { ShopModal } from './zombieroad/ui/ShopModal';
import { GameOverModal } from './zombieroad/ui/GameOverModal';
import { PauseModal } from './zombieroad/ui/PauseModal';
import { SettingsModal } from './zombieroad/ui/SettingsModal';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<VectorGameEngine | null>(null);

  // App Navigation States (Starts DIRECTLY into the active game!)
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [activeShopTab, setActiveShopTab] = useState<'weapons' | 'characters' | 'upgrades'>('weapons');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Reactive Game HUD States
  const [currentHearts, setCurrentHearts] = useState(3);
  const [maxHearts, setMaxHearts] = useState(3);
  const [distance, setDistance] = useState(0);
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null);

  // Player Stats Snapshot
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    return loadSavedPlayerStats();
  });

  const activeCharacter: CharacterDef =
    CHARACTERS_CATALOG[playerStats.selectedCharacter] || CHARACTERS_CATALOG['survivor'];
  const activeWeapon: WeaponDef =
    WEAPONS_CATALOG[playerStats.selectedWeapon] || WEAPONS_CATALOG['pistol'];

  // Initialize Vector Game Engine on mount and start DIRECTLY!
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new VectorGameEngine(canvasRef.current);
    engineRef.current = engine;

    // Engine Event Callbacks
    engine.onStateChange = (state) => {
      setGameState(state);
    };

    engine.onStatsUpdate = (stats, hearts, maxH) => {
      setPlayerStats({ ...stats });
      setCurrentHearts(hearts);
      setMaxHearts(maxH);
    };

    engine.onDistanceUpdate = (m) => {
      setDistance(m);
    };

    engine.onGameOver = (summary) => {
      setRunSummary(summary);
    };

    setPlayerStats({ ...engine.playerStats });
    setCurrentHearts(engine.currentHearts);
    setMaxHearts(engine.maxHearts);

    // START GAME DIRECTLY WITHOUT BLOCKING SCREENS!
    engine.startRun();

    // Keyboard Controls Listeners (A/D/Arrows for Movement, Space/W/Up for Jump, J/K/F/Enter for Shoot)
    const activeKeys = new Set<string>();

    const updateMovementFromKeys = () => {
      if (!engineRef.current || engineRef.current.state !== 'PLAYING') return;

      const isLeft = activeKeys.has('KeyA') || activeKeys.has('ArrowLeft');
      const isRight = activeKeys.has('KeyD') || activeKeys.has('ArrowRight');

      if (isLeft && !isRight) {
        engineRef.current.setMoveInput(-1);
      } else if (isRight && !isLeft) {
        engineRef.current.setMoveInput(1);
      } else {
        engineRef.current.setMoveInput(0);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      activeKeys.add(e.code);

      if (engineRef.current.state === 'PLAYING') {
        if (e.code === 'KeyA' || e.code === 'ArrowLeft' || e.code === 'KeyD' || e.code === 'ArrowRight') {
          updateMovementFromKeys();
        } else if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
          e.preventDefault();
          engineRef.current.jump();
        } else if (e.code === 'KeyJ' || e.code === 'KeyK' || e.code === 'KeyF' || e.code === 'Enter') {
          e.preventDefault();
          engineRef.current.shoot();
        } else if (e.code === 'Escape' || e.code === 'KeyP') {
          e.preventDefault();
          engineRef.current.pauseGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      activeKeys.delete(e.code);
      if (e.code === 'KeyA' || e.code === 'ArrowLeft' || e.code === 'KeyD' || e.code === 'ArrowRight') {
        updateMovementFromKeys();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const handleResize = () => {
      if (engineRef.current) {
        engineRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, []);

  // Action Handlers
  const handlePlay = () => {
    sound.playClick();
    if (engineRef.current) {
      engineRef.current.startRun();
    }
  };

  const handleMoveLeft = () => {
    if (engineRef.current) {
      engineRef.current.setMoveInput(-1);
    }
  };

  const handleMoveRight = () => {
    if (engineRef.current) {
      engineRef.current.setMoveInput(1);
    }
  };

  const handleStopMove = () => {
    if (engineRef.current) {
      engineRef.current.setMoveInput(0);
    }
  };

  const handleJump = () => {
    if (engineRef.current) {
      engineRef.current.jump();
    }
  };

  const handleShoot = () => {
    if (engineRef.current) {
      engineRef.current.shoot();
    }
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.pauseGame();
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.resumeGame();
    }
  };

  const handleRestart = () => {
    sound.playClick();
    if (engineRef.current) {
      engineRef.current.startRun();
    }
  };

  const handleQuitToMenu = () => {
    sound.playClick();
    sound.stopMusic();
    setGameState('MENU');
    if (engineRef.current) {
      engineRef.current.state = 'MENU';
    }
  };

  const handleOpenShop = (tab: 'weapons' | 'characters' | 'upgrades' = 'weapons') => {
    sound.playClick();
    setActiveShopTab(tab);
    setGameState('SHOP');
  };

  const handleToggleSound = () => {
    const next = !playerStats.soundEnabled;
    sound.setSoundEnabled(next);
    const updated = {
      ...(engineRef.current ? engineRef.current.playerStats : playerStats),
      soundEnabled: next,
    };
    if (engineRef.current) {
      engineRef.current.playerStats = updated;
    }
    setPlayerStats(updated);
    savePlayerStats(updated);
  };

  const handleToggleMusic = () => {
    const next = !playerStats.musicEnabled;
    sound.setMusicEnabled(next);
    const updated = {
      ...(engineRef.current ? engineRef.current.playerStats : playerStats),
      musicEnabled: next,
    };
    if (engineRef.current) {
      engineRef.current.playerStats = updated;
    }
    setPlayerStats(updated);
    savePlayerStats(updated);
  };

  const handleResetData = () => {
    const reset = resetPlayerStats();
    if (engineRef.current) {
      engineRef.current.playerStats = reset;
      setPlayerStats({ ...reset });
    }
    setIsSettingsOpen(false);
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 flex flex-col overflow-hidden select-none font-sans">
      {/* Fullscreen Adaptive Game Viewport */}
      <div className="relative w-full h-full overflow-hidden flex flex-col bg-slate-950">
        
        {/* Vector 2D Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-0 w-full h-full block"
        />

        {/* 1. Main Menu */}
        {gameState === 'MENU' && (
          <MainMenu
            playerStats={playerStats}
            character={activeCharacter}
            weapon={activeWeapon}
            onPlay={handlePlay}
            onOpenShop={handleOpenShop}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onToggleSound={handleToggleSound}
          />
        )}

        {/* 2. Active Run HUD */}
        {gameState === 'PLAYING' && (
          <HUD
            currentHearts={currentHearts}
            maxHearts={maxHearts}
            distance={distance}
            coins={playerStats.coins}
            weapon={activeWeapon}
            onMoveLeft={handleMoveLeft}
            onMoveRight={handleMoveRight}
            onStopMove={handleStopMove}
            onJump={handleJump}
            onShoot={handleShoot}
            onPause={handlePause}
            onOpenShop={() => handleOpenShop('weapons')}
            soundEnabled={playerStats.soundEnabled}
            musicEnabled={playerStats.musicEnabled}
            onToggleSound={handleToggleSound}
            onToggleMusic={handleToggleMusic}
          />
        )}

        {/* 3. Shop & Character Armory Modal */}
        {gameState === 'SHOP' && (
          <ShopModal
            initialTab={activeShopTab}
            playerStats={playerStats}
            onSelectCharacter={(id) => engineRef.current?.selectCharacter(id)}
            onUnlockCharacter={(id) => engineRef.current?.unlockCharacter(id)}
            onSelectWeapon={(id) => engineRef.current?.selectWeapon(id)}
            onUnlockWeapon={(id) => engineRef.current?.unlockWeapon(id)}
            onUpgradeWeapon={(id, stat) => engineRef.current?.upgradeWeapon(id, stat)}
            onBack={() => {
              if (engineRef.current && engineRef.current.state === 'PLAYING') {
                setGameState('PLAYING');
              } else {
                setGameState('PLAYING');
              }
            }}
          />
        )}

        {/* 4. Pause Modal */}
        {gameState === 'PAUSED' && (
          <PauseModal
            onResume={handleResume}
            onRestart={handleRestart}
            onOpenShop={() => handleOpenShop('weapons')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onMenu={handleQuitToMenu}
            soundEnabled={playerStats.soundEnabled}
            musicEnabled={playerStats.musicEnabled}
            onToggleSound={handleToggleSound}
            onToggleMusic={handleToggleMusic}
          />
        )}

        {/* 5. Game Over Modal */}
        {gameState === 'GAMEOVER' && runSummary && (
          <GameOverModal
            summary={runSummary}
            onRetry={handleRestart}
            onMenu={handleQuitToMenu}
            onOpenShop={() => handleOpenShop('weapons')}
          />
        )}

        {/* 6. Settings Modal */}
        {isSettingsOpen && (
          <SettingsModal
            playerStats={playerStats}
            onToggleSound={handleToggleSound}
            onToggleMusic={handleToggleMusic}
            onResetData={handleResetData}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
