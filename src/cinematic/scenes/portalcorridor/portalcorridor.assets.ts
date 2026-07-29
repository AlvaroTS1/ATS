import type { SceneAssets } from '../../types';

export const PORTAL_CORRIDOR_FRAME_COUNT = 140;

export function getPortalCorridorFramePath(index: number): string {
  const n = Math.min(PORTAL_CORRIDOR_FRAME_COUNT, Math.max(1, index + 1));
  return `/cinematic/portal-corridor/frame-${String(n).padStart(3, '0')}.webp`;
}

export const PORTAL_CORRIDOR_ASSETS: SceneAssets = {
  id: 'portal-corridor',
  frames: Array.from({ length: PORTAL_CORRIDOR_FRAME_COUNT }, (_, i) => getPortalCorridorFramePath(i)),
  preloadPriority: 2,
};
