import * as THREE from 'three';
import { LoopingVideoTexture } from './LoopingVideoTexture';
import { sampleKeyframes, type Keyframe } from './keyframes';
import { sampleAmbient, type AmbientSample } from './sampleAmbient';

const GUARDIAN_VIDEO = '/cinematic/guardian/guardian.mp4';
const BEAM_VIDEO = '/cinematic/guardian/beam.mp4';

/**
 * Global progress at which the beam fires.
 *
 * 0.6294 is where `holo-hall`'s interactive panels finish dissolving —
 * measured by sweeping the real `Timeline` against
 * `HOLOHALL_PANELS_HIDE_AT`, not estimated. The Hall takes the frame at
 * 0.6501, so the blowout lands exactly on the handoff between regions.
 *
 * That window is 0.02 of the whole journey, roughly 150px of scroll, which
 * is why the clip CANNOT be scrubbed by scroll: nobody would ever see it.
 * It fires once and plays out on the real clock.
 */
const BEAM_FIRES_AT = 0.6294;
/** Scrolling back this far below the trigger re-arms it. Hysteresis, so it can't strobe. */
const BEAM_REARM_BELOW = 0.56;

/**
 * The flash is not a timed effect — it is the light he actually emits,
 * measured. `sampleAmbient` reads the beam clip's own mean luminance every
 * few frames and that drives the overlay, so the two can never drift and
 * changing the clip changes the flash for free.
 *
 * The knee is set from the clip as shipped: it sits at luma 27-58 (0.11-0.23)
 * for the first four seconds while he turns and the emblem charges, then
 * blows out to 239 (0.94). Mapping 0.30 -> 0.90 keeps the whole charging
 * phase at zero flash and lets only the release actually fill the screen.
 */
const FLASH_FROM = 0.3;
const FLASH_TO = 0.9;
/** How fast the flash falls once the clip is spent. */
const FLASH_DECAY_PER_SECOND = 1.6;
/** Sampling every Nth rendered frame — the ramp lasts ~1s, so this is plenty. */
const FLASH_SAMPLE_INTERVAL = 4;

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

  private beam: LoopingVideoTexture | null = null;
  private beamTexture: THREE.VideoTexture | null = null;
  private idleTexture: THREE.VideoTexture | null = null;
  private flashGeometry: THREE.PlaneGeometry | null = null;
  private flashMaterial: THREE.MeshBasicMaterial | null = null;
  private flash: THREE.Mesh | null = null;

  /**
   * IDLE -> FIRING (clip playing, flash rising off its measured luminance)
   * -> DECAYING (clip spent, flash falling; the map swaps back to idle
   * UNDER COVER of the white, so the swap is never seen) -> IDLE.
   */
  private beamState: 'idle' | 'firing' | 'decaying' = 'idle';
  private beamArmed = true;
  private flashAlpha = 0;
  private lastFrameTime = 0;
  private sampleCounter = 0;
  private readonly beamSample: AmbientSample = { brightness: 0, r: 0, g: 0, b: 0 };

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
    this.idleTexture = texture;

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

    // The flash: a white quad just in front of the camera, sized to the
    // frustum on every resize. It lives in this scene rather than in the
    // DOM because it belongs to the light he releases, and because at
    // z-[21] it already covers every footage canvas beneath it while
    // staying under the HUD — which is the point, since the interface is
    // what the light makes readable.
    this.flashGeometry = new THREE.PlaneGeometry(1, 1);
    this.flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.flash = new THREE.Mesh(this.flashGeometry, this.flashMaterial);
    this.flash.position.set(0, 0, 5);
    this.flash.visible = false;
    this.scene.add(this.flash);
    this.sizeFlashToFrustum();

    // Loaded after the idle clip so the thing needed first is never behind
    // the thing needed at 63% of the journey. Paused at frame 0 until fired.
    this.beam = new LoopingVideoTexture();
    this.beamTexture = await this.beam.load(BEAM_VIDEO, { loop: false });
    if (!this.scene) return;
    this.beam.pause();
    const beamEl = this.beam.element;
    if (beamEl) beamEl.currentTime = 0;

    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.startLoop();
  }

  /** The flash quad has to exactly cover the frustum at its own depth. */
  private sizeFlashToFrustum(): void {
    if (!this.flash || !this.camera) return;
    const distance = this.camera.position.z - this.flash.position.z;
    const halfHeight = Math.tan((this.camera.fov * Math.PI) / 360) * distance;
    this.flash.scale.set(halfHeight * this.camera.aspect * 2, halfHeight * 2, 1);
  }

  resize(cssWidth: number, cssHeight: number): void {
    if (!this.camera || !this.renderer || cssWidth === 0 || cssHeight === 0) return;
    this.camera.aspect = cssWidth / cssHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(cssWidth, cssHeight, false);
    this.sizeFlashToFrustum();
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

  /**
   * He does not launch the site. He lights the hall, and the light is what
   * makes the interface readable — the distinction matters, because a beam
   * that ENDS the cinematic would rebuild the "intro is over, now the site
   * starts" seam that V5.1 through V7 existed to destroy. Same drama,
   * opposite meaning: this reveals a region, it doesn't close one.
   */
  private stepBeam(deltaSeconds: number): void {
    if (!this.material || !this.flashMaterial || !this.beam) return;

    if (this.beamState === 'idle') {
      if (this.progress < BEAM_REARM_BELOW) this.beamArmed = true;
      if (this.beamArmed && this.progress >= BEAM_FIRES_AT) {
        this.beamArmed = false;
        this.beamState = 'firing';
        this.flashAlpha = 0;
        if (this.beamTexture) this.material.uniforms.uMap.value = this.beamTexture;
        this.beam.restart();
      }
      return;
    }

    if (this.beamState === 'firing') {
      const el = this.beam.element;
      // The flash follows the clip's OWN luminance, sampled — not a curve
      // invented to match it. Sampled every few frames because the ramp
      // lasts about a second, so 15Hz is already more than the eye needs.
      this.sampleCounter = (this.sampleCounter + 1) % FLASH_SAMPLE_INTERVAL;
      if (el && el.readyState >= 2 && this.sampleCounter === 0) {
        sampleAmbient(el, this.beamSample);
      }
      const target = THREE.MathUtils.smoothstep(this.beamSample.brightness, FLASH_FROM, FLASH_TO);
      // Rises freely, never falls while firing — a flash that flickered
      // back down mid-release would read as a dropped frame.
      this.flashAlpha = Math.max(this.flashAlpha, target);

      if (!el || el.ended || (el.duration > 0 && el.currentTime >= el.duration - 0.05)) {
        this.beamState = 'decaying';
        // Swapped while the screen is at its whitest, so the cut back to
        // the idle loop happens inside the light and is never visible.
        if (this.idleTexture) this.material.uniforms.uMap.value = this.idleTexture;
        this.beam.pause();
        if (el) el.currentTime = 0;
      }
    } else if (this.beamState === 'decaying') {
      this.flashAlpha -= FLASH_DECAY_PER_SECOND * deltaSeconds;
      if (this.flashAlpha <= 0) {
        this.flashAlpha = 0;
        this.beamState = 'idle';
      }
    }

    this.flashMaterial.opacity = this.flashAlpha;
    if (this.flash) this.flash.visible = this.flashAlpha > 0.001;
  }

  private draw(): void {
    if (!this.renderer || !this.scene || !this.camera || !this.mesh || !this.material) return;

    this.frameParity ^= 1;
    if (this.skipAlternateFrames && this.frameParity === 1) return;

    const now = performance.now();
    const deltaSeconds = this.lastFrameTime === 0 ? 0 : Math.min(0.1, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;
    this.stepBeam(deltaSeconds);

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
    this.beam?.dispose();
    this.flashGeometry?.dispose();
    this.flashMaterial?.dispose();
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
    this.beam = null;
    this.beamTexture = null;
    this.idleTexture = null;
    this.flashGeometry = null;
    this.flashMaterial = null;
    this.flash = null;
    this.beamState = 'idle';
    this.beamArmed = true;
    this.flashAlpha = 0;
    this.lastFrameTime = 0;
  }
}
