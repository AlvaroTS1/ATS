import * as THREE from 'three';

/** Soft radial-glow sprite shared by every Three.js scene's particle system — same brand look everywhere. */
export function createParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(0, 212, 255, 1)');
    grad.addColorStop(0.6, 'rgba(41, 171, 226, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
  }
  return new THREE.CanvasTexture(canvas);
}
