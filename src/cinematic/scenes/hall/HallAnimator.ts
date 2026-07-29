import { easeInOutCubic } from '../../shared/easing';

export interface HallBuffers {
  /** Live positions, shared by reference with the BufferAttribute — mutated in place. */
  positions: Float32Array;
  /** Immutable origin. Kept separate so `step()` stays a pure function of
   *  progress: scrubbing backwards has to land on exactly the same frame,
   *  which an accumulating frame-to-frame lerp could never guarantee. */
  startPositions: Float32Array;
  /** Immutable destination: a loose shell defining the room's volume. */
  targetPositions: Float32Array;
}

export interface HallState {
  cameraZ: number;
  particleOpacity: number;
  /** The room's own light, establishing as you arrive — never a fade-out. */
  ambientGlowOpacity: number;
}

/**
 * V6: this scene used to be `return` — camera pulling back (6 → 10),
 * particles collapsing to the origin, glow peaking then dying, the whole
 * frame fading to 0.3. Camera retreating + energy withdrawing + lights
 * going out is the grammar of a curtain call, and it was the single
 * loudest source of the "the intro is over, now the site starts" feeling
 * that every other phase had been fighting.
 *
 * Inverted: the camera moves IN, the scattered energy ORGANIZES into the
 * volume of a room, and the light ESTABLISHES and holds. You don't leave
 * — you arrive somewhere and stay.
 */
const CAMERA_START_Z = 9;
const CAMERA_END_Z = 5.5;
/** The room's light is up early — you're arriving somewhere already lit, not switching it on. */
const GLOW_ESTABLISHED_AT = 0.45;

/** Where the particles come FROM: scattered, unresolved — the space before it has shape. */
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
 * Where the particles GO: a hollow shell rather than a point. Collapsing
 * to the origin reads as energy being swallowed; settling into a shell
 * reads as a room acquiring walls — the volume you're arriving inside of.
 */
export function computeRoomShell(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Even-ish spherical distribution, then flattened on Y so it reads as
    // a hall (wide, not tall) instead of a ball.
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * (0.85 + Math.random() * 0.15);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) * 0.45;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  return positions;
}

/**
 * Pure per-frame step: mutates `buffers.positions` in place, moving every
 * particle from its scattered start toward its place in the room's shell.
 * Zero allocations.
 */
export function step(buffers: HallBuffers, progress: number, out: HallState): void {
  const t = Math.min(1, Math.max(0, progress));
  const eased = easeInOutCubic(t);

  const { positions, startPositions, targetPositions } = buffers;
  for (let i = 0; i < positions.length; i++) {
    positions[i] = startPositions[i] + (targetPositions[i] - startPositions[i]) * eased;
  }

  out.cameraZ = CAMERA_START_Z + (CAMERA_END_Z - CAMERA_START_Z) * eased;
  out.particleOpacity = 0.35 + eased * 0.35;
  out.ambientGlowOpacity = Math.min(1, t / GLOW_ESTABLISHED_AT);
}
