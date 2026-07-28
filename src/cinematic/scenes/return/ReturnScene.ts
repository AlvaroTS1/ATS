import type { Scene, SceneAssets } from '../../types';
import { getDeviceTier } from '../../../lib/deviceTier';
import { ReturnRenderer } from './ReturnRenderer';
import { computeScatteredPositions, step, type ReturnBuffers, type ReturnState } from './ReturnAnimator';

const SCATTER_SPREAD = 8;

/** "Retorno": every particle collapses back into the Núcleo as the camera pulls away and the light dims. */
class ReturnScene implements Scene {
  readonly id = 'return';

  private readonly renderer = new ReturnRenderer();
  private buffers: ReturnBuffers | null = null;
  private readonly state: ReturnState = {
    cameraZ: 6,
    particleOpacity: 0.6,
    coreGlowOpacity: 0,
    sceneFadeOpacity: 1,
  };

  async preload(_assets: SceneAssets): Promise<void> {
    // Procedural — nothing to fetch.
  }

  mount(canvas: HTMLCanvasElement): void {
    const tier = getDeviceTier();
    const particleCount = tier === 'high' ? 500 : 200;
    const pixelRatioCap = tier === 'high' ? 2 : 1.5;

    const startPositions = computeScatteredPositions(particleCount, SCATTER_SPREAD);
    this.buffers = {
      positions: Float32Array.from(startPositions),
      startPositions,
    };

    this.renderer.mount(canvas, this.buffers.positions, pixelRatioCap);
    this.renderer.resize(canvas.clientWidth, canvas.clientHeight);
  }

  resize(cssWidth: number, cssHeight: number): void {
    this.renderer.resize(cssWidth, cssHeight);
  }

  update(localProgress: number): void {
    if (!this.buffers) return;
    step(this.buffers, localProgress, this.state);
  }

  render(opacity: number): void {
    this.renderer.render(this.state, opacity);
  }

  unmount(): void {
    this.renderer.unmount();
    this.buffers = null;
  }
}

export function createReturnScene(): Scene {
  return new ReturnScene();
}
