import type { SceneAssets } from './types';
import { NUCLEUS_ASSETS } from './scenes/nucleus/nucleus.assets';
import { PORTAL_ASSETS } from './scenes/portal/portal.assets';
import { ECOSYSTEM_ENTRY_ASSETS } from './scenes/ecosystementry/ecosystementry.assets';
import { HOLOHALL_ASSETS } from './scenes/holohall/holohall.assets';
import { FUSIONAI_ASSETS } from './scenes/fusionai/fusionai.assets';
import { RETURN_ASSETS } from './scenes/return/return.assets';

/** One manifest per registered scene — the AssetManager never sees a raw path outside these. */
export const SCENE_ASSETS: Record<string, SceneAssets> = {
  nucleus: NUCLEUS_ASSETS,
  portal: PORTAL_ASSETS,
  'ecosystem-entry': ECOSYSTEM_ENTRY_ASSETS,
  'holo-hall': HOLOHALL_ASSETS,
  'fusion-ai': FUSIONAI_ASSETS,
  return: RETURN_ASSETS,
};
