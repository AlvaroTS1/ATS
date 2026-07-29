import type { SceneAssets } from './types';
import { NUCLEUS_ASSETS } from './scenes/nucleus/nucleus.assets';
import { GUARDIAN_ASSETS } from './scenes/guardian/guardian.assets';
import { PORTAL_CORRIDOR_ASSETS } from './scenes/portalcorridor/portalcorridor.assets';
import { HOLOHALL_ASSETS } from './scenes/holohall/holohall.assets';
import { FUSIONAI_ASSETS } from './scenes/fusionai/fusionai.assets';
import { RETURN_ASSETS } from './scenes/return/return.assets';

/** One manifest per registered scene — the AssetManager never sees a raw path outside these. */
export const SCENE_ASSETS: Record<string, SceneAssets> = {
  nucleus: NUCLEUS_ASSETS,
  guardian: GUARDIAN_ASSETS,
  'portal-corridor': PORTAL_CORRIDOR_ASSETS,
  'holo-hall': HOLOHALL_ASSETS,
  'fusion-ai': FUSIONAI_ASSETS,
  return: RETURN_ASSETS,
};
