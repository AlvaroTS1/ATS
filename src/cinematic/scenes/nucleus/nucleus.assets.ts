import type { SceneAssets } from '../../types';

export const NUCLEUS_FRAME_COUNT = 120;

export function getNucleusFramePath(index: number): string {
  const n = Math.min(NUCLEUS_FRAME_COUNT, Math.max(1, index + 1));
  return `/cinematic/nucleus/frame-${String(n).padStart(3, '0')}.webp`;
}

export const NUCLEUS_ASSETS: SceneAssets = {
  id: 'nucleus',
  frames: Array.from({ length: NUCLEUS_FRAME_COUNT }, (_, i) => getNucleusFramePath(i)),
  preloadPriority: 0,
};
