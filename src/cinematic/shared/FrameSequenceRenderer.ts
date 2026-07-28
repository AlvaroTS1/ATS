/**
 * Draws a single already-decoded frame onto a 2D canvas, modulated by
 * `opacity` for scene cross-fades. Shared by every video-based scene.
 *
 * Fit mode compares the *image's* aspect ratio against the *canvas's* —
 * not a hardcoded assumption about either. When both are on the same side
 * of square (both portrait, or both landscape/square) the shapes roughly
 * agree, so "cover" reads as full-bleed and immersive with only a minor
 * crop. When they're on opposite sides — our vertical 9:16 footage inside
 * a wide desktop viewport, for instance — "cover" would zoom in until only
 * a thin sliver of the frame's height survives, so we "contain" instead:
 * the footage sits centered like a vertical portal, letterboxed left and
 * right by the scene's own ambient dressing (grid, glow, particles)
 * instead of hard black bars.
 */
export class FrameSequenceRenderer {
  private canvas: HTMLCanvasElement | null = null;

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

    const canvasAspect = cssW / cssH;
    const imageAspect = image.naturalWidth / image.naturalHeight;
    const sameOrientation = (canvasAspect >= 1) === (imageAspect >= 1);
    const useCover = sameOrientation;
    const scale = useCover
      ? Math.max(cssW / image.naturalWidth, cssH / image.naturalHeight)
      : Math.min(cssW / image.naturalWidth, cssH / image.naturalHeight);

    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    ctx.drawImage(image, (cssW - w) / 2, (cssH - h) / 2, w, h);
    ctx.globalAlpha = 1;
  }

  unmount(): void {
    this.canvas = null;
  }
}
