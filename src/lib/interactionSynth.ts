/**
 * interactionSynth
 * ─────────────────────────────────────────────────────────────
 * Synthesizes Jeli's short interaction cues programmatically using the
 * Web Audio API — no .wav/.mp3 files needed for any of them.
 *
 * This is a direct port of the sound-design *technique* used by the
 * "crmb" menu app (github.com/saidryus/crmb — see src/hooks/useSound.js):
 * every cue there is a tiny oscillator + GainNode envelope, lazily
 * initialized on first use to satisfy mobile autoplay policies, and
 * wrapped in try/catch so a browser that blocks audio never breaks the
 * UI. crmb ships zero audio assets — its whole SFX palette is generated
 * at runtime — so there is nothing to literally copy over as a file;
 * instead each Jeli cue below reuses the same oscillator/gain envelope
 * shapes crmb uses for its closest equivalent interaction:
 *
 *   Jeli cue   →  ported from crmb's...   →  crmb's use case
 *   ──────────    ─────────────────────      ─────────────────────
 *   click      →  playClick                  generic button / nav tap
 *   add        →  playAddToCart              adding an item
 *   drop       →  playRemove                 removing an item
 *   complete   →  playSuccess                order confirmed (arpeggio)
 *   reward     →  playQtyUp + playSuccess    combined into a bigger
 *                 (layered, new)             "swell + sparkle" cue,
 *                                            since crmb has no single
 *                                            equivalent of "claim a
 *                                            random loot drop"
 *
 * Every function takes a `masterGain` (0–1) so Jeli's existing
 * volume/mute slider (owned by the Zustand store, mirrored into
 * `audioManager`) scales these exactly the way it scaled the old
 * pre-recorded clips.
 */

export type InteractionCue = "click" | "add" | "drop" | "complete" | "reward";

// Singleton AudioContext — shared across all cues, lazily created so it's
// only ever constructed after a user gesture (see `unlockInteractionSynth`).
let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => undefined);
  }
  return ctx;
}

function gainNode(ac: AudioContext, value: number, time: number): GainNode {
  const g = ac.createGain();
  g.gain.setValueAtTime(value, time);
  return g;
}

/** One oscillator with an exponential-decay envelope, mirroring crmb's
 *  single-tone cues (playClick / playNav / playRemove / playQtyUp/Down). */
function tone(
  ac: AudioContext,
  startTime: number,
  {
    type,
    from,
    to,
    peakGain,
    duration,
  }: { type: OscillatorType; from: number; to: number; peakGain: number; duration: number }
) {
  const osc = ac.createOscillator();
  const g = gainNode(ac, peakGain, startTime);
  osc.type = type;
  osc.frequency.setValueAtTime(from, startTime);
  osc.frequency.exponentialRampToValueAtTime(to, startTime + duration * 0.8);
  g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

/** Ported from crmb's `playClick` — crisp descending sine.
 *  Used for: generic button taps, bottom-nav tab switches. */
function playClick(masterGain: number) {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    tone(ac, t, { type: "sine", from: 820, to: 480, peakGain: 0.12 * masterGain, duration: 0.07 });
  } catch {
    /* audio blocked — never break the UI */
  }
}

/** Ported from crmb's `playAddToCart` — warm double-pop (two overlapping
 *  rising sines, the second offset by 100ms).
 *  Used for: starting a new quest. */
function playAdd(masterGain: number) {
  try {
    const ac = getCtx();
    const t = ac.currentTime;

    const o1 = ac.createOscillator();
    const g1 = gainNode(ac, 0.18 * masterGain, t);
    o1.type = "sine";
    o1.frequency.setValueAtTime(520, t);
    o1.frequency.exponentialRampToValueAtTime(780, t + 0.08);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o1.connect(g1);
    g1.connect(ac.destination);
    o1.start(t);
    o1.stop(t + 0.12);

    const o2 = ac.createOscillator();
    const g2 = gainNode(ac, 0.14 * masterGain, t + 0.1);
    o2.type = "sine";
    o2.frequency.setValueAtTime(680, t + 0.1);
    o2.frequency.exponentialRampToValueAtTime(960, t + 0.18);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o2.connect(g2);
    g2.connect(ac.destination);
    o2.start(t + 0.1);
    o2.stop(t + 0.22);
  } catch {
    /* audio blocked — never break the UI */
  }
}

/** Ported from crmb's `playRemove` — low descending thud, stretched
 *  slightly longer so it reads as "lost", not just "removed".
 *  Used for: a quest getting randomly dropped on overflow. */
function playDrop(masterGain: number) {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    tone(ac, t, { type: "sine", from: 320, to: 110, peakGain: 0.12 * masterGain, duration: 0.18 });
  } catch {
    /* audio blocked — never break the UI */
  }
}

/** Ported from crmb's `playSuccess` — ascending C-major arpeggio
 *  (C5 → E5 → G5 → C6), fast attack / slow exponential decay per note.
 *  Used for: completing a quest. */
function playComplete(masterGain: number) {
  try {
    const ac = getCtx();
    const t = ac.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const delay = i * 0.1 + (i === 3 ? 0.04 : 0);
      const osc = ac.createOscillator();
      const g = gainNode(ac, 0, t + delay);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + delay);
      g.gain.linearRampToValueAtTime(0.16 * masterGain, t + delay + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.55);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.6);
    });
  } catch {
    /* audio blocked — never break the UI */
  }
}

/** New cue, layered from two crmb building blocks since crmb has no
 *  single equivalent of "claim a random loot drop":
 *   1. a bright rising sweep (crmb's `playQtyUp` shape) as the "swell"
 *   2. a triangle-wave high sparkle chord (G5/C6/E6), reusing crmb's
 *      `playSuccess` per-note envelope but pitched up and in parallel
 *      instead of arpeggiated, for a shimmering "loot" chime.
 *  Used for: claiming a reward. */
function playReward(masterGain: number) {
  try {
    const ac = getCtx();
    const t = ac.currentTime;

    // 1. Swell — ported from crmb's playQtyUp
    tone(ac, t, { type: "sine", from: 600, to: 900, peakGain: 0.11 * masterGain, duration: 0.11 });

    // 2. High sparkle chord — triangle wave, three notes in parallel
    const sparkleStart = t + 0.08;
    [783.99, 1046.5, 1318.51].forEach((freq, i) => {
      const osc = ac.createOscillator();
      const g = gainNode(ac, 0, sparkleStart);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, sparkleStart);
      g.gain.linearRampToValueAtTime(0.1 * masterGain, sparkleStart + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, sparkleStart + 0.5 + i * 0.05);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(sparkleStart);
      osc.stop(sparkleStart + 0.6 + i * 0.05);
    });
  } catch {
    /* audio blocked — never break the UI */
  }
}

const CUE_PLAYERS: Record<InteractionCue, (masterGain: number) => void> = {
  click: playClick,
  add: playAdd,
  drop: playDrop,
  complete: playComplete,
  reward: playReward,
};

/** Plays a named interaction cue, scaled by the app's current master
 *  volume (0–1, already resolved for mute by the caller). */
export function playInteractionCue(cue: InteractionCue, masterGain: number) {
  CUE_PLAYERS[cue](masterGain);
}

/** Mobile browsers only allow an AudioContext to start after a user
 *  gesture. Call this once on the very first tap (same moment the
 *  ambient loop is unlocked) so the context is warmed up and ready. */
export function unlockInteractionSynth() {
  try {
    getCtx();
  } catch {
    /* Web Audio unsupported — cues will just no-op via their own try/catch */
  }
}
