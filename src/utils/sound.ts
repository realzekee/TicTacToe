// Dynamic Web Audio API sound designer for polished mechanical and synthesized interactions
let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

// Robust auto-unlocker for modern browsers and sandboxed iframes
if (typeof window !== 'undefined') {
  const resumeEvents = ['click', 'touchstart', 'keydown'];
  const resumeAudio = () => {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      try {
        // Play a high-fidelity micro-silent buffer to unlock Web Audio on iOS/Safari/Chrome
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch (e) {
        console.warn('Web Audio auto-unlock failed:', e);
      }
      
      // Safely detaching event listeners after we unlock
      resumeEvents.forEach(evt => window.removeEventListener(evt, resumeAudio));
    }
  };
  resumeEvents.forEach(evt => window.addEventListener(evt, resumeAudio, { passive: true }));
}

export function setMuteState(muted: boolean) {
  isMuted = muted;
  if (!muted && audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
}

export function getMuteState(): boolean {
  return isMuted;
}

export function playClickSound(player: 'X' | 'O') {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  // X gets a bright synth click, O gets a slightly warmer, rounder pop sound
  if (player === 'X') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  } else {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.06);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  }

  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}

export function playWinSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime;
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // Beautiful C Major pentatonic arpeggio

  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const delay = index * 0.08;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + delay);
    
    // Vibrato effect
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 8;
    lfoGain.gain.value = 4;
    
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    gainNode.gain.setValueAtTime(0, now + delay);
    gainNode.gain.linearRampToValueAtTime(0.15, now + delay + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);

    lfo.start(now + delay);
    osc.start(now + delay);

    lfo.stop(now + delay + 0.45);
    osc.stop(now + delay + 0.45);
  });
}

export function playDrawSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(220, now);
  osc1.frequency.linearRampToValueAtTime(180, now + 0.4);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(225, now);
  osc2.frequency.linearRampToValueAtTime(182, now + 0.4);

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(ctx.destination);

  gainNode.gain.setValueAtTime(0.12, now);
  gainNode.gain.linearRampToValueAtTime(0.001, now + 0.45);

  osc1.start();
  osc2.start();
  osc1.stop(now + 0.45);
  osc2.stop(now + 0.45);
}

export function playResetSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  gainNode.gain.setValueAtTime(0.08, now);
  gainNode.gain.linearRampToValueAtTime(0.001, now + 0.28);

  osc.start();
  osc.stop(now + 0.3);
}

export function playToggleSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.1);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}
