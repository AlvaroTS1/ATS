import type { Scene, SceneAssets } from '../../types';
import { getDeviceTier } from '../../../lib/deviceTier';
import { cinematicEvents } from '../../EventBus';
import { HallRenderer } from './HallRenderer';
import {
  computeRoomShell,
  computeScatteredPositions,
  step,
  type HallBuffers,
  type HallState,
} from './HallAnimator';

const SCATTER_SPREAD = 9;
const ROOM_RADIUS = 4.2;
/** Where the arrival has settled enough for the Hero HUD to be born — still deep inside the pin. */
const HERO_READY_AT = 0.55;

/**
 * "O Salão": the destination, not an ending. Scattered energy organizes
 * into the volume of a room, the camera moves in, the light establishes
 * and holds. This is where the user arrives and stays.
 */
class HallScene implements Scene {
  readonly id = 'hall';

  private readonly renderer = new HallRenderer();
  private buffers: HallBuffers | null = null;
  private heroReadyVisible = false;
  /** Frame-skipping (device tier 'low' only): `step()` mutates up to 500 particle positions per call — the one real per-frame cost here. `render()` still runs every tick, redrawing the last-computed positions, so motion never visibly stutters. */
  private skipFrames = false;
  private frameSkipParity = 0;
  private readonly state: HallState = {
    cameraZ: 9,
    particleOpacity: 0.35,
    ambientGlowOpacity: 0,
  };

  async preload(_assets: SceneAssets): Promise<void> {
    // Procedural — nothing to fetch.
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
      targetPositions: computeRoomShell(particleCount, ROOM_RADIUS),
    };

    this.renderer.mount(canvas, this.buffers.positions, pixelRatioCap);
    this.renderer.resize(canvas.clientWidth, canvas.clientHeight);
  }

  resize(cssWidth: number, cssHeight: number): void {
    this.renderer.resize(cssWidth, cssHeight);
  }

  update(localProgress: number): void {
    if (!this.buffers) return;

    const shouldShowHero = localProgress >= HERO_READY_AT;
    if (shouldShowHero !== this.heroReadyVisible) {
      this.heroReadyVisible = shouldShowHero;
      cinematicEvents.emit('hall:hero-ready', { visible: shouldShowHero });
    }

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
  }
}

export function createHallScene(): Scene {
  return new HallScene();
}
