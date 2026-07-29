/**
 * Soft radial-glow dust sprite, tinted by an `"r, g, b"` triplet — shared by
 * every plain-2D-canvas ambient layer (`AmbientLayer.ts`,
 * `ProductMicroEnvironment.tsx`) so the "drifting dust" look stays
 * consistent everywhere without duplicating the canvas gradient code, and
 * without any of them importing Three.js (they must mount eagerly / in
 * large numbers across the page, so pulling in the ~500KB library here
 * would undo the code-splitting work elsewhere).
 */
export function createMoteSprite(rgb: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, `rgba(${rgb}, 1)`);
    grad.addColorStop(0.6, `rgba(${rgb}, 0.3)`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
  }
  return canvas;
}
