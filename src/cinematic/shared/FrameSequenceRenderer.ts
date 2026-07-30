import { computeFrameFit } from './frameFit';

/** Width of the low-res surface the ambient bed is built on. */
const BED_WIDTH = 160;
/**
 * How far the feather reaches inward from the footage's edge, as a
 * fraction of the footage's own width. Wide enough that the eye can't find
 * where it starts; narrow enough that the sharp centre of the shot — the
 * part with the architecture in it — is untouched.
 */
const FEATHER_FRACTION = 0.16;

/**
 * Draws a single already-decoded frame onto a 2D canvas, modulated by
 * `opacity` for scene cross-fades. Shared by every video-based scene.
 *
 * Placement comes from `computeFrameFit` — see there for why the fit mode
 * is chosen by comparing aspects, and for what `contain` costs.
 *
 * On the `contain` path (vertical footage in a wide viewport) this does
 * NOT simply leave bare canvas beside the shot. A 9:16 plate centred in a
 * 16:9 frame with hard vertical edges IS a visible video rectangle, and no
 * amount of grain or shared lighting elsewhere can talk the eye out of an
 * edge it can point at. So:
 *
 *   1. An ambient BED is built from the same frame, scaled to cover the
 *      whole canvas, darkened and desaturated. The bars stop being bare
 *      canvas and become an out-of-focus continuation of the room.
 *   2. That bed is masked so it is opaque out at the edges and fully
 *      transparent across the middle, with a soft ramp between. Drawn OVER
 *      the sharp plate, it dissolves the plate's own vertical edges into
 *      the continuation instead of butting against it.
 *
 * This is the standard compositing answer to portrait footage on a wide
 * screen, and it is cheap here because the bed is built on a 160px-wide
 * surface and then upscaled: the upscale supplies the blur for free, and
 * smoothing the small mask's ramp for free with it. One small draw plus
 * one full-size blit per frame, no per-pixel work, no CSS filter on a
 * full-resolution surface.
 */
export class FrameSequenceRenderer {
  private canvas: HTMLCanvasElement | null = null;
  /** Low-res surface the ambient bed is composed on. Null until first needed. */
  private bed: HTMLCanvasElement | null = null;

  mount(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  resize(cssWidth: number, cssHeight: number): void {
    const canvas = this.canvas;
    if (!canvas || cssWidth === 0 || cssHeight === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelW = Math.round(cssWidth * dpr);
    const pixelH = Math.round(cssHeight * dpr);
    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
    }
  }

  draw(image: HTMLImageElement | null, opacity: number): void {
    const canvas = this.canvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (cssW === 0 || cssH === 0) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    if (!image || !image.complete || image.naturalWidth === 0) return;

    ctx.globalAlpha = Math.min(1, Math.max(0, opacity));

    const fit = computeFrameFit(image.naturalWidth, image.naturalHeight, cssW, cssH);
    ctx.drawImage(image, fit.x, fit.y, fit.width, fit.height);

    if (fit.mode === 'contain' && fit.barWidth > 1) {
      this.drawAmbientBed(ctx, image, cssW, cssH, fit.x, fit.width);
    }

    ctx.globalAlpha = 1;
  }

  /**
   * The out-of-focus continuation that fills the bars and eats the plate's
   * vertical edges. Composed at `BED_WIDTH` and upscaled, which is what
   * makes it nearly free.
   */
  private drawAmbientBed(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    cssW: number,
    cssH: number,
    plateX: number,
    plateWidth: number,
  ): void {
    const bedH = Math.max(1, Math.round((BED_WIDTH * cssH) / cssW));
    let bed = this.bed;
    if (!bed) {
      bed = document.createElement('canvas');
      this.bed = bed;
    }
    if (bed.width !== BED_WIDTH || bed.height !== bedH) {
      bed.width = BED_WIDTH;
      bed.height = bedH;
    }
    const bctx = bed.getContext('2d');
    if (!bctx) return;

    bctx.setTransform(1, 0, 0, 1, 0, 0);
    bctx.globalCompositeOperation = 'source-over';
    bctx.clearRect(0, 0, BED_WIDTH, bedH);

    // Same frame, scaled to COVER this surface — the continuation of the
    // room rather than a second copy of the shot: dimmed and desaturated so
    // it reads as light spill, never as content competing for attention.
    const coverScale = Math.max(BED_WIDTH / image.naturalWidth, bedH / image.naturalHeight);
    const cw = image.naturalWidth * coverScale;
    const ch = image.naturalHeight * coverScale;
    bctx.filter = 'brightness(0.42) saturate(0.55)';
    bctx.drawImage(image, (BED_WIDTH - cw) / 2, (bedH - ch) / 2, cw, ch);
    bctx.filter = 'none';

    // Punch the middle out: opaque in the bars, transparent across the
    // sharp plate, ramping over the feather band just inside the plate's
    // edges. `destination-in` keeps only what the gradient's alpha allows.
    const feather = plateWidth * FEATHER_FRACTION;
    const toBed = BED_WIDTH / cssW;
    const l0 = plateX * toBed;
    const l1 = (plateX + feather) * toBed;
    const r1 = (plateX + plateWidth - feather) * toBed;
    const r0 = (plateX + plateWidth) * toBed;

    const mask = bctx.createLinearGradient(0, 0, BED_WIDTH, 0);
    mask.addColorStop(0, 'rgba(255,255,255,1)');
    mask.addColorStop(Math.max(0, Math.min(1, l0 / BED_WIDTH)), 'rgba(255,255,255,1)');
    mask.addColorStop(Math.max(0, Math.min(1, l1 / BED_WIDTH)), 'rgba(255,255,255,0)');
    mask.addColorStop(Math.max(0, Math.min(1, r1 / BED_WIDTH)), 'rgba(255,255,255,0)');
    mask.addColorStop(Math.max(0, Math.min(1, r0 / BED_WIDTH)), 'rgba(255,255,255,1)');
    mask.addColorStop(1, 'rgba(255,255,255,1)');

    bctx.globalCompositeOperation = 'destination-in';
    bctx.fillStyle = mask;
    bctx.fillRect(0, 0, BED_WIDTH, bedH);
    bctx.globalCompositeOperation = 'source-over';

    // Upscaling the small surface is what blurs it. Smoothing must be on
    // (it is by default) or this returns as visible 160px-wide blocks.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bed, 0, 0, cssW, cssH);
  }

  unmount(): void {
    this.canvas = null;
    this.bed = null;
  }
}
