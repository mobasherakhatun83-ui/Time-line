// Comprehensive and fully-functional Web Audio API ambient Focus Sound & Synthesizer Engine.
// This is natively built to play, loop, and switch premium focus soundtracks indefinitely.

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentType: string | null = null;
  private isRunning: boolean = false;
  private volume: number = 0.5;

  // Active nodes track for clean garbage collection
  private activeNodes: {
    sources: AudioNode[];
    gains: GainNode[];
    filters: BiquadFilterNode[];
    timers: number[];
  } = {
    sources: [],
    gains: [],
    filters: [],
    timers: [],
  };

  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    // Keep constructor clean, lazily initialize on user gesture to avoid browser restrictions.
  }

  private initCtx() {
    try {
      if (typeof window === 'undefined') return;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.ctx) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.generateNoiseBuffer();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(e => console.warn("AudioContext resume failed:", e));
      }
    } catch (e) {
      console.warn("Failed to initialize AudioContext:", e);
      this.ctx = null;
      this.masterGain = null;
    }
  }

  private generateNoiseBuffer() {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 4; // 4 seconds of noise
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentType(): string | null {
    return this.currentType;
  }

  public isPlaying(): boolean {
    return this.isRunning;
  }

  public stop() {
    this.isRunning = false;
    this.currentType = null;
    this.cleanupActiveNodes();
  }

  private cleanupActiveNodes() {
    // Stop and disconnect sources safely
    this.activeNodes.sources.forEach(src => {
      try {
        (src as any).stop?.();
      } catch (e) {
        // Ignored
      }
      try {
        src.disconnect();
      } catch (e) {
        // Ignored
      }
    });

    this.activeNodes.gains.forEach(gain => {
      try {
        gain.disconnect();
      } catch (e) {
        // Ignored
      }
    });

    this.activeNodes.filters.forEach(filter => {
      try {
        filter.disconnect();
      } catch (e) {
        // Ignored
      }
    });

    this.activeNodes.timers.forEach(timer => {
      clearInterval(timer);
      clearTimeout(timer);
    });

    this.activeNodes = {
      sources: [],
      gains: [],
      filters: [],
      timers: [],
    };
  }

  public play(type: 'Binaural Combat' | 'White Noise' | 'Cyber Rain' | 'Deep Space' | 'Old Library') {
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    this.stop(); // Stop current playing sounds
    this.isRunning = true;
    this.currentType = type;

    // Start designated synthesizer
    switch (type) {
      case "Binaural Combat":
        this.synthBinauralCombat();
        break;
      case "White Noise":
        this.synthWhiteNoise();
        break;
      case "Cyber Rain":
        this.synthCyberRain();
        break;
      case "Deep Space":
        this.synthDeepSpace();
        break;
      case "Old Library":
        this.synthOldLibrary();
        break;
    }
  }

  /**
   * 1. BINAURAL COMBAT SOUNDS
   * - Binaural beats (6Hz Theta difference for extreme focus: Left 140Hz, Right 146Hz)
   * - Intense low epic cyber war drone (sawtooth sweeping through rhythmic LFO filtering)
   */
  private synthBinauralCombat() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // A. BINAURAL GENERATOR
    const merger = ctx.createChannelMerger(2);
    
    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();
    
    const gainL = ctx.createGain();
    const gainR = ctx.createGain();

    oscL.frequency.value = 140; // 140 Hz left
    oscR.frequency.value = 146; // 146 Hz right (6Hz focus wave)

    gainL.gain.setValueAtTime(0.12, ctx.currentTime);
    gainR.gain.setValueAtTime(0.12, ctx.currentTime);

    oscL.connect(gainL);
    oscR.connect(gainR);

    gainL.connect(merger, 0, 0);
    gainR.connect(merger, 0, 1);

    merger.connect(this.masterGain);

    // B. COMBAT DRONE/RHYTHM
    const droneOsc1 = ctx.createOscillator();
    const droneOsc2 = ctx.createOscillator();
    const droneGain = ctx.createGain();
    const droneFilter = ctx.createBiquadFilter();

    droneOsc1.type = "sawtooth";
    droneOsc2.type = "square";

    droneOsc1.frequency.value = 73; // D2
    droneOsc2.frequency.value = 73.4; // detuned drone

    droneGain.gain.setValueAtTime(0.04, ctx.currentTime);
    droneFilter.type = "lowpass";
    droneFilter.Q.value = 5;

    // Slow LFO to sweep filter frequency for moving battle feel
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.25; // 4 seconds sweep
    lfoGain.gain.value = 150; // swing +-150Hz
    
    droneFilter.frequency.setValueAtTime(300, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(droneFilter.frequency);

    droneOsc1.connect(droneFilter);
    droneOsc2.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(this.masterGain);

    // Start all
    oscL.start();
    oscR.start();
    droneOsc1.start();
    droneOsc2.start();
    lfo.start();

    this.activeNodes.sources.push(oscL, oscR, droneOsc1, droneOsc2, lfo);
    this.activeNodes.gains.push(gainL, gainR, droneGain, lfoGain);
    this.activeNodes.filters.push(droneFilter);
  }

  /**
   * 2. WHITE NOISE
   * - Looped white noise custom buffer
   * - Smooth bandpass filtering to remove harsh frequencies for premium focus comfort
   */
  private synthWhiteNoise() {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const ctx = this.ctx;

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = this.noiseBuffer;
    noiseNode.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(1500, ctx.currentTime); // focus-centered pass
    noiseFilter.Q.setValueAtTime(0.4, ctx.currentTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, ctx.currentTime);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noiseNode.start();

    this.activeNodes.sources.push(noiseNode);
    this.activeNodes.gains.push(noiseGain);
    this.activeNodes.filters.push(noiseFilter);
  }

  /**
   * 3. CYBER RAIN
   * - Base low rain roar (Pink noise profile using filtered white noise)
   * - Micro high-frequency clicks & resonant noise pops representing raindrops striking neon puddles.
   */
  private synthCyberRain() {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const ctx = this.ctx;

    // A. Base Rain rumble (Low pass filtered white noise)
    const baseRain = ctx.createBufferSource();
    baseRain.buffer = this.noiseBuffer;
    baseRain.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = "lowpass";
    rainFilter.frequency.setValueAtTime(800, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.24, ctx.currentTime);

    baseRain.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(this.masterGain);
    baseRain.start();

    this.activeNodes.sources.push(baseRain);
    this.activeNodes.filters.push(rainFilter);
    this.activeNodes.gains.push(rainGain);

    // B. Rain crackles & droplet impulses generator (Dynamic clicks)
    const playDroplet = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;
      
      const resOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      
      resOsc.type = "sine";
      // Randomized frequencies of droplet impacts
      resOsc.frequency.setValueAtTime(1200 + Math.random() * 2000, this.ctx.currentTime);
      
      clickGain.gain.setValueAtTime(0, this.ctx.currentTime);
      clickGain.gain.linearRampToValueAtTime(0.005 + Math.random() * 0.015, this.ctx.currentTime + 0.005);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

      resOsc.connect(clickGain);
      clickGain.connect(this.masterGain);
      
      resOsc.start();
      resOsc.stop(this.ctx.currentTime + 0.1);

      // Clean up self-closing nodes
      setTimeout(() => {
        try { resOsc.disconnect(); clickGain.disconnect(); } catch(e){}
      }, 200);
    };

    // Fast-firing droplet timers
    const timerId = setInterval(() => {
      if (Math.random() > 0.3) {
        playDroplet();
      }
    }, 60) as any;

    this.activeNodes.timers.push(timerId);
  }

  /**
   * 4. DEEP SPACE
   * - Zero-gravity cosmic landscape
   * - Harmonic sine/triangle waves tuned to cosmic intervals (55Hz, 110Hz, 165Hz)
   * - Multiple sweeping LFO modulators controlling slow filter sweeps & volume dynamics
   */
  private synthDeepSpace() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // High fidelity fundamental signals
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();

    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const gain3 = ctx.createGain();

    osc1.type = "triangle";
    osc2.type = "sine";
    osc3.type = "triangle";

    osc1.frequency.value = 55; // Root Sub A1
    osc2.frequency.value = 110; // A2 Octave
    osc3.frequency.value = 165; // E3 Perfect Fifth

    gain1.gain.setValueAtTime(0.14, ctx.currentTime);
    gain2.gain.setValueAtTime(0.08, ctx.currentTime);
    gain3.gain.setValueAtTime(0.05, ctx.currentTime);

    // Filter sweeps representation
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 4;
    filter.frequency.setValueAtTime(140, ctx.currentTime);

    // LFO to sweep low-pass filters slowly
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.06; // sweeping over 16 seconds
    lfoGain.gain.value = 90; // sweep range +-90Hz

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);

    const spaceGain = ctx.createGain();
    spaceGain.gain.setValueAtTime(0.28, ctx.currentTime);

    filter.connect(spaceGain);
    spaceGain.connect(this.masterGain);

    osc1.start();
    osc2.start();
    osc3.start();
    lfo.start();

    this.activeNodes.sources.push(osc1, osc2, osc3, lfo);
    this.activeNodes.gains.push(gain1, gain2, gain3, spaceGain, lfoGain);
    this.activeNodes.filters.push(filter);
  }

  /**
   * 5. OLD LIBRARY
   * - Low library background breeze (bandpass filtered white noise)
   * - Vintage fireplace rustling and paper parchment crackles (short high-frequency impulses)
   */
  private synthOldLibrary() {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const ctx = this.ctx;

    // A. Library breeze (Muffled, extremely warm room roar)
    const ambientBreeze = ctx.createBufferSource();
    ambientBreeze.buffer = this.noiseBuffer;
    ambientBreeze.loop = true;

    const breezeFilter = ctx.createBiquadFilter();
    breezeFilter.type = "bandpass";
    breezeFilter.frequency.setValueAtTime(650, ctx.currentTime);
    breezeFilter.Q.setValueAtTime(0.35, ctx.currentTime);

    const breezeGain = ctx.createGain();
    breezeGain.gain.setValueAtTime(0.12, ctx.currentTime);

    ambientBreeze.connect(breezeFilter);
    breezeFilter.connect(breezeGain);
    breezeGain.connect(this.masterGain);
    ambientBreeze.start();

    // Minor low 50Hz transformer/hum to emulate cozy fluorescent warmth
    const transformerHum = ctx.createOscillator();
    const transformerGain = ctx.createGain();
    transformerHum.type = "sine";
    transformerHum.frequency.value = 50;
    transformerGain.gain.setValueAtTime(0.02, ctx.currentTime);
    transformerHum.connect(transformerGain);
    transformerGain.connect(this.masterGain);
    transformerHum.start();

    this.activeNodes.sources.push(ambientBreeze, transformerHum);
    this.activeNodes.filters.push(breezeFilter);
    this.activeNodes.gains.push(breezeGain, transformerGain);

    // B. Vintage cracks and page flips (Cozy paper rustles)
    const playCrackle = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain || !this.noiseBuffer) return;

      const cracker = this.ctx.createBufferSource();
      cracker.buffer = this.noiseBuffer;

      const crackFilter = this.ctx.createBiquadFilter();
      crackFilter.type = "peaking";
      crackFilter.frequency.setValueAtTime(6000 + Math.random() * 4000, this.ctx.currentTime);
      crackFilter.Q.setValueAtTime(5, this.ctx.currentTime);

      const crackGain = this.ctx.createGain();
      crackGain.gain.setValueAtTime(0, this.ctx.currentTime);
      crackGain.gain.linearRampToValueAtTime(0.01 + Math.random() * 0.02, this.ctx.currentTime + 0.001);
      crackGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.02 + Math.random() * 0.03);

      cracker.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(this.masterGain);

      cracker.start();
      cracker.stop(this.ctx.currentTime + 0.1);

      setTimeout(() => {
        try { cracker.disconnect(); crackFilter.disconnect(); crackGain.disconnect(); } catch(e){}
      }, 150);
    };

    const crackleTimer = setInterval(() => {
      // Periodic cozy crackles
      if (Math.random() > 0.45) {
        playCrackle();
      }
    }, 180) as any;

    this.activeNodes.timers.push(crackleTimer);
  }
}

export const soundEngine = new AmbientAudioEngine();
