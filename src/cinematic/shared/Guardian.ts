import * as THREE from 'three';
import { LoopingVideoTexture } from './LoopingVideoTexture';
import { sampleKeyframes, type Keyframe } from './keyframes';
import { sampleAmbient, type AmbientSample } from './sampleAmbient';
import { AssetManager } from '../AssetManager';
import { pickFrameIndex } from './FrameSequenceAnimator';

const GUARDIAN_VIDEO = '/cinematic/guardian/guardian.mp4';

export const BEAM_FRAME_COUNT = 92;
const getBeamFramePath = (i: number): string =>
  `/cinematic/guardian/beam/frame-${String(Math.min(BEAM_FRAME_COUNT, Math.max(1, i + 1))).padStart(3, '0')}.jpg`;

/**
 * The release is SCRUBBED BY SCROLL, and it is the climax of the pinned
 * journey rather than a beat inside it — the window runs to the very end,
 * so the blowout is what hands the viewer to the page.
 *
 * It used to be a one-shot clip on the real clock, cued by an event when
 * the last installation went back to standby. Two things were wrong with
 * that. It fired with roughly 2000px of pinned scroll still to come, so the
 * climax landed in the middle of the experience. And the cue was an edge
 * ("done" turning true), so hovering around that threshold re-armed and
 * re-fired it, raising the flash back to full before it could decay — which
 * is exactly the stuck white screen: the clip owned a clock the scroll
 * could not rewind.
 *
 * Scrubbing removes the whole class of bug. There is no state to latch, no
 * timer to outrun the user, and scrolling back retracts the light because
 * the frame is a pure function of position.
 */
const BEAM_FROM = 0.86;

/**
 * Flash knee, in 0-1 luminance, set from the footage as shipped. The clip
 * sits at luma 27-58 (0.11-0.23) while he turns and the emblem charges,
 * then blows out to 239 (0.94). Mapping 0.30 -> 0.90 keeps the entire
 * charge at zero flash and lets only the release fill the screen.
 */
const FLASH_FROM = 0.3;
const FLASH_TO = 0.9;

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

  private readonly beamAssets = new AssetManager();
  private beamTexture: THREE.Texture | null = null;
  private idleTexture: THREE.VideoTexture | null = null;
  private beamFrameIndex = -1;
  private flashGeometry: THREE.PlaneGeometry | null = null;
  private flashMaterial: THREE.MeshBasicMaterial | null = null;
  private flash: THREE.Mesh | null = null;

  private flashAlpha = 0;
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

    // One texture reused for every beam frame: the image behind it is
    // swapped as the scroll scrubs, rather than allocating a texture per
    // frame. Streamed in the background because it is only needed in the
    // last 14% of the journey — the idle clip is what matters first.
    this.beamTexture = new THREE.Texture();
    this.beamTexture.colorSpace = THREE.SRGBColorSpace;
    this.beamTexture.minFilter = THREE.LinearFilter;
    this.beamTexture.magFilter = THREE.LinearFilter;
    this.beamTexture.generateMipmaps = false;
    void this.beamAssets.preload(
      {
        id: 'guardian-beam',
        frames: Array.from({ length: BEAM_FRAME_COUNT }, (_, i) => getBeamFramePath(i)),
        preloadPriority: 9,
      },
      // Nothing eager: every one of these is needed only in the last 14% of
      // the journey, so they stream one at a time behind everything else.
      { eagerCount: 0 },
    );

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
   * opposite meaning: this reveals, it does not close.
   *
   * Scrubbed, not played. Everything here is derived from `this.progress`
   * and nothing is remembered between frames, which is what makes going
   * back actually go back.
   */
  private stepBeam(): void {
    if (!this.material || !this.flashMaterial || !this.beamTexture) return;

    const beamProgress = (this.progress - BEAM_FROM) / (1 - BEAM_FROM);
    if (beamProgress <= 0) {
      // Before the window: the idle loop, no flash. Restoring rather than
      // remembering is the point — scrolling back always lands here.
      if (this.idleTexture) this.material.uniforms.uMap.value = this.idleTexture;
      this.flashAlpha = 0;
      this.beamFrameIndex = -1;
      this.flashMaterial.opacity = 0;
      if (this.flash) this.flash.visible = false;
      return;
    }

    const index = pickFrameIndex(
      Math.min(1, beamProgress),
      BEAM_FRAME_COUNT,
      (i) => this.beamAssets.isLoaded(getBeamFramePath(i)),
    );
    if (index < 0) return; // nothing streamed in yet — hold the idle loop

    if (index !== this.beamFrameIndex) {
      this.beamFrameIndex = index;
      const image = this.beamAssets.get(getBeamFramePath(index));
      if (image) {
        this.beamTexture.image = image;
        this.beamTexture.needsUpdate = true;
        this.material.uniforms.uMap.value = this.beamTexture;
        // Sampled on frame change only. The flash IS this frame's light.
        sampleAmbient(image, this.beamSample);
        this.flashAlpha = THREE.MathUtils.smoothstep(
          this.beamSample.brightness,
          FLASH_FROM,
          FLASH_TO,
        );
      }
    }

    this.flashMaterial.opacity = this.flashAlpha;
    if (this.flash) this.flash.visible = this.flashAlpha > 0.001;
  }

  private draw(): void {
    if (!this.renderer || !this.scene || !this.camera || !this.mesh || !this.material) return;

    this.frameParity ^= 1;
    if (this.skipAlternateFrames && this.frameParity === 1) return;

    this.stepBeam();

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
    this.beamTexture?.dispose();
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
    this.beamTexture = null;
    this.beamFrameIndex = -1;
    this.idleTexture = null;
    this.flashGeometry = null;
    this.flashMaterial = null;
    this.flash = null;
    this.flashAlpha = 0;
  }
}
