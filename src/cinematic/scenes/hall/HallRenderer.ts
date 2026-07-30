import * as THREE from 'three';
import { createParticleTexture } from '../../shared/particleTexture';
import { createBloomComposer, type BloomComposer } from '../../shared/createBloomComposer';
import type { HallState } from './HallAnimator';

/**
 * Renders the arrival: scattered energy organizes into the volume of a
 * room while the camera moves in and the light establishes. Deliberately
 * restrained per V6 art direction — the particles describe the space, and
 * a single soft ambient glow sits it in place. No second light source and
 * no extra sprite: restraint here is what lets the footage's own
 * architecture be the thing that gets looked at.
 *
 * Owns every Three.js resource it creates and disposes all of them on
 * unmount.
 */
export class HallRenderer {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private particleGeometry: THREE.BufferGeometry | null = null;
  private particleMaterial: THREE.PointsMaterial | null = null;
  private particleTexture: THREE.CanvasTexture | null = null;
  private glowMaterial: THREE.SpriteMaterial | null = null;
  private glowTexture: THREE.CanvasTexture | null = null;
  private composer: BloomComposer | null = null;

  mount(canvas: HTMLCanvasElement, particlePositions: Float32Array, pixelRatioCap: number): void {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 9);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
    this.renderer.setSize(width, height, false);
    this.composer = createBloomComposer(this.renderer, this.scene, this.camera, width, height);

    this.particleGeometry = new THREE.BufferGeometry();
    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    this.particleTexture = createParticleTexture();
    this.particleMaterial = new THREE.PointsMaterial({
      size: 0.055,
      map: this.particleTexture,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0x29abe2,
    });
    this.scene.add(new THREE.Points(this.particleGeometry, this.particleMaterial));

    // The room's own ambient light — large, soft, low. Establishes and
    // holds; it is never the thing you look at.
    this.glowTexture = createParticleTexture();
    this.glowMaterial = new THREE.SpriteMaterial({
      map: this.glowTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Sprite(this.glowMaterial);
    glow.scale.set(9, 9, 1);
    glow.position.set(0, 0, -3);
    this.scene.add(glow);
  }

  resize(cssWidth: number, cssHeight: number): void {
    if (!this.camera || !this.renderer || cssWidth === 0 || cssHeight === 0) return;
    this.camera.aspect = cssWidth / cssHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(cssWidth, cssHeight, false);
    this.composer?.resize(cssWidth, cssHeight);
  }

  render(state: HallState, crossfadeOpacity: number): void {
    if (!this.renderer || !this.scene || !this.camera || !this.particleGeometry) return;

    this.camera.position.z = state.cameraZ;

    if (this.particleMaterial) this.particleMaterial.opacity = state.particleOpacity * crossfadeOpacity;
    this.particleGeometry.attributes.position.needsUpdate = true;

    // 0.09 ceiling: present enough to sit the room in space, far too low
    // to read as an effect. Contention over spectacle.
    if (this.glowMaterial) this.glowMaterial.opacity = state.ambientGlowOpacity * 0.09 * crossfadeOpacity;

    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  unmount(): void {
    this.particleGeometry?.dispose();
    this.particleMaterial?.dispose();
    this.particleTexture?.dispose();
    this.glowMaterial?.dispose();
    this.glowTexture?.dispose();
    this.composer?.dispose();
    // forceContextLoss() frees the WebGL context immediately instead of
    // waiting on garbage collection — see every other renderer here.
    this.renderer?.forceContextLoss();
    this.renderer?.dispose();

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particleGeometry = null;
    this.particleMaterial = null;
    this.particleTexture = null;
    this.glowMaterial = null;
    this.glowTexture = null;
    this.composer = null;
  }
}
