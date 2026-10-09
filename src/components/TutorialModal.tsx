/**
 * Sector Quarantine: Field Combat Briefing & Interactive Tutorial
 * Covers aiming, active reloads, environmental traps, zombie archetypes, and cleanup phase sweeps.
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crosshair,
  Flame,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Shield,
  Zap,
} from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: '01. AIMING & KINETIC HEADSHOTS',
      icon: <Crosshair className="w-5 h-5 text-red-500" />,
      content:
        'Touch and drag anywhere on the screen to aim your weapon. The laser reticle guides your line of fire. Bullets hitting the head (top 25% of body) deal 2.5x Critical Damage and trigger violent decapitation ragdoll physics!',
      tip: 'Shotgun blasts and revolvers send infected flying backwards with heavy kinetic knockback.',
    },
    {
      title: '02. ACTIVE TACTICAL RELOAD',
      icon: <RefreshCw className="w-5 h-5 text-amber-500" />,
      content:
        'When your magazine is depleted, tap the RELOAD button. A progress bar appears with a highlighted green "Sweet Spot" (45% - 75%). Tap RELOAD again while inside the sweet spot to execute a Perfect Active Reload: instant chambering plus a temporary firing speed boost!',
      tip: 'Missing the sweet spot jams your weapon momentarily.',
    },
    {
      title: '03. ENVIRONMENTAL TRAPS & BARRELS',
      icon: <Flame className="w-5 h-5 text-orange-500" />,
      content:
        'Do not rely solely on ammunition. Shoot red explosive fuel drums to unleash devastating area-of-effect blast waves that fling zombie ragdolls across walls. Tap the electrical breaker box to stun and fry entire hordes with high-voltage electricity!',
      tip: 'Tap the REPAIR hammer at the bottom to reinforce damaged barricade planks between attacks.',
    },
    {
      title: '04. INFECTED ARCHETYPES & WEAKNESSES',
      icon: <Shield className="w-5 h-5 text-cyan-500" />,
      content:
        'You will encounter 8 distinct infected strains: fast Sprinters, heavy Brutes, low Crawlers, explosive Volatiles, shrieking Howlers that frenzy the horde, and armored Juggernauts whose riot armor deflects frontal torso bullets unless hit in the head or blasted with explosives!',
      tip: 'Listen carefully for Howler screams—they make all nearby zombies run 50% faster.',
    },
    {
      title: '05. THE CLEANUP PHASE (NIGHT SWEEP)',
      icon: <Lightbulb className="w-5 h-5 text-yellow-400" />,
      content:
        'After defeating the main assault wave, the facility enters lockdown. The lights go dark and your tactical flashlight switches on! Lurking zombies hide behind doors, overturned desks, lockers, and shadows. Aim your flashlight to reveal them and tap doors to breach hiding spots!',
      tip: 'Beware: hidden zombies will leap out in sudden ambushes when disturbed!',
    },
  ];

  const step = steps[currentStep];

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col gap-4 text-left shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            {step.icon}
            <span className="text-xs font-mono font-bold tracking-wider text-amber-500 uppercase">
              FIELD BRIEFING
            </span>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {currentStep + 1} / {steps.length}
          </span>
        </div>

        {/* Step Title & Content */}
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-bold text-zinc-100">{step.title}</h3>
          <p className="text-xs text-zinc-300 leading-relaxed">{step.content}</p>

          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 mt-1 flex items-start gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-400 leading-snug">{step.tip}</p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentStep ? 'w-6 bg-amber-400' : 'w-1.5 bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="py-2.5 px-3 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold hover:bg-zinc-700 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <span>NEXT LESSON</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>READY FOR COMBAT</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
