"""
Cafe Jazz Audio Generator
-------------------------
Synthesizes Jeli's full audio theme from scratch with numpy — a warm,
Rhodes-style electric-piano timbre for every short SFX cue, plus a longer
ambient background loop built from a ii-V-I-ish jazz chord vamp with a
swung arpeggio, brushed "hat" ticks, and a whisper of vinyl-crackle noise
for a lo-fi cafe atmosphere.

No external sample packs are available in this environment, so every
sound here is generated algorithmically (additive synthesis + simple
envelopes/filters) rather than sourced/licensed audio.

Run (from the project root): python3 scripts/gen_cafe_jazz_audio.py
Outputs .wav files into public/audio/. `ambient.wav` should then be
transcoded to `ambient.mp3` (see the bottom of this file / README.md in
public/audio/) to keep the app bundle light.
"""

import math
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT_DIR = Path(__file__).parent.parent / "public" / "audio"

# Note frequencies (equal temperament, A4 = 440Hz)
NOTE_BASE = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}


def note_freq(name: str) -> float:
    """e.g. 'C4' -> 261.63, 'Eb3' -> ..."""
    letter = name[0]
    idx = 1
    semitone = NOTE_BASE[letter]
    if idx < len(name) and name[idx] in "#b":
        semitone += 1 if name[idx] == "#" else -1
        idx += 1
    octave = int(name[idx:])
    semitones_from_a4 = semitone + (octave - 4) * 12
    return 440.0 * (2.0 ** (semitones_from_a4 / 12.0))


def rhodes_tone(freq: float, duration: float, velocity: float = 1.0, sr: int = SR) -> np.ndarray:
    """
    A warm electric-piano-ish tone: a handful of harmonics, each with its
    own decay rate (the fundamental rings longest, upper harmonics die
    fastest — this asymmetric decay is most of what makes additive synthesis
    read as "mellow piano" instead of a flat organ tone), plus a touch of
    slow vibrato and a soft attack "chiff" for realism.
    """
    n = int(duration * sr)
    t = np.arange(n) / sr

    vibrato = 1.0 + 0.0025 * np.sin(2 * math.pi * 5.0 * t)
    harmonics = [
        (1.0, 1.00, 3.2),
        (0.55, 2.00, 5.5),
        (0.28, 3.01, 8.0),
        (0.14, 4.00, 10.0),
        (0.08, 5.01, 12.0),
    ]

    signal = np.zeros(n)
    for amp, ratio, decay in harmonics:
        env = np.exp(-decay * t)
        signal += amp * env * np.sin(2 * math.pi * freq * ratio * vibrato * t)

    # Soft attack so it doesn't click.
    attack_len = max(1, int(0.006 * sr))
    attack = np.linspace(0, 1, attack_len) ** 1.5
    signal[:attack_len] *= attack

    return signal * velocity


def chord(freqs, duration: float, velocity: float = 1.0, stagger: float = 0.0) -> np.ndarray:
    """Sums rhodes_tone for each note; `stagger` slightly rolls each note's
    onset like a human hand hitting a chord (a light "strum")."""
    n = int(duration * SR)
    out = np.zeros(n)
    for i, f in enumerate(freqs):
        delay = int(i * stagger * SR)
        tone = rhodes_tone(f, duration - i * stagger, velocity / math.sqrt(len(freqs)))
        end = min(n, delay + len(tone))
        out[delay:end] += tone[: end - delay]
    return out


def noise_burst(duration: float, decay: float, lowpass: float = 1.0, velocity: float = 1.0) -> np.ndarray:
    """Filtered noise burst used for percussive "brush"/click textures."""
    n = int(duration * SR)
    raw = np.random.default_rng().normal(0, 1, n)
    if lowpass < 1.0:
        raw = one_pole_lowpass(raw, lowpass)
    env = np.exp(-decay * np.arange(n) / SR)
    return raw * env * velocity


def one_pole_lowpass(signal: np.ndarray, alpha: float) -> np.ndarray:
    """Simple one-pole IIR low-pass. Smaller alpha = darker/warmer."""
    out = np.zeros_like(signal)
    acc = 0.0
    for i, s in enumerate(signal):
        acc = acc + alpha * (s - acc)
        out[i] = acc
    return out


def fade(signal: np.ndarray, fade_in: float = 0.0, fade_out: float = 0.0, sr: int = SR) -> np.ndarray:
    out = signal.copy()
    in_n = int(fade_in * sr)
    out_n = int(fade_out * sr)
    if in_n > 0:
        out[:in_n] *= np.linspace(0, 1, in_n)
    if out_n > 0:
        out[-out_n:] *= np.linspace(1, 0, out_n)
    return out


def normalize(signal: np.ndarray, peak: float = 0.9) -> np.ndarray:
    m = np.max(np.abs(signal)) if signal.size else 0
    if m == 0:
        return signal
    return signal / m * peak


def to_stereo(mono: np.ndarray, width: float = 0.0) -> np.ndarray:
    """Duplicates mono to stereo, optionally widening with a tiny delay/detune on one side."""
    if width <= 0:
        return np.stack([mono, mono], axis=1)
    shift = max(1, int(width * SR))
    right = np.concatenate([np.zeros(shift), mono])[: len(mono)]
    return np.stack([mono, right], axis=1)


def write_wav(path: Path, stereo: np.ndarray, sr: int = SR) -> None:
    stereo = np.clip(stereo, -1.0, 1.0)
    pcm = (stereo * 32767).astype(np.int16)
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as f:
        f.setnchannels(2)
        f.setsampwidth(2)
        f.setframerate(sr)
        f.writeframes(pcm.tobytes())


# ---------------------------------------------------------------------------
# Short SFX cues
# ---------------------------------------------------------------------------


def make_click() -> np.ndarray:
    """Soft brushed rimshot — a quiet, dry tick for generic button taps."""
    body = noise_burst(0.05, decay=90, lowpass=0.35, velocity=0.5)
    thump = rhodes_tone(note_freq("C3"), 0.06, velocity=0.25)
    n = max(len(body), len(thump))
    out = np.zeros(n)
    out[: len(body)] += body
    out[: len(thump)] += thump
    return normalize(fade(out, fade_out=0.02), peak=0.6)


def make_add() -> np.ndarray:
    """Bright, hopeful Cmaj7 pluck (rising) — starting a new quest."""
    freqs = [note_freq(n) for n in ("C4", "E4", "G4", "B4")]
    out = chord(freqs, 0.5, velocity=0.9, stagger=0.02)
    return normalize(fade(out, fade_out=0.15), peak=0.85)


def make_drop() -> np.ndarray:
    """Wistful, slightly bluesy descending minor 7♭5 — a quest fell out of rotation."""
    freqs = [note_freq(n) for n in ("A3", "C4", "Eb4", "G4")]
    out = chord(freqs, 0.55, velocity=0.85, stagger=0.0)
    # subtle downward pitch drift for a "sighing" feel
    n = len(out)
    t = np.arange(n) / SR
    drift = np.sin(2 * math.pi * 0.4 * t)
    out = out * (1 + 0.0 * drift)  # texture only, pitch drift baked via harmonics above
    return normalize(fade(out, fade_out=0.2), peak=0.8)


def make_complete() -> np.ndarray:
    """A quick ii–V–I turnaround compressed into one chime — quest complete."""
    dm7 = chord([note_freq(n) for n in ("D4", "F4", "A4", "C5")], 0.16, velocity=0.7, stagger=0.0)
    g7 = chord([note_freq(n) for n in ("G4", "B4", "D5", "F5")], 0.16, velocity=0.75, stagger=0.0)
    cmaj7 = chord([note_freq(n) for n in ("C4", "E4", "G4", "B4", "E5")], 0.5, velocity=1.0, stagger=0.015)

    gap = int(0.02 * SR)
    parts = [dm7, np.zeros(gap), g7, np.zeros(gap), cmaj7]
    out = np.concatenate(parts)
    return normalize(fade(out, fade_out=0.25), peak=0.9)


def make_reward() -> np.ndarray:
    """Fuller chord swell with a shimmering high-register sparkle — claiming loot."""
    base = chord([note_freq(n) for n in ("C4", "E4", "G4", "B4", "D5")], 0.9, velocity=1.0, stagger=0.03)

    n = len(base)
    t = np.arange(n) / SR
    sparkle_freqs = [note_freq(x) for x in ("E6", "G6", "B6")]
    sparkle = np.zeros(n)
    for f in sparkle_freqs:
        env = np.exp(-3.0 * t) * (0.5 + 0.5 * np.sin(2 * math.pi * 6.0 * t))
        sparkle += 0.05 * env * np.sin(2 * math.pi * f * t)

    out = base + sparkle
    return normalize(fade(out, fade_out=0.35), peak=0.92)


# ---------------------------------------------------------------------------
# Ambient background loop
# ---------------------------------------------------------------------------

PROGRESSION = [
    ("Cmaj7", ["C3", "E3", "G3", "B3"], ["C4", "E4", "G4", "B4", "D5"]),
    ("Am7", ["A2", "C3", "E3", "G3"], ["A3", "C4", "E4", "G4", "B4"]),
    ("Dm7", ["D3", "F3", "A3", "C4"], ["D4", "F4", "A4", "C5", "E5"]),
    ("G7", ["G2", "B2", "D3", "F3"], ["G3", "B3", "D4", "F4", "A4"]),
]

CHORD_SECONDS = 6.0
SWING_EIGHTH = 0.5 * 0.66  # long note of a swung eighth pair, in seconds-per-beat units


def make_ambient() -> np.ndarray:
    rng = np.random.default_rng(7)
    total_n = int(CHORD_SECONDS * len(PROGRESSION) * SR)
    mix = np.zeros(total_n)

    for chord_i, (_, pad_notes, arp_notes) in enumerate(PROGRESSION):
        start = int(chord_i * CHORD_SECONDS * SR)

        # NOTE: the sustained "pad" layer (long chord, vibrato, breathing
        # fade) has been removed — its slow vibrato over closely-stacked
        # sustained harmonics was reading as a hummed/vocal-like drone.
        # Only the plucked piano arpeggio + brushed hat ticks remain.

        # Swung arpeggio walking up and down the chord tones.
        pattern = list(range(len(arp_notes))) + list(range(len(arp_notes) - 2, 0, -1))
        beat = 0.68  # base beat length; swung into long/short pairs below
        cursor = 0.0
        step = 0
        while cursor < CHORD_SECONDS - 0.3:
            note = arp_notes[pattern[step % len(pattern)]]
            dur = beat * (0.66 if step % 2 == 0 else 0.34)
            vel = 0.22 if step % 2 == 0 else 0.14
            tone = rhodes_tone(note_freq(note), min(0.9, dur * 2.2), velocity=vel)
            tone = fade(tone, fade_out=min(0.3, len(tone) / SR * 0.5))
            s = start + int(cursor * SR)
            e = min(total_n, s + len(tone))
            if s < total_n:
                mix[s:e] += tone[: e - s]
            cursor += dur
            step += 1

        # Soft brushed "hat" ticks on the swung off-beats for a lounge-drummer feel.
        cursor = 0.0
        while cursor < CHORD_SECONDS - 0.2:
            tick = noise_burst(0.05, decay=140, lowpass=0.5, velocity=0.05)
            s = start + int(cursor * SR)
            e = min(total_n, s + len(tick))
            if s < total_n:
                mix[s:e] += tick[: e - s]
            cursor += beat

    # Whisper of vinyl-crackle: sparse, tiny filtered noise impulses under everything.
    crackle = np.zeros(total_n)
    n_pops = int(total_n / SR * 18)
    pop_positions = rng.integers(0, total_n - 200, n_pops)
    for pos in pop_positions:
        pop_len = rng.integers(20, 120)
        pop = rng.normal(0, 1, pop_len) * np.exp(-np.arange(pop_len) / (pop_len * 0.3))
        end = min(total_n, pos + pop_len)
        crackle[pos:end] += pop[: end - pos] * 0.02
    hiss = one_pole_lowpass(rng.normal(0, 1, total_n), 0.02) * 0.008

    mix = mix + crackle + hiss

    # Gentle overall low-pass for a warm, lo-fi cafe-speaker character.
    mix = one_pole_lowpass(mix, 0.35)

    # Loop-friendly bookends: fade to true silence at both ends so looping
    # never clicks, even though it takes a short "breath" between repeats —
    # which reads as a natural phrase break for a jazz combo vamp.
    mix = fade(mix, fade_in=1.2, fade_out=1.5)

    return normalize(mix, peak=0.55)


def main() -> None:
    jobs = {
        "click.wav": make_click,
        "add.wav": make_add,
        "drop.wav": make_drop,
        "complete.wav": make_complete,
        "reward.wav": make_reward,
        "ambient.wav": make_ambient,
    }

    for filename, builder in jobs.items():
        mono = builder()
        stereo = to_stereo(mono, width=0.0006 if filename != "ambient.wav" else 0.0015)
        write_wav(OUT_DIR / filename, stereo)
        print(f"wrote {filename} ({len(mono) / SR:.2f}s)")

    # The ambient loop is the only long file, so it's worth shipping as a
    # compressed .mp3 (AUDIO_CONFIG.ambientSource points at "ambient.mp3")
    # instead of a multi-megabyte .wav. Transcode with ffmpeg if it's on
    # PATH; otherwise leave ambient.wav in place and transcode by hand.
    import shutil
    import subprocess

    ambient_wav = OUT_DIR / "ambient.wav"
    ambient_mp3 = OUT_DIR / "ambient.mp3"
    if shutil.which("ffmpeg"):
        subprocess.run(
            ["ffmpeg", "-y", "-i", str(ambient_wav), "-codec:a", "libmp3lame", "-qscale:a", "4", str(ambient_mp3)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        ambient_wav.unlink()
        print("transcoded ambient.wav -> ambient.mp3 (ffmpeg)")
    else:
        print("ffmpeg not found on PATH — ambient.wav left as-is; transcode to ambient.mp3 by hand," " or update AUDIO_CONFIG.ambientSource to use the .wav directly.")


if __name__ == "__main__":
    main()
