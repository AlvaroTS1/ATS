import type { SceneFactory } from './types';

/**
 * Every scene the experience can play, registered by id. Adding a future
 * scene means adding one line here (plus one entry in `timeline.config.ts`)
 * — nothing else in the engine changes.
 *
 * `nucleus`/`portal-corridor`/`holo-hall` are frame-sequence scenes (real
 * cinematic footage) — cheap to register, no Three.js involved. `hall`
 * pulls in Three.js, so it's dynamically imported: that's what keeps the
 * ~500KB library out of the app's main, eagerly-parsed bundle. The
 * Guardian (`shared/Sede.ts`) is not a scene here — see
 * `timeline.config.ts`.
 */
export const SCENE_REGISTRY: Record<string, SceneFactory> = {
  nucleus: () => import('./scenes/nucleus/NucleusScene').then((m) => m.createNucleusScene()),
  'portal-corridor': () =>
    import('./scenes/portalcorridor/PortalCorridorScene').then((m) => m.createPortalCorridorScene()),
  'holo-hall': () => import('./scenes/holohall/HoloHallScene').then((m) => m.createHoloHallScene()),
  hall: () => import('./scenes/hall/HallScene').then((m) => m.createHallScene()),
};
