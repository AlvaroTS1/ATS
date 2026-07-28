import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export interface BloomComposer {
  render(): void;
  resize(cssWidth: number, cssHeight: number): void;
  dispose(): void;
}

/**
 * Shared, elegant bloom pass for the two procedural (Three.js) scenes —
 * Fusion AI's converging forms and Return's collapsing embers both live or
 * die by how believable their glow reads. Tuned deliberately restrained
 * (low strength, tight radius) per `ART_DIRECTION.md`: energy, not haze.
 *
 * A single shared factory instead of one composer per scene keeps the
 * tuning consistent and the disposal logic (a real leak risk with
 * postprocessing passes) written exactly once.
 */
export function createBloomComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  width: number,
  height: number,
): BloomComposer {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.55, 0.4, 0.15);
  composer.addPass(bloomPass);

  return {
    render(): void {
      composer.render();
    },
    resize(cssWidth: number, cssHeight: number): void {
      composer.setSize(cssWidth, cssHeight);
      bloomPass.setSize(cssWidth, cssHeight);
    },
    dispose(): void {
      composer.dispose();
    },
  };
}
