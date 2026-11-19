/**
 * Pure spatial layout of the Core World: where things are, and where the
 * camera is, for any global progress. No Three.js, no DOM — so the whole
 * camera choreography can be unit-tested and reasoned about as numbers.
 *
 * World axes: +Y up, camera looks roughly toward -Z at the start.
 * The core sits at the origin. The Ecossistema orbit circles it; the
 * Inovação chain lies below it at `CHAIN_Y` — the infrastructure under the
 * products, literally.
 */
import { CHAPTER_RANGES, ECOSYSTEM_ORDER, ecosystemFocus, type ChapterRange } from '../chapters';

export type Vec3 = [number, number, number];

export const ORBIT = { rx: 4.6, rz: 3.5, tilt: 0.26, y: 0 };
export const CHAIN_Y = -7.2;
export const CHAIN_BLOCKS = 8;
export const CHAIN_SPACING = 1.25;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Angle of product `i` on the orbit. The ring turns slowly as the chapter advances. */
export function productAngle(i: number, count: number, ecoLocal: number): number {
  return (i / count) * Math.PI * 2 + Math.PI / 2 - ecoLocal * 0.9;
}

/** A point on the tilted orbit ellipse. */
export function orbitPoint(angle: number, radiusScale = 1): Vec3 {
  const x = Math.cos(angle) * ORBIT.rx * radiusScale;
  const z = Math.sin(angle) * ORBIT.rz * radiusScale;
  // tilt around X so the far side rises slightly — reads as an orbit, not a table
  const y = ORBIT.y + z * Math.sin(ORBIT.tilt);
  return [x, y, z * Math.cos(ORBIT.tilt)];
}

export function chainBlockPosition(i: number): Vec3 {
  const x = (i - (CHAIN_BLOCKS - 1) / 2) * CHAIN_SPACING;
  return [x, CHAIN_Y + Math.sin(i * 0.9) * 0.08, Math.sin(i * 0.7) * 0.35];
}

/** Merkle tree node positions: levels from leaves (0) to root. */
export function merkleLevels(): Vec3[][] {
  const levels: Vec3[][] = [];
  let current = Array.from({ length: CHAIN_BLOCKS }, (_, i) => {
    const p = chainBlockPosition(i);
    return [p[0], p[1] + 1.15, p[2]] as Vec3;
  });
  levels.push(current);
  let y = current[0][1];
  while (current.length > 1) {
    y += 0.95;
    const next: Vec3[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const a = current[i];
      const b = current[i + 1] ?? a;
      next.push([(a[0] + b[0]) / 2, y, (a[2] + b[2]) / 2 * 0.5]);
    }
    levels.push(next);
    current = next;
  }
  return levels;
}

export interface CameraPose {
  position: Vec3;
  target: Vec3;
  fov: number;
}

/** Camera pose of each chapter as a function of its own local progress. */
function chapterPose(index: number, local: number, productCount: number, aspect: number): CameraPose {
  const t = easeInOutCubic(clamp01(local));
  switch (index) {
    case 0: // Núcleo — close on the core; footage owns most of this chapter
      return { position: [0, 0, lerp(4.8, 4.0, t)], target: [0, 0, 0], fov: 45 };
    case 1: {
      // Inteligência — pull back and rise as the network unfolds around the core
      const a = lerp(0, 0.55, t);
      const r = lerp(4.0, 10.5, t);
      return {
        position: [Math.sin(a) * r, lerp(0, 1.6, t), Math.cos(a) * r],
        target: [0, 0, 0],
        fov: lerp(45, aspect < 0.8 ? 62 : 50, t),
      };
    }
    case 2: {
      // Ecossistema — overview, then visit each product along the orbit
      const { index: focus, slice } = ecosystemFocus(local, productCount);
      const overview: CameraPose = { position: [3.2, 4.6, 13.2], target: [0, -0.4, 0], fov: aspect < 0.8 ? 66 : 50 };
      if (focus < 0) return overview;
      const angleAt = (k: number) => productAngle(k, productCount, local);
      // travel in the first 40% of a slice, hold for the rest — time to read
      const travel = easeInOutCubic(clamp01(slice / 0.4));
      const fromAngle = focus === 0 ? angleAt(0) : angleAt(focus - 1);
      const toAngle = angleAt(focus);
      const ang = focus === 0 ? toAngle : lerp(fromAngle, toAngle, travel);
      // frame the product off-centre (right on wide screens, high on tall
      // ones) so the panel has room and the core reads in the background
      const P = orbitPoint(ang);
      const radial: Vec3 = [Math.cos(ang), 0, Math.sin(ang)];
      const tangent: Vec3 = [-Math.sin(ang), 0, Math.cos(ang)];
      const portrait = aspect < 0.8;
      const side = portrait ? 0 : 1;
      const pose: CameraPose = {
        position: [
          P[0] + radial[0] * 2.9 - tangent[0] * 1.25 * side,
          P[1] + 0.75,
          P[2] + radial[2] * 2.9 - tangent[2] * 1.25 * side,
        ],
        target: [
          P[0] + tangent[0] * 0.95 * side,
          P[1] - (portrait ? 0.55 : 0.05),
          P[2] + tangent[2] * 0.95 * side,
        ],
        fov: portrait ? 56 : 44,
      };
      if (focus === 0) {
        // first product: blend in from the overview
        const k = travel;
        return {
          position: lerp3(overview.position, pose.position, k),
          target: lerp3(overview.target, pose.target, k),
          fov: lerp(overview.fov, pose.fov, k),
        };
      }
      return pose;
    }
    case 3: {
      // Inovação — descend under the products, track along the hash chain
      const first = chainBlockPosition(0);
      const last = chainBlockPosition(CHAIN_BLOCKS - 1);
      const x = lerp(first[0] * 0.55, last[0] * 0.55, t);
      return {
        position: [x, CHAIN_Y + lerp(0.9, 2.2, t), lerp(8.2, 9.6, t)],
        target: [x * 0.6, CHAIN_Y + lerp(0.8, 2.0, t), 0],
        fov: aspect < 0.8 ? 70 : 48,
      };
    }
    default: {
      // Futuro — rise and pull back to see the whole: chain below, orbit, core
      const wide: CameraPose = { position: [0, -1.4, 23], target: [0, -3.2, 0], fov: 50 };
      const close: CameraPose = { position: [0, 1.4, 13.5], target: [0, -1.5, 0], fov: aspect < 0.8 ? 60 : 48 };
      const k = easeInOutCubic(clamp01((local - 0.45) / 0.55));
      if (local < 0.45) return wide;
      return {
        position: lerp3(wide.position, close.position, k),
        target: lerp3(wide.target, close.target, k),
        fov: lerp(wide.fov, close.fov, k),
      };
    }
  }
}

/** Fraction of each chapter (after the first) spent blending in from the previous chapter's final pose. */
export const CHAPTER_BLEND = 0.3;

/**
 * Camera pose for a global progress. Each chapter blends from where the
 * previous one ended, so the path is continuous across every boundary — a
 * dolly, never a cut.
 */
export function cameraPoseAt(
  progress: number,
  productCount: number = ECOSYSTEM_ORDER.length,
  ranges: ChapterRange[] = CHAPTER_RANGES,
  aspect = 1.6,
): CameraPose {
  const p = clamp01(progress);
  let index = ranges.length - 1;
  for (let i = 0; i < ranges.length; i++) {
    if (p <= ranges[i].end) {
      index = i;
      break;
    }
  }
  const r = ranges[index];
  const span = r.end - r.start;
  const local = span > 0 ? clamp01((p - r.start) / span) : 1;
  const pose = chapterPose(index, local, productCount, aspect);
  if (index === 0 || local >= CHAPTER_BLEND) return pose;
  const prev = chapterPose(index - 1, 1, productCount, aspect);
  const k = easeInOutCubic(local / CHAPTER_BLEND);
  return {
    position: lerp3(prev.position, pose.position, k),
    target: lerp3(prev.target, pose.target, k),
    fov: lerp(prev.fov, pose.fov, k),
  };
}
