import { getAudioContext } from './playGameOverSound';

let lastPlay = 0;
const DEBOUNCE_MS = 150;

export async function playFeedSound() {
  const now = performance.now();
  if (now - lastPlay < DEBOUNCE_MS) return;
  lastPlay = now;

  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {
      /* ignore */
    }
  }

  // Cheerful two-note chime: rising major third
  const duration = 0.3;
  const t = ctx.currentTime;

  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'triangle';
  osc1.frequency.setValueAtTime(523, t); // C5
  gain1.gain.setValueAtTime(0.2, t);
  gain1.gain.linearRampToValueAtTime(0, t + duration * 0.6);
  osc1.connect(gain1).connect(ctx.destination);
  osc1.start(t);
  osc1.stop(t + duration * 0.6);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(659, t + 0.08); // E5
  gain2.gain.setValueAtTime(0, t);
  gain2.gain.setValueAtTime(0.22, t + 0.08);
  gain2.gain.linearRampToValueAtTime(0, t + duration);
  osc2.connect(gain2).connect(ctx.destination);
  osc2.start(t + 0.08);
  osc2.stop(t + duration);

  osc1.onended = () => { osc1.disconnect(); gain1.disconnect(); };
  osc2.onended = () => { osc2.disconnect(); gain2.disconnect(); };
}
