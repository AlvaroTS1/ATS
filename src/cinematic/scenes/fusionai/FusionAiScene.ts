import type { Scene, SceneAssets } from '../../types';
import { getDeviceTier } from '../../../lib/deviceTier';
import { FusionAiRenderer } from './FusionAiRenderer';
import { step, type FusionAiState } from './FusionAiAnimator';

/** "Fusion AI": two abstract forms approach and merge, revealing "Em breve". */
class FusionAiScene implements Scene {
  readonly id = 'fusion-ai';

  private readonly renderer = new FusionAiRenderer();
  private readonly state: FusionAiState = {
    orbAX: -2.6,
    orbBX: 2.6,
    orbScale: 1,
    fusionGlowOpacity: 0,
    labelOpacity: 0,
    cameraZ: 7,
  };

  async preload(_assets: SceneAssets): Promise<void> {
    // Procedural — nothing to fetch.
  }

  mount(canvas: HTMLCanvasElement): void {
    const tier = getDeviceTier();
    const pixelRatioCap = tier === 'high' ? 2 : 1.5;
    this.renderer.mount(canvas, pixelRatioCap);
    this.renderer.resize(canvas.clientWidth, canvas.clientHeight);
  }

  resize(cssWidth: number, cssHeight: number): void {
    this.renderer.resize(cssWidth, cssHeight);
  }

  update(localProgress: number): void {
    step(localProgress, this.state);
  }

  render(opacity: number): void {
    this.renderer.render(this.state, opacity);
  }

  unmount(): void {
    this.renderer.unmount();
  }
}

export function createFusionAiScene(): Scene {
  return new FusionAiScene();
}
