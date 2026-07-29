import type * as THREE from 'three';
import type { Scene, SceneAssets } from '../../types';
import { getDeviceTier } from '../../../lib/deviceTier';
import { GUARDIAN_VIDEO_PATH } from '../guardian/guardian.assets';
import { ReturnRenderer } from './ReturnRenderer';
import { computeScatteredPositions, step, type ReturnBuffers, type ReturnState } from './ReturnAnimator';

const SCATTER_SPREAD = 8;

/**
 * "Retorno": every particle collapses back into the Núcleo as the camera
 * pulls away and the light dims — and the Guardian reprises, distant and
 * dim, the bookend to his earlier awakening.
 */
class ReturnScene implements Scene {
  readonly id = 'return';

  private readonly renderer = new ReturnRenderer();
  private buffers: ReturnBuffers | null = null;
  private guardianTexture: THREE.VideoTexture | null = null;
  /** Frame-skipping (device tier 'low' only): this scene's `step()` mutates up to 500 particle positions per call — the one real per-frame cost among the procedural scenes. `render()` still runs every tick, just redrawing the last-computed positions, so motion never visibly stutters. */
  private skipFrames = false;
  private frameSkipParity = 0;
  private readonly state: ReturnState = {
    cameraZ: 6,
    particleOpacity: 0.6,
    coreGlowOpacity: 0,
    sceneFadeOpacity: 1,
    guardianOpacity: 0,
  };

  async preload(_assets: SceneAssets): Promise<void> {
    this.guardianTexture = await this.renderer.loadGuardianVideo(GUARDIAN_VIDEO_PATH);
  }

  mount(canvas: HTMLCanvasElement): void {
    const tier = getDeviceTier();
    const particleCount = tier === 'high' ? 500 : 200;
    const pixelRatioCap = tier === 'high' ? 2 : 1.5;
    this.skipFrames = tier === 'low';

    const startPositions = computeScatteredPositions(particleCount, SCATTER_SPREAD);
    this.buffers = {
      positions: Float32Array.from(startPositions),
      startPositions,
    };

    this.renderer.mount(canvas, this.buffers.positions, pixelRatioCap, this.guardianTexture);
    this.renderer.resize(canvas.clientWidth, canvas.clientHeight);
  }

  resize(cssWidth: number, cssHeight: number): void {
    this.renderer.resize(cssWidth, cssHeight);
  }

  update(localProgress: number): void {
    if (!this.buffers) return;
    if (this.skipFrames) {
      this.frameSkipParity = (this.frameSkipParity + 1) % 2;
      if (this.frameSkipParity !== 0) return;
    }
    step(this.buffers, localProgress, this.state);
  }

  render(opacity: number): void {
    this.renderer.render(this.state, opacity);
  }

  unmount(): void {
    this.renderer.unmount();
    this.buffers = null;
    this.guardianTexture = null;
  }
}

export function createReturnScene(): Scene {
  return new ReturnScene();
}
