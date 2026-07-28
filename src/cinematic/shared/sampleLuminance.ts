const SAMPLE_SIZE = 12;

let sampleCanvas: HTMLCanvasElement | null = null;

/**
 * Average perceptual brightness (0-1) of a decoded frame, downsampled to a
 * tiny 12x12 canvas first so this stays cheap enough to run once per frame
 * change (not per rAF tick) — see `createFrameSequenceScene`'s
 * `'cinematic:ambient-light'` emit.
 */
export function sampleLuminance(image: HTMLImageElement): number {
  if (!sampleCanvas) sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = SAMPLE_SIZE;
  sampleCanvas.height = SAMPLE_SIZE;
  const ctx = sampleCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return 0.5;

  ctx.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);

  let sum = 0;
  const pixelCount = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  }
  return sum / pixelCount / 255;
}
