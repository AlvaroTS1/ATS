import * as THREE from 'three';
import { createParticleTexture } from '../../shared/particleTexture';
import { createBloomComposer, type BloomComposer } from '../../shared/createBloomComposer';
import type { ReturnState } from './ReturnAnimator';

/**
 * Renders the collapse: ambient particles pull back toward the origin
 * while the camera slowly retreats and the core glow flares then dims —
 * ending in a calm, dim ember that the Hero can naturally fade up from.
 * Owns every Three.js resource it creates and disposes all of them on
 * unmount.
 */
export class ReturnRenderer {
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
    this.camera.position.set(0, 0, 6);

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
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0x29abe2,
    });
    this.scene.add(new THREE.Points(this.particleGeometry, this.particleMaterial));

    this.glowTexture = createParticleTexture();
    this.glowMaterial = new THREE.SpriteMaterial({
      map: this.glowTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Sprite(this.glowMaterial);
    glow.scale.set(2.2, 2.2, 1);
    this.scene.add(glow);
  }

  resize(cssWidth: number, cssHeight: number): void {
    if (!this.camera || !this.renderer || cssWidth === 0 || cssHeight === 0) return;
    this.camera.aspect = cssWidth / cssHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(cssWidth, cssHeight, false);
    this.composer?.resize(cssWidth, cssHeight);
  }

  render(state: ReturnState, crossfadeOpacity: number): void {
    if (!this.renderer || !this.scene || !this.camera || !this.particleGeometry) return;

    this.camera.position.z = state.cameraZ;
    const combinedOpacity = crossfadeOpacity * state.sceneFadeOpacity;

    if (this.particleMaterial) this.particleMaterial.opacity = state.particleOpacity * combinedOpacity;
    this.particleGeometry.attributes.position.needsUpdate = true;

    if (this.glowMaterial) this.glowMaterial.opacity = state.coreGlowOpacity * combinedOpacity;

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
    // See GenesisRenderer.unmount() — forceContextLoss() frees the WebGL
    // context immediately instead of waiting on garbage collection.
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
