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
 * The Guardian is not a scene here, and never becomes one: he is a
 * persistent layer driven by this Timeline's GLOBAL progress, not by a
 * range of his own. He doesn't belong to one scene; he belongs to the
 * whole journey. (V8 retired the layer that carried him until a source
 * exists that can be composited into the space instead of laid over it —
 * the distance below stays his.)
 *
 * Distances below are the MOBILE-FIRST baseline (V4: "projete primeiro
 * para celulares, depois expanda para desktop" — most traffic is mobile,
 * so mobile pacing is the source of truth, not a shrunk-down desktop).
 * `CinematicExperience.tsx` multiplies by `DESKTOP_DISTANCE_SCALE` (4/3)
 * above the tablet breakpoint — the exact inverse of the 0.75 mobile
 * scale-down V1-V3 used, so desktop pacing is unchanged from before.
 *
 * V5.1: `fusion-ai` removed — it was a contextless "Em breve" placeholder
 * (two abstract orbs merging, no product name/branding), never connected
 * to the real "Fusion AI" roadmap entry in `data/products.ts`. That
 * product keeps existing in `RoadmapSection`; it just doesn't get an
 * unexplained cinematic beat. Its distance moved into the final stretch,
 * which needs the room for the Guardian's persistent presence and the
 * in-universe Hero HUD landing inside it.
 *
 * V6: `return` became `hall`. The old scene was choreographed as a
 * curtain call — camera pulling back, energy collapsing to a point, light
 * dying, frame fading out — which was the single loudest source of the
 * "the intro is over, now the site starts" feeling every other phase had
 * been fighting. Inverted into an arrival: camera moves in, energy
 * organizes into the volume of a room, light establishes and holds.
 *
 * V5.1 Fase E: `nucleus`'s overlap into `portal-corridor` rose from 0.05
 * to 0.12 — that boundary is where the visual language actually changes
 * (procedural core → real footage), so it was the most abrupt cut in the
 * whole journey; the other footage-to-footage handoffs stay at their
 * small safety blend since there's no real mismatch to hide there.
 */
export const SCENE_DURATIONS: SceneDurationConfig[] = [
  { id: 'nucleus', distance: 750, overlap: 0.12 },
  // Absorbed the old discrete `guardian` scene's distance (825px) — the
  // Guardian's "awakening" belongs to a persistent layer over global
  // progress during this stretch, not to a separate scene mount.
  { id: 'portal-corridor', distance: 2250, overlap: 0.05 },
  { id: 'holo-hall', distance: 750, overlap: 0.12 },
  // The destination, and deliberately the LONGEST region of the journey:
  // this is where the user arrives and stays, so it gets the most room.
  // No overlap after it — the pin releases only once they've been inside
  // it a good while, so there is no moment where "the intro ends".
  { id: 'hall', distance: 2000 },
];
