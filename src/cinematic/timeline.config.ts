import type { SceneDurationConfig } from './types';

/**
 * The only place scene ORDER and DURATION are declared. Adding a future
 * scene means adding one entry here (plus registering it in
 * SceneRegistry.ts) — Timeline and SceneEngine never change.
 *
 * `distance` is scroll-px dedicated to that scene; `overlap` is the
 * fraction of the scene's OWN distance spent cross-fading into the next
 * one (shared with that next scene's start, not additional length).
 *
 * `nucleus` -> `portal` -> `ecosystem-entry` -> `holo-hall` are real
 * cinematic footage: one continuous ~24s single-take camera move across 4
 * clips (each cut literally starts on the next file's first frame),
 * extracted to frame sequences. Because it's one real shot, not four
 * independently rendered
 * scenes, the overlap between them only needs to be a small safety blend
 * (0.05) rather than a real cross-fade — there's no visual mismatch to
 * hide. `holo-hall` gets a larger overlap (0.12) since it hands off to an
 * actual style change (Fusion AI's abstract procedural forms); its
 * interactive React panels (see `HOLOHALL_PANELS_HIDE_AT`) are timed to
 * finish dissolving just as this overlap begins, so they never appear
 * mid-cross-fade.
 *
 * `guardian` sits between `nucleus` and `portal` — "the core pulses, and
 * the Guardian wakes with it" — a real procedural Three.js scene (not
 * footage), so its overlap into `portal` IS a genuine cross-fade (0.15)
 * rather than a safety blend.
 */
export const SCENE_DURATIONS: SceneDurationConfig[] = [
  { id: 'nucleus', distance: 1000, overlap: 0.05 },
  { id: 'guardian', distance: 1100, overlap: 0.15 },
  { id: 'portal', distance: 1000, overlap: 0.05 },
  { id: 'ecosystem-entry', distance: 1000, overlap: 0.05 },
  { id: 'holo-hall', distance: 1000, overlap: 0.12 },
  { id: 'fusion-ai', distance: 900, overlap: 0.3 },
  // Last scene: no overlap needed — it settles to a calm ember and the
  // pin releases into the (unchanged) Hero right after.
  { id: 'return', distance: 900 },
];
