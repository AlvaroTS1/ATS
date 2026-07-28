import type { SceneAssets } from './types';

/**
 * Generic, priority-aware preloader shared by every scene. Scenes never
 * fetch images themselves — they declare a `SceneAssets` manifest and read
 * back through this cache, so asset paths live in exactly one place.
 */
export class AssetManager {
  private cache = new Map<string, HTMLImageElement>();
  private cancelled = false;

  /** Synchronous cache lookup — null if not loaded (yet). */
  get(url: string): HTMLImageElement | null {
    return this.cache.get(url) ?? null;
  }

  isLoaded(url: string): boolean {
    return this.cache.has(url);
  }

  /**
   * Loads `eagerCount` images in parallel first (so the scene has something
   * to render immediately), then streams the rest in sequentially in the
   * background without blocking the caller. `onEachLoaded` lets a scene
   * refresh its current frame if a just-finished image happens to be the
   * one it's currently trying to show.
   */
  async preload(
    assets: SceneAssets,
    options: { eagerCount?: number; onEachLoaded?: (url: string) => void } = {},
  ): Promise<void> {
    const urls = [...(assets.frames ?? []), ...(assets.textures ?? [])];
    if (urls.length === 0) return;
    const eagerCount = options.eagerCount ?? urls.length;

    const loadOne = (url: string, priority: 'high' | 'low') =>
      new Promise<void>((resolve) => {
        if (this.cancelled || this.cache.has(url)) return resolve();
        const img = new Image();
        img.decoding = 'async';
        img.setAttribute('fetchpriority', priority);
        img.src = url;
        img.onload = () => {
          this.cache.set(url, img);
          options.onEachLoaded?.(url);
          resolve();
        };
        img.onerror = () => resolve();
      });

    const eager = urls.slice(0, eagerCount);
    const rest = urls.slice(eagerCount);

    await Promise.all(eager.map((url, i) => loadOne(url, i === 0 ? 'high' : 'low')));
    if (this.cancelled) return;

    for (const url of rest) {
      if (this.cancelled) return;
      await loadOne(url, 'low');
    }
  }

  /** Stops any in-flight background preloading (does not evict the cache). */
  cancel(): void {
    this.cancelled = true;
  }
}
