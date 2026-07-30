import type { Scene } from '../../types';
import { createFrameSequenceScene } from '../../shared/createFrameSequenceScene';
import { cinematicEvents } from '../../EventBus';
import {
  HOLOHALL_FRAME_COUNT,
  getHoloHallFramePath,
  HOLOHALL_PLAY_THROUGH,
  HOLOHALL_HOLD_FRAME,
  HOLOHALL_SECTORS_END,
  resolveSector,
  type SectorState,
} from './holohall.assets';

/**
 * The Hall. The camera arrives in the first 30% of the region and the frame
 * is stationary after that — and the stationary phase is the point: it is
 * where the user WALKS between the holographic installations, one product
 * at a time (`holohall.assets.ts`).
 *
 * Before V8 this region held its shot briefly and showed three product
 * cards abreast, all at once. They read as a row of HTML over a video
 * because that is what they were, and they could never have been anchored
 * to the footage's own consoles: three panels needed 508px of separation
 * and the footage offers 149px. One installation at a time is what made the
 * arithmetic possible; the walk is what makes them read as devices that
 * belong to the place.
 *
 * This scene only reports. Where the consoles sit and how they wake is pure
 * data and a pure function, kept next to the frames they describe.
 */
export function createHoloHallScene(): Scene {
  const sector: SectorState = { productId: null, wake: 0, anchorX: 0.5, anchorY: 0.5 };
  let lastProductId: string | null = null;
  let lastWakeStep = -1;
  let sectorsComplete = false;

  return createFrameSequenceScene({
    id: 'holo-hall',
    frameCount: HOLOHALL_FRAME_COUNT,
    getFramePath: getHoloHallFramePath,
    playThrough: HOLOHALL_PLAY_THROUGH,
    holdFrame: HOLOHALL_HOLD_FRAME,
    onProgress: (localProgress) => {
      resolveSector(localProgress, sector);

      // Emitted on real change only. `wake` is continuous, so it is
      // quantised to 100 steps before comparing — otherwise this fires
      // every scroll frame and every listener re-renders for a difference
      // nobody can see.
      const wakeStep = Math.round(sector.wake * 100);
      if (sector.productId !== lastProductId || wakeStep !== lastWakeStep) {
        lastProductId = sector.productId;
        lastWakeStep = wakeStep;
        cinematicEvents.emit('holo-hall:sector', {
          productId: sector.productId,
          wake: sector.wake,
          anchorX: sector.anchorX,
          anchorY: sector.anchorY,
        });
      }

      // The Guardian's cue, derived from the last installation's own window
      // so it cannot drift from the walk the way a hardcoded global
      // progress did.
      const done = localProgress >= HOLOHALL_SECTORS_END;
      if (done !== sectorsComplete) {
        sectorsComplete = done;
        cinematicEvents.emit('holo-hall:sectors-complete', { done });
      }
    },
  });
}
