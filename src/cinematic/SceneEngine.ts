import type { Scene, SceneAssets, SceneFactory } from './types';
import { Timeline } from './Timeline';
import { cinematicEvents } from './EventBus';

/**
 * Orchestrates scenes without ever knowing what's inside one. Per tick it
 * only: asks the Timeline which scene(s) are active at the current
 * progress, and calls `update()`/`render()` on exactly those. Mounting,
 * preloading and disposing are simple pass-throughs — the engine invokes
 * the lifecycle, it never inspects what a scene does with it. Each scene
 * owns its own `AssetManager` internally, since assets are never shared
 * across scenes.
 */
export class SceneEngine {
  private activeIds = new Set<string>();

  private constructor(
    private readonly timeline: Timeline,
    private readonly scenes: Map<string, Scene>,
    private readonly sceneAssets: Record<string, SceneAssets>,
  ) {}

  /**
   * Resolves every scene factory (in parallel) before the engine exists —
   * keeps async scene construction (e.g. Genesis's dynamic `import()` of
   * Three.js) from ever blocking synchronous host-component work like
   * sizing the pin wrapper (`Timeline.getTotalDistance()` doesn't need any
   * of this and is queried independently, before scenes are ready).
   */
  static async create(
    registry: Record<string, SceneFactory>,
    sceneAssets: Record<string, SceneAssets>,
    timeline: Timeline,
  ): Promise<SceneEngine> {
    const entries = await Promise.all(
      Object.entries(registry).map(async ([id, factory]) => [id, await factory()] as const),
    );
    return new SceneEngine(timeline, new Map(entries), sceneAssets);
  }

  getTotalDistance(): number {
    return this.timeline.getTotalDistance();
  }

  /** Mounts every scene onto its own canvas. Canvases are supplied by the host component. */
  mountAll(canvases: Record<string, HTMLCanvasElement>): void {
    for (const [id, scene] of this.scenes) {
      const canvas = canvases[id];
      if (canvas) scene.mount(canvas);
    }
  }

  resizeAll(cssWidth: number, cssHeight: number): void {
    for (const scene of this.scenes.values()) scene.resize(cssWidth, cssHeight);
  }

  /** Kicks off preloading for every registered scene, ordered by declared priority. */
  async preloadAll(): Promise<void> {
    const ordered = Object.values(this.sceneAssets).sort(
      (a, b) => a.preloadPriority - b.preloadPriority,
    );
    for (const assets of ordered) {
      const scene = this.scenes.get(assets.id);
      if (scene) await scene.preload(assets);
    }
  }

  /** Advances the experience to a given global scroll progress (0-1). */
  tick(globalProgress: number): void {
    const active = this.timeline.resolve(globalProgress);
    const nextActiveIds = new Set(active.map((entry) => entry.id));

    for (const id of nextActiveIds) {
      if (!this.activeIds.has(id)) cinematicEvents.emit('scene:enter', { id });
    }
    for (const id of this.activeIds) {
      if (!nextActiveIds.has(id)) cinematicEvents.emit('scene:complete', { id });
    }
    this.activeIds = nextActiveIds;

    for (const entry of active) {
      const scene = this.scenes.get(entry.id);
      if (!scene) continue;
      scene.update(entry.localProgress);
      scene.render(entry.opacity);
    }

    if (globalProgress >= 1) cinematicEvents.emit('experience:complete', undefined);
  }

  unmountAll(): void {
    for (const scene of this.scenes.values()) scene.unmount();
  }
}
