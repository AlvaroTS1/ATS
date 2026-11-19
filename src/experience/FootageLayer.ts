import type { FrameSequence } from './media';
import { frameUrl } from './media';

/**
 * The opening shot — the metallic ATS sphere opening onto its energy core —
 * drawn frame by frame on a 2D canvas, scrubbed by scroll.
 *
 * The frame is always placed so that the footage's own core (`anchor`)
 * lands on the centre of the screen: that is exactly where the 3D core of
 * the Core World sits, so when this layer dissolves the procedural core is
 * already there, in the same place, at the same moment. That alignment is
 * the whole hand-off — no cut.
 *
 * Frames stream in through a small worker pool; until a frame has loaded,
 * the nearest loaded frame is shown — never a blank canvas.
 */
export class FootageLayer {
  private images: (HTMLImageElement | null)[];
  private ctx: CanvasRenderingContext2D | null;
  private cancelled = false;
  private lastKey = '';
  private cssW = 0;
  private cssH = 0;
  private dpr = 1;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly seq: FrameSequence,
    /** Load every Nth frame (2 on weak devices: half the bytes, still smooth under scroll). */
    private readonly step = 1,
  ) {
    this.images = new Array(seq.count).fill(null);
    this.ctx = canvas.getContext('2d');
  }

  /** Streams all frames, first frame first. Resolves when every frame settled. */
  async load(onFirst?: () => void): Promise<void> {
    const order: number[] = [];
    for (let i = 0; i < this.seq.count; i += this.step) order.push(i);
    if (order[order.length - 1] !== this.seq.count - 1) order.push(this.seq.count - 1);
    const loadOne = (i: number) =>
      new Promise<void>((resolve) => {
        if (this.cancelled) return resolve();
        const img = new Image();
        img.decoding = 'async';
        img.src = frameUrl(this.seq, i);
        img.onload = () => {
          this.images[i] = img;
          if (i === 0) onFirst?.();
          this.lastKey = '';
          resolve();
        };
        img.onerror = () => resolve();
      });
    await loadOne(order[0]);
    let cursor = 1;
    const worker = async () => {
      while (!this.cancelled && cursor < order.length) {
        const i = order[cursor++];
        await loadOne(i);
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
  }

  resize(cssW: number, cssH: number): void {
    this.cssW = cssW;
    this.cssH = cssH;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(cssW * this.dpr);
    this.canvas.height = Math.round(cssH * this.dpr);
    this.lastKey = '';
  }

  private nearest(i: number): HTMLImageElement | null {
    for (let d = 0; d < this.seq.count; d++) {
      const a = this.images[i - d];
      if (a) return a;
      const b = this.images[i + d];
      if (b) return b;
    }
    return null;
  }

  /**
   * @param t      0-1 through the footage
   * @param zoom   push-in scale around the anchor (1 = fitted)
   * @param centerX where the anchor sits horizontally (0-1); converges to 0.5 for the hand-off
   */
  draw(t: number, zoom: number, centerX = 0.5): void {
    const ctx = this.ctx;
    if (!ctx || this.cssW === 0) return;
    const index = Math.round(Math.min(1, Math.max(0, t)) * (this.seq.count - 1));
    const key = `${index}|${zoom.toFixed(3)}|${centerX.toFixed(3)}`;
    if (key === this.lastKey) return;
    const img = this.nearest(index);
    if (!img) return;
    this.lastKey = key;

    const { width: iw, height: ih, anchor } = this.seq;
    const W = this.cssW;
    const H = this.cssH;
    // portrait screens: fill; landscape: the full-height "portal" column
    const cover = W / H < 0.8;
    const fit = cover ? Math.max(W / iw, H / ih) : H / ih;
    const s = fit * zoom;
    const dw = iw * s;
    const dh = ih * s;
    const cx = W * centerX;
    const x = cx - anchor[0] * dw;
    const y = H / 2 - anchor[1] * dh;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(img, x, y, dw, dh);

    // feather every edge of the footage into the world behind it
    ctx.globalCompositeOperation = 'destination-in';
    const r = Math.max(dw, dh) * 0.62;
    const g = ctx.createRadialGradient(cx, H / 2, r * 0.35, cx, H / 2, r);
    g.addColorStop(0, 'rgba(0,0,0,1)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    if (!cover) {
      const half = dw / 2;
      const lg = ctx.createLinearGradient(cx - half, 0, cx + half, 0);
      lg.addColorStop(0, 'rgba(0,0,0,0)');
      lg.addColorStop(0.22, 'rgba(0,0,0,1)');
      lg.addColorStop(0.78, 'rgba(0,0,0,1)');
      lg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lg;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  cancel(): void {
    this.cancelled = true;
  }
}
