import { getProduct } from '../../../data/products';
import { hexStringToInt } from '../../shared/colorLerp';
import { easeInOutCubic } from '../../shared/easing';

export interface FusionAiState {
  orbAX: number;
  orbBX: number;
  orbScale: number;
  fusionGlowOpacity: number;
  labelOpacity: number;
  cameraZ: number;
}

const fusionAi = getProduct('fusion-ai')!;
export const ORB_A_COLOR = hexStringToInt(fusionAi.accent.from);
export const ORB_B_COLOR = hexStringToInt(fusionAi.accent.to);

const START_OFFSET = 2.6;
const CAMERA_START_Z = 7;
const CAMERA_END_Z = 5.5;
/** "Em breve" only reveals once the two forms have visibly merged. */
const LABEL_REVEAL_START = 0.72;

/**
 * Pure per-frame step — zero allocations, `out` is created once at mount
 * and mutated every frame. Two abstract forms converge and merge; no
 * literal product imagery, matching the storyboard's "sem mostrar
 * detalhes técnicos, apenas transmitir inovação".
 */
export function step(progress: number, out: FusionAiState): void {
  const t = Math.min(1, Math.max(0, progress));
  const eased = easeInOutCubic(t);

  out.orbAX = -START_OFFSET * (1 - eased);
  out.orbBX = START_OFFSET * (1 - eased);
  out.orbScale = 1 + eased * 0.4;
  out.fusionGlowOpacity = Math.max(0, eased - 0.4) / 0.6;
  out.cameraZ = CAMERA_START_Z + (CAMERA_END_Z - CAMERA_START_Z) * eased;
  out.labelOpacity =
    t < LABEL_REVEAL_START ? 0 : Math.min(1, (t - LABEL_REVEAL_START) / (1 - LABEL_REVEAL_START));
}
