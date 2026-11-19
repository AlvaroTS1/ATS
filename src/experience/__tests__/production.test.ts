import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { estimateCredits, renderPrompt, renderPromptsMarkdown, validateProduction } from '../../../scripts/cinematic/lib.mjs';

const root = process.cwd();
const load = (slug: string) => JSON.parse(fs.readFileSync(path.join(root, 'production', slug, 'shots.json'), 'utf8'));
const exists = (slug: string) => (rel: string) => fs.existsSync(path.join(root, 'production', slug, rel));

const baseShot = {
  id: 'x',
  chapter: 'c',
  kind: 'loop',
  status: 'pending',
  blend: 'screen',
  loop: true,
  mode: 'text',
  aspect: '16:9',
  resolution: '720P',
  duration: 6,
  objective: 'o',
  goal: 'g',
  camera: 'c',
  lighting: 'l',
  composition: 'k',
  timeline: [
    { t: '0-3s', action: 'a' },
    { t: '3-6s', action: 'b' },
  ],
};

describe('production pipeline', () => {
  it('the ATS site production is valid', () => {
    const { errors } = validateProduction(load('ats-site'), exists('ats-site'));
    expect(errors).toEqual([]);
  });

  it('the template production is valid once its placeholders are filled', () => {
    const raw = fs.readFileSync(path.join(root, 'production', '_template', 'shots.json'), 'utf8');
    const prod = JSON.parse(raw.split('{{SLUG}}').join('demo').split('{{NOME}}').join('Demo'));
    expect(validateProduction(prod, () => true).errors).toEqual([]);
  });

  it('rejects a timeline with a gap', () => {
    const prod = { production: 'p', styleLock: 's', shots: [{ ...baseShot, timeline: [{ t: '0-2s', action: 'a' }, { t: '3-6s', action: 'b' }] }] };
    expect(validateProduction(prod).errors.join(' ')).toMatch(/buraco/);
  });

  it('rejects a timeline that does not add up to the duration', () => {
    const prod = { production: 'p', styleLock: 's', shots: [{ ...baseShot, duration: 8 }] };
    expect(validateProduction(prod).errors.join(' ')).toMatch(/soma 6s/);
  });

  it('requires a role for every reference image', () => {
    const prod = { production: 'p', styleLock: 's', shots: [{ ...baseShot, references: [{ file: 'a.png' }] }] };
    expect(validateProduction(prod).errors.join(' ')).toMatch(/role/);
  });

  it('first/last-frame mode requires both frames', () => {
    const prod = { production: 'p', styleLock: 's', shots: [{ ...baseShot, mode: 'first-last-frame', firstFrame: 'a.png' }] };
    expect(validateProduction(prod).errors.join(' ')).toMatch(/lastFrame/);
  });

  it('a continuity frame from a shot not yet ingested blocks (warning), a plain missing file errors', () => {
    const prod = {
      production: 'p',
      styleLock: 's',
      shots: [
        { ...baseShot, id: 'a' },
        { ...baseShot, id: 'b', mode: 'first-frame', firstFrame: 'references/a-ultimo-quadro.png', continuityFrom: [{ shot: 'a', file: 'references/a-ultimo-quadro.png' }] },
        { ...baseShot, id: 'c', references: [{ file: 'nope.png', role: 'r' }] },
      ],
    };
    const { errors, warnings } = validateProduction(prod, () => false);
    expect(warnings.join(' ')).toMatch(/bloqueada até "a"/);
    expect(errors.join(' ')).toMatch(/nope\.png/);
  });

  it('every prompt carries the style lock, a timeline and the footage contract', () => {
    const prod = load('ats-site');
    for (const s of prod.shots.filter((x: { legacy?: boolean }) => !x.legacy)) {
      const p = renderPrompt(prod, s);
      expect(p).toContain(prod.styleLock);
      expect(p).toMatch(/\[0-\d+s\]/);
      expect(p).toContain('no cuts');
      expect(p).toContain('NO BGM');
      if (s.blend === 'screen') expect(p).toContain('pure black background');
      if (s.loop) expect(p).toContain('seamless loop');
    }
  });

  it('keepExistingMark allows the lettering already in the provided frame, nothing new', () => {
    const prod = load('ats-site');
    const t03 = prod.shots.find((s: { id: string }) => s.id === 't03-teaser-assinatura');
    const p = renderPrompt(prod, t03);
    expect(p).toContain('no NEW text');
    expect(p).not.toContain('no text, no letters');
  });

  it('credit estimates follow the rate table', () => {
    expect(estimateCredits({ ...baseShot, duration: 10, resolution: '720P' })).toBe(370);
    expect(estimateCredits({ ...baseShot, resolution: '1080P' }, undefined, 'Seedance 2.0 Mini')).toBeNull();
  });

  it('prompts.md on disk is up to date with shots.json', () => {
    const prod = load('ats-site');
    const onDisk = fs.readFileSync(path.join(root, 'production', 'ats-site', 'prompts.md'), 'utf8');
    expect(onDisk).toBe(renderPromptsMarkdown(prod));
  });
});
