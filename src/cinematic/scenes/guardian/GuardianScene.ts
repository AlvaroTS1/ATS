import type * as THREE from 'three';
import type { Scene, SceneAssets } from '../../types';
import { getDeviceTier } from '../../../lib/deviceTier';
import { GuardianRenderer, PARTICLE_COUNT_HIGH, PARTICLE_COUNT_LOW } from './GuardianRenderer';
import { step, type GuardianState } from './GuardianAnimator';
import { GUARDIAN_VIDEO_PATH } from './guardian.assets';

/**
 * "The Guardian awakens with the core." Unlike every other scene, this one
 * keeps its own `requestAnimationFrame` loop running independent of scroll
 * (same principle as `AmbientLayer`) — because the Golden Rule of V4 is
 * that nothing goes still when the user stops scrolling, and the Guardian
 * is the one element that must never read as a paused video. `update()`/
 * `render()` (driven by `SceneEngine.tick()`) only cache the latest
 * scroll-derived state; the actual redraw happens on this scene's own
 * clock, at whatever state was last cached.
 */
class GuardianScene implements Scene {
  readonly id = 'guardian';

  private readonly renderer = new GuardianRenderer();
  private readonly state: GuardianState = {
    cameraZ: 6.2,
    rimLightIntensity: 1.4,
    fogNear: 3.5,
    fogFar: 11,
  };
  private videoTexture: THREE.VideoTexture | null = null;
  private crossfadeOpacity = 0;
  private rafId: number | null = null;
  private startTime = 0;
  private onVisibilityChange = (): void => {
    if (document.hidden) this.stopLoop();
    else this.startLoop();
  };

  async preload(_assets: SceneAssets): Promise<void> {
    this.videoTexture = await this.renderer.loadVideo(GUARDIAN_VIDEO_PATH);
  }

  mount(canvas: HTMLCanvasElement): void {
    if (!this.videoTexture) return;
    const tier = getDeviceTier();
    const pixelRatioCap = tier === 'high' ? 2 : 1.5;
    const particleCount = tier === 'high' ? PARTICLE_COUNT_HIGH : PARTICLE_COUNT_LOW;
    const enableBloom = tier === 'high';
    this.renderer.mount(canvas, this.videoTexture, pixelRatioCap, particleCount, enableBloom);
    this.renderer.resize(canvas.clientWidth, canvas.clientHeight);
    this.startTime = performance.now();
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.startLoop();
  }

  resize(cssWidth: number, cssHeight: number): void {
    this.renderer.resize(cssWidth, cssHeight);
  }

  update(localProgress: number): void {
    step(localProgress, this.state);
  }

  render(opacity: number): void {
    this.crossfadeOpacity = opacity;
    // The rAF loop below draws every frame regardless — this just updates
    // what it draws with. Video decode/playback pauses automatically once
    // opacity settles at 0 for a while (see startLoop/stopLoop gating).
    if (opacity <= 0) this.renderer.pauseVideo();
    else this.renderer.resumeVideo();
  }

  private startLoop(): void {
    if (this.rafId !== null || document.hidden) return;
    const tick = (now: number) => {
      this.renderer.render(this.state, this.crossfadeOpacity, (now - this.startTime) / 1000);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  unmount(): void {
    this.stopLoop();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.renderer.unmount();
    this.videoTexture = null;
  }
}

export function createGuardianScene(): Scene {
  return new GuardianScene();
}
