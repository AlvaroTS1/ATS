import * as THREE from 'three';
import { createParticleTexture } from '../../shared/particleTexture';
import { lerpColor } from '../../shared/colorLerp';
import { createBloomComposer, type BloomComposer } from '../../shared/createBloomComposer';
import type { FusionAiState } from './FusionAiAnimator';
import { ORB_A_COLOR, ORB_B_COLOR } from './FusionAiAnimator';

/** "Em breve" rendered once onto an offscreen canvas — a static label, no need to redraw text per frame. */
function createLabelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 56px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 212, 255, 0.8)';
    ctx.shadowBlur = 24;
    ctx.fillText('Em breve', canvas.width / 2, canvas.height / 2);
  }
  return new THREE.CanvasTexture(canvas);
}

/**
 * Two abstract glowing forms drift toward each other and merge into a
 * single glow, then "Em breve" fades in — no literal product imagery.
 * Owns every Three.js resource it creates and disposes all of them on
 * unmount.
 */
export class FusionAiRenderer {
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private orbGeometry: THREE.IcosahedronGeometry | null = null;
  private orbAMaterial: THREE.MeshBasicMaterial | null = null;
  private orbBMaterial: THREE.MeshBasicMaterial | null = null;
  private orbA: THREE.Mesh | null = null;
  private orbB: THREE.Mesh | null = null;
  private glowMaterial: THREE.SpriteMaterial | null = null;
  private glowTexture: THREE.CanvasTexture | null = null;
  private labelMaterial: THREE.SpriteMaterial | null = null;
  private labelTexture: THREE.CanvasTexture | null = null;
  private composer: BloomComposer | null = null;

  mount(canvas: HTMLCanvasElement, pixelRatioCap: number): void {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 7);

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
    this.renderer.setSize(width, height, false);
    this.composer = createBloomComposer(this.renderer, this.scene, this.camera, width, height);

    this.orbGeometry = new THREE.IcosahedronGeometry(0.7, 1);
    this.orbAMaterial = new THREE.MeshBasicMaterial({
      color: ORB_A_COLOR,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.orbBMaterial = new THREE.MeshBasicMaterial({
      color: ORB_B_COLOR,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.orbA = new THREE.Mesh(this.orbGeometry, this.orbAMaterial);
    this.orbB = new THREE.Mesh(this.orbGeometry, this.orbBMaterial);
    this.scene.add(this.orbA, this.orbB);

    this.glowTexture = createParticleTexture();
    this.glowMaterial = new THREE.SpriteMaterial({
      map: this.glowTexture,
      color: lerpColor(ORB_A_COLOR, ORB_B_COLOR, 0.5),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Sprite(this.glowMaterial);
    glow.scale.set(3.2, 3.2, 1);
    this.scene.add(glow);

    this.labelTexture = createLabelTexture();
    this.labelMaterial = new THREE.SpriteMaterial({
      map: this.labelTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const label = new THREE.Sprite(this.labelMaterial);
    label.scale.set(2.6, 0.65, 1);
    label.position.set(0, -1.4, 0);
    this.scene.add(label);
  }

  resize(cssWidth: number, cssHeight: number): void {
    if (!this.camera || !this.renderer || cssWidth === 0 || cssHeight === 0) return;
    this.camera.aspect = cssWidth / cssHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(cssWidth, cssHeight, false);
    this.composer?.resize(cssWidth, cssHeight);
  }

  render(state: FusionAiState, crossfadeOpacity: number): void {
    if (!this.renderer || !this.scene || !this.camera || !this.orbA || !this.orbB) return;

    this.camera.position.z = state.cameraZ;

    this.orbA.position.x = state.orbAX;
    this.orbB.position.x = state.orbBX;
    this.orbA.scale.setScalar(state.orbScale);
    this.orbB.scale.setScalar(state.orbScale);
    this.orbA.rotation.y += 0.006;
    this.orbB.rotation.y -= 0.006;

    if (this.orbAMaterial) this.orbAMaterial.opacity = 0.85 * crossfadeOpacity;
    if (this.orbBMaterial) this.orbBMaterial.opacity = 0.85 * crossfadeOpacity;
    if (this.glowMaterial) this.glowMaterial.opacity = state.fusionGlowOpacity * crossfadeOpacity;
    if (this.labelMaterial) this.labelMaterial.opacity = state.labelOpacity * crossfadeOpacity;

    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  unmount(): void {
    this.orbGeometry?.dispose();
    this.orbAMaterial?.dispose();
    this.orbBMaterial?.dispose();
    this.glowMaterial?.dispose();
    this.glowTexture?.dispose();
    this.labelMaterial?.dispose();
    this.labelTexture?.dispose();
    this.composer?.dispose();
    // See GenesisRenderer.unmount() — forceContextLoss() frees the WebGL
    // context immediately instead of waiting on garbage collection.
    this.renderer?.forceContextLoss();
    this.renderer?.dispose();

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.orbGeometry = null;
    this.orbAMaterial = null;
    this.orbBMaterial = null;
    this.orbA = null;
    this.orbB = null;
    this.glowMaterial = null;
    this.glowTexture = null;
    this.labelMaterial = null;
    this.labelTexture = null;
    this.composer = null;
  }
}
