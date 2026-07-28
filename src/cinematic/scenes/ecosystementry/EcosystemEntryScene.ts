import type { Scene } from '../../types';
import { createFrameSequenceScene } from '../../shared/createFrameSequenceScene';
import { ECOSYSTEM_ENTRY_FRAME_COUNT, getEcosystemEntryFramePath } from './ecosystementry.assets';

/** "Entrada no Ecossistema": the corridor opens into the grand hall, first holo-panels appear in the distance. */
export function createEcosystemEntryScene(): Scene {
  return createFrameSequenceScene({
    id: 'ecosystem-entry',
    frameCount: ECOSYSTEM_ENTRY_FRAME_COUNT,
    getFramePath: getEcosystemEntryFramePath,
  });
}
