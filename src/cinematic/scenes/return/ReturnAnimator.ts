import { easeInOutCubic } from '../../shared/easing';

export interface ReturnBuffers {
  /** Live positions, shared by reference with the BufferAttribute — mutated in place. */
  positions: Float32Array;
  startPositions: Float32Array;
}

export interface ReturnState {
  cameraZ: number;
  particleOpacity: number;
  coreGlowOpacity: number;
  /** Extra internal dim near the very end — settles the scene to a calm ember before the Hero takes over. */
  sceneFadeOpacity: number;
}

const CAMERA_START_Z = 6;
const CAMERA_END_Z = 10;
/** Fraction of local progress where the core glow peaks before dimming ("luz diminui"). */
const GLOW_PEAK = 0.55;
/** The last stretch settles to a calm ember instead of a hard cut, for a natural Hero handoff. */
const FINAL_FADE_START = 0.85;

/** One-time random scatter the particles converge back FROM — computed once at mount. */
export function computeScatteredPositions(count: number, spread: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
  }
  return positions;
}

/**
 * Pure per-frame step: mutates `buffers.positions` in place, collapsing
 * every particle from its scattered start toward the origin as progress
 * advances — "toda a energia retorna ao Núcleo". Zero allocations.
 */
export function step(buffers: ReturnBuffers, progress: number, out: ReturnState): void {
  const t = Math.min(1, Math.max(0, progress));
  const eased = easeInOutCubic(t);

  const { positions, startPositions } = buffers;
  for (let i = 0; i < positions.length; i++) {
    positions[i] = startPositions[i] * (1 - eased);
  }

  out.cameraZ = CAMERA_START_Z + (CAMERA_END_Z - CAMERA_START_Z) * eased;
  out.particleOpacity = 1 - eased * 0.3;

  out.coreGlowOpacity =
    t < GLOW_PEAK ? t / GLOW_PEAK : Math.max(0.15, 1 - ((t - GLOW_PEAK) / (1 - GLOW_PEAK)) * 0.85);

  out.sceneFadeOpacity =
    t < FINAL_FADE_START ? 1 : 1 - ((t - FINAL_FADE_START) / (1 - FINAL_FADE_START)) * 0.7;
}
