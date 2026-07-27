export type PinPosition = 'absolute' | 'fixed';

export interface PinState {
  position: PinPosition;
  /** CSS `top` value in pixels, relative to the pinned element's own containing block. */
  top: number;
  /** Scrub progress in the [0, 1] range. */
  progress: number;
}

/**
 * Pure pin/unpin state machine — the same technique GSAP ScrollTrigger's
 * `pin: true` uses internally (toggle fixed <-> absolute inside a
 * height-reserving wrapper), computed from live layout measurements so it
 * needs no extra library and has no CSS `position: sticky` containment
 * pitfalls (sticky breaks under ancestors with a non-visible `overflow`).
 *
 * @param rectTop    wrapper.getBoundingClientRect().top (viewport-relative)
 * @param rectBottom wrapper.getBoundingClientRect().bottom (viewport-relative)
 * @param rectHeight wrapper.getBoundingClientRect().height
 * @param viewportH  window.innerHeight (or visualViewport.height)
 */
export function computePinState(
  rectTop: number,
  rectBottom: number,
  rectHeight: number,
  viewportH: number,
): PinState {
  if (rectTop > 0) {
    // Not reached yet (or elastic overscroll): sits at the top of its own
    // reserved space, in normal flow order.
    return { position: 'absolute', top: 0, progress: 0 };
  }

  if (rectBottom > viewportH) {
    // Inside the dedicated scroll range: pinned to the viewport.
    const pinRange = rectHeight - viewportH;
    const progress = pinRange > 0 ? Math.min(1, Math.max(0, -rectTop / pinRange)) : 1;
    return { position: 'fixed', top: 0, progress };
  }

  // Past the end: unpinned for good, parked flush with the wrapper's own
  // bottom edge so the next section picks up with zero gap or overlap.
  return { position: 'absolute', top: rectHeight - viewportH, progress: 1 };
}
