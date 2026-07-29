import { easeInOutCubic } from './easing';

/**
 * Hand-authored pose curves over GLOBAL journey progress — the pattern
 * persistent layers use instead of belonging to a Timeline range
 * (`GuardianPresence`, `HoloWall`). Kept generic and zero-allocation:
 * writes into a caller-owned `out` object, same discipline as every
 * Animator in `scenes/`.
 */
export type Keyframe<T> = T & { t: number };

/**
 * Samples `frames` at `progress`, easing between the surrounding pair.
 * `frames` must be sorted by `t`. Values outside the range clamp to the
 * first/last frame.
 */
export function sampleKeyframes<T extends Record<string, number>>(
  frames: ReadonlyArray<Keyframe<T>>,
  progress: number,
  out: T,
): void {
  const t = Math.min(1, Math.max(0, progress));
  const keys = Object.keys(out) as Array<keyof T>;

  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i];
    const b = frames[i + 1];
    if (t >= a.t && t <= b.t) {
      const span = b.t - a.t;
      const eased = easeInOutCubic(span === 0 ? 0 : (t - a.t) / span);
      for (const key of keys) {
        out[key] = (a[key] + (b[key] - a[key]) * eased) as T[keyof T];
      }
      return;
    }
  }

  const edge = t <= frames[0].t ? frames[0] : frames[frames.length - 1];
  for (const key of keys) out[key] = edge[key];
}
