import type { SceneFactory } from './types';

/**
 * Every scene the experience can play, registered by id. Adding a future
 * scene means adding one line here (plus one entry in `timeline.config.ts`)
 * — nothing else in the engine changes.
 *
 * `nucleus`/`portal`/`ecosystem-entry`/`holo-hall` are frame-sequence
 * scenes (real cinematic footage) — cheap to register, no Three.js
 * involved. `fusion-ai` and `return` are the only scenes that pull in
 * Three.js, so they're the only ones dynamically imported: that's what
 * keeps the ~500KB library out of the app's main, eagerly-parsed bundle.
 */
export const SCENE_REGISTRY: Record<string, SceneFactory> = {
  nucleus: () => import('./scenes/nucleus/NucleusScene').then((m) => m.createNucleusScene()),
  portal: () => import('./scenes/portal/PortalScene').then((m) => m.createPortalScene()),
  'ecosystem-entry': () =>
    import('./scenes/ecosystementry/EcosystemEntryScene').then((m) => m.createEcosystemEntryScene()),
  'holo-hall': () => import('./scenes/holohall/HoloHallScene').then((m) => m.createHoloHallScene()),
  'fusion-ai': () =>
    import('./scenes/fusionai/FusionAiScene').then((m) => m.createFusionAiScene()),
  return: () => import('./scenes/return/ReturnScene').then((m) => m.createReturnScene()),
};
