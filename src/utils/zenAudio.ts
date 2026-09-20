/**
 * Serene Web Audio API Synthesizer
 * Generates natural ambient soundscapes (Rain, Ocean, Zen Chimes, Brown Noise)
 * and meditation chime. 100% procedural, no external MP3s.
 */

export type SoundscapeType = 'rain' | 'ocean' | 'chimes' | 'brown-noise';

class ZenAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentSource: AudioNode | null = null;
  private secondarySource: AudioNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private intervalId: number | null = null;

  public isPlaying = false;
  public currentSoundscape: SoundscapeType = 'rain';
  public volume = 0.45; // 45% default audible, soothing level

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  setVolume(newVolume: number) {
    this.volume = Math.max(0, Math.min(1, newVolume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
    }
  }

  playSuccessChime() {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      // Pentatonic overtone chord: E5, B5, E6
      const chord = [659.25, 987.77, 1318.51];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const bellVol = (0.08 / (idx + 1)) * this.volume;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(bellVol, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4 + idx * 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.8);
      });
    } catch {
      // Ignored if user hasn't interacted yet
    }
  }

  toggleSoundscape(type?: SoundscapeType): boolean {
    if (type && type !== this.currentSoundscape) {
      this.currentSoundscape = type;
      if (this.isPlaying) {
        this.stopCurrent();
        this.startCurrent();
        return true;
      }
    }

    if (this.isPlaying) {
      this.stopCurrent();
      this.isPlaying = false;
      return false;
    } else {
      if (type) this.currentSoundscape = type;
      this.startCurrent();
      this.isPlaying = true;
      return true;
    }
  }

  private stopCurrent() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    try {
      if (this.currentSource) {
        (this.currentSource as AudioBufferSourceNode).stop?.();
        this.currentSource.disconnect();
        this.currentSource = null;
      }
      if (this.secondarySource) {
        (this.secondarySource as AudioBufferSourceNode).stop?.();
        this.secondarySource.disconnect();
        this.secondarySource = null;
      }
      if (this.lfoOsc) {
        this.lfoOsc.stop?.();
        this.lfoOsc.disconnect();
        this.lfoOsc = null;
      }
    } catch {
      // noop
    }
  }

  private startCurrent() {
    const ctx = this.initContext();
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
    }

    switch (this.currentSoundscape) {
      case 'rain':
        this.startRain(ctx);
        break;
      case 'ocean':
        this.startOcean(ctx);
        break;
      case 'chimes':
        this.startChimes(ctx);
        break;
      case 'brown-noise':
        this.startBrownNoise(ctx);
        break;
    }
  }

  // --- Rain Generator: Pink noise bed + randomized droplet pings ---
  private startRain(ctx: AudioContext) {
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Warm pink/brown noise
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.12;
      b6 = white * 0.115926;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filter to simulate rain on foliage / glass
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(320, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.5, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(highpass);
    highpass.connect(rainGain);
    if (this.masterGain) rainGain.connect(this.masterGain);

    noiseSource.start();
    this.currentSource = noiseSource;

    // Random soft water droplet pings
    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying || Math.random() > 0.6) return;
      try {
        const dropOsc = ctx.createOscillator();
        const dropGain = ctx.createGain();
        const t = ctx.currentTime;
        const baseFreq = 800 + Math.random() * 900;

        dropOsc.type = 'sine';
        dropOsc.frequency.setValueAtTime(baseFreq, t);
        dropOsc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, t + 0.08);

        dropGain.gain.setValueAtTime(0.015, t);
        dropGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

        dropOsc.connect(dropGain);
        if (this.masterGain) dropGain.connect(this.masterGain);

        dropOsc.start(t);
        dropOsc.stop(t + 0.09);
      } catch {
        // noop
      }
    }, 180);
  }

  // --- Ocean Waves Generator: Slow breathing filter sweep over brown noise ---
  private startOcean(ctx: AudioContext) {
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 1.8;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Swept lowpass filter to mimic rolling waves
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    // LFO for wave modulation
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 second wave period

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(320, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const oceanGain = ctx.createGain();
    oceanGain.gain.setValueAtTime(0.65, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(oceanGain);
    if (this.masterGain) oceanGain.connect(this.masterGain);

    noiseSource.start();
    lfo.start();
    this.currentSource = noiseSource;
    this.lfoOsc = lfo;
  }

  // --- Zen Chimes Generator: Ambient breeze + random pentatonic singing bell ---
  private startChimes(ctx: AudioContext) {
    // Soft air bed
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.04;
    }

    const airSource = ctx.createBufferSource();
    airSource.buffer = buffer;
    airSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(480, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    const airGain = ctx.createGain();
    airGain.gain.setValueAtTime(0.18, ctx.currentTime);

    airSource.connect(filter);
    filter.connect(airGain);
    if (this.masterGain) airGain.connect(this.masterGain);
    airSource.start();
    this.currentSource = airSource;

    // Pentatonic frequencies (G4, A4, C5, D5, E5, G5)
    const pentatonic = [392.0, 440.0, 523.25, 587.33, 659.25, 783.99];

    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying) return;
      try {
        const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        const t = ctx.currentTime;

        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(freq, t);

        chimeGain.gain.setValueAtTime(0, t);
        chimeGain.gain.linearRampToValueAtTime(0.06, t + 0.03);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);

        chimeOsc.connect(chimeGain);
        if (this.masterGain) chimeGain.connect(this.masterGain);

        chimeOsc.start(t);
        chimeOsc.stop(t + 3.5);
      } catch {
        // noop
      }
    }, 2400);
  }

  // --- Cozy Brown Noise Generator ---
  private startBrownNoise(ctx: AudioContext) {
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 2.2;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);

    noiseSource.start();
    this.currentSource = noiseSource;
  }
}

export const zenAudio = new ZenAudioManager();
