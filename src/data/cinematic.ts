/** Total frames extracted from the cinematic reveal video (10s @ 24fps). */
export const CINEMATIC_FRAME_COUNT = 240;

/** Resolves the static asset path for a given 0-based frame index. */
export function getCinematicFramePath(index: number): string {
  const frameNumber = Math.min(
    CINEMATIC_FRAME_COUNT,
    Math.max(1, index + 1),
  );
  return `/cinematic/frame-${String(frameNumber).padStart(3, '0')}.webp`;
}
