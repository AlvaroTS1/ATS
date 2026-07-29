import * as THREE from 'three';
import { LoopingVideoTexture } from './LoopingVideoTexture';
import { sampleKeyframes, type Keyframe } from './keyframes';

const GUARDIAN_VIDEO = '/cinematic/guardian/guardian.mp4';

/** Arc span, in radians — wide enough to curve around the viewer, not a full ring. */
const SPAN = Math.PI * 0.72;
const WALL_RADIUS = 6;
const WALL_HEIGHT = 5;
const ARC_SEGMENTS = 56;
/** 9:16 source. */
const GUARDIAN_ASPECT = 1280 / 720;
const GUARDIAN_WIDTH = 2.6;

interface SedePose extends Record<string, number> {
  guardianOpacity: number;
  guardianScale: number;
  guardianX: number;
  guardianY: number;
  /** The Guardian's distance from camera. Real depth — the wall can now pass in front of or behind him. */
  guardianZ: number;
  wallOpacity: number;
  wallScale: number;
  wallZ: number;
}

/**
 * ONE space, ONE camera.
 *
 * Before V7 the Guardian and the wall were two independent
 * `WebGLRenderer`s with different focal lengths (fov 40 vs 45), stacked by
 * `z-index`. That made shared perspective, real occlusion and shared light
 * literally impossible, not merely hard — they were two photographs taped
 * together. No amount of grain or CSS perspective fixes a composite that
 * is, structurally, two composites.
 *
 * Merged here: the Guardian is a plane standing INSIDE the architecture,
 * both lit by the same rim light, both inside the same fog, both seen
 * through the same lens. Occlusion is now a fact of the geometry rather
 * than something to fake. One fewer WebGL context, too.
 */
const POSE_CURVE: ReadonlyArray<Keyframe<SedePose>> = [
  // The core still forming: he is absent, the Sede is barely a suggestion
  // on the horizon. If it reads as anything but "something far away", it is
  // too strong — clutter over footage is worse than absence.
  { t: 0.0, guardianOpacity: 0, guardianScale: 0.82, guardianX: 0, guardianY: 0, guardianZ: 0, wallOpacity: 0.0, wallScale: 0.3, wallZ: -15 },
  { t: 0.12, guardianOpacity: 0, guardianScale: 0.82, guardianX: 0, guardianY: 0, guardianZ: 0, wallOpacity: 0.04, wallScale: 0.36, wallZ: -14 },
  // He wakes with the core.
  { t: 0.3, guardianOpacity: 1, guardianScale: 1, guardianX: 0, guardianY: 0, guardianZ: 0, wallOpacity: 0.05, wallScale: 0.42, wallZ: -13 },
  // Travelling the corridor: he steps back and accompanies, never absent;
  // the Sede grows closer.
  { t: 0.6, guardianOpacity: 0.3, guardianScale: 0.42, guardianX: 1.05, guardianY: -0.7, guardianZ: -1.5, wallOpacity: 0.1, wallScale: 0.58, wallZ: -10.5 },
  // Arrival: he returns to frame, the structure resolves around him.
  { t: 0.85, guardianOpacity: 0.62, guardianScale: 0.7, guardianX: 0, guardianY: 0.3, guardianZ: -0.6, wallOpacity: 0.3, wallScale: 0.9, wallZ: -6 },
  // And stays. He sits in the upper frame, in FRONT of the wall in real
  // depth — the lower third is left for the HUD.
  { t: 1.0, guardianOpacity: 0.72, guardianScale: 0.58, guardianX: 0, guardianY: 0.62, guardianZ: 0, wallOpacity: 0.45, wallScale: 1.0, wallZ: -4.5 },
];

/**
 * Horizontal arcs + vertical ribs, merged into ONE `LineSegments` — an
 * architectural elevation, not a 3D primitive. A wireframe cylinder reads
 * as a wireframe cylinder; spaced arcs read as built structure.
 *
 * Everything in a single geometry so the whole wall is one draw call.
 * (WebGL ignores `linewidth`, so these are always 1px — exactly the thin,
 * drafted look wanted here. Not a limitation to "fix".)
 */
function buildWallGeometry(arcCount: number, ribCount: number): THREE.BufferGeometry {
  const points: number[] = [];
  const halfSpan = SPAN / 2;

  for (let a = 0; a < arcCount; a++) {
    const y = WALL_HEIGHT * (a / (arcCount - 1) - 0.5);
    // Arcs bow inward toward the top and bottom edges, so the wall reads as
    // a curved surface rather than stacked identical rings.
    const bow = 1 - Math.abs(y / (WALL_HEIGHT / 2)) * 0.18;
    for (let s = 0; s < ARC_SEGMENTS; s++) {
      const t0 = -halfSpan + (SPAN * s) / ARC_SEGMENTS;
      const t1 = -halfSpan + (SPAN * (s + 1)) / ARC_SEGMENTS;
      points.push(
        Math.sin(t0) * WALL_RADIUS * bow, y, -Math.cos(t0) * WALL_RADIUS * bow,
        Math.sin(t1) * WALL_RADIUS * bow, y, -Math.cos(t1) * WALL_RADIUS * bow,
      );
    }
  }

  for (let r = 0; r < ribCount; r++) {
    const angle = -halfSpan + (SPAN * r) / (ribCount - 1);
    const bowTop = 1 - 0.18;
    const top = WALL_HEIGHT / 2;
    points.push(
      Math.sin(angle) * WALL_RADIUS * bowTop, top, -Math.cos(angle) * WALL_RADIUS * bowTop,
      Math.sin(angle) * WALL_RADIUS * bowTop, -top, -Math.cos(angle) * WALL_RADIUS * bowTop,
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  return geometry;
}

/**
 * The ATS headquarters: the Guardian and the architecture he curates, as a
 * single inhabited space. Not a scene — a scene begins and ends, and the
 * premise is that the Sede always existed and the user was simply far from
 * it. Lives outside the Timeline, on a hand-authored curve over global
 * journey progress.
 *
 * Rendered ABOVE the footage rather than behind it: the four videos are
 * opaque full-frame plates, so anything behind them would not exist. Drawn
 * over them as a holographic trace, which also lets the structure sit on
 * the footage's own centre vanishing point — where a thing at the end of a
 * corridor belongs.
 */
export class Sede {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private fog: THREE.Fog | null = null;
  private rimLight: THREE.PointLight | null = null;

  private videoSource: LoopingVideoTexture | null = null;
  private guardianGeometry: THREE.PlaneGeometry | null = null;
  private guardianMaterial: THREE.MeshBasicMaterial | null = null;
  private guardian: THREE.Mesh | null = null;

  private wallGeometry: THREE.BufferGeometry | null = null;
  private wallMaterial: THREE.LineBasicMaterial | null = null;
  private wall: THREE.LineSegments | null = null;

  private rafId: number | null = null;
  /**
   * Written by `setProgress`, read by the loop. Not smoothed here: the host
   * already eases global progress (`lib/scrollEasing.ts`), and a second lerp
   * would give this layer alone a lag the rest of the world lacks — which
   * reads as dragging behind the shot, not as weight.
   */
  private progress = 0;
  private readonly pose: SedePose = {
    guardianOpacity: 0, guardianScale: 0.82, guardianX: 0, guardianY: 0, guardianZ: 0,
    wallOpacity: 0, wallScale: 0.3, wallZ: -15,
  };
  private onVisibilityChange = (): void => {
    if (document.hidden) this.stopLoop();
    else this.startLoop();
  };

  async mount(canvas: HTMLCanvasElement, pixelRatioCap: number, detail: 'high' | 'low'): Promise<void> {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;

    this.scene = new THREE.Scene();
    this.fog = new THREE.Fog(0x030712, 3, 16);
    this.scene.fog = this.fog;

    // ONE lens for everything in this space.
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 6);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
    this.renderer.setSize(width, height, false);

    // ONE light. It reaches the Guardian and the structure alike, which is
    // the whole point of merging them.
    this.rimLight = new THREE.PointLight(0x29abe2, 0.9, 20, 2);
    this.rimLight.position.set(1.3, 0.5, 2);
    this.scene.add(this.rimLight);
    this.scene.add(new THREE.AmbientLight(0x0a1622, 0.5));

    this.wallGeometry = buildWallGeometry(detail === 'high' ? 7 : 5, detail === 'high' ? 9 : 6);
    this.wallMaterial = new THREE.LineBasicMaterial({
      color: 0x29abe2,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.wall = new THREE.LineSegments(this.wallGeometry, this.wallMaterial);
    this.scene.add(this.wall);

    this.videoSource = new LoopingVideoTexture();
    const texture = await this.videoSource.load(GUARDIAN_VIDEO);
    if (!this.scene) return; // unmounted while the video was loading

    this.guardianGeometry = new THREE.PlaneGeometry(GUARDIAN_WIDTH, GUARDIAN_WIDTH * GUARDIAN_ASPECT);
    this.guardianMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0 });
    this.guardian = new THREE.Mesh(this.guardianGeometry, this.guardianMaterial);
    this.scene.add(this.guardian);

    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.startLoop();
  }

  resize(cssWidth: number, cssHeight: number): void {
    if (!this.camera || !this.renderer || cssWidth === 0 || cssHeight === 0) return;
    this.camera.aspect = cssWidth / cssHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(cssWidth, cssHeight, false);
  }

  /** Global journey progress (0-1), already eased by the host. */
  setProgress(progress: number): void {
    this.progress = progress;
  }

  private startLoop(): void {
    // The video texture needs a real frame loop; the wall rides along for
    // free, since they are now the same render.
    if (this.rafId !== null || document.hidden) return;
    const tick = () => {
      this.draw();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  private draw(): void {
    if (!this.renderer || !this.scene || !this.camera) return;

    const pose = this.pose;
    sampleKeyframes(POSE_CURVE, this.progress, pose);

    if (this.guardian) {
      this.guardian.position.set(pose.guardianX, pose.guardianY, pose.guardianZ);
      this.guardian.scale.setScalar(pose.guardianScale);
    }
    if (this.guardianMaterial) this.guardianMaterial.opacity = pose.guardianOpacity;

    if (this.wall) {
      this.wall.position.z = pose.wallZ;
      this.wall.scale.setScalar(pose.wallScale);
    }
    if (this.wallMaterial) this.wallMaterial.opacity = pose.wallOpacity;

    if (this.fog) {
      this.fog.near = 2.6 + (1 - pose.guardianScale) * 1.4;
      this.fog.far = 14 - (1 - pose.wallScale) * 3;
    }
    if (this.rimLight) this.rimLight.intensity = 0.55 + pose.guardianOpacity * 0.55;

    this.renderer.render(this.scene, this.camera);
  }

  unmount(): void {
    this.stopLoop();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);

    this.guardianGeometry?.dispose();
    this.guardianMaterial?.dispose();
    this.videoSource?.dispose();
    this.wallGeometry?.dispose();
    this.wallMaterial?.dispose();
    // forceContextLoss() frees the WebGL context immediately instead of
    // waiting on garbage collection — see every other renderer here.
    this.renderer?.forceContextLoss();
    this.renderer?.dispose();

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.fog = null;
    this.rimLight = null;
    this.videoSource = null;
    this.guardianGeometry = null;
    this.guardianMaterial = null;
    this.guardian = null;
    this.wallGeometry = null;
    this.wallMaterial = null;
    this.wall = null;
  }
}
