import type { ActiveSceneEntry, SceneDurationConfig } from './types';

interface ResolvedRange {
  id: string;
  /** Fraction of the TOTAL pin distance where this scene starts/ends. */
  start: number;
  end: number;
  /** Fraction of the total distance spent cross-fading out into the next scene. */
  overlap: number;
}

/**
 * Pure, config-driven scroll timeline. Converts a list of per-scene
 * px-durations (with optional shared overlap) into 0-1 fraction ranges once,
 * then resolves which scene(s) are active — and at what local progress and
 * opacity — for any given global progress. No DOM, no React, no side
 * effects: this is the same "pure function" approach already proven by
 * `lib/pinScrollMath.ts`.
 */
export class Timeline {
  private ranges: ResolvedRange[] = [];
  private totalDistance = 0;

  constructor(config: SceneDurationConfig[]) {
    let cursor = 0;
    const starts: number[] = [];
    const ends: number[] = [];

    for (const entry of config) {
      const overlapPx = (entry.overlap ?? 0) * entry.distance;
      starts.push(cursor);
      ends.push(cursor + entry.distance);
      cursor = cursor + entry.distance - overlapPx;
    }

    this.totalDistance = ends[ends.length - 1] ?? 0;

    this.ranges = config.map((entry, i) => ({
      id: entry.id,
      start: this.totalDistance > 0 ? starts[i] / this.totalDistance : 0,
      end: this.totalDistance > 0 ? ends[i] / this.totalDistance : 0,
      overlap: entry.overlap ?? 0,
    }));
  }

  /** Total scroll distance (px) this timeline needs, before any mobile scaling. */
  getTotalDistance(): number {
    return this.totalDistance;
  }

  /** Resolves every scene active at `globalProgress` (0-1), with local progress + opacity. */
  resolve(globalProgress: number): ActiveSceneEntry[] {
    const p = Math.min(1, Math.max(0, globalProgress));
    const active: ActiveSceneEntry[] = [];

    for (let i = 0; i < this.ranges.length; i++) {
      const range = this.ranges[i];
      if (p < range.start || p > range.end) continue;

      const span = range.end - range.start;
      const localProgress = span > 0 ? (p - range.start) / span : 1;

      const overlapSpan = range.overlap * span;
      const fadeOutStart = range.end - overlapSpan;
      let opacity = 1;
      if (overlapSpan > 0 && p > fadeOutStart) {
        opacity = 1 - (p - fadeOutStart) / overlapSpan;
      }

      active.push({ id: range.id, localProgress, opacity });

      // The next scene's fade-in mirrors this scene's fade-out exactly.
      const next = this.ranges[i + 1];
      if (next && overlapSpan > 0 && p > fadeOutStart) {
        const nextSpan = next.end - next.start;
        const nextLocalProgress = nextSpan > 0 ? (p - next.start) / nextSpan : 0;
        const nextOpacity = (p - fadeOutStart) / overlapSpan;
        active.push({ id: next.id, localProgress: Math.max(0, nextLocalProgress), opacity: nextOpacity });
        i++; // already handled the next range's overlap portion
      }
    }

    return active;
  }
}
