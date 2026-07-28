/**
 * Pure frame-selection math shared by every video-based scene (originally
 * built for the Núcleo reveal, now generalized for the whole 4-part
 * cinematic journey). Maps local progress (0-1) to a frame index, falling
 * back to the nearest already-loaded frame at or before the target so the
 * canvas never flashes blank while the rest of the sequence streams in.
 *
 * `freezeAt` lets a scene hold its last shot once the camera has
 * "arrived" (e.g. Holo Hall freezes at 75% so interactive React panels
 * have a stable backdrop instead of the shot still scrubbing underneath
 * them) — everything past that point keeps reporting the frozen frame.
 */
export function pickFrameIndex(
  localProgress: number,
  frameCount: number,
  isLoaded: (index: number) => boolean,
  freezeAt = 1,
): number {
  const clamped = Math.min(freezeAt, Math.max(0, localProgress));
  const target = Math.min(frameCount - 1, Math.round(clamped * (frameCount - 1)));

  let i = target;
  while (i >= 0 && !isLoaded(i)) i--;
  if (i >= 0) return i;

  for (let j = target + 1; j < frameCount; j++) {
    if (isLoaded(j)) return j;
  }
  return -1;
}
