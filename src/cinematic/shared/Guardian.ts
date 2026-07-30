import * as THREE from 'three';
import { LoopingVideoTexture } from './LoopingVideoTexture';
import { sampleKeyframes, type Keyframe } from './keyframes';
import { sampleAmbient, type AmbientSample } from './sampleAmbient';
import { AssetManager } from '../AssetManager';
import { cinematicEvents } from '../EventBus';
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
 * Re-measured properly in V9.4, because the first calibration was wrong.
 * It sampled ONE 200x300 region that happened to include the lit chest
 * emblem, read "armour = 28.5", and declared a 7-28x separation from the
 * void. Sampling the whole figure and the whole void tells a different
 * story:
 *
 *   figure   p20 7.1   p50 14.8   p70 24.6   p90 67.0
 *   void     p50 5.1   p90 10.5   p95 12.5   p99 16.9   max 33.0
 *
 * They OVERLAP. The void's p90 is brighter than the figure's p30. The
 * generator did not deliver the absolute black the spec asked for, so no
 * per-pixel luma threshold can make this figure fully solid without the
 * void starting to show as a haze.
 *
 * LOW sits just above the void's p90, so 90% of the background stays at
 * exactly zero — cleaner than the old 0.025, which let the void's p90
 * through at 10.5% alpha. HIGH is pulled in from 0.1 to 0.068 to open the
 * middle: the armour's median tone goes from 36% opaque to 72%, and
 * everything from p60 up is fully solid instead of 58%.
 *
 * The cost is honest and bounded. The void's p95 renders at 22% alpha and
 * its p99 at ~99%, but those pixels are luma 12-17 and the grade below
 * darkens them further, so they land as near-black specks over an already
 * dark hall. The trade is 5% of the background gaining a barely visible
 * shadow in exchange for the figure ceasing to be see-through.
 */
const MATTE_LOW = 0.041;
const MATTE_HIGH = 0.068;

/**
 * Colour grade applied to what survives the matte: lift is subtracted
 * first, then gain, then a saturation push.
 *
 * This is what answers "perdeu o brilho da armadura". It runs on RGB ONLY,
 * never on the value the matte is computed from — so the void cannot be
 * lifted by it, because black minus lift, times anything, is still black.
 * The armour's mid-tones open up, the specular edges clip toward white,
 * and the cyan seams saturate instead of sitting flat.
 */
const GRADE_LIFT = 0.02;
const GRADE_GAIN = 1.55;
const GRADE_SATURATION = 1.3;

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
  // Opacity reaches 1. It used to top out at 0.88 and sit at 0.5 through
  // the approach, which multiplied the matte a second time: the armour's
  // median tone ended up 21% opaque, and he read as a ghost rather than a
  // figure. The matte alone decides what is see-through now.
  { t: 0.62, opacity: 0.85, scale: 0.96, lateral: -0.38, y: -0.35, z: -0.5 },
  { t: 0.78, opacity: 1, scale: 1, lateral: -0.4, y: -0.35, z: 0 },
  { t: 1.0, opacity: 1, scale: 1, lateral: -0.4, y: -0.35, z: 0 },
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
  uniform vec3 uGrade;   // lift, gain, saturation
  varying vec2 vUv;

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    // Keyed off the UNGRADED luminance on purpose: grading the value the
    // matte reads would lift the void along with the armour and hand the
    // rectangle straight back.
    float luma = dot(tex.rgb, vec3(0.2126, 0.7152, 0.0722));

    vec3 graded = max(vec3(0.0), tex.rgb - uGrade.x) * uGrade.y;
    float gradedLuma = dot(graded, vec3(0.2126, 0.7152, 0.0722));
    graded = clamp(mix(vec3(gradedLuma), graded, uGrade.z), 0.0, 1.0);

    // Black contributes nothing. No key colour, no chroma spill, no
    // rectangle — the void simply never becomes fragments.
    float matte = smoothstep(uMatte.x, uMatte.y, luma);

    // Alpha reaches zero before any edge of the plate does.
    float fx = smoothstep(0.0, uFeather.x, vUv.x) *
               smoothstep(0.0, uFeather.y, 1.0 - vUv.x);
    float fy = smoothstep(0.0, uFeather.z, vUv.y) *
               smoothstep(0.0, uFeather.w, 1.0 - vUv.y);

    gl_FragColor = vec4(graded, matte * fx * fy * uOpacity);
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

  private flashAlpha = 0;
  private lastPublishedFlash = -1;
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
        uGrade: { value: new THREE.Vector3(GRADE_LIFT, GRADE_GAIN, GRADE_SATURATION) },
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

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
    if (!this.material || !this.beamTexture) return;

    const beamProgress = (this.progress - BEAM_FROM) / (1 - BEAM_FROM);
    if (beamProgress <= 0) {
      // Before the window: the idle loop, no flash. Restoring rather than
      // remembering is the point — scrolling back always lands here.
      if (this.idleTexture) this.material.uniforms.uMap.value = this.idleTexture;
      this.flashAlpha = 0;
      this.beamFrameIndex = -1;
      this.publishFlash();
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

    this.publishFlash();
  }

  /**
   * The flash is REPORTED, not drawn here.
   *
   * It used to be a quad inside this scene, which meant it lived inside the
   * pin — so the moment the pin released, the light vanished and the page
   * slid up underneath it as an ordinary scroll. That gap is the "interval"
   * the whole cinematic exists to deny. Rendered by the host as a fixed
   * layer instead, it survives the pin and can fade out over the page,
   * which is what lets the site emerge FROM the light rather than arrive
   * after it.
   */
  private publishFlash(): void {
    if (this.flashAlpha === this.lastPublishedFlash) return;
    this.lastPublishedFlash = this.flashAlpha;
    cinematicEvents.emit('guardian:flash', { intensity: this.flashAlpha });
  }

  /**
   * Self-healing size check, once per frame.
   *
   * `mount` runs after the video has loaded, and at that moment the canvas
   * may not be laid out yet — it falls back to 1x1 and relies on the single
   * `resize` call that follows. If THAT lands while the pin still measures
   * zero, the renderer stays 1x1 and gets stretched across the viewport,
   * which looks exactly like the complaint that prompted this: a soft,
   * matte Guardian with no shine. Reproduced in the preview after a cold
   * start, where only a manual resize event recovered it.
   *
   * A slow phone loading a video over mobile data is precisely where that
   * race is most likely, so the loop verifies rather than trusting one
   * call at one moment.
   */
  private ensureSized(): void {
    const canvas = this.renderer?.domElement;
    if (!canvas || !this.renderer) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    const ratio = this.renderer.getPixelRatio();
    if (Math.abs(canvas.width - Math.round(w * ratio)) > 1) this.resize(w, h);
  }

  private draw(): void {
    if (!this.renderer || !this.scene || !this.camera || !this.mesh || !this.material) return;
    this.ensureSized();

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
    this.flashAlpha = 0;
  }
}
