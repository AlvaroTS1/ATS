import React, { useEffect, useState } from 'react';

const TILE = 128;

/**
 * Balanced grain: each pixel is either slightly lighter or slightly darker
 * than nothing, never uniformly white. Plain white noise on normal
 * blending lifts the blacks and turns dark footage milky — the exact
 * opposite of the contrast this art direction wants. Emitting both
 * polarities lets grain darken and lighten like real film, without
 * needing `mix-blend-mode: overlay` (which forces an extra compositing
 * pass and costs real frames on weak mobile GPUs).
 */
function createGrainTile(): string {
  const canvas = document.createElement('canvas');
  canvas.width = TILE;
  canvas.height = TILE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const image = ctx.createImageData(TILE, TILE);
  const { data } = image;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 2 - 1; // -1..1
    const light = v > 0;
    const alpha = Math.abs(v) * 255;
    data[i] = light ? 255 : 0;
    data[i + 1] = light ? 255 : 0;
    data[i + 2] = light ? 255 : 0;
    data[i + 3] = alpha;
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * The single cheapest, highest-impact fix for "video behind, HTML in
 * front".
 *
 * DOM text is subpixel-antialiased, perfectly stable and razor sharp; the
 * footage is compressed WebP with noise and encoding artefacts. That
 * mismatch in *texture* is what the eye reads as "overlay", long before
 * anyone consciously notices a layer. Film compositors solve it the same
 * way every time: put the same grain over the plate AND over the element,
 * so both share one surface. This sits at the top of the pinned stack —
 * above the footage, above the HUD, above everything — for exactly that
 * reason.
 *
 * Zero per-frame JavaScript: the tile is generated once, then a CSS
 * animation shuffles `background-position` between eight offsets. Static
 * grain reads as dirt on the screen; shifting grain reads as sensor
 * noise, and the GPU does all of it.
 */
const FilmGrain: React.FC = () => {
  const [tile, setTile] = useState<string>('');

  useEffect(() => {
    // Generated after mount, never during render — it touches the DOM and
    // costs ~16k pixels once.
    setTile(createGrainTile());
  }, []);

  if (!tile) return null;

  return (
    <div
      aria-hidden="true"
      // FIXED and document-wide, not confined to the pin.
      //
      // Inside the pin the grain stopped dead at the pin's bottom edge, so
      // the footage was grained and the page below it was clean — a texture
      // seam on exactly the line where the cinematic hands over, which is
      // the last place that can afford one. The whole argument for grain
      // (V7-B) is that one surface covering two things stops the eye
      // separating them; that argument does not end at the pin.
      //
      // Above the flash layer on purpose: the released light gets grained
      // too, so even the white is part of the same surface.
      className="pointer-events-none fixed inset-0 z-[70] animate-film-grain"
      style={{
        backgroundImage: `url(${tile})`,
        backgroundRepeat: 'repeat',
        opacity: 0.05,
      }}
    />
  );
};

export default FilmGrain;
