import type { Scene, SceneAssets } from '../types';
import { AssetManager } from '../AssetManager';
import { FrameSequenceRenderer } from './FrameSequenceRenderer';
import { pickFrameIndex } from './FrameSequenceAnimator';

export interface FrameSequenceSceneConfig {
  id: string;
  frameCount: number;
  getFramePath: (index: number) => string;
  /** Frames loaded eagerly (in parallel) before background streaming begins. */
  eagerFrameCount?: number;
  /** Hold the shot at this local-progress fraction (0-1) instead of playing to the very end. */
  freezeAt?: number;
  /** Fires on every `update()` with the raw local progress — lets a scene react to its own timing (e.g. Holo Hall revealing its React panels) without a bespoke Scene subclass. */
  onProgress?: (localProgress: number) => void;
}

/**
 * Generic frame-sequence scene: any video-based scene (Núcleo, Portal,
 * Ecosystem Entry, Holo Hall — originally built once for the Núcleo
 * reveal) is just this factory plus a small assets manifest. Animator
 * (frame selection) and Renderer (drawing) stay shared and battle-tested
 * in one place instead of copy-pasted per scene.
 */
export function createFrameSequenceScene(config: FrameSequenceSceneConfig): Scene {
  const assetManager = new AssetManager();
  const renderer = new FrameSequenceRenderer();
  const frames: string[] = Array.from({ length: config.frameCount }, (_, i) => config.getFramePath(i));
  let currentIndex = -1;

  const doRender = (opacity: number): void => {
    const url = currentIndex >= 0 ? frames[currentIndex] : null;
    renderer.draw(url ? assetManager.get(url) : null, opacity);
  };

  return {
    id: config.id,

    async preload(assets: SceneAssets): Promise<void> {
      await assetManager.preload(assets, {
        eagerCount: config.eagerFrameCount ?? Math.min(20, config.frameCount),
        onEachLoaded: (url) => {
          const index = frames.indexOf(url);
          if (index === currentIndex) doRender(1);
        },
      });
    },

    mount(canvas: HTMLCanvasElement): void {
      renderer.mount(canvas);
      renderer.resize(canvas.clientWidth, canvas.clientHeight);
    },

    resize(cssWidth: number, cssHeight: number): void {
      renderer.resize(cssWidth, cssHeight);
    },

    update(localProgress: number): void {
      currentIndex = pickFrameIndex(
        localProgress,
        frames.length,
        (i) => assetManager.isLoaded(frames[i]),
        config.freezeAt ?? 1,
      );
      config.onProgress?.(localProgress);
    },

    render: doRender,

    unmount(): void {
      assetManager.cancel();
      renderer.unmount();
    },
  };
}
