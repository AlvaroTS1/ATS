import * as THREE from 'three';
import { sampleKeyframes, type Keyframe } from './keyframes';

/** Arc span, in radians — wide enough to curve around the viewer, not a full ring. */
const SPAN = Math.PI * 0.72;
const RADIUS = 6;
const HEIGHT = 5;
const ARC_SEGMENTS = 56;

interface WallPose extends Record<string, number> {
  opacity: number;
  scale: number;
  z: number;
}

/**
 * The ATS headquarters as a DESTINATION, visible from the start.
 *
 * Deliberately not a scene: a scene begins and ends, and the whole point
 * here is that the Hall was always there — you were just far from it. So
 * it lives outside the Timeline entirely, on a hand-authored curve over
 * global journey progress, exactly like `GuardianPresence`.
 *
 * Rendered ABOVE the footage rather than behind it: the four videos are
 * opaque full-frame plates, so a structure behind them would simply not
 * exist. Drawing it over them as a holographic trace is coherent with the
 * language the whole universe already speaks — and it lets the wall sit
 * on the footage's own centre vanishing point, which is where a thing at
 * the end of a corridor belongs.
 */
const POSE_CURVE: ReadonlyArray<Keyframe<WallPose>> = [
  // Barely a suggestion. If it reads as anything but "something far away",
  // it's too strong — clutter over footage is worse than absence.
  { t: 0.0, opacity: 0.0, scale: 0.3, z: -15 },
  { t: 0.35, opacity: 0.05, scale: 0.42, z: -13 },
  { t: 0.7, opacity: 0.12, scale: 0.62, z: -10 },
  // Arrival: resolves into real structure as the Hall establishes.
  { t: 0.88, opacity: 0.32, scale: 0.9, z: -6 },
  // Never blazing. It is the room the Guardian stands in, not the subject.
  { t: 1.0, opacity: 0.45, scale: 1.0, z: -4.5 },
];

/**
 * Horizontal arcs + vertical ribs, merged into ONE `LineSegments` — an
 * architectural elevation, not a 3D primitive. A wireframe cylinder reads
 * as a wireframe cylinder; spaced arcs read as built structure.
 *
 * Everything in a single geometry so the whole wall is one draw call.
 * (WebGL ignores `linewidth`, so these are always 1px — which is exactly
 * the thin, drafted look wanted here. Not a limitation to "fix".)
 */
function buildWallGeometry(arcCount: number, ribCount: number): THREE.BufferGeometry {
  const points: number[] = [];
  const halfSpan = SPAN / 2;

  for (let a = 0; a < arcCount; a++) {
    const y = HEIGHT * (a / (arcCount - 1) - 0.5);
    // Arcs bow inward toward the top and bottom edges, so the wall reads
    // as a curved surface rather than stacked identical rings.
    const bow = 1 - Math.abs(y / (HEIGHT / 2)) * 0.18;
    for (let s = 0; s < ARC_SEGMENTS; s++) {
      const t0 = -halfSpan + (SPAN * s) / ARC_SEGMENTS;
      const t1 = -halfSpan + (SPAN * (s + 1)) / ARC_SEGMENTS;
      points.push(
        Math.sin(t0) * RADIUS * bow, y, -Math.cos(t0) * RADIUS * bow,
        Math.sin(t1) * RADIUS * bow, y, -Math.cos(t1) * RADIUS * bow,
      );
    }
  }

  for (let r = 0; r < ribCount; r++) {
    const angle = -halfSpan + (SPAN * r) / (ribCount - 1);
    const top = HEIGHT / 2;
    const bowTop = 1 - 0.18;
    points.push(
      Math.sin(angle) * RADIUS * bowTop, top, -Math.cos(angle) * RADIUS * bowTop,
      Math.sin(angle) * RADIUS * bowTop, -top, -Math.cos(angle) * RADIUS * bowTop,
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  return geometry;
}

export class HoloWall {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private geometry: THREE.BufferGeometry | null = null;
  private material: THREE.LineBasicMaterial | null = null;
  private wall: THREE.LineSegments | null = null;
  private readonly pose: WallPose = { opacity: 0, scale: 0.3, z: -15 };

  mount(canvas: HTMLCanvasElement, pixelRatioCap: number, detail: 'high' | 'low'): void {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
    this.renderer.setSize(width, height, false);

    this.geometry = buildWallGeometry(detail === 'high' ? 7 : 5, detail === 'high' ? 9 : 6);
    this.material = new THREE.LineBasicMaterial({
      color: 0x29abe2,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.wall = new THREE.LineSegments(this.geometry, this.material);
    this.scene.add(this.wall);
  }

  resize(cssWidth: number, cssHeight: number): void {
    if (!this.camera || !this.renderer || cssWidth === 0 || cssHeight === 0) return;
    this.camera.aspect = cssWidth / cssHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(cssWidth, cssHeight, false);
    this.render();
  }

  /**
   * Global journey progress (0-1). Already smoothed by the host (see
   * `scrollEasing.ts`), so no second lerp here.
   *
   * Renders on demand rather than on a rAF loop: the geometry is static,
   * so a loop would burn frames redrawing an identical image. The living
   * quality of the environment is `AmbientLayer`'s job, layered above —
   * "menos movimento, mais presença".
   */
  setProgress(progress: number): void {
    sampleKeyframes(POSE_CURVE, progress, this.pose);
    this.render();
  }

  private render(): void {
    if (!this.renderer || !this.scene || !this.camera || !this.wall || !this.material) return;
    this.wall.position.z = this.pose.z;
    this.wall.scale.setScalar(this.pose.scale);
    this.material.opacity = this.pose.opacity;
    this.renderer.render(this.scene, this.camera);
  }

  unmount(): void {
    this.geometry?.dispose();
    this.material?.dispose();
    this.renderer?.forceContextLoss();
    this.renderer?.dispose();

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.geometry = null;
    this.material = null;
    this.wall = null;
  }
}
