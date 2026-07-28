import type { Scene } from '../../types';
import { createFrameSequenceScene } from '../../shared/createFrameSequenceScene';
import { NUCLEUS_FRAME_COUNT, getNucleusFramePath } from './nucleus.assets';

/** "Formação do Núcleo ATS": the orb forms, its plates open, revealing the energy core. */
export function createNucleusScene(): Scene {
  return createFrameSequenceScene({
    id: 'nucleus',
    frameCount: NUCLEUS_FRAME_COUNT,
    getFramePath: getNucleusFramePath,
  });
}
