import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { CHAPTER_RANGES, ecosystemFocus, localOf } from '../chapters';
import {
  BRAND,
  createFresnelMaterial,
  createHaloSprite,
  createHaloTexture,
  createLineMaterial,
  createPointsMaterial,
} from './materials';
import {
  CHAIN_BLOCKS,
  cameraPoseAt,
  chainBlockPosition,
  easeInOutCubic,
  merkleLevels,
  orbitPoint,
  productAngle,
  type Vec3,
} from './layout';

export type Tier = 'high' | 'low';

export interface WorldProduct {
  id: string;
  from: string;
  to: string;
  soon: boolean;
}

export interface ScreenPoint {
  x: number;
  y: number;
  /** false when behind the camera or off screen */
  visible: boolean;
}

/** What the host reads after each rendered frame to place DOM labels in 3D space. */
export interface WorldFrame {
  progress: number;
  products: ScreenPoint[];
  groups: ScreenPoint[];
  chainRoot: ScreenPoint;
  quality: 'full' | 'reduced' | 'minimal';
}

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};

/** Groups of the Inteligência network: human, AI, engineering. */
const GROUP_COLORS = [BRAND.white, BRAND.glow, BRAND.violet];

/**
 * The Core World: one renderer, one scene, one camera, every chapter.
 *
 * A single persistent world (instead of a scene per chapter) is what makes
 * the journey read as ONE place the camera moves through: the core you see
 * in chapter 1 is the same object the products orbit in chapter 3 and the
 * chain sits under in chapter 4. Each system below only reads the progress
 * of the chapter it belongs to and is otherwise idle.
 *
 * Performance contract (same as `cinematic/ART_DIRECTION.md`): no
 * per-frame allocation, all motion in shaders where possible, emissive +
 * additive materials only, and the frame loop sleeps when the host says
 * the stage is off screen.
 */
export class CoreWorld {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(45, 1, 0.05, 200);
  private composer: EffectComposer | null = null;
  private bloom: UnrealBloomPass | null = null;
  private lastTime = 0;
  private elapsed = 0;
  private raf: number | null = null;
  private active = true;
  private disposed = false;

  private progress = 0;
  private pointer = new THREE.Vector2(0, 0);
  /** Velocidade da jornada, suavizada: 0 parado, 1 rolagem rápida. */
  private warp = 0;
  private warpSign = 1;
  private prevProgress = -1;
  private warpSpin = 0;
  private pointerEased = new THREE.Vector2(0, 0);
  private width = 1;
  private height = 1;
  private dprCap: number;
  private quality: WorldFrame['quality'] = 'full';
  private frameTimes: number[] = [];
  private warmupFrames = 120;

  // systems
  private core = new THREE.Group();
  private coreBody!: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>;
  private coreShell!: THREE.LineSegments;
  private coreRings: THREE.Mesh[] = [];
  private coreHalo!: THREE.Sprite;
  private stars!: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private dust!: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;

  private network = new THREE.Group();
  private netNodes!: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private netEdges!: THREE.LineSegments<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private netPulses!: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private groupCentroids: THREE.Vector3[] = [];

  private eco = new THREE.Group();
  private orbitLine!: THREE.LineLoop<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private orbitPointCount = 256;
  private productBodies: {
    group: THREE.Group;
    body: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
    ring: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
    halo: THREE.Sprite;
    wire?: THREE.LineSegments;
    soon: boolean;
    scale: number;
  }[] = [];
  private link!: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private linkPositions = new Float32Array(6);

  private chain = new THREE.Group();
  private blocks: { edges: THREE.LineSegments<THREE.EdgesGeometry, THREE.LineBasicMaterial>; fill: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial> }[] = [];
  private chainLinks!: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private merkle!: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  private merkleNodes!: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private merkleSegmentLevel: number[] = [];
  private merkleBaseColors!: Float32Array;
  private rootPos = new THREE.Vector3();
  private anchorRing!: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  private beam!: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>;
  private grid!: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>;

  private haloTex = createHaloTexture();
  private tmp = new THREE.Vector3();
  private tmpColor = new THREE.Color();
  private frameOut: WorldFrame;

  onFrame: ((frame: WorldFrame) => void) | null = null;
  onQualityChange: ((q: WorldFrame['quality']) => void) | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    private readonly products: WorldProduct[],
    private readonly tier: Tier,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: tier === 'high',
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x030712, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.dprCap = tier === 'high' ? 1.75 : 1.25;
    this.scene.fog = new THREE.FogExp2(0x030712, 0.018);

    this.buildStars();
    this.buildCore();
    this.buildNetwork();
    this.buildEcosystem();
    this.buildChain();

    this.scene.add(this.core, this.network, this.eco, this.chain);

    this.frameOut = {
      progress: 0,
      products: products.map(() => ({ x: 0, y: 0, visible: false })),
      groups: GROUP_COLORS.map(() => ({ x: 0, y: 0, visible: false })),
      chainRoot: { x: 0, y: 0, visible: false },
      quality: this.quality,
    };

    if (tier === 'high') this.enableBloom();
  }

  // ── construction ───────────────────────────────────────────────────────

  private buildStars(): void {
    const count = this.tier === 'high' ? 2200 : 800;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // deterministic pseudo-random (no Math.random — reproducible frames)
      const u = fract(Math.sin(i * 12.9898) * 43758.5453);
      const v = fract(Math.sin(i * 78.233) * 12345.6789);
      const w = fract(Math.sin(i * 39.425) * 24634.6345);
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const r = 34 + w * 46;
      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.cos(phi) * r * 0.7;
      pos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
      const c = w > 0.85 ? BRAND.violet : w > 0.5 ? BRAND.cyan : BRAND.white;
      col[i * 3] = c.r * 0.55;
      col[i * 3 + 1] = c.g * 0.55;
      col[i * 3 + 2] = c.b * 0.55;
      size[i] = 0.09 + u * 0.16;
      seed[i] = v;
    }
    this.stars = new THREE.Points(geometryOf(pos, col, size, seed), createPointsMaterial());
    this.scene.add(this.stars);

    const dCount = this.tier === 'high' ? 420 : 160;
    const dPos = new Float32Array(dCount * 3);
    const dCol = new Float32Array(dCount * 3);
    const dSize = new Float32Array(dCount);
    const dSeed = new Float32Array(dCount);
    for (let i = 0; i < dCount; i++) {
      const u = fract(Math.sin(i * 91.17) * 43758.5453);
      const v = fract(Math.sin(i * 17.31) * 24634.6345);
      const w = fract(Math.sin(i * 53.77) * 12345.6789);
      dPos[i * 3] = (u - 0.5) * 30;
      dPos[i * 3 + 1] = (v - 0.5) * 22 - 3;
      dPos[i * 3 + 2] = (w - 0.5) * 30;
      dCol[i * 3] = BRAND.cyan.r * 0.35;
      dCol[i * 3 + 1] = BRAND.cyan.g * 0.35;
      dCol[i * 3 + 2] = BRAND.cyan.b * 0.35;
      dSize[i] = 0.03 + w * 0.04;
      dSeed[i] = u;
    }
    this.dust = new THREE.Points(geometryOf(dPos, dCol, dSize, dSeed), createPointsMaterial());
    this.scene.add(this.dust);
  }

  private buildCore(): void {
    this.coreBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 48, 32),
      createFresnelMaterial(BRAND.white, BRAND.cyan, 0.9),
    );
    this.core.add(this.coreBody);

    const shellGeo = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.05, 1));
    this.coreShell = new THREE.LineSegments(
      shellGeo,
      new THREE.LineBasicMaterial({ color: BRAND.cyan, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    this.core.add(this.coreShell);

    const ringSpecs: [number, number, number][] = [
      [1.35, 1.15, 0.2],
      [1.6, 0.4, 1.1],
      [1.9, -0.6, -0.5],
    ];
    for (const [r, rx, rz] of ringSpecs) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.006, 6, 160),
        new THREE.MeshBasicMaterial({ color: BRAND.cyan, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      ring.rotation.set(rx, 0, rz);
      this.coreRings.push(ring);
      this.core.add(ring);
    }

    this.coreHalo = createHaloSprite(this.haloTex, BRAND.cyan, 5.5);
    this.core.add(this.coreHalo);
  }

  private buildNetwork(): void {
    const n = this.tier === 'high' ? 340 : 150;
    const unit: THREE.Vector3[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      const jitter = 0.86 + 0.14 * fract(Math.sin(i * 7.13) * 4375.85);
      unit.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(jitter));
    }
    // group by longitude thirds: three "kinds" of intelligence on one sphere
    const groupOf = (v: THREE.Vector3) => {
      const a = (Math.atan2(v.z, v.x) + Math.PI) / (Math.PI * 2);
      return Math.min(2, Math.floor(a * 3));
    };
    const groupDirs = [0, 1, 2].map((g) => {
      const a = ((g + 0.5) / 3) * Math.PI * 2 - Math.PI;
      return new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
    });
    this.groupCentroids = groupDirs.map((d) => d.clone().multiplyScalar(0.75));

    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const seed = new Float32Array(n);
    const gdir = new Float32Array(n * 3);
    const groups: number[] = [];
    unit.forEach((v, i) => {
      const g = groupOf(v);
      groups.push(g);
      pos.set([v.x, v.y, v.z], i * 3);
      const c = GROUP_COLORS[g];
      col.set([c.r, c.g, c.b], i * 3);
      size[i] = 0.07 + fract(Math.sin(i * 3.7) * 9631.1) * 0.07;
      seed[i] = fract(Math.sin(i * 1.37) * 7919.3);
      gdir.set([groupDirs[g].x, groupDirs[g].y, groupDirs[g].z], i * 3);
    });

    // edges: k nearest neighbours, computed once on the unit sphere
    const k = 3;
    const edgeSet = new Set<string>();
    const edges: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const d: [number, number][] = [];
      for (let j = 0; j < n; j++) if (j !== i) d.push([unit[i].distanceToSquared(unit[j]), j]);
      d.sort((a, b) => a[0] - b[0]);
      for (let m = 0; m < k; m++) {
        const j = d[m][1];
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push([i, j]);
        }
      }
    }

    const sepUniform = { value: 0 };
    const mergeUniform = { value: 0 };
    const pointerUniform = { value: new THREE.Vector3(99, 99, 99) };
    const sharedUniforms = { uSep: sepUniform, uMerge: mergeUniform, uPointer: pointerUniform };

    // nodes
    const nodeGeo = geometryOf(pos, col, size, seed);
    nodeGeo.setAttribute('aGroupDir', new THREE.BufferAttribute(gdir, 3));
    this.netNodes = new THREE.Points(
      nodeGeo,
      createPointsMaterial(
        /* glsl */ `
        p += aGroupDir * uSep;
        float dp = distance(p, uPointer);
        glow = 1.0 + 1.6 * smoothstep(0.9, 0.0, dp);
      `,
        sharedUniforms,
      ),
    );
    prependAttributes(this.netNodes.material, 'attribute vec3 aGroupDir;\nuniform float uSep;\nuniform vec3 uPointer;\n');

    // edges — custom shader so they follow the same group separation, and
    // cross-group edges only appear once the groups have merged
    const ePos = new Float32Array(edges.length * 6);
    const eCol = new Float32Array(edges.length * 6);
    const eDir = new Float32Array(edges.length * 6);
    const eCross = new Float32Array(edges.length * 2);
    edges.forEach(([a, b], e) => {
      ePos.set([unit[a].x, unit[a].y, unit[a].z, unit[b].x, unit[b].y, unit[b].z], e * 6);
      const ca = GROUP_COLORS[groups[a]];
      const cb = GROUP_COLORS[groups[b]];
      eCol.set([ca.r, ca.g, ca.b, cb.r, cb.g, cb.b], e * 6);
      const da = groupDirs[groups[a]];
      const db = groupDirs[groups[b]];
      eDir.set([da.x, da.y, da.z, db.x, db.y, db.z], e * 6);
      const cross = groups[a] !== groups[b] ? 1 : 0;
      eCross[e * 2] = cross;
      eCross[e * 2 + 1] = cross;
    });
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
    edgeGeo.setAttribute('aColor', new THREE.BufferAttribute(eCol, 3));
    edgeGeo.setAttribute('aGroupDir', new THREE.BufferAttribute(eDir, 3));
    edgeGeo.setAttribute('aCross', new THREE.BufferAttribute(eCross, 1));
    this.netEdges = new THREE.LineSegments(
      edgeGeo,
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { ...sharedUniforms, uFade: { value: 1 } },
        vertexShader: /* glsl */ `
          attribute vec3 aColor;
          attribute vec3 aGroupDir;
          attribute float aCross;
          uniform float uSep;
          uniform float uMerge;
          uniform vec3 uPointer;
          varying vec3 vColor;
          void main() {
            vec3 p = position + aGroupDir * uSep;
            float near = smoothstep(1.1, 0.0, distance(p, uPointer));
            float vis = mix(1.0, uMerge, aCross);
            vColor = aColor * vis * (0.28 + 0.9 * near);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uFade;
          varying vec3 vColor;
          void main() {
            gl_FragColor = vec4(vColor * uFade, 1.0);
            #include <colorspace_fragment>
          }
        `,
      }),
    );

    // signals travelling along edges — entirely in the vertex shader
    const pulseCount = this.tier === 'high' ? 140 : 60;
    const pA = new Float32Array(pulseCount * 3);
    const pB = new Float32Array(pulseCount * 3);
    const pDA = new Float32Array(pulseCount * 3);
    const pDB = new Float32Array(pulseCount * 3);
    const pCol = new Float32Array(pulseCount * 3);
    const pSize = new Float32Array(pulseCount);
    const pSeed = new Float32Array(pulseCount);
    const pCross = new Float32Array(pulseCount);
    for (let i = 0; i < pulseCount; i++) {
      const e = edges[Math.floor(fract(Math.sin(i * 4.1) * 9999.1) * edges.length)];
      const [a, b] = e;
      pA.set([unit[a].x, unit[a].y, unit[a].z], i * 3);
      pB.set([unit[b].x, unit[b].y, unit[b].z], i * 3);
      pDA.set([groupDirs[groups[a]].x, 0, groupDirs[groups[a]].z], i * 3);
      pDB.set([groupDirs[groups[b]].x, 0, groupDirs[groups[b]].z], i * 3);
      pCol.set([1, 1, 1], i * 3);
      pSize[i] = 0.09;
      pSeed[i] = fract(Math.sin(i * 2.9) * 3131.7);
      pCross[i] = groups[a] !== groups[b] ? 1 : 0;
    }
    const pulseGeo = new THREE.BufferGeometry();
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pA, 3));
    pulseGeo.setAttribute('aB', new THREE.BufferAttribute(pB, 3));
    pulseGeo.setAttribute('aDirA', new THREE.BufferAttribute(pDA, 3));
    pulseGeo.setAttribute('aDirB', new THREE.BufferAttribute(pDB, 3));
    pulseGeo.setAttribute('aColor', new THREE.BufferAttribute(pCol, 3));
    pulseGeo.setAttribute('aSize', new THREE.BufferAttribute(pSize, 1));
    pulseGeo.setAttribute('aSeed', new THREE.BufferAttribute(pSeed, 1));
    pulseGeo.setAttribute('aCross', new THREE.BufferAttribute(pCross, 1));
    this.netPulses = new THREE.Points(
      pulseGeo,
      createPointsMaterial(
        /* glsl */ `
        float tt = fract(uTime * (0.25 + aSeed * 0.35) + aSeed * 7.0);
        p = mix(position + aDirA * uSep, aB + aDirB * uSep, tt);
        glow = sin(tt * 3.14159) * mix(1.0, uMerge, aCross);
      `,
        sharedUniforms,
      ),
    );
    prependAttributes(
      this.netPulses.material,
      'attribute vec3 aB;\nattribute vec3 aDirA;\nattribute vec3 aDirB;\nattribute float aCross;\nuniform float uSep;\nuniform float uMerge;\nuniform vec3 uPointer;\n',
    );

    this.network.add(this.netEdges, this.netNodes, this.netPulses);
    this.network.visible = false;
  }

  private buildEcosystem(): void {
    const pts = new Float32Array(this.orbitPointCount * 3);
    const cols = new Float32Array(this.orbitPointCount * 3);
    for (let i = 0; i < this.orbitPointCount; i++) {
      const p = orbitPoint((i / this.orbitPointCount) * Math.PI * 2);
      pts.set(p, i * 3);
      cols.set([BRAND.cyan.r * 0.45, BRAND.cyan.g * 0.45, BRAND.cyan.b * 0.45], i * 3);
    }
    const orbitGeo = new THREE.BufferGeometry();
    orbitGeo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    orbitGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    this.orbitLine = new THREE.LineLoop(orbitGeo, createLineMaterial(1));
    this.eco.add(this.orbitLine);

    for (const product of this.products) {
      const from = new THREE.Color(product.from);
      const to = new THREE.Color(product.to);
      const group = new THREE.Group();
      const bodyGeo = product.soon ? new THREE.IcosahedronGeometry(0.3, 1) : new THREE.SphereGeometry(0.32, 32, 24);
      const body = new THREE.Mesh(bodyGeo, createFresnelMaterial(to, from, product.soon ? 0.55 : 1));
      group.add(body);
      let wire: THREE.LineSegments | undefined;
      if (product.soon) {
        // under construction: the structure is visible, the energy isn't full yet
        wire = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.42, 1)),
          new THREE.LineBasicMaterial({ color: from, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }),
        );
        group.add(wire);
      }
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.56, 0.007, 6, 96),
        new THREE.MeshBasicMaterial({ color: from, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      ring.rotation.x = Math.PI / 2.4;
      group.add(ring);
      const halo = createHaloSprite(this.haloTex, from, 1.15);
      group.add(halo);
      this.eco.add(group);
      this.productBodies.push({ group, body, ring, halo, wire, soon: product.soon, scale: 1 });
    }

    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.BufferAttribute(this.linkPositions, 3));
    const linkCols = new Float32Array([BRAND.white.r, BRAND.white.g, BRAND.white.b, 1, 1, 1]);
    linkGeo.setAttribute('color', new THREE.BufferAttribute(linkCols, 3));
    this.link = new THREE.Line(linkGeo, createLineMaterial(0));
    this.eco.add(this.link);
    this.eco.visible = false;
  }

  private buildChain(): void {
    const boxGeo = new THREE.BoxGeometry(0.72, 0.72, 0.72);
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    for (let i = 0; i < CHAIN_BLOCKS; i++) {
      const [x, y, z] = chainBlockPosition(i);
      const edges = new THREE.LineSegments(
        edgesGeo,
        new THREE.LineBasicMaterial({ color: BRAND.cyan, transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      const fill = new THREE.Mesh(
        boxGeo,
        new THREE.MeshBasicMaterial({ color: BRAND.deep, transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      edges.position.set(x, y, z);
      fill.position.set(x, y, z);
      edges.rotation.y = fill.rotation.y = 0.35;
      this.chain.add(fill, edges);
      this.blocks.push({ edges, fill });
    }

    // hash links between consecutive blocks
    const lp = new Float32Array((CHAIN_BLOCKS - 1) * 6);
    const lc = new Float32Array((CHAIN_BLOCKS - 1) * 6);
    for (let i = 0; i < CHAIN_BLOCKS - 1; i++) {
      const a = chainBlockPosition(i);
      const b = chainBlockPosition(i + 1);
      lp.set([a[0] + 0.36, a[1], a[2], b[0] - 0.36, b[1], b[2]], i * 6);
      lc.set([0, 0, 0, 0, 0, 0], i * 6);
    }
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.BufferAttribute(lp, 3));
    linkGeo.setAttribute('color', new THREE.BufferAttribute(lc, 3));
    this.chainLinks = new THREE.LineSegments(linkGeo, createLineMaterial(1));
    this.chain.add(this.chainLinks);

    // Merkle tree above the blocks, converging to one root
    const levels = merkleLevels();
    const segs: number[] = [];
    const segLevel: number[] = [];
    // vertical stems from each block to its leaf
    for (let i = 0; i < CHAIN_BLOCKS; i++) {
      const b = chainBlockPosition(i);
      const leaf = levels[0][i];
      segs.push(b[0], b[1] + 0.36, b[2], leaf[0], leaf[1], leaf[2]);
      segLevel.push(0);
    }
    for (let l = 0; l < levels.length - 1; l++) {
      levels[l].forEach((node, i) => {
        const parent = levels[l + 1][Math.floor(i / 2)];
        segs.push(node[0], node[1], node[2], parent[0], parent[1], parent[2]);
        segLevel.push(l + 1);
      });
    }
    this.merkleSegmentLevel = segLevel;
    const mp = new Float32Array(segs);
    this.merkleBaseColors = new Float32Array(mp.length);
    for (let i = 0; i < mp.length / 3; i++) this.merkleBaseColors.set([BRAND.cyan.r, BRAND.cyan.g, BRAND.cyan.b], i * 3);
    const mc = new Float32Array(mp.length);
    const merkleGeo = new THREE.BufferGeometry();
    merkleGeo.setAttribute('position', new THREE.BufferAttribute(mp, 3));
    merkleGeo.setAttribute('color', new THREE.BufferAttribute(mc, 3));
    this.merkle = new THREE.LineSegments(merkleGeo, createLineMaterial(1));
    this.chain.add(this.merkle);

    const allNodes = levels.flat();
    const np = new Float32Array(allNodes.length * 3);
    const nc = new Float32Array(allNodes.length * 3);
    const ns = new Float32Array(allNodes.length);
    const nsd = new Float32Array(allNodes.length);
    allNodes.forEach((p, i) => {
      np.set(p, i * 3);
      nc.set([0, 0, 0], i * 3);
      ns[i] = i === allNodes.length - 1 ? 0.34 : 0.14;
      nsd[i] = i / allNodes.length;
    });
    this.merkleNodes = new THREE.Points(geometryOf(np, nc, ns, nsd), createPointsMaterial());
    this.chain.add(this.merkleNodes);

    const root = levels[levels.length - 1][0];
    this.rootPos.set(root[0], root[1], root[2]);
    this.anchorRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.012, 6, 6),
      new THREE.MeshBasicMaterial({ color: BRAND.white, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    this.anchorRing.position.set(root[0], root[1] + 2.4, root[2]);
    this.anchorRing.rotation.x = Math.PI / 2;
    this.beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 2.4, 6, 1, true),
      new THREE.MeshBasicMaterial({ color: BRAND.glow, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    this.beam.position.set(root[0], root[1] + 1.2, root[2]);
    this.chain.add(this.anchorRing, this.beam);

    // infrastructure floor — fades with distance, baked into vertex colours
    const gp: number[] = [];
    const gc: number[] = [];
    const half = 16;
    const y = chainBlockPosition(0)[1] - 0.9;
    const pushLine = (x1: number, z1: number, x2: number, z2: number) => {
      gp.push(x1, y, z1, x2, y, z2);
      for (const [x, z] of [
        [x1, z1],
        [x2, z2],
      ]) {
        const f = Math.max(0, 1 - Math.hypot(x, z) / half) * 0.35;
        gc.push(BRAND.cyan.r * f, BRAND.cyan.g * f, BRAND.cyan.b * f);
      }
    };
    for (let i = -half; i <= half; i += 1) {
      for (let s = -half; s < half; s += 2) {
        pushLine(i, s, i, s + 2);
        pushLine(s, i, s + 2, i);
      }
    }
    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(gp), 3));
    gridGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(gc), 3));
    this.grid = new THREE.LineSegments(gridGeo, createLineMaterial(1));
    this.chain.add(this.grid);
    this.chain.visible = false;
  }

  private enableBloom(): void {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(this.width, this.height), 0.7, 0.42, 0.3);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.composer.setSize(this.width, this.height);
  }

  private disableBloom(): void {
    this.composer?.dispose();
    this.composer = null;
    this.bloom = null;
  }

  // ── public API ─────────────────────────────────────────────────────────

  setProgress(p: number): void {
    this.progress = clamp01(p);
  }

  /** Pointer in normalised device coords, -1..1 (y up). */
  setPointer(x: number, y: number): void {
    this.pointer.set(x, y);
  }

  /** The host turns the loop off while the stage is off screen. */
  setActive(active: boolean): void {
    if (this.active === active) return;
    this.active = active;
    if (active) this.start();
    else this.stop();
  }

  resize(w: number, h: number): void {
    this.width = Math.max(1, w);
    this.height = Math.max(1, h);
    const dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.composer?.setSize(this.width, this.height);
    this.updatePointScale();
  }

  start(): void {
    if (this.raf !== null || this.disposed) return;
    this.lastTime = performance.now();
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      this.frame();
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    if (this.raf !== null) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  dispose(): void {
    this.disposed = true;
    this.stop();
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      mesh.geometry?.dispose?.();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose?.();
    });
    this.haloTex.dispose();
    this.disableBloom();
    this.renderer.forceContextLoss();
    this.renderer.dispose();
  }

  /** Renders exactly one frame now (used for the first paint and by tests/screenshots). */
  renderOnce(): void {
    this.frame();
  }

  // ── frame ──────────────────────────────────────────────────────────────

  private updatePointScale(): void {
    const scale = (this.height * this.renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2));
    const mats = [this.stars, this.dust, this.netNodes, this.netPulses, this.merkleNodes].map((p) => p.material);
    for (const m of mats) m.uniforms.uScale.value = scale;
  }

  private frame(): void {
    const now = performance.now();
    const dt = Math.min(0.1, Math.max(0, (now - this.lastTime) / 1000));
    this.lastTime = now;
    this.elapsed += dt;
    const time = this.elapsed;
    this.trackPerformance(dt);

    const p = this.progress;
    const r = CHAPTER_RANGES;
    const nucleo = localOf(p, 'nucleo', r);
    const intel = localOf(p, 'inteligencia', r);
    const ecoL = localOf(p, 'ecossistema', r);
    const inov = localOf(p, 'inovacao', r);
    const fut = localOf(p, 'futuro', r);
    const inIntel = p >= r[1].start;
    const inEco = p >= r[2].start;
    const inInov = p >= r[3].start;
    const inFut = p >= r[4].start;

    // pointer eases — the world has mass
    this.pointerEased.lerp(this.pointer, 1 - Math.pow(0.001, dt));

    // Velocidade da jornada → "impulso": a rolagem rápida abre a lente,
    // inclina a câmera na curva, acelera a poeira e acende o bloom. Parar
    // devolve tudo devagar — é isso que dá a sensação de massa e de
    // estar viajando por um lugar, e não de rolar uma página.
    if (this.prevProgress < 0) this.prevProgress = p;
    const speed = dt > 0 ? (p - this.prevProgress) / dt : 0;
    this.prevProgress = p;
    // saltos de âncora (snap) não são viagem: ignorados
    const warpTarget = Math.abs(speed) > 2 ? 0 : clamp01(Math.abs(speed) / 0.22);
    const warpRate = warpTarget > this.warp ? 1 - Math.pow(0.004, dt) : 1 - Math.pow(0.15, dt);
    this.warp += (warpTarget - this.warp) * warpRate;
    if (Math.abs(speed) > 0.01) this.warpSign = Math.sign(speed);
    const warp = this.warp;

    // camera
    const pose = cameraPoseAt(p, this.products.length, CHAPTER_RANGES, this.width / this.height);
    const right = this.tmp.set(1, 0, 0);
    // respiração: um micro-balanço contínuo, como uma câmera na mão
    const breathe = Math.sin(time * 0.55) * 0.035;
    this.camera.position.set(
      pose.position[0] + this.pointerEased.x * 0.35 * right.x + Math.sin(time * 0.37) * 0.025,
      pose.position[1] + this.pointerEased.y * 0.22 + breathe,
      pose.position[2],
    );
    this.camera.lookAt(pose.target[0], pose.target[1], pose.target[2]);
    // inclinação na curva: segue o ponteiro/giroscópio e a direção da viagem
    this.camera.rotateZ(-this.pointerEased.x * 0.035 + this.warpSign * warp * 0.025);
    const fov = pose.fov + warp * 9;
    if (Math.abs(this.camera.fov - fov) > 0.01) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
      this.updatePointScale();
    }

    // stars & dust: always alive — e correm junto com a viagem
    this.warpSpin += dt * warp * this.warpSign;
    this.stars.rotation.y = time * 0.004 + p * 0.6 + this.warpSpin * 0.05;
    this.dust.rotation.y = -time * 0.01 - this.warpSpin * 0.35;
    this.stars.material.uniforms.uTime.value = time;
    this.dust.material.uniforms.uTime.value = time;

    // ── core ──
    const coreReveal = smooth(0.62, 0.92, nucleo);
    const finale = smooth(0.5, 1, fut);
    const { index: ecoFocusNow } = ecosystemFocus(ecoL, this.products.length);
    const chapterDim = inFut ? 1 : inInov ? 0.3 : inEco ? (ecoFocusNow >= 0 ? 0.22 : 0.55) : inIntel ? 0.72 : 1;
    const coreIntensity = coreReveal * (0.85 + finale * 0.5) * chapterDim;
    this.coreBody.material.uniforms.uTime.value = time;
    this.coreBody.material.uniforms.uFade.value = coreIntensity;
    const pulse = 1 + Math.sin(time * 1.6) * 0.025;
    this.coreBody.scale.setScalar(pulse * (1 + finale * 0.12));
    (this.coreShell.material as THREE.LineBasicMaterial).opacity = 0.45 * coreReveal * (1 - smooth(0.05, 0.4, intel) * 0.5);
    this.coreShell.rotation.set(time * 0.05 + this.pointerEased.y * 0.3, time * 0.08 + this.pointerEased.x * 0.4, 0);
    this.coreShell.scale.setScalar(1 + smooth(0.0, 0.5, intel) * 0.25);
    this.coreRings.forEach((ring, i) => {
      ring.rotation.z += dt * (0.05 + i * 0.03) * (i % 2 ? -1 : 1);
      ring.rotation.y = time * 0.03 * (i + 1);
      (ring.material as THREE.MeshBasicMaterial).opacity = 0.5 * coreReveal * (0.6 + finale * 0.6);
    });
    (this.coreHalo.material as THREE.SpriteMaterial).opacity = 0.32 * coreReveal * chapterDim * (1 + finale * 0.6);
    this.coreHalo.scale.setScalar(3.6 + finale * 1.6 + Math.sin(time * 1.1) * 0.1);

    // ── network (Inteligência) ──
    const netVisible = inIntel && p < r[3].end;
    this.network.visible = netVisible;
    if (netVisible) {
      const expand = easeInOutCubic(smooth(0.0, 0.42, intel));
      const sep = 1.4 * smooth(0.05, 0.3, intel) * (1 - smooth(0.45, 0.8, intel));
      const merge = smooth(0.5, 0.85, intel);
      // in Ecossistema the network becomes a quiet shell around the core
      const shrink = smooth(0.0, 0.25, ecoL);
      const radius = (0.3 + expand * 2.9) * (1 - shrink * 0.32);
      this.network.scale.setScalar(radius);
      this.network.rotation.y = time * 0.03 + intel * 1.2 + this.pointerEased.x * 0.25;
      this.network.rotation.x = this.pointerEased.y * 0.15;
      const focusDim = ecoFocusNow >= 0 && !inInov ? 0.45 : 1;
      const fade = smooth(0.0, 0.12, intel) * (1 - shrink * 0.65) * focusDim * (1 - smooth(0.0, 0.3, inov));
      const nu = this.netNodes.material.uniforms;
      nu.uSep.value = sep;
      nu.uMerge.value = merge;
      nu.uTime.value = time;
      nu.uFade.value = fade;
      this.netEdges.material.uniforms.uFade.value = fade * 0.9;
      this.netPulses.material.uniforms.uTime.value = time;
      this.netPulses.material.uniforms.uFade.value = fade * (0.4 + merge * 0.6);
      // pointer → network local space (on the plane facing the camera through the origin)
      this.updatePointerInNetwork();
    }

    // ── ecosystem ──
    const ecoVisible = inEco && p < r[3].end + 0.02;
    const ecoAppear = smooth(0.0, 0.14, ecoL);
    const ecoReturn = inFut ? smooth(0.2, 0.7, fut) : 0;
    const ecoLeave = inInov && !inFut ? 1 - smooth(0.0, 0.35, inov) * 0.95 : 1;
    const ecoFade = inFut ? Math.max(0.15, ecoReturn) : ecoAppear * ecoLeave;
    this.eco.visible = ecoVisible || inFut;
    if (this.eco.visible) {
      const drawn = Math.max(2, Math.floor(this.orbitPointCount * (inFut ? 1 : smooth(0.0, 0.16, ecoL))));
      this.orbitLine.geometry.setDrawRange(0, drawn);
      this.orbitLine.material.opacity = ecoFade;
      const { index: focus } = ecosystemFocus(ecoL, this.products.length);
      const ringLocal = inFut ? 1 + fut * 0.3 : ecoL;
      this.productBodies.forEach((pb, i) => {
        const a = productAngle(i, this.products.length, ringLocal);
        const pos = orbitPoint(a);
        const bob = Math.sin(time * 0.9 + i) * 0.05;
        pb.group.position.set(pos[0], pos[1] + bob, pos[2]);
        const appear = inFut ? ecoFade : smooth(i * 0.012, 0.1 + i * 0.012, ecoL) * ecoLeave;
        const isFocus = !inFut && focus === i;
        const target = isFocus ? 1.15 : 1;
        pb.scale += (target - pb.scale) * (1 - Math.pow(0.02, dt));
        pb.group.scale.setScalar(Math.max(0.001, pb.scale * (0.3 + 0.7 * appear)));
        pb.body.material.uniforms.uTime.value = time + i;
        pb.body.material.uniforms.uFade.value = appear * (focus >= 0 && !isFocus && !inFut ? 0.55 : 1);
        pb.ring.material.opacity = 0.75 * appear;
        pb.ring.rotation.z = time * 0.4 + i;
        (pb.halo.material as THREE.SpriteMaterial).opacity = appear * (isFocus ? 0.6 : 0.3);
        if (pb.wire) {
          pb.wire.rotation.set(time * 0.2, time * 0.3, 0);
          (pb.wire.material as THREE.LineBasicMaterial).opacity = 0.7 * appear;
        }
      });
      // energy link from the core to the product in focus
      if (focus >= 0 && !inInov) {
        const fp = this.productBodies[focus].group.position;
        this.linkPositions.set([0, 0, 0, fp.x, fp.y, fp.z]);
        this.link.geometry.attributes.position.needsUpdate = true;
        const { slice } = ecosystemFocus(ecoL, this.products.length);
        this.link.material.opacity = smooth(0.25, 0.45, slice) * (1 - smooth(0.9, 1, slice)) * 0.9;
      } else {
        this.link.material.opacity = 0;
      }
    }

    // ── chain (Inovação) ──
    const chainVisible = inInov || (inEco && ecoL > 0.9);
    this.chain.visible = chainVisible;
    if (chainVisible) {
      const build = inFut ? 1 : smooth(0.05, 0.75, inov);
      const chainFade = inFut ? 0.45 - finale * 0.15 : smooth(0.0, 0.2, inov) + (inEco && !inInov ? 0.2 : 0);
      this.blocks.forEach((b, i) => {
        const sealed = build * CHAIN_BLOCKS > i ? 1 : 0;
        const lit = sealed ? 1 : 0.35;
        b.edges.material.opacity = 0.75 * lit * chainFade;
        b.fill.material.opacity = 0.35 * sealed * chainFade;
        b.edges.rotation.y = b.fill.rotation.y = 0.35 + Math.sin(time * 0.5 + i) * 0.04;
      });
      const lc = this.chainLinks.geometry.attributes.color.array as Float32Array;
      for (let i = 0; i < CHAIN_BLOCKS - 1; i++) {
        const on = build * CHAIN_BLOCKS > i + 1 ? chainFade : 0;
        const flick = 0.75 + 0.25 * Math.sin(time * 3 + i);
        for (let v = 0; v < 2; v++) {
          lc[i * 6 + v * 3] = BRAND.glow.r * on * flick;
          lc[i * 6 + v * 3 + 1] = BRAND.glow.g * on * flick;
          lc[i * 6 + v * 3 + 2] = BRAND.glow.b * on * flick;
        }
      }
      this.chainLinks.geometry.attributes.color.needsUpdate = true;

      // Merkle tree builds level by level after the chain is sealed
      const tree = inFut ? 1 : smooth(0.45, 0.9, inov);
      const levelsCount = Math.max(...this.merkleSegmentLevel) + 1;
      const mc = this.merkle.geometry.attributes.color.array as Float32Array;
      this.merkleSegmentLevel.forEach((lvl, s) => {
        const on = smooth(lvl / levelsCount, (lvl + 1) / levelsCount, tree) * chainFade;
        for (let v = 0; v < 2; v++) {
          const k = s * 6 + v * 3;
          mc[k] = this.merkleBaseColors[k] * on * 0.8;
          mc[k + 1] = this.merkleBaseColors[k + 1] * on * 0.8;
          mc[k + 2] = this.merkleBaseColors[k + 2] * on * 0.8;
        }
      });
      this.merkle.geometry.attributes.color.needsUpdate = true;
      const nc = this.merkleNodes.geometry.attributes.aColor.array as Float32Array;
      const nodeCount = nc.length / 3;
      for (let i = 0; i < nodeCount; i++) {
        const isRoot = i === nodeCount - 1;
        const on = isRoot ? smooth(0.85, 1, tree) : smooth(0, 0.6, tree);
        const c = isRoot ? BRAND.white : BRAND.glow;
        nc[i * 3] = c.r * on * chainFade;
        nc[i * 3 + 1] = c.g * on * chainFade;
        nc[i * 3 + 2] = c.b * on * chainFade;
      }
      this.merkleNodes.geometry.attributes.aColor.needsUpdate = true;
      this.merkleNodes.material.uniforms.uTime.value = time;
      const anchor = inFut ? 1 : smooth(0.88, 1, inov);
      this.beam.material.opacity = 0.7 * anchor * chainFade;
      this.anchorRing.material.opacity = 0.9 * anchor * chainFade;
      this.anchorRing.rotation.z = time * 0.6;
      this.grid.material.opacity = chainFade;
    }

    // render
    if (this.composer) {
      if (this.bloom) this.bloom.strength = 0.65 + finale * 0.3 + this.warp * 0.35;
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    this.emitFrame();
  }

  private camDir = new THREE.Vector3();
  private rayDir = new THREE.Vector3();

  private updatePointerInNetwork(): void {
    // ray from camera through the pointer, intersected with the plane that
    // faces the camera through the origin — then into the network's local space
    const dir = this.rayDir.set(this.pointerEased.x, this.pointerEased.y, 0.5).unproject(this.camera);
    dir.sub(this.camera.position).normalize();
    this.camera.getWorldDirection(this.camDir);
    const denom = dir.dot(this.camDir);
    const t = denom !== 0 ? -this.camera.position.dot(this.camDir) / denom : 0;
    const hit = dir.multiplyScalar(t).add(this.camera.position);
    this.network.updateMatrixWorld();
    const local = this.network.worldToLocal(hit);
    (this.netNodes.material.uniforms.uPointer.value as THREE.Vector3).copy(local);
  }

  private project(v: THREE.Vector3, out: ScreenPoint): void {
    const p = this.tmp.copy(v).project(this.camera);
    out.visible = p.z < 1 && p.x > -1.2 && p.x < 1.2 && p.y > -1.2 && p.y < 1.2;
    out.x = (p.x * 0.5 + 0.5) * this.width;
    out.y = (-p.y * 0.5 + 0.5) * this.height;
  }

  private worldScratch = new THREE.Vector3();

  private emitFrame(): void {
    if (!this.onFrame) return;
    const f = this.frameOut;
    f.progress = this.progress;
    f.quality = this.quality;
    this.productBodies.forEach((pb, i) => this.project(pb.group.position, f.products[i]));
    this.network.updateMatrixWorld();
    this.groupCentroids.forEach((c, i) => {
      const sepUniform = this.netNodes.material.uniforms.uSep.value as number;
      this.worldScratch.copy(c).multiplyScalar(1 + sepUniform);
      this.network.localToWorld(this.worldScratch);
      this.project(this.worldScratch, f.groups[i]);
    });
    this.worldScratch.copy(this.rootPos);
    this.project(this.worldScratch, f.chainRoot);
    this.onFrame(f);
  }

  /** Adaptive quality: if frames are slow for a sustained stretch, step down once per level. */
  private trackPerformance(dt: number): void {
    if (dt <= 0) return;
    // shader compilation and first texture uploads make the first frames slow — ignore them
    if (this.warmupFrames > 0) {
      this.warmupFrames--;
      return;
    }
    this.frameTimes.push(dt);
    if (this.frameTimes.length < 90) return;
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.frameTimes.length = 0;
    if (avg > 0.026 && this.quality === 'full') {
      this.quality = 'reduced';
      this.disableBloom();
      this.onQualityChange?.(this.quality);
    } else if (avg > 0.03 && this.quality === 'reduced') {
      this.quality = 'minimal';
      this.dprCap = 1;
      this.resize(this.width, this.height);
      this.onQualityChange?.(this.quality);
    }
  }
}

function fract(x: number): number {
  return x - Math.floor(x);
}

function geometryOf(pos: Float32Array, col: Float32Array, size: Float32Array, seed: Float32Array): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  return g;
}

/** Injects extra attribute/uniform declarations ahead of a points shader's own. */
function prependAttributes(mat: THREE.ShaderMaterial, decl: string): void {
  mat.vertexShader = decl + mat.vertexShader;
}

export type { Vec3 };
