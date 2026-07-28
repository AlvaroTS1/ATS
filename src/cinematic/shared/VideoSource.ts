/**
 * Reusable primitive for the "vídeo otimizado sincronizado ao scroll" scene
 * strategy — the third rendering approach alongside procedural Three.js
 * (Genesis, Ecosystem) and pre-extracted frame sequences (Core).
 *
 * Deliberately separate from `AssetManager`: images benefit from an eager +
 * background preload cache of many small files, while video benefits from
 * the browser's own progressive buffering and range-request seeking via a
 * single `<video>` element. Forcing both into one abstraction would weaken
 * whichever one didn't fit.
 *
 * A scene using this owns one `VideoSource`, drives it from `update()`
 * (`seekTo`) and `render()` (`getFrame()` + `ctx.drawImage`) — same
 * "draw whatever's ready, never block on network" resilience CoreAnimator
 * already applies to frame sequences, just backed by video decoding
 * instead of an image array.
 */
export class VideoSource {
  private video: HTMLVideoElement | null = null;
  private ready = false;
  private lastSeekTime = -1;

  /** Creates an offscreen `<video>` and resolves once its duration is known. */
  async load(url: string): Promise<void> {
    const video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    this.video = video;

    await new Promise<void>((resolve) => {
      video.addEventListener(
        'loadedmetadata',
        () => {
          this.ready = true;
          resolve();
        },
        { once: true },
      );
      video.addEventListener('error', () => resolve(), { once: true });
    });
  }

  /** Seeks to `progress` (0-1) of the video's duration. No-ops for sub-frame deltas. */
  seekTo(progress: number): void {
    if (!this.video || !this.ready || !this.video.duration) return;
    const target = Math.min(this.video.duration, Math.max(0, progress * this.video.duration));
    if (Math.abs(target - this.lastSeekTime) < 1 / 60) return;
    this.lastSeekTime = target;
    this.video.currentTime = target;
  }

  /** The currently decoded frame, or null if nothing is ready to draw yet. */
  getFrame(): HTMLVideoElement | null {
    if (!this.video || !this.ready || this.video.readyState < 2) return null;
    return this.video;
  }

  dispose(): void {
    if (this.video) {
      this.video.pause();
      this.video.removeAttribute('src');
      this.video.load();
    }
    this.video = null;
    this.ready = false;
  }
}
