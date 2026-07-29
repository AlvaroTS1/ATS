import * as THREE from 'three';
import { LoopingVideoTexture } from './LoopingVideoTexture';
import { sampleKeyframes, type Keyframe } from './keyframes';

const VIDEO_PATH = '/cinematic/guardian/guardian.mp4';

interface GuardianPose extends Record<string, number> {
  opacity: number;
  scale: number;
  x: number;
  y: number;
}

/**
 * Hand-authored curve over GLOBAL pin progress (0-1 of the whole journey,
 * not one scene's `localProgress`) — the Guardian doesn't belong to a
 * scene, he belongs to the universe. `x`/`y` are Three.js scene units;
 * `scale` multiplies the plane's base size.
 *
 * V6-D: the old curve ended at opacity 0.18 / scale 0.3, pushed off to a
 * corner — he shrank and faded away at the exact moment the user arrived.
 * That is the same departure grammar removed from the `return` scene, and
 * it contradicts what he is: the host of this place. Now he arrives,
 * establishes, and STAYS.
 *
 * Final composition is vertical and identical on every screen: the
 * Guardian occupies the upper frame, the Hero HUD sits below him, the
 * wall (`HoloWall`) is behind them both. Vertical stacking is the only
 * arrangement that survives a 375px-wide phone, and mobile is the
 * baseline here — so desktop simply gets the same shot, wider.
 */
const POSE_CURVE: ReadonlyArray<Keyframe<GuardianPose>> = [
  { t: 0.0, opacity: 0, scale: 0.82, x: 0, y: 0 },
  { t: 0.12, opacity: 0, scale: 0.82, x: 0, y: 0 },
  // The core pulses and he wakes with it — full presence, centred.
  { t: 0.3, opacity: 1, scale: 1, x: 0, y: 0 },
  // Travelling the corridor: he steps back and accompanies, never absent.
  { t: 0.6, opacity: 0.3, scale: 0.42, x: 1.05, y: -0.7 },
  // Arrival at the Hall: he returns to the frame and settles.
  { t: 0.85, opacity: 0.62, scale: 0.7, x: 0, y: 0.3 },
  // And stays. Lifted into the upper frame so the HUD has the lower third,
  // scaled so the top edge stops short of the frame border (see the
  // frustum note below) — present, not looming.
  { t: 1.0, opacity: 0.72, scale: 0.58, x: 0, y: 0.62 },
];

/**
 * The Guardian as a persistent inhabitant of the universe, not a scene he
 * enters and leaves. Mounted once alongside `AmbientLayer`, driven by the
 * pin's global scroll progress instead of any single scene's timeline
 * range. Deliberately restrained (V5.1 art direction: contention over
 * spectacle) — no bloom, no particle system of his own; just the plane,
 * a soft rim light and fog. `AmbientLayer`, already layered above every
 * scene, carries the ambient particle texture — duplicating it here would
 * be clutter, not presence.
 */
export class GuardianPresence {
  private canvas: HTMLCanvasElement | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private videoSource: LoopingVideoTexture | null = null;
  private planeGeometry: THREE.PlaneGeometry | null = null;
  private planeMaterial: THREE.MeshBasicMaterial | null = null;
  private plane: THREE.Mesh | null = null;
  private rimLight: THREE.PointLight | null = null;
  private fog: THREE.Fog | null = null;
  private rafId: number | null = null;
  private startTime = 0;
  /**
   * Written by `setProgress`, read by the rAF loop. Not smoothed here: the
   * host already eases global progress (`lib/scrollEasing.ts`, V6-A), and
   * a second lerp on top of it would give the Guardian alone an extra lag
   * the rest of the world doesn't have — which reads as him dragging
   * behind the shot, not as weight.
   */
  private progress = 0;
  private readonly pose: GuardianPose = { opacity: 0, scale: 0.82, x: 0, y: 0 };
  private onVisibilityChange = (): void => {
    if (document.hidden) this.stopLoop();
    else this.startLoop();
  };

  async mount(canvas: HTMLCanvasElement, pixelRatioCap: number): Promise<void> {
    this.canvas = canvas;
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;

    this.scene = new THREE.Scene();
    this.fog = new THREE.Fog(0x030712, 3, 12);
    this.scene.fog = this.fog;

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 6);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
    this.renderer.setSize(width, height, false);

    this.rimLight = new THREE.PointLight(0x29abe2, 0.9, 14, 2);
    this.rimLight.position.set(1.3, 0.5, 2);
    this.scene.add(this.rimLight);
    this.scene.add(new THREE.AmbientLight(0x0a1622, 0.5));

    this.videoSource = new LoopingVideoTexture();
    const texture = await this.videoSource.load(VIDEO_PATH);
    if (!this.scene) return; // unmounted while the video was loading

    this.planeGeometry = new THREE.PlaneGeometry(2.6, 2.6 * (1280 / 720));
    this.planeMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0 });
    this.plane = new THREE.Mesh(this.planeGeometry, this.planeMaterial);
    this.scene.add(this.plane);

    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.startLoop();
  }

  resize(cssWidth: number, cssHeight: number): void {
    if (!this.camera || !this.renderer || cssWidth === 0 || cssHeight === 0) return;
    this.camera.aspect = cssWidth / cssHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(cssWidth, cssHeight, false);
  }

  /** Called on every scroll tick with the pin's global progress (0-1), already eased by the host. */
  setProgress(progress: number): void {
    this.progress = progress;
  }

  private startLoop(): void {
    if (this.rafId !== null || document.hidden) return;
    this.startTime = performance.now();
    const tick = (now: number) => {
      this.draw((now - this.startTime) / 1000);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  private draw(_timeSeconds: number): void {
    if (!this.renderer || !this.scene || !this.camera) return;

    const pose = this.pose;
    sampleKeyframes(POSE_CURVE, this.progress, pose);

    if (this.plane) {
      this.plane.position.set(pose.x, pose.y, 0);
      this.plane.scale.setScalar(pose.scale);
    }
    if (this.planeMaterial) this.planeMaterial.opacity = pose.opacity;
    if (this.fog) {
      this.fog.near = 2.6 + (1 - pose.scale) * 1.4;
      this.fog.far = 10 - (1 - pose.scale) * 2;
    }
    if (this.rimLight) this.rimLight.intensity = 0.55 + pose.opacity * 0.55;

    this.renderer.render(this.scene, this.camera);
  }

  unmount(): void {
    this.stopLoop();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);

    this.planeGeometry?.dispose();
    this.planeMaterial?.dispose();
    this.videoSource?.dispose();
    this.renderer?.forceContextLoss();
    this.renderer?.dispose();

    this.canvas = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.videoSource = null;
    this.planeGeometry = null;
    this.planeMaterial = null;
    this.plane = null;
    this.rimLight = null;
    this.fog = null;
  }
}
