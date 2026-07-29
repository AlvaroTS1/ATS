import type { SceneAssets } from '../../types';

export const HOLOHALL_FRAME_COUNT = 120;

export function getHoloHallFramePath(index: number): string {
  const n = Math.min(HOLOHALL_FRAME_COUNT, Math.max(1, index + 1));
  return `/cinematic/holo-hall/frame-${String(n).padStart(3, '0')}.webp`;
}

export const HOLOHALL_ASSETS: SceneAssets = {
  id: 'holo-hall',
  frames: Array.from({ length: HOLOHALL_FRAME_COUNT }, (_, i) => getHoloHallFramePath(i)),
  preloadPriority: 4,
};

/**
 * Fraction of this scene's own local progress where the camera has
 * "arrived" and holds — the shot freezes here so the real React product
 * panels (rendered on top by the host) have a stable backdrop to emerge
 * into and be interacted with, instead of the footage still scrubbing
 * underneath them.
 */
export const HOLOHALL_FREEZE_AT = 0.72;

/**
 * Fraction of local progress where the panels begin dissolving back into
 * energy — must finish BEFORE the Timeline's own cross-fade into Fusion AI
 * begins (that starts at `1 - overlap` = 1 - 0.12 = 0.88, see
 * `timeline.config.ts`), with a small safety margin, so the interactive
 * panels are never visible while the next scene is blending in underneath
 * them.
 */
export const HOLOHALL_PANELS_HIDE_AT = 0.85;
