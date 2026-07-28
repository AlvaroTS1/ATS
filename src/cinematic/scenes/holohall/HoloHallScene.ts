import type { Scene } from '../../types';
import { createFrameSequenceScene } from '../../shared/createFrameSequenceScene';
import { cinematicEvents } from '../../EventBus';
import {
  HOLOHALL_FRAME_COUNT,
  getHoloHallFramePath,
  HOLOHALL_FREEZE_AT,
  HOLOHALL_PANELS_HIDE_AT,
} from './holohall.assets';

/**
 * "Ambiente Holográfico Principal": the camera arrives at the grand hall
 * and holds — this is where the real, clickable React product panels
 * (rendered by the host, see `components/cinematic-overlays/`) take over.
 */
export function createHoloHallScene(): Scene {
  let panelsVisible = false;

  return createFrameSequenceScene({
    id: 'holo-hall',
    frameCount: HOLOHALL_FRAME_COUNT,
    getFramePath: getHoloHallFramePath,
    freezeAt: HOLOHALL_FREEZE_AT,
    onProgress: (localProgress) => {
      const shouldShow =
        localProgress >= HOLOHALL_FREEZE_AT && localProgress < HOLOHALL_PANELS_HIDE_AT;
      if (shouldShow !== panelsVisible) {
        panelsVisible = shouldShow;
        cinematicEvents.emit('holo-hall:panels', { visible: shouldShow });
      }
    },
  });
}
