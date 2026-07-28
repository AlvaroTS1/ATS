import type { SceneAssets } from '../../types';

export const PORTAL_FRAME_COUNT = 120;

export function getPortalFramePath(index: number): string {
  const n = Math.min(PORTAL_FRAME_COUNT, Math.max(1, index + 1));
  return `/cinematic/portal/frame-${String(n).padStart(3, '0')}.webp`;
}

export const PORTAL_ASSETS: SceneAssets = {
  id: 'portal',
  frames: Array.from({ length: PORTAL_FRAME_COUNT }, (_, i) => getPortalFramePath(i)),
  preloadPriority: 1,
};
