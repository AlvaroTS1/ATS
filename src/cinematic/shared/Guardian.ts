import * as THREE from 'three';
import { LoopingVideoTexture } from './LoopingVideoTexture';
import { sampleKeyframes, type Keyframe } from './keyframes';

const GUARDIAN_VIDEO = '/cinematic/guardian/guardian.mp4';

/** 9:16 source. */
const SOURCE_ASPECT = 1280 / 720;
const PLANE_WIDTH = 1.85;

/**
 * Luma matte knee, in 0-1 luminance.
 *
 * Measured on the shipped plate: the void reads 1-4 of 255 (0.004-0.016)
 * in every corner and along every border, while the armour reads 28.5
 * (0.112). That is a 7-28x separation, and it is the entire reason this
 * source works where the previous one could not — there the armour sat at
 * 14.2 against a darkest-background of 13.5, a ratio of 1.05, so no
 * threshold could ever tell figure from room.
 *
 * LOW sits above the void, HIGH at the armour, and the smoothstep between
 * them means the darkest parts of the suit stay semi-transparent rather
 * than being cut out. That is deliberate: a figure whose shadowed side
 * dissolves into the hall reads as standing IN the room. A hard cutout
 * reads as a sticker of a person.
 */
const MATTE_LOW = 0.025;
const MATTE_HIGH = 0.1;

/**
 * How far alpha is forced to zero in from each edge of the plate, in UV.
 *
 * This is the guarantee, not an effect: whatever the source has at its
 * borders, the plate's own rectangle CANNOT reach the screen, because
 * alpha is already zero before it gets there. Belt and braces over the
 * matte, and the thing that makes the "no rectangle, ever" rule
 * structural rather than dependent on a generator behaving.
 *
 * The values come from the figure's measured bounding box, so the mask
 * never touches him: he spans u 0.239-0.74 and v 0.056-0.877 (image y
 * 0.123-0.944). The generous top feather also disposes of the one thing
 * the plate got wrong — a volumetric light shaft in the upper-right
 * corner, measured at luma 106, which the two feathers together reduce to
 * roughly 4% alpha where it meets the frame.
 *
 * Bottom is tightest because his feet very nearly reach the plate edge;
 * what fades there is the floor reflection below them, which SHOULD
 * dissolve rather than stop on a line.
 */
const FEATHER_LEFT = 0.2;
const FEATHER_RIGHT = 0.2;
const FEATHER_TOP = 0.08;
const FEATHER_BOTTOM = 0.04;

interface GuardianPose extends Record<string, number> {
  opacity: number;
  scale: number;
  /**
   * Lateral placement as a FRACTION of the available half-width, not world
   * units — the frustum is far narrower on a phone than on a desktop, and
   * a fixed offset that reads as "off to one side" on a monitor puts him
   * off-screen on a phone.
   */
  lateral: number;
  y: number;
  z: number;
}

/**
 * He is absent for the first half of the journey. The núcleo and the
 * portal are their own subject, and a figure standing in them would be a
 * host introducing a slideshow — the exact mascot register this whole
 * direction exists to avoid. He resolves out of the dark as the hall
 * arrives, and then he simply stays, off to one side, present.
 */
const POSE_CURVE: ReadonlyArray<Keyframe<GuardianPose>> = [
  { t: 0.0, opacity: 0, scale: 0.9, lateral: -0.3, y: -0.35, z: -1.2 },
  { t: 0.5, opacity: 0, scale: 0.92, lateral: -0.34, y: -0.35, z: -1 },
  { t: 0.62, opacity: 0.5, scale: 0.96, lateral: -0.38, y: -0.35, z: -0.5 },
  { t: 0.78, opacity: 0.88, scale: 1, lateral: -0.4, y: -0.35, z: 0 },
  { t: 1.0, opacity: 0.88, scale: 1, lateral: -0.4, y: -0.35, z: 0 },
];

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform vec4 uFeather; // left, right, bottom, top — in UV
  uniform vec2 uMatte;   // low, high
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    float luma = dot(tex.rgb, vec3(0.2126, 0.7152, 0.0722));

    // Black contributes nothing. No key colour, no chroma spill, no
    // rectangle — the void simply never becomes fragments.
    float matte = smoothstep(uMatte.x, uMatte.y, luma);

    // Alpha reaches zero before any edge of the plate does.
    float fx = smoothstep(0.0, uFeather.x, vUv.x) *
               smoothstep(0.0, uFeather.y, 1.0 - vUv.x);
    float fy = smoothstep(0.0, uFeather.z, vUv.y) *
               smoothstep(0.0, uFeather.w, 1.0 - vUv.y);

    gl_FragColor = vec4(tex.rgb, matte * fx * fy * uOpacity);
    if (gl_FragColor.a < 0.002) discard;
  }
`;

/**
 * The Guardian, as an inhabitant rather than a plate.
 *
 * The V8 audit retired his predecessor outright: that source was a cropped
 * portrait bust on a mid-tone teal background, so its rectangle was
 * unavoidable — its borders sat 6-10x brighter than this stack's
 * near-black, the frame cut through his skull and shoulders so no feather
 * could hide it, and the background was too bright to key without eating
 * the armour. This one was shot to spec against a true void, which is what
 * lets a luma matte do the job with no mask painting and no alpha channel.
 *
 * Lives outside the Timeline, on a hand-authored curve over GLOBAL journey
 * progress: he doesn't belong to one scene, he belongs to the whole trip.
 */
export class Guardian {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private video: LoopingVideoTexture | null = null;
  private geometry: THREE.PlaneGeometry | null = null;
  private material: THREE.ShaderMaterial | null = null;
  private mesh: THREE.Mesh | null = null;

  private rafId: number | null = null;
  private frameParity = 0;
  private skipAlternateFrames = false;

  /** Written by `setProgress`, read by the loop. Already eased by the host. */
  private progress = 0;
  private readonly pose: GuardianPose = {
    opacity: 0,
    scale: 0.9,
    lateral: -0.3,
    y: -0.35,
    z: -1.2,
  };

  private onVisibilityChange = (): void => {
    if (document.hidden) this.stopLoop();
    else this.startLoop();
  };

  async mount(
    canvas: HTMLCanvasElement,
    pixelRatioCap: number,
    detail: 'high' | 'low',
  ): Promise<void> {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;

    this.skipAlternateFrames = detail === 'low';
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 6);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
    this.renderer.setSize(width, height, false);

    this.video = new LoopingVideoTexture();
    const texture = await this.video.load(GUARDIAN_VIDEO);
    if (!this.scene) return; // unmounted while the video was loading

    this.geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_WIDTH * SOURCE_ASPECT);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: texture },
        uOpacity: { value: 0 },
        uFeather: {
          value: new THREE.Vector4(
            FEATHER_LEFT,
            FEATHER_RIGHT,
            FEATHER_BOTTOM,
            FEATHER_TOP,
          ),
        },
        uMatte: { value: new THREE.Vector2(MATTE_LOW, MATTE_HIGH) },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

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
    if (!this.renderer || !this.scene || !this.camera || !this.mesh || !this.material) return;

    this.frameParity ^= 1;
    if (this.skipAlternateFrames && this.frameParity === 1) return;

    const pose = this.pose;
    sampleKeyframes(POSE_CURVE, this.progress, pose);

    // Fully transparent costs nothing but a cleared buffer.
    this.material.uniforms.uOpacity.value = pose.opacity;
    if (pose.opacity <= 0.001) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    // Lateral placement resolved against the CURRENT frustum, so "off to
    // one side" means the same thing on a phone and on a monitor.
    const halfHeight = Math.tan((this.camera.fov * Math.PI) / 360) * (6 - pose.z);
    const halfWidth = halfHeight * this.camera.aspect;
    this.mesh.position.set(pose.lateral * halfWidth, pose.y, pose.z);
    this.mesh.scale.setScalar(pose.scale);

    this.renderer.render(this.scene, this.camera);
  }

  unmount(): void {
    this.stopLoop();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);

    this.geometry?.dispose();
    this.material?.dispose();
    this.video?.dispose();
    // forceContextLoss() frees the WebGL context immediately instead of
    // waiting on garbage collection — same as every other renderer here.
    this.renderer?.forceContextLoss();
    this.renderer?.dispose();

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.video = null;
    this.geometry = null;
    this.material = null;
    this.mesh = null;
  }
}
