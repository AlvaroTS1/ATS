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
 * `nucleus` and `portal-corridor` are real cinematic footage (frame
 * sequences). `portal-corridor` (V4) replaced the earlier separate
 * `portal` + `ecosystem-entry` clips (V2) with a single commissioned take
 * — the portal ring opens onto the landscape, the camera descends into
 * the corridor and travels down it, no cut. Its overlap into `holo-hall`
 * (0.05) stays a small safety blend, not a real cross-fade — same
 * reasoning as before, there's no visual mismatch to hide within one
 * continuous shot. `holo-hall` itself gets a larger overlap (0.12) since
 * it hands off to an actual style change (Fusion AI's abstract procedural
 * forms); its interactive React panels (see `HOLOHALL_PANELS_HIDE_AT`)
 * are timed to finish dissolving just as this overlap begins, so they
 * never appear mid-cross-fade.
 *
 * `guardian` sits between `nucleus` and `portal-corridor` — "the core
 * pulses, and the Guardian wakes with it" — a real procedural Three.js
 * scene (not footage), so its overlap into `portal-corridor` IS a genuine
 * cross-fade (0.15) rather than a safety blend.
 *
 * Distances below are the MOBILE-FIRST baseline (V4: "projete primeiro
 * para celulares, depois expanda para desktop" — most traffic is mobile,
 * so mobile pacing is the source of truth, not a shrunk-down desktop).
 * `CinematicExperience.tsx` multiplies by `DESKTOP_DISTANCE_SCALE` (4/3)
 * above the tablet breakpoint — the exact inverse of the 0.75 mobile
 * scale-down V1-V3 used, so desktop pacing is unchanged from before.
 */
export const SCENE_DURATIONS: SceneDurationConfig[] = [
  { id: 'nucleus', distance: 750, overlap: 0.05 },
  { id: 'guardian', distance: 825, overlap: 0.15 },
  { id: 'portal-corridor', distance: 1425, overlap: 0.05 },
  { id: 'holo-hall', distance: 750, overlap: 0.12 },
  { id: 'fusion-ai', distance: 675, overlap: 0.3 },
  // Last scene: no overlap needed — it settles to a calm ember and the
  // pin releases into the (unchanged) Hero right after.
  { id: 'return', distance: 675 },
];
