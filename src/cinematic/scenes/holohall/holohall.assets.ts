import type { SceneAssets } from '../../types';

export const HOLOHALL_FRAME_COUNT = 120;

export function getHoloHallFramePath(index: number): string {
  const n = Math.min(HOLOHALL_FRAME_COUNT, Math.max(1, index + 1));
  return `/cinematic/holo-hall/frame-${String(n).padStart(3, '0')}.webp`;
}

export const HOLOHALL_ASSETS: SceneAssets = {
  id: 'holo-hall',
  frames: Array.from({ length: HOLOHALL_FRAME_COUNT }, (_, i) => getHoloHallFramePath(i)),
  preloadPriority: 3,
};

/**
 * Fraction of this region's own progress in which the SHOT completes. The
 * camera arrives quickly and the frame is stationary for everything after —
 * which is most of the region, because the stationary part is where the user
 * walks between the installations.
 */
export const HOLOHALL_PLAY_THROUGH = 0.3;

/**
 * The frame held for the whole stationary phase, chosen rather than
 * inherited. Index 86 is `frame-087.webp`, the one whose holographic
 * consoles are spread across the space at three distinct positions and
 * depths — the arrangement the installations are anchored to.
 *
 * Before V8 the held frame was a side effect of the travel timing (see
 * `FrameSequenceAnimator`), so it could not be chosen at all.
 */
export const HOLOHALL_HOLD_FRAME = 86;

export interface HoloHallSector {
  /** Product id, matching `data/products.ts`. */
  productId: string;
  /** Where this installation sits in the HELD frame, normalized to the source image. */
  anchor: { x: number; y: number };
  /** Local-progress window in which this installation is the one awake. */
  from: number;
  to: number;
}

/**
 * Three installations, one per product, at three points of the
 * architecture — walked past rather than presented side by side.
 *
 * Abandoning the row is what made anchoring possible at all. Three panels
 * abreast needed 508px between the footage's own consoles and the footage
 * offers 149px, so containment was arithmetically out of reach. With ONE
 * awake at a time the only constraint left is the frame itself: a 320px
 * console centred on the left anchor spans x 639-959 of a 1920px screen.
 *
 * Anchors were read off `frame-087.webp` by eye. Automatic detection was
 * tried and abandoned — the consoles' glow bleeds together, so there is no
 * dark gap for a threshold to find and every profile merged the row into
 * one blob.
 *
 * The windows are deliberately NOT adjacent. The gap between them is a
 * moment with nothing awake: walking between installations, which is what
 * makes them read as devices in a place rather than as tabs.
 */
export const HOLOHALL_SECTORS: ReadonlyArray<HoloHallSector> = [
  { productId: 'fusion-buy', anchor: { x: 0.235, y: 0.556 }, from: 0.34, to: 0.53 },
  { productId: 'reencontra', anchor: { x: 0.5, y: 0.556 }, from: 0.55, to: 0.74 },
  { productId: 'coffee-break', anchor: { x: 0.744, y: 0.556 }, from: 0.76, to: 0.95 },
];

/** Fraction of a sector's window spent waking, and again spent returning to standby. */
const WAKE_RAMP = 0.28;

export interface SectorState {
  /** Which installation is awake, or null while walking between them. */
  productId: string | null;
  /** 0 = standby, 1 = fully awake. */
  wake: number;
  anchorX: number;
  anchorY: number;
}

const smoothstep = (t: number): number => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

/**
 * Which installation is awake at this local progress, and how much.
 *
 * Pure, and separated from the scene so the walk is verifiable without a
 * browser — same reason `pinScrollMath` and `scrollEasing` are pure. Wake
 * rises and falls inside each window, so approaching wakes a console and
 * leaving returns it to standby, with no latched state to get stuck.
 *
 * Writes into a caller-owned object; this runs on the scroll path.
 */
export function resolveSector(localProgress: number, out: SectorState): void {
  out.productId = null;
  out.wake = 0;

  for (const sector of HOLOHALL_SECTORS) {
    if (localProgress < sector.from || localProgress > sector.to) continue;
    const t = (localProgress - sector.from) / (sector.to - sector.from);
    out.productId = sector.productId;
    out.wake = Math.min(smoothstep(t / WAKE_RAMP), smoothstep((1 - t) / WAKE_RAMP));
    out.anchorX = sector.anchor.x;
    out.anchorY = sector.anchor.y;
    return;
  }
}

/**
 * Local progress past which every installation is asleep again and the
 * Guardian releases his light. Derived from the last sector so the cue and
 * the walk can never drift apart — it used to be a hardcoded global
 * progress inside `Guardian.ts`, which silently broke the moment this
 * region's distance changed.
 */
export const HOLOHALL_SECTORS_END = HOLOHALL_SECTORS[HOLOHALL_SECTORS.length - 1].to;
