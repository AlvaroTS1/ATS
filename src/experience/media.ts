import manifest from './media.manifest.json';
import type { ChapterId } from './chapters';

/**
 * Typed view of `media.manifest.json` — the one place the site learns which
 * Dreamina shots exist. The JSON (not this file) is what
 * `scripts/cinematic/ingest.mjs` rewrites when a new clip is delivered, so
 * integrating a video never needs a code change: ingest, rebuild, done.
 */

export interface VideoSource {
  mp4: string;
  webm?: string;
}

export interface FrameSequence {
  base: string;
  ext: string;
  count: number;
  digits: number;
  width: number;
  height: number;
  /** Point of the footage (0-1 of the frame) that the 3D core must line up with at the hand-off. */
  anchor: [number, number];
}

export interface MediaSlot {
  id: string;
  chapter: ChapterId;
  /** `frames`: scroll-scrubbed sequence · `loop`: ambient clip composited over the 3D world · `scrub`: scroll-driven video */
  kind: 'frames' | 'loop' | 'scrub';
  status: 'pending' | 'ready';
  /** `screen` makes pure black transparent — the reason every layer prompt asks for a black background. */
  blend: 'normal' | 'screen';
  opacity: number;
  frames?: FrameSequence;
  desktop?: VideoSource | null;
  mobile?: VideoSource | null;
  poster?: string | null;
}

export const MEDIA_SLOTS = (manifest.slots as MediaSlot[]).map((s) => ({ ...s }));

export function readySlots(kind?: MediaSlot['kind']): MediaSlot[] {
  return MEDIA_SLOTS.filter((s) => s.status === 'ready' && (!kind || s.kind === kind));
}

export function frameUrl(seq: FrameSequence, index: number): string {
  const n = String(Math.min(seq.count, Math.max(1, index + 1))).padStart(seq.digits, '0');
  return `${seq.base}${n}${seq.ext}`;
}

/** The opening sequence (the ATS sphere) — required by the experience. */
export const OPENING = MEDIA_SLOTS.find((s) => s.id === 's01-nucleo-abertura')!.frames!;
