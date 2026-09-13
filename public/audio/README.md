# Jeli Audio

## Short interaction cues — synthesized, no files

`click`, `add`, `drop`, `complete`, and `reward` are **no longer pre-rendered
.wav files.** They're generated live in the browser with the Web Audio API
by `src/lib/interactionSynth.ts` — oscillators + gain-envelope "blips",
the same technique used by the crmb menu app
(github.com/saidryus/crmb — see its `src/hooks/useSound.js`), which ships
zero audio assets and synthesizes every UI sound from scratch instead.

| Cue        | Used for                                    | Ported from crmb's...        |
| ---------- | -------------------------------------------- | ----------------------------- |
| `click`    | Generic button tap, bottom-nav tab switch     | `playClick`                   |
| `add`      | Starting a new quest                          | `playAddToCart`                |
| `drop`     | A quest randomly dropped on overflow          | `playRemove`                   |
| `complete` | Completing a quest (C-major arpeggio)         | `playSuccess`                   |
| `reward`   | Claiming a reward (swell + high sparkle)      | `playQtyUp` + `playSuccess`, layered |

Because these are generated at runtime, there's nothing to drop into this
folder for them anymore — tweak frequencies, waveform types, or envelope
timings directly in `interactionSynth.ts` to change the feel. `audioManager`
scales every cue by the app's master volume/mute automatically.

## Looping background bed — still a file

`ambient.mp3` (Jeli's "Café Jazz" theme) is unchanged: a 24s loop generated
by `gen_cafe_jazz_audio.py` (see the project root) using additive
synthesis — a warm Rhodes-style vamp with a swung arpeggio, brushed hat
ticks, and a whisper of vinyl-crackle noise. It stays a pre-rendered file
(rather than being synthesized live like the short cues above) because it's
a musical loop, not a one-shot UI blip — crmb's closest equivalent is a
*live internet jazz radio stream*, which isn't a fit for Jeli's local-first,
works-offline design.

### Regenerating / customizing the ambient loop

```
python3 gen_cafe_jazz_audio.py
```

Tweak the chord voicings, `PROGRESSION`, envelope decay rates, or swing
timing directly in the script to change the mood, or raise `ambientGain` in
`src/config/app.config.ts` if the loop feels too far under the SFX.

If you'd rather use a real recording instead, just replace `ambient.mp3`
(or update `AUDIO_CONFIG.ambientSource` in `src/config/app.config.ts` to
point at a new filename).
