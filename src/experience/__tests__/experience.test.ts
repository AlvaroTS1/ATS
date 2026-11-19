import { describe, expect, it } from 'vitest';
import {
  CHAPTERS,
  CHAPTER_RANGES,
  ECOSYSTEM_ORDER,
  chapterAt,
  computeChapterRanges,
  ecosystemFocus,
  windowOpacity,
} from '../chapters';
import { cameraPoseAt, merkleLevels, CHAIN_BLOCKS } from '../world/layout';
import { products } from '../../data/products';
import manifest from '../media.manifest.json';

describe('chapters', () => {
  it('ranges are contiguous and cover 0..1', () => {
    const r = computeChapterRanges();
    expect(r[0].start).toBe(0);
    expect(r[r.length - 1].end).toBeCloseTo(1, 10);
    for (let i = 1; i < r.length; i++) expect(r[i].start).toBeCloseTo(r[i - 1].end, 10);
  });

  it('chapterAt resolves every point to exactly one chapter, local progress monotonic', () => {
    let prev = { index: 0, local: 0 };
    for (let i = 0; i <= 2000; i++) {
      const c = chapterAt(i / 2000);
      expect(c.local).toBeGreaterThanOrEqual(0);
      expect(c.local).toBeLessThanOrEqual(1);
      if (c.index === prev.index) expect(c.local).toBeGreaterThanOrEqual(prev.local - 1e-9);
      else expect(c.index).toBe(prev.index + 1);
      prev = c;
    }
  });

  it('every product shown in the ecosystem exists in data/products.ts (no invented products)', () => {
    for (const id of ECOSYSTEM_ORDER) expect(products.some((p) => p.id === id)).toBe(true);
    expect(ECOSYSTEM_ORDER.length).toBe(products.length);
  });

  it('ecosystem focus visits each product once, in order', () => {
    const seen: number[] = [];
    for (let i = 0; i <= 1000; i++) {
      const { index } = ecosystemFocus(i / 1000);
      if (index >= 0 && seen[seen.length - 1] !== index) seen.push(index);
    }
    expect(seen).toEqual(ECOSYSTEM_ORDER.map((_, i) => i));
  });

  it('windowOpacity is 0 at the edges and 1 in the hold', () => {
    expect(windowOpacity(0)).toBe(0);
    expect(windowOpacity(0.5)).toBe(1);
    expect(windowOpacity(1)).toBe(0);
  });

  it('the H1 chapter is the first one', () => {
    expect(CHAPTERS[0].id).toBe('nucleo');
  });
});

describe('camera path', () => {
  for (const aspect of [1.6, 0.46]) {
    it(`never jumps (aspect ${aspect}) — a dolly, never a cut`, () => {
      const steps = 4000;
      let prev = cameraPoseAt(0, ECOSYSTEM_ORDER.length, CHAPTER_RANGES, aspect);
      let worst = 0;
      for (let i = 1; i <= steps; i++) {
        const pose = cameraPoseAt(i / steps, ECOSYSTEM_ORDER.length, CHAPTER_RANGES, aspect);
        const d = Math.hypot(
          pose.position[0] - prev.position[0],
          pose.position[1] - prev.position[1],
          pose.position[2] - prev.position[2],
        );
        worst = Math.max(worst, d);
        expect(Number.isFinite(d)).toBe(true);
        prev = pose;
      }
      // a cut would teleport several world units in one step; the fastest
      // legitimate move (flying between two products) peaks at ~0.2 per step
      expect(worst).toBeLessThan(0.25);
    });
  }

  it('merkle tree converges to a single root over the chain', () => {
    const levels = merkleLevels();
    expect(levels[0].length).toBe(CHAIN_BLOCKS);
    expect(levels[levels.length - 1].length).toBe(1);
  });
});

describe('media manifest', () => {
  it('has the opening sequence and every slot belongs to a real chapter', () => {
    const ids = new Set(CHAPTERS.map((c) => c.id));
    expect(manifest.slots.find((s) => s.id === 's01-nucleo-abertura')?.status).toBe('ready');
    for (const s of manifest.slots) expect(ids.has(s.chapter as never)).toBe(true);
  });

  it('a ready loop always has both desktop and mobile sources', () => {
    for (const s of manifest.slots as { kind: string; status: string; desktop?: unknown; mobile?: unknown }[]) {
      if (s.kind === 'loop' && s.status === 'ready') {
        expect(s.desktop).toBeTruthy();
        expect(s.mobile).toBeTruthy();
      }
    }
  });
});
