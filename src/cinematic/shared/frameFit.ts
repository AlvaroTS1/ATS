export interface FrameFit {
  /** Uniform scale applied to the source image. */
  scale: number;
  /** Rendered size, CSS px. */
  width: number;
  height: number;
  /** Top-left of the rendered image within the canvas, CSS px. May be negative when cropping. */
  x: number;
  y: number;
  /**
   * `contain` means the image does NOT fill the canvas — there is bare
   * canvas beside it, and therefore a hard edge to deal with.
   */
  mode: 'cover' | 'contain';
  /** Empty canvas on each side, CSS px. Non-zero only in `contain`. */
  barWidth: number;
  barHeight: number;
}

/**
 * How a source frame is laid into the canvas.
 *
 * Fit mode compares the image's aspect against the canvas's, rather than
 * assuming either. Same side of square (both portrait, or both landscape)
 * → `cover`, full bleed with a minor crop. Opposite sides — our vertical
 * 9:16 footage inside a wide desktop viewport — → `contain`, because cover
 * would zoom until only a sliver of the frame's height survived.
 *
 * Extracted from `FrameSequenceRenderer` so the number of places that know
 * this math stays at one. Anything that needs to know WHERE something in
 * the footage lands on screen has to agree with the renderer exactly, and
 * a second copy of these four lines would drift the first time either was
 * touched.
 *
 * The V8 audit measured what `contain` actually costs: on 1920x1080 the
 * footage renders 608x1080 and fills 32% of the frame, leaving 656px of
 * bare canvas on each side with a hard vertical edge. That edge is the
 * "I can see the video rectangle" tell, and it is invisible on mobile —
 * phones and tablets are portrait, so they take the `cover` branch and
 * fill 122-133%. A mobile-first process could never have caught it.
 */
export function computeFrameFit(
  imageWidth: number,
  imageHeight: number,
  cssWidth: number,
  cssHeight: number,
): FrameFit {
  const canvasAspect = cssWidth / cssHeight;
  const imageAspect = imageWidth / imageHeight;
  const sameOrientation = canvasAspect >= 1 === imageAspect >= 1;
  const scale = sameOrientation
    ? Math.max(cssWidth / imageWidth, cssHeight / imageHeight)
    : Math.min(cssWidth / imageWidth, cssHeight / imageHeight);

  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return {
    scale,
    width,
    height,
    x: (cssWidth - width) / 2,
    y: (cssHeight - height) / 2,
    mode: sameOrientation ? 'cover' : 'contain',
    barWidth: Math.max(0, (cssWidth - width) / 2),
    barHeight: Math.max(0, (cssHeight - height) / 2),
  };
}
