const SAMPLE_SIZE = 12;

let sampleCanvas: HTMLCanvasElement | null = null;

export interface AmbientSample {
  /** Average perceptual brightness, 0-1. */
  brightness: number;
  /** Average color of the frame, 0-255 per channel — the shot's temperature. */
  r: number;
  g: number;
  b: number;
}

/**
 * Average brightness AND average color of a decoded frame, downsampled to a
 * tiny 12x12 canvas first so this stays cheap enough to run once per frame
 * change (not per rAF tick) — see `createFrameSequenceScene`'s
 * `'cinematic:ambient-light'` emit.
 *
 * V7-E added the color. Brightness alone made the coupling a DIMMER: the
 * interface got darker in dark shots and brighter in bright ones, but it
 * was always lit by the same imaginary white lamp, while the footage
 * around it was cyan, or amber, or blue. Sharing the light's TEMPERATURE
 * is most of what "shot in the same room" actually means — a compositor
 * matches color before anything else, because the eye forgives a
 * brightness mismatch far more readily than a color one.
 *
 * Writes into a caller-owned object so the per-frame path allocates
 * nothing, matching the discipline every animator here follows.
 */
export function sampleAmbient(
  image: HTMLImageElement | HTMLVideoElement,
  out: AmbientSample,
): void {
  if (!sampleCanvas) sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = SAMPLE_SIZE;
  sampleCanvas.height = SAMPLE_SIZE;
  const ctx = sampleCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    out.brightness = 0.5;
    out.r = 255;
    out.g = 255;
    out.b = 255;
    return;
  }

  ctx.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

  let luma = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  const pixelCount = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    sumR += data[i];
    sumG += data[i + 1];
    sumB += data[i + 2];
    luma += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  }

  out.brightness = luma / pixelCount / 255;
  out.r = sumR / pixelCount;
  out.g = sumG / pixelCount;
  out.b = sumB / pixelCount;
}
