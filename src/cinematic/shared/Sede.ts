import * as THREE from 'three';
import { LoopingVideoTexture } from './LoopingVideoTexture';
import { sampleKeyframes, type Keyframe } from './keyframes';

const GUARDIAN_VIDEO = '/cinematic/guardian/guardian.mp4';

/** Arc span, in radians — wide enough to curve around the viewer, not a full ring. */
const SPAN = Math.PI * 0.72;

/**
 * Where the architecture meets the ground. Every shell rises from this
 * single Y, which is what turns three curved surfaces into one building:
 * things that share a ground plane read as built, things floating at
 * their own heights read as decoration.
 *
 * Chosen so the ground line stays inside frame at the near shell's depth
 * — the convergence of the floor toward the vanishing point is the
 * strongest perspective cue in the whole composition, and it only works
 * if you can see it.
 */
const GROUND_Y = -3;

interface ShellSpec {
  radius: number;
  height: number;
  /** Horizontal courses, ground upward. 2 = ground line and roof line only. */
  arcs: number;
  /** Vertical columns. These, not the arcs, are what read as monumental. */
  ribs: number;
  /** Baked into vertex colors, so depth is art-directed and not only fogged. */
  intensity: number;
}

/**
 * Three concentric shells at different depths, tallest and dimmest
 * outermost. The brief asked for a monument occupying the scenery AND for
 * restraint — those only conflict if scale and intensity are treated as
 * the same dial. They aren't: big + dim + few lines is a monument, big +
 * bright + many lines is clutter.
 *
 * So this is deliberately FEWER line segments than the single wall it
 * replaces (308 vs 401 at high detail), spread across three depths
 * instead of packed into one surface. Depth here comes from arrangement
 * and parallax, never from quantity.
 */
const SHELLS: ReadonlyArray<ShellSpec> = [
  { radius: 9.5, height: 15, arcs: 2, ribs: 9, intensity: 0.5 },
  { radius: 6.5, height: 11, arcs: 3, ribs: 7, intensity: 0.8 },
  { radius: 3.8, height: 7.5, arcs: 2, ribs: 5, intensity: 1 },
];

/** Radial floor lines joining the shells — the plaza the structure stands on. */
const FLOOR_RAYS = 7;
const FLOOR_INTENSITY = 0.4;
const STRUCTURE_COLOR = new THREE.Color(0x29abe2);
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
 * The monument: three concentric shells standing on a shared plaza,
 * merged into ONE `LineSegments` — an architectural elevation, not a 3D
 * primitive. A wireframe cylinder reads as a wireframe cylinder; courses
 * and columns rising off a floor read as built structure.
 *
 * Everything in a single geometry so the whole building is one draw call,
 * with per-shell brightness carried in vertex colors rather than in
 * separate materials (which would have cost one draw call per depth).
 *
 * (WebGL ignores `linewidth`, so these are always 1px — exactly the thin,
 * drafted look wanted here. Not a limitation to "fix".)
 */
function buildMonumentGeometry(detail: 'high' | 'low'): THREE.BufferGeometry {
  const segments = detail === 'high' ? 40 : 24;
  const shells = detail === 'high'
    ? SHELLS
    : SHELLS.map((s) => ({ ...s, ribs: Math.max(3, s.ribs - 2) }));

  const positions: number[] = [];
  const colors: number[] = [];
  const halfSpan = SPAN / 2;

  const edge = (
    x1: number, y1: number, z1: number,
    x2: number, y2: number, z2: number,
    intensity: number,
  ): void => {
    positions.push(x1, y1, z1, x2, y2, z2);
    const r = STRUCTURE_COLOR.r * intensity;
    const g = STRUCTURE_COLOR.g * intensity;
    const b = STRUCTURE_COLOR.b * intensity;
    colors.push(r, g, b, r, g, b);
  };

  /** Polar to world. -cos on Z so the span opens away from the camera. */
  const px = (radius: number, angle: number) => Math.sin(angle) * radius;
  const pz = (radius: number, angle: number) => -Math.cos(angle) * radius;

  for (const shell of shells) {
    for (let a = 0; a < shell.arcs; a++) {
      const y = GROUND_Y + shell.height * (a / (shell.arcs - 1));
      for (let s = 0; s < segments; s++) {
        const t0 = -halfSpan + (SPAN * s) / segments;
        const t1 = -halfSpan + (SPAN * (s + 1)) / segments;
        edge(
          px(shell.radius, t0), y, pz(shell.radius, t0),
          px(shell.radius, t1), y, pz(shell.radius, t1),
          shell.intensity,
        );
      }
    }

    // Columns: dead straight, ground to roof. The previous wall bowed its
    // verticals inward, which made it read as a curved SURFACE — a screen.
    // Straight columns standing on a floor read as a BUILDING.
    for (let r = 0; r < shell.ribs; r++) {
      const angle = -halfSpan + (SPAN * r) / (shell.ribs - 1);
      const x = px(shell.radius, angle);
      const z = pz(shell.radius, angle);
      edge(x, GROUND_Y, z, x, GROUND_Y + shell.height, z, shell.intensity);
    }
  }

  const innerRadius = Math.min(...shells.map((s) => s.radius));
  const outerRadius = Math.max(...shells.map((s) => s.radius));
  for (let i = 0; i < FLOOR_RAYS; i++) {
    const angle = -halfSpan + (SPAN * i) / (FLOOR_RAYS - 1);
    edge(
      px(innerRadius, angle), GROUND_Y, pz(innerRadius, angle),
      px(outerRadius, angle), GROUND_Y, pz(outerRadius, angle),
      FLOOR_INTENSITY,
    );
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
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

    this.wallGeometry = buildMonumentGeometry(detail);
    this.wallMaterial = new THREE.LineBasicMaterial({
      // White, because the hue now lives in the vertex colors — the
      // material color multiplies them, so anything but white would
      // double-tint the structure.
      color: 0xffffff,
      vertexColors: true,
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
      // A few degrees of yaw across the whole journey. Not a keyframe
      // channel, because it isn't a beat — it's the continuous
      // consequence of approaching something slightly off-axis. The
      // parallax it creates BETWEEN the three shells is what makes the
      // depth legible; without it they flatten back into one surface, no
      // matter how far apart they actually are.
      this.wall.rotation.y = -0.09 + this.progress * 0.14;
    }
    if (this.wallMaterial) this.wallMaterial.opacity = pose.wallOpacity;

    if (this.fog) {
      // Fog has to reach past the monument's far shell, or it deletes it.
      // The previous values (far = 14) put the wall's own core at 100%
      // fogged and even its nearest edge at 91% — the structure was never
      // actually visible, which read as "weak" and invited turning the
      // opacity up. The real fix is range: keep the gradient, extend it
      // far enough that near structure is crisp and far structure
      // dissolves, instead of everything past arm's reach being erased.
      //
      // `near` stays below the Guardian's own distance from camera (6) so
      // he is never fogged; he is the subject, not atmosphere.
      this.fog.near = 4.5 + (1 - pose.wallScale) * 1.5;
      this.fog.far = 16 + pose.wallScale * 14;
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
