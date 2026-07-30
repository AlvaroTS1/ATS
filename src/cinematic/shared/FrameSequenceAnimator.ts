/**
 * Pure frame-selection math shared by every video-based scene (originally
 * built for the Núcleo reveal, now generalized for the whole cinematic
 * journey). Maps local progress (0-1) to a frame index, falling back to the
 * nearest already-loaded frame at or before the target so the canvas never
 * flashes blank while the rest of the sequence streams in.
 *
 * `playThrough` is the fraction of the scene's own progress in which the
 * SHOT completes; past it, `holdFrame` is reported forever. Those are two
 * separate knobs on purpose, and they used to be one.
 *
 * Before V8 there was a single `freezeAt`, and the held frame was whatever
 * `round(freezeAt * (frameCount - 1))` happened to be. That tied "how much
 * scroll the travel consumes" to "which frame you end up looking at", so a
 * region could not give its stationary phase more room without also
 * choosing a different frame to be stationary on. Holo Hall needs exactly
 * that: the shot arrives quickly, then holds one specific frame — the one
 * whose holographic consoles are arranged across the space — for a long
 * stretch while the user walks between them.
 */
export function pickFrameIndex(
  localProgress: number,
  frameCount: number,
  isLoaded: (index: number) => boolean,
  playThrough = 1,
  holdFrame?: number,
): number {
  const lastFrame = Math.min(frameCount - 1, Math.max(0, holdFrame ?? frameCount - 1));
  const t = playThrough <= 0 ? 1 : Math.min(1, Math.max(0, localProgress) / playThrough);
  const target = Math.round(t * lastFrame);

  let i = target;
  while (i >= 0 && !isLoaded(i)) i--;
  if (i >= 0) return i;

  for (let j = target + 1; j < frameCount; j++) {
    if (isLoaded(j)) return j;
  }
  return -1;
}
