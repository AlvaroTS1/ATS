/**
 * The ATS Core Experience, as data.
 *
 * Five chapters of one continuous camera journey. Every line of copy here
 * comes from content the site already publishes (`data/products.ts`,
 * `AboutSection`, `ServicesSection`, `RoadmapSection`) — nothing about a
 * product is claimed here that the rest of the site doesn't already say.
 *
 * `length` is scroll distance in VIEWPORT HEIGHTS, so pacing is identical
 * on a phone and on a 4K monitor: one chapter always costs the same number
 * of "screens" of scrolling, whatever the screen.
 */

export type ChapterId = 'nucleo' | 'inteligencia' | 'ecossistema' | 'inovacao' | 'futuro';

export interface Chapter {
  id: ChapterId;
  /** Short label for the progress rail. */
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  tags?: string[];
  /** Scroll length in viewport heights. */
  length: number;
}

/** Product order inside the Ecossistema chapter — available first, in-construction last. */
export const ECOSYSTEM_ORDER = [
  'votrix',
  'reencontra',
  'fusion-buy',
  'coffee-break',
  'fusion-ai',
  'giro-ia',
] as const;

export const CHAPTERS: Chapter[] = [
  {
    id: 'nucleo',
    label: 'Núcleo',
    eyebrow: 'ATS Sistemas de Automações',
    title: 'Tecnologia que resolve problemas reais.',
    body: 'Um ecossistema de software inteligente construído pela ATS: produtos próprios, da proteção familiar à votação verificável e aos assistentes de IA.',
    length: 1.6,
  },
  {
    id: 'inteligencia',
    label: 'Inteligência',
    eyebrow: 'Capítulo 2 · Inteligência',
    title: 'Pessoas, IA e engenharia — uma só rede.',
    body: 'Inteligência aplicada: IA usada para resolver problemas concretos, não para parecer moderna. Quem entende o problema, modelos que entendem linguagem natural e código feito para durar.',
    tags: ['Inteligência humana', 'Inteligência artificial', 'Engenharia de software'],
    length: 1.5,
  },
  {
    id: 'ecossistema',
    label: 'Ecossistema',
    eyebrow: 'Capítulo 3 · Ecossistema',
    title: 'Não são aplicativos isolados.',
    body: 'Cada produto faz parte do ecossistema ATS — mesma qualidade, mesma identidade e evolução constante.',
    length: 3.4,
  },
  {
    id: 'inovacao',
    label: 'Inovação',
    eyebrow: 'Capítulo 4 · Inovação',
    title: 'Tecnologia construída por dentro.',
    body: 'Apps, plataformas web e SaaS, agentes de IA e automação projetados e desenvolvidos pela própria ATS. No VOTRIX, cada voto é selado num quadro público encadeado por hashes, com as raízes de Merkle carimbadas no Bitcoin.',
    tags: ['Corrente de blocos por hash', 'Raízes de Merkle', 'Carimbo no Bitcoin', 'Desenvolvimento próprio'],
    length: 1.7,
  },
  {
    id: 'futuro',
    label: 'Futuro',
    eyebrow: 'Capítulo 5 · Futuro',
    title: 'O próximo produto já está a caminho.',
    body: 'Fusion AI e Giro IA estão em construção. O ecossistema ATS não para de crescer.',
    length: 1.3,
  },
];

export interface ChapterRange {
  id: ChapterId;
  index: number;
  /** Fractions of the whole journey, 0-1. */
  start: number;
  end: number;
}

/** Converts chapter lengths into contiguous 0-1 ranges. Pure — tested. */
export function computeChapterRanges(chapters: Chapter[] = CHAPTERS): ChapterRange[] {
  const total = chapters.reduce((sum, c) => sum + c.length, 0);
  let cursor = 0;
  return chapters.map((c, index) => {
    const start = total > 0 ? cursor / total : 0;
    cursor += c.length;
    const end = total > 0 ? cursor / total : 0;
    return { id: c.id, index, start, end };
  });
}

export const CHAPTER_RANGES = computeChapterRanges();

/** Total journey length in viewport heights. */
export const JOURNEY_LENGTH_VH = CHAPTERS.reduce((sum, c) => sum + c.length, 0);

/** Which chapter a global progress falls in, plus progress local to it. */
export function chapterAt(
  progress: number,
  ranges: ChapterRange[] = CHAPTER_RANGES,
): { index: number; local: number } {
  const p = Math.min(1, Math.max(0, progress));
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    if (p <= r.end || i === ranges.length - 1) {
      const span = r.end - r.start;
      return { index: i, local: span > 0 ? Math.min(1, Math.max(0, (p - r.start) / span)) : 1 };
    }
  }
  return { index: 0, local: 0 };
}

/** Local 0-1 progress of one chapter (clamped), for systems that only care about their own chapter. */
export function localOf(progress: number, id: ChapterId, ranges: ChapterRange[] = CHAPTER_RANGES): number {
  const r = ranges.find((x) => x.id === id);
  if (!r) return 0;
  const span = r.end - r.start;
  return span > 0 ? Math.min(1, Math.max(0, (progress - r.start) / span)) : 0;
}

/**
 * Opacity window for a block that should be readable through the middle of
 * its range and gone at the edges. `fade` is the fraction of the window
 * spent fading at each end.
 */
export function windowOpacity(local: number, fadeIn = 0.14, fadeOut = 0.14, holdStart = 0, holdEnd = 1): number {
  if (local < holdStart || local > holdEnd) return 0;
  const t = (local - holdStart) / Math.max(1e-6, holdEnd - holdStart);
  const a = fadeIn > 0 ? Math.min(1, t / fadeIn) : 1;
  const b = fadeOut > 0 ? Math.min(1, (1 - t) / fadeOut) : 1;
  const v = Math.max(0, Math.min(a, b));
  return v * v * (3 - 2 * v);
}

/**
 * Ecossistema chapter: which product is in focus. The chapter spends its
 * first `INTRO` fraction on the overview, then gives each product an equal
 * slice.
 */
export const ECOSYSTEM_INTRO = 0.16;

export function ecosystemFocus(local: number, count: number = ECOSYSTEM_ORDER.length): {
  index: number;
  /** 0-1 within that product's slice, -1 during the overview. */
  slice: number;
} {
  if (local < ECOSYSTEM_INTRO) return { index: -1, slice: -1 };
  const t = (local - ECOSYSTEM_INTRO) / (1 - ECOSYSTEM_INTRO);
  const f = Math.min(count - 1e-6, t * count);
  const index = Math.floor(f);
  return { index, slice: f - index };
}
