/**
 * The one easing curve every cinematic scene uses for progress-driven
 * motion (camera dollies, rotations, color/opacity blends) — see
 * `ART_DIRECTION.md`. A single shared function keeps every scene's motion
 * feeling like the same hand drew it, and stops the curve from drifting
 * between copy-pasted local implementations.
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
