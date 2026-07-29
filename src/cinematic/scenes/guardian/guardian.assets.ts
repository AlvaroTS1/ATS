import type { SceneAssets } from '../../types';

export const GUARDIAN_VIDEO_PATH = '/cinematic/guardian/guardian.mp4';

/**
 * `videos` here is documentation only — `AssetManager` doesn't preload
 * video (it's an image-cache primitive), so `GuardianScene.preload()`
 * loads this path itself via `LoopingVideoTexture`.
 */
export const GUARDIAN_ASSETS: SceneAssets = {
  id: 'guardian',
  videos: [GUARDIAN_VIDEO_PATH],
  preloadPriority: 1,
};
