import { AUDIO_CONFIG, STORAGE_KEYS } from "../config";
import { playInteractionCue, unlockInteractionSynth, type InteractionCue } from "./interactionSynth";

export type SfxKey = InteractionCue;

const STORAGE_KEY = STORAGE_KEYS.legacyAudio;

interface StoredAudioSettings {
  volume: number;
  muted: boolean;
}

/**
 * Singleton audio manager. Plays short SFX cues via `interactionSynth`
 * (synthesized live with the Web Audio API — see that module's header for
 * where the technique comes from) plus one looping ambient background bed
 * (Jeli's "Café Jazz" theme, still a pre-rendered file since it's a 24s
 * musical loop rather than a short UI cue). A single master volume/mute
 * applies to both.
 *
 * Volume/mute are NOT the source of truth here — the Zustand store
 * (`useJeliStore`, persisted under the key in `STORAGE_KEYS.store`) owns
 * that. This class just mirrors whatever it's told via `init`/`setVolume`/
 * `setMuted` so actual playback always matches what the Settings slider
 * shows. A legacy localStorage key is still read once as a fallback for
 * anyone who had settings saved before the store became the source of
 * truth.
 */
class AudioManager {
  private volume: number = AUDIO_CONFIG.defaultVolume;
  private muted: boolean = AUDIO_CONFIG.defaultMuted;
  private ambient: HTMLAudioElement;
  private unlocked = false;

  constructor() {
    const legacy = this.loadLegacySettings();
    if (legacy) {
      this.volume = legacy.volume;
      this.muted = legacy.muted;
    }

    this.ambient = new Audio(AUDIO_CONFIG.ambientSource);
    this.ambient.loop = true;
    this.ambient.preload = "auto";
    this.ambient.volume = this.effectiveAmbientVolume();
  }

  private loadLegacySettings(): StoredAudioSettings | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StoredAudioSettings) : null;
    } catch {
      return null;
    }
  }

  private effectiveVolume(): number {
    return this.muted ? 0 : this.volume / AUDIO_CONFIG.maxVolume;
  }

  /** Same master volume/mute as SFX, scaled down by `ambientGain` so the
   *  Café Jazz loop sits under everything else instead of competing with it. */
  private effectiveAmbientVolume(): number {
    return this.effectiveVolume() * AUDIO_CONFIG.ambientGain;
  }

  /**
   * Hydrates this manager with the current volume/mute from the store.
   * Call once on app start (before any interaction) so playback matches
   * whatever the Settings screen displays right away, instead of relying
   * on a separately-persisted value that could drift out of sync.
   */
  init(volume: number, muted: boolean) {
    this.volume = Math.min(AUDIO_CONFIG.maxVolume, Math.max(AUDIO_CONFIG.minVolume, volume));
    this.muted = muted;
    this.ambient.volume = this.effectiveAmbientVolume();
  }

  /**
   * Mobile browsers require a user gesture before any audio — including a
   * looping background track or a Web Audio oscillator — can start. Call
   * this on the very first tap (see `IntroScreen`); it warms up the
   * synthesized-SFX AudioContext and kicks off the Café Jazz ambient loop.
   */
  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    unlockInteractionSynth();
    this.playAmbient();
  }

  /** Plays a synthesized interaction cue at the current effective volume. */
  play(key: SfxKey) {
    playInteractionCue(key, this.effectiveVolume());
  }

  /** Starts the looping Café Jazz background bed, if it isn't already playing.
   *  No-ops silently before `unlock()` has run (the browser would reject it anyway). */
  playAmbient() {
    if (!this.unlocked) return;
    this.ambient.volume = this.effectiveAmbientVolume();
    if (this.ambient.paused) {
      this.ambient.play().catch(() => undefined);
    }
  }

  /** Pauses the ambient loop without resetting its playback position, so
   *  resuming picks up where it left off instead of restarting the vamp. */
  pauseAmbient() {
    this.ambient.pause();
  }

  setVolume(value: number) {
    this.volume = Math.min(AUDIO_CONFIG.maxVolume, Math.max(AUDIO_CONFIG.minVolume, value));
    if (this.volume > 0) this.muted = false;
    this.ambient.volume = this.effectiveAmbientVolume();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.ambient.volume = this.effectiveAmbientVolume();
  }

  setMax() {
    this.setVolume(AUDIO_CONFIG.maxVolume);
  }

  getVolume() {
    return this.volume;
  }

  isMuted() {
    return this.muted;
  }
}

export const audioManager = new AudioManager();
