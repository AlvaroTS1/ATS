import type { SceneAssets } from '../../types';

/** Fusion AI is fully procedural (two abstract forms + shader math) — nothing to fetch. */
export const FUSIONAI_ASSETS: SceneAssets = {
  id: 'fusion-ai',
  preloadPriority: 4,
};
