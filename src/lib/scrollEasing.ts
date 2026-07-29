/**
 * V6: scroll sets a TARGET; the world eases toward it. Without this the
 * camera is bolted 1:1 to the scrollbar — mechanically exact and
 * completely weightless, which is what reads as "watching a page scroll"
 * instead of "moving through a place".
 *
 * Pure like `pinScrollMath.ts` and for the same reason: this is the part
 * that can subtly ruin the whole experience (lag, desync from the finger,
 * slow-motion crawl after an anchor jump), so it has to be testable
 * without a browser.
 */

/** Small enough that scrubbing still feels attached to the finger, large enough to read as mass. */
export const PROGRESS_EASE = 0.14;
/** Settled — stop the loop so an idle tab costs nothing. */
export const PROGRESS_EPSILON = 0.0002;
/**
 * A jump this big isn't scrolling — it's an anchor link, a reload
 * mid-page, or a scrollbar drag. Easing across it would crawl through the
 * whole journey in slow motion, so snap instead.
 */
export const PROGRESS_SNAP_THRESHOLD = 0.25;

export interface EasedProgress {
  /** What the world should render this frame. */
  value: number;
  /** False once it has converged — the caller stops its rAF loop. */
  keepEasing: boolean;
}

/**
 * One easing step from `current` toward `target`. Snaps outright on large
 * jumps, and reports settled (`keepEasing: false`) once within epsilon so
 * the caller can stop animating instead of spinning forever.
 */
export function stepProgress(current: number, target: number): EasedProgress {
  const delta = target - current;

  if (Math.abs(delta) > PROGRESS_SNAP_THRESHOLD) {
    return { value: target, keepEasing: false };
  }
  if (Math.abs(delta) < PROGRESS_EPSILON) {
    return { value: target, keepEasing: false };
  }
  return { value: current + delta * PROGRESS_EASE, keepEasing: true };
}
