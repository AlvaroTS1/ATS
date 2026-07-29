import { easeInOutCubic } from '../../shared/easing';

export interface GuardianState {
  cameraZ: number;
  rimLightIntensity: number;
  fogNear: number;
  fogFar: number;
}

const CAMERA_START_Z = 6.2;
const CAMERA_END_Z = 4.6;

/**
 * Pure per-frame step, zero allocations — `out` is created once at mount.
 * The Guardian himself never animates from scroll (his breathing/head turn
 * live entirely in the looping video, on a real clock); this only controls
 * the camera's slow push-in and the fog/rim-light "the world leans toward
 * him as you arrive" feel.
 */
export function step(progress: number, out: GuardianState): void {
  const t = Math.min(1, Math.max(0, progress));
  const eased = easeInOutCubic(t);

  out.cameraZ = CAMERA_START_Z + (CAMERA_END_Z - CAMERA_START_Z) * eased;
  out.rimLightIntensity = 1.4 + eased * 0.8;
  out.fogNear = 3.5 - eased * 0.8;
  out.fogFar = 11 - eased * 1.5;
}
