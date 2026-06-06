let audioCtx = null;
let isMuted = false;
let scribbleNode = null;
let scribbleGain = null;

function getAudioContext() {
  if (isMuted) return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundSynth = {
  setMuted(muted) {
    isMuted = muted;
    if (muted && audioCtx) {
      this.stopScribble();
    }
  },

  // 1. Create a helper to generate white noise
  createNoiseBuffer(ctx, duration) {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  },

  // 2. Play page-flip/paper-rustle sound
  playPageFlip() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(ctx, 0.3);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    // Fade filter frequency slightly for a shuffle effect
    filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05); // quick attack
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); // decay

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.35);
  },

  // 3. Play cute UI popping sound
  playPop() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Frequency sweep from 200Hz up to 500Hz
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  },

  // 4. Pencil scratching sound (continuous scribble loop)
  startScribble() {
    const ctx = getAudioContext();
    if (!ctx || scribbleNode) return;

    // Create noise source
    scribbleNode = ctx.createBufferSource();
    scribbleNode.buffer = this.createNoiseBuffer(ctx, 2.0); // 2 second buffer
    scribbleNode.loop = true;

    // Filter to capture high frequency scratch (around 2500Hz)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, ctx.currentTime);
    filter.Q.setValueAtTime(2.0, ctx.currentTime);

    scribbleGain = ctx.createGain();
    scribbleGain.gain.setValueAtTime(0.05, ctx.currentTime);

    // LFO/amplitude modulation to make it sound like active strokes rather than static noise
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(8, ctx.currentTime); // 8Hz mod

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.025, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(scribbleGain.gain);

    scribbleNode.connect(filter);
    filter.connect(scribbleGain);
    scribbleGain.connect(ctx.destination);

    lfo.start();
    scribbleNode.start();
  },

  stopScribble() {
    if (scribbleGain && audioCtx) {
      try {
        const ctx = audioCtx;
        // Fade out slightly to avoid a pop sound on stop
        scribbleGain.gain.setValueAtTime(scribbleGain.gain.value, ctx.currentTime);
        scribbleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        
        const node = scribbleNode;
        setTimeout(() => {
          try { node.stop(); } catch {}
        }, 60);
      } catch (err) {}
    }
    scribbleNode = null;
    scribbleGain = null;
  },

  // 5. Water splash/slosh sound (clicking cup)
  playSlosh() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    // Frequency sweep down
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  },

  // 6. Splat sound (spilling coffee)
  playSplat() {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Noise burst
    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(ctx, 0.4);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.4);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.45);
  }
};
