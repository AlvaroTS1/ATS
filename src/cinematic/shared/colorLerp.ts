/** Linear-interpolates two 0xRRGGBB integers — used to blend brand accent colors continuously. */
export function lerpColor(colorA: number, colorB: number, t: number): number {
  const ar = (colorA >> 16) & 0xff;
  const ag = (colorA >> 8) & 0xff;
  const ab = colorA & 0xff;
  const br = (colorB >> 16) & 0xff;
  const bg = (colorB >> 8) & 0xff;
  const bb = colorB & 0xff;

  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | b;
}

/** Parses a "#RRGGBB" string (as stored in `data/products.ts`) into a 0xRRGGBB integer. */
export function hexStringToInt(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

/** Parses a "#RRGGBB" string into an `[r, g, b]` triplet — for canvas `rgba()` strings. */
export function hexStringToRgb(hex: string): [number, number, number] {
  return intToRgb(hexStringToInt(hex));
}

/** Splits a 0xRRGGBB integer into an `[r, g, b]` triplet — for canvas `rgba()` strings. */
export function intToRgb(color: number): [number, number, number] {
  return [(color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff];
}
