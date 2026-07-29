import type { Scene } from '../../types';
import { createFrameSequenceScene } from '../../shared/createFrameSequenceScene';
import { PORTAL_CORRIDOR_FRAME_COUNT, getPortalCorridorFramePath } from './portalcorridor.assets';

/**
 * "Travessia": a single unbroken shot — the portal ring opens onto the
 * crystalline ecosystem landscape, the camera descends into the corridor
 * and moves down it toward the light. Replaces the earlier two-clip
 * `portal` + `ecosystem-entry` pair (V2) with one commissioned take, so
 * there's no seam between them to blend across.
 */
export function createPortalCorridorScene(): Scene {
  return createFrameSequenceScene({
    id: 'portal-corridor',
    frameCount: PORTAL_CORRIDOR_FRAME_COUNT,
    getFramePath: getPortalCorridorFramePath,
  });
}
