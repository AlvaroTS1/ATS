import * as THREE from 'three';

/**
 * Shaders shared by every system in the Core World. All of them follow the
 * house rule from `cinematic/ART_DIRECTION.md`: emissive colour, additive
 * blending, `depthWrite: false`, no real lights. In additive blending,
 * brightness IS visibility — so "fading" anything is just scaling its
 * colour toward black, which is why most fades below are a multiplier.
 */

const ADDITIVE = {
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
} as const;

/** Glowing sphere: hot centre, cyan rim, slow travelling bands. Used for the core and product bodies. */
export function createFresnelMaterial(inner: THREE.Color, rim: THREE.Color, intensity = 1): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    ...ADDITIVE,
    uniforms: {
      uInner: { value: inner.clone() },
      uRim: { value: rim.clone() },
      uIntensity: { value: intensity },
      uTime: { value: 0 },
      uFade: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN;
      varying vec3 vV;
      varying vec3 vObj;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vObj = position;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uInner;
      uniform vec3 uRim;
      uniform float uIntensity;
      uniform float uTime;
      uniform float uFade;
      varying vec3 vN;
      varying vec3 vV;
      varying vec3 vObj;
      void main() {
        float facing = max(dot(vN, vV), 0.0);
        float rim = pow(1.0 - facing, 2.4);
        float heart = pow(facing, 4.0);
        float bands = 0.5 + 0.5 * sin(normalize(vObj).y * 18.0 - uTime * 1.4);
        bands *= 0.5 + 0.5 * sin(atan(vObj.z, vObj.x) * 6.0 + uTime * 0.6);
        vec3 c = uInner * heart * 1.05 + uRim * rim * 1.6 + uRim * bands * 0.14;
        gl_FragColor = vec4(c * uIntensity * uFade, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

/**
 * Soft round points with world-space size. `aSize` is in world units and is
 * converted with `uScale` (= viewport height / (2 * tan(fov/2)), updated on
 * resize) so a node looks the same size whatever the screen resolution.
 */
export function createPointsMaterial(extraVertex = '', extraUniforms: Record<string, THREE.IUniform> = {}): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    ...ADDITIVE,
    uniforms: {
      uScale: { value: 500 },
      uTime: { value: 0 },
      uFade: { value: 1 },
      ...extraUniforms,
    },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aSeed;
      uniform float uScale;
      uniform float uTime;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        float glow = 1.0;
        ${extraVertex}
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float twinkle = 0.75 + 0.25 * sin(uTime * (0.8 + aSeed * 1.7) + aSeed * 31.0);
        vColor = aColor * twinkle * glow;
        vAlpha = 1.0;
        gl_PointSize = max(1.0, aSize * glow * uScale / max(0.1, -mv.z));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uFade;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        a = a * a;
        gl_FragColor = vec4(vColor * a * vAlpha * uFade, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

/** Lines with per-vertex colour and a global fade — additive, so colour = visibility. */
export function createLineMaterial(opacity = 1): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    ...ADDITIVE,
    vertexColors: true,
    opacity,
  });
}

/** A single soft halo billboard texture, built once on a small canvas. */
export function createHaloTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.18, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.45, 'rgba(255,255,255,0.12)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createHaloSprite(tex: THREE.Texture, color: THREE.Color, scale: number): THREE.Sprite {
  const mat = new THREE.SpriteMaterial({ ...ADDITIVE, map: tex, color: color.clone() });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.setScalar(scale);
  return sprite;
}

export const BRAND = {
  cyan: new THREE.Color('#29ABE2'),
  glow: new THREE.Color('#00D4FF'),
  violet: new THREE.Color('#A855F7'),
  white: new THREE.Color('#EAF6FF'),
  deep: new THREE.Color('#0B3D5C'),
};
