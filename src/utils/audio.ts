/**
 * Procedural Web Audio Sound Engine
 * Generates all game sound effects and atmospheric music dynamically without external dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private isAmbientPlaying = false;
  private sfxVolume = 0.8;
  private musicVolume = 0.5;
  private soundEnabled = true;
  private musicEnabled = true;

  constructor() {
    // Context will initialize on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.soundEnabled ? this.sfxVolume : 0;
      this.sfxGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicEnabled ? this.musicVolume : 0;
      this.musicGain.connect(this.ctx.destination);
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSettings(sound: boolean, music: boolean, sfxVol: number, musVol: number) {
    this.soundEnabled = sound;
    this.musicEnabled = music;
    this.sfxVolume = sfxVol;
    this.musicVolume = musVol;

    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(sound ? sfxVol : 0, this.ctx.currentTime);
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(music ? musVol * 0.4 : 0, this.ctx.currentTime);
    }
  }

  // Helper for generating white/pink noise buffer
  private createNoiseBuffer(duration: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Weapon Firing Sounds tailored to weapon characteristics
   */
  public playGunshot(type: 'pistol' | 'revolver' | 'shotgun' | 'smg' | 'assault_rifle' | 'sniper' | 'crossbow' | 'launcher') {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    switch (type) {
      case 'pistol': {
        // Sharp pop with quick noise burst
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.12);

        // Noise crack
        const noise = this.createNoiseBuffer(0.08);
        if (noise) {
          const nSource = this.ctx.createBufferSource();
          nSource.buffer = noise;
          const nFilter = this.ctx.createBiquadFilter();
          nFilter.type = 'bandpass';
          nFilter.frequency.value = 1800;
          const nGain = this.ctx.createGain();
          nGain.gain.setValueAtTime(0.6, t);
          nGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

          nSource.connect(nFilter);
          nFilter.connect(nGain);
          nGain.connect(this.sfxGain);
          nSource.start(t);
        }
        break;
      }

      case 'revolver': {
        // Heavy boom with sustained low-end
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.28);

        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.28);
        break;
      }

      case 'shotgun': {
        // Massive spread explosion + low kick
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(25, t + 0.35);

        gain.gain.setValueAtTime(1.0, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.35);

        const noise = this.createNoiseBuffer(0.25);
        if (noise) {
          const nSource = this.ctx.createBufferSource();
          nSource.buffer = noise;
          const nFilter = this.ctx.createBiquadFilter();
          nFilter.type = 'lowpass';
          nFilter.frequency.value = 1200;
          const nGain = this.ctx.createGain();
          nGain.gain.setValueAtTime(0.9, t);
          nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

          nSource.connect(nFilter);
          nFilter.connect(nGain);
          nGain.connect(this.sfxGain);
          nSource.start(t);
        }
        break;
      }

      case 'smg': {
        // Snappy rapid chatter
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(450, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.07);

        gain.gain.setValueAtTime(0.45, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.07);
        break;
      }

      case 'assault_rifle': {
        // Balanced military punch
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.14);

        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.14);
        break;
      }

      case 'sniper': {
        // High caliber sonic whip
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.4);

        gain.gain.setValueAtTime(1.0, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.4);
        break;
      }

      case 'crossbow': {
        // String twang and wooden release
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + 0.1);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      }

      case 'launcher': {
        // Thump tube launch
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(20, t + 0.3);

        gain.gain.setValueAtTime(0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
      }
    }
  }

  /**
   * Massive Ragdoll Explosion Thud
   */
  public playExplosion() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Sub rumble
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(90, t);
    sub.frequency.exponentialRampToValueAtTime(18, t + 0.7);

    subGain.gain.setValueAtTime(1.0, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(t);
    sub.stop(t + 0.7);

    // Blast noise
    const noise = this.createNoiseBuffer(0.6);
    if (noise) {
      const nSource = this.ctx.createBufferSource();
      nSource.buffer = noise;
      const nFilter = this.ctx.createBiquadFilter();
      nFilter.type = 'lowpass';
      nFilter.frequency.setValueAtTime(800, t);
      nFilter.frequency.linearRampToValueAtTime(120, t + 0.6);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(1.0, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      nSource.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(this.sfxGain);
      nSource.start(t);
    }
  }

  /**
   * Electric Zap (Breaker Box / Trap)
   */
  public playElectricZap() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.linearRampToValueAtTime(120, t + 0.25);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  /**
   * Flesh Impact / Gore Hit
   */
  public playHitFlesh(isCrit: boolean = false) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isCrit ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isCrit ? 380 : 180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + (isCrit ? 0.2 : 0.08));

    gain.gain.setValueAtTime(isCrit ? 0.75 : 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isCrit ? 0.2 : 0.08));

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + (isCrit ? 0.2 : 0.08));
  }

  /**
   * Armor Ricochet Clank
   */
  public playHitArmor() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Zombie Growls & Shrieks
   */
  public playZombieSound(type: 'growl' | 'shriek' | 'exploder_hiss' | 'death') {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    if (type === 'growl') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.linearRampToValueAtTime(65, t + 0.35);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.35);
    } else if (type === 'shriek') {
      // Howler ear-piercing scream
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.linearRampToValueAtTime(1100, t + 0.2);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.6);

      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.6);
    } else if (type === 'exploder_hiss') {
      const noise = this.createNoiseBuffer(0.3);
      if (noise) {
        const nSource = this.ctx.createBufferSource();
        nSource.buffer = noise;
        const nFilter = this.ctx.createBiquadFilter();
        nFilter.type = 'highpass';
        nFilter.frequency.value = 3000;
        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.4, t);
        nGain.gain.linearRampToValueAtTime(0.8, t + 0.3);

        nSource.connect(nFilter);
        nFilter.connect(nGain);
        nGain.connect(this.sfxGain);
        nSource.start(t);
      }
    } else if (type === 'death') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.25);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.25);
    }
  }

  /**
   * Reload Sounds
   */
  public playReload(phase: 'start' | 'active_success' | 'complete' | 'empty') {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    if (phase === 'start') {
      // Magazine release click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(500, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.05);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.05);
    } else if (phase === 'active_success') {
      // Satisfying tactical sweet-spot chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, t); // G5
      osc.frequency.setValueAtTime(1046, t + 0.08); // C6

      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.25);
    } else if (phase === 'complete') {
      // Slide chamber clack
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.07);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.07);
    } else if (phase === 'empty') {
      // Dry click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(900, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.03);
    }
  }

  /**
   * Barricade Hit or Hammer Repair
   */
  public playBarricadeSound(type: 'hit' | 'repair') {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(type === 'repair' ? 360 : 140, t);
    osc.frequency.exponentialRampToValueAtTime(type === 'repair' ? 180 : 40, t + 0.1);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  /**
   * UI Interaction & Purchase Fanfare
   */
  public playUI(action: 'click' | 'purchase' | 'victory' | 'defeat' | 'breach_door') {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    if (action === 'click') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.04);
    } else if (action === 'purchase') {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.frequency.setValueAtTime(987.77, t); // B5
      osc2.frequency.setValueAtTime(1318.51, t + 0.06); // E6
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);
      osc1.start(t);
      osc2.start(t + 0.06);
      osc1.stop(t + 0.3);
      osc2.stop(t + 0.3);
    } else if (action === 'victory') {
      // Victorious minor-to-major resolve chord
      [440, 554.37, 659.25, 880].forEach((freq, i) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + i * 0.08);
        gain.gain.setValueAtTime(0.3, t + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.08 + 0.5);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t + i * 0.08);
        osc.stop(t + i * 0.08 + 0.5);
      });
    } else if (action === 'defeat') {
      // Dissonant descending doom
      [220, 207.65, 196].forEach((freq, i) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + i * 0.15);
        gain.gain.setValueAtTime(0.4, t + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.15 + 0.6);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t + i * 0.15);
        osc.stop(t + i * 0.15 + 0.6);
      });
    } else if (action === 'breach_door') {
      // Heavy kick and wooden latch snap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.2);

      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.2);
    }
  }

  /**
   * Ambient Drone (Tension Background)
   */
  public startAmbient(intensity: 'defense' | 'cleanup' = 'defense') {
    if (!this.musicEnabled) return;
    this.initContext();
    if (!this.ctx || !this.musicGain || this.isAmbientPlaying) return;

    try {
      this.isAmbientPlaying = true;
      const t = this.ctx.currentTime;

      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientFilter = this.ctx.createBiquadFilter();

      this.ambientOsc1.type = 'sawtooth';
      this.ambientOsc1.frequency.setValueAtTime(intensity === 'cleanup' ? 48.99 : 55.0, t); // G1 or A1

      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(intensity === 'cleanup' ? 73.42 : 82.41, t);

      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.setValueAtTime(intensity === 'cleanup' ? 240 : 380, t);

      this.ambientOsc1.connect(this.ambientFilter);
      this.ambientOsc2.connect(this.ambientFilter);
      this.ambientFilter.connect(this.musicGain);

      this.ambientOsc1.start(t);
      this.ambientOsc2.start(t);
    } catch {
      // AudioContext policy catch
    }
  }

  public stopAmbient() {
    if (!this.isAmbientPlaying) return;
    try {
      if (this.ambientOsc1) {
        this.ambientOsc1.stop();
        this.ambientOsc1.disconnect();
        this.ambientOsc1 = null;
      }
      if (this.ambientOsc2) {
        this.ambientOsc2.stop();
        this.ambientOsc2.disconnect();
        this.ambientOsc2 = null;
      }
      this.isAmbientPlaying = false;
    } catch {
      // ignore cleanup errors
    }
  }
}

export const sound = new SoundEngine();
