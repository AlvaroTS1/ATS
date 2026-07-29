import * as THREE from 'three';

/**
 * A hidden `<video>` looping on its own real-time clock, exposed as a
 * `THREE.VideoTexture` a scene can map onto a plane. Deliberately NOT
 * `VideoSource.ts` (that primitive drives `currentTime` from scroll
 * progress, for a future scroll-scrubbed scene) — the Guardian must stay
 * alive independent of scroll, same principle as `AmbientLayer`'s
 * real-clock breathing, just backed by native video playback instead of
 * canvas drawing.
 */
export class LoopingVideoTexture {
  private video: HTMLVideoElement | null = null;
  private texture: THREE.VideoTexture | null = null;

  /** Creates the hidden video, starts its native loop, and resolves once a texture is safe to sample. */
  async load(url: string): Promise<THREE.VideoTexture> {
    const video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    this.video = video;

    await new Promise<void>((resolve) => {
      video.addEventListener('loadeddata', () => resolve(), { once: true });
      video.addEventListener('error', () => resolve(), { once: true });
    });
    await video.play().catch(() => {
      // Autoplay can be blocked before any user gesture — the texture still
      // mounts (first frame or blank), and playback resumes once resume()
      // is called from a gesture-adjacent path (scene enters view on scroll).
    });

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    this.texture = texture;
    return texture;
  }

  /** Pauses decoding — call when the scene scrolls out of view for a while (device tier / visibility gating). */
  pause(): void {
    this.video?.pause();
  }

  resume(): void {
    this.video?.play().catch(() => {});
  }

  dispose(): void {
    this.texture?.dispose();
    if (this.video) {
      this.video.pause();
      this.video.removeAttribute('src');
      this.video.load();
    }
    this.video = null;
    this.texture = null;
  }
}
