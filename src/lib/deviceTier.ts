export type DeviceTier = 'high' | 'low';

/**
 * Cheap, one-shot heuristic (not a real GPU benchmark) shared by every scene
 * that needs to scale particle counts, texture resolution or effect
 * intensity for weaker devices — computed once and reused, never
 * re-implemented per scene.
 */
export function getDeviceTier(): DeviceTier {
  if (typeof window === 'undefined') return 'high';

  const isNarrowViewport = window.innerWidth < 768;
  const isCoarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const lowConcurrency = (navigator.hardwareConcurrency ?? 8) <= 4;
  const lowMemory = (navigator as { deviceMemory?: number }).deviceMemory !== undefined
    ? (navigator as { deviceMemory?: number }).deviceMemory! <= 4
    : false;

  const weakSignals = [isNarrowViewport, isCoarsePointer, lowConcurrency, lowMemory].filter(
    Boolean,
  ).length;

  return weakSignals >= 2 ? 'low' : 'high';
}
