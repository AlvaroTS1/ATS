import * as THREE from 'three';
import { createParticleTexture } from '../../shared/particleTexture';
import { createBloomComposer, type BloomComposer } from '../../shared/createBloomComposer';
import { LoopingVideoTexture } from '../../shared/LoopingVideoTexture';
import type { GuardianState } from './GuardianAnimator';

const PARTICLE_COUNT_HIGH = 220;
const PARTICLE_COUNT_LOW = 90;

/**
 * The Guardian isn't HTML over video — he's a real plane inside this
 * Three.js scene, lit by the same cyan rim light and wrapped in the same
 * fog/particles/bloom as every other procedural scene, so he reads as a
 * presence occupying the space rather than a clip playing on top of it.
 * Owns every Three.js + video resource it creates and disposes all of
 * them on unmount.
 */
export class GuardianRenderer {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private videoSource: LoopingVideoTexture | null = null;
  private planeGeometry: THREE.PlaneGeometry | null = null;
  private planeMaterial: THREE.MeshBasicMaterial | null = null;
  private plane: THREE.Mesh | null = null;
  private rimLight: THREE.PointLight | null = null;
  private fog: THREE.Fog | null = null;
  private particleGeometry: THREE.BufferGeometry | null = null;
  private particleMaterial: THREE.PointsMaterial | null = null;
  private particleTexture: THREE.CanvasTexture | null = null;
  private particlePositions: Float32Array | null = null;
  private particles: THREE.Points | null = null;
  private composer: BloomComposer | null = null;

  /** Starts the hidden `<video>` + its native loop — call during `Scene.preload()`, before `mount()`. */
  async loadVideo(videoUrl: string): Promise<THREE.VideoTexture> {
    this.videoSource = new LoopingVideoTexture();
    return this.videoSource.load(videoUrl);
  }

  mount(
    canvas: HTMLCanvasElement,
    videoTexture: THREE.VideoTexture,
    pixelRatioCap: number,
    particleCount: number,
    enableBloom: boolean,
  ): void {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;

    this.scene = new THREE.Scene();
    this.fog = new THREE.Fog(0x030712, 3.5, 11);
    this.scene.fog = this.fog;

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 6.2);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
    this.renderer.setSize(width, height, false);
    if (enableBloom) {
      this.composer = createBloomComposer(this.renderer, this.scene, this.camera, width, height);
    }

    // 9:16 source — a fixed-aspect plane, sized to read as a "window" the
    // camera slowly pushes toward, same portal feeling as the frame-sequence
    // scenes get from their cover/contain fit, just resolved by perspective
    // projection here instead of canvas math.
    this.planeGeometry = new THREE.PlaneGeometry(3, 3 * (1280 / 720));
    this.planeMaterial = new THREE.MeshBasicMaterial({
      map: videoTexture,
      transparent: true,
      opacity: 0,
    });
    this.plane = new THREE.Mesh(this.planeGeometry, this.planeMaterial);
    this.scene.add(this.plane);

    this.rimLight = new THREE.PointLight(0x29abe2, 1.4, 14, 2);
    this.rimLight.position.set(1.6, 0.6, 2.2);
    this.scene.add(this.rimLight);
    this.scene.add(new THREE.AmbientLight(0x0a1622, 0.6));

    this.particleTexture = createParticleTexture();
    this.particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      this.particlePositions[i * 3] = (Math.random() - 0.5) * 8;
      this.particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      this.particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    }
    this.particleGeometry = new THREE.BufferGeometry();
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    this.particleMaterial = new THREE.PointsMaterial({
      size: 0.045,
      map: this.particleTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0x29abe2,
    });
    this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particles);
  }

  resize(cssWidth: number, cssHeight: number): void {
    if (!this.camera || !this.renderer || cssWidth === 0 || cssHeight === 0) return;
    this.camera.aspect = cssWidth / cssHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(cssWidth, cssHeight, false);
    this.composer?.resize(cssWidth, cssHeight);
  }

  render(state: GuardianState, crossfadeOpacity: number, timeSeconds: number): void {
    if (!this.renderer || !this.scene || !this.camera || !this.plane) return;

    this.camera.position.z = state.cameraZ;
    if (this.fog) {
      this.fog.near = state.fogNear;
      this.fog.far = state.fogFar;
    }
    if (this.rimLight) this.rimLight.intensity = state.rimLightIntensity;

    if (this.planeMaterial) this.planeMaterial.opacity = crossfadeOpacity;
    if (this.particleMaterial) this.particleMaterial.opacity = 0.35 * crossfadeOpacity;

    // Slow independent drift, same "alive even when scroll is still"
    // principle as AmbientLayer — driven by real time, not localProgress.
    if (this.particles) {
      this.particles.rotation.y = timeSeconds * 0.01;
    }

    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  pauseVideo(): void {
    this.videoSource?.pause();
  }

  resumeVideo(): void {
    this.videoSource?.resume();
  }

  unmount(): void {
    this.planeGeometry?.dispose();
    this.planeMaterial?.dispose();
    this.videoSource?.dispose();
    this.particleGeometry?.dispose();
    this.particleMaterial?.dispose();
    this.particleTexture?.dispose();
    this.composer?.dispose();
    this.renderer?.forceContextLoss();
    this.renderer?.dispose();

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.videoSource = null;
    this.planeGeometry = null;
    this.planeMaterial = null;
    this.plane = null;
    this.rimLight = null;
    this.fog = null;
    this.particleGeometry = null;
    this.particleMaterial = null;
    this.particleTexture = null;
    this.particlePositions = null;
    this.particles = null;
    this.composer = null;
  }
}

export { PARTICLE_COUNT_HIGH, PARTICLE_COUNT_LOW };
