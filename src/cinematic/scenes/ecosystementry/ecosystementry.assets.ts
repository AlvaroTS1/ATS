import type { SceneAssets } from '../../types';

export const ECOSYSTEM_ENTRY_FRAME_COUNT = 120;

export function getEcosystemEntryFramePath(index: number): string {
  const n = Math.min(ECOSYSTEM_ENTRY_FRAME_COUNT, Math.max(1, index + 1));
  return `/cinematic/ecosystem-entry/frame-${String(n).padStart(3, '0')}.webp`;
}

export const ECOSYSTEM_ENTRY_ASSETS: SceneAssets = {
  id: 'ecosystem-entry',
  frames: Array.from({ length: ECOSYSTEM_ENTRY_FRAME_COUNT }, (_, i) => getEcosystemEntryFramePath(i)),
  preloadPriority: 2,
};
