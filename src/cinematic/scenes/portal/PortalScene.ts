import type { Scene } from '../../types';
import { createFrameSequenceScene } from '../../shared/createFrameSequenceScene';
import { PORTAL_FRAME_COUNT, getPortalFramePath } from './portal.assets';

/** "Travessia pelo Portal": the camera flies through the aperture into a crystalline corridor. */
export function createPortalScene(): Scene {
  return createFrameSequenceScene({
    id: 'portal',
    frameCount: PORTAL_FRAME_COUNT,
    getFramePath: getPortalFramePath,
  });
}
