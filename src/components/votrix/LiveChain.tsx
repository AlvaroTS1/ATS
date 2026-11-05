import React, { useEffect, useRef, useState } from 'react';
import { Anchor, BadgeCheck, Link2, Lock, ScanSearch } from 'lucide-react';
import { cn } from '../../lib/utils';
import VotrixMark from './VotrixMark';

type Stage = 'cifrando' | 'conferindo' | 'selado';

interface Block {
  n: number;
  hash: string;
  prev: string;
  stage: Stage;
}

const VISIBLE = 4;
/** How often the simulation flashes the anchor (the real product anchors at closing and at the tally). */
const ANCHOR_EVERY = 5;

const hex = (bytes = 32) => {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
};
const short = (h: string) => `${h.slice(0, 6)}…${h.slice(-4)}`;

const STAGE: Record<Stage, { label: string; icon: React.ReactNode; cls: string }> = {
  cifrando: { label: 'cifrando', icon: <Lock className="h-3 w-3" />, cls: 'text-amber-300 border-amber-300/40 bg-amber-300/10' },
  conferindo: { label: 'conferindo prova', icon: <ScanSearch className="h-3 w-3" />, cls: 'text-cyan-300 border-cyan-300/40 bg-cyan-300/10' },
  selado: { label: 'selado', icon: <BadgeCheck className="h-3 w-3" />, cls: 'text-emerald-300 border-emerald-300/40 bg-emerald-300/10' },
};

function seed(): Block[] {
  const out: Block[] = [];
  let prev = hex();
  for (let i = 0; i < VISIBLE; i++) {
    const hash = hex();
    out.push({ n: 1036 + i, hash, prev, stage: 'selado' });
    prev = hash;
  }
  return out;
}

/**
 * The public board as a living chain: a new ballot arrives encrypted, its
 * proof is checked, it is sealed with a hash that points to the block before
 * it — and every few blocks the board's summary is stamped on Bitcoin.
 * The "anterior" of each block is literally the "hash" of the one to its
 * left, so the link the eye sees is the link the math makes.
 *
 * Purely illustrative (random hashes, no network), paused while off-screen
 * or in a hidden tab, and frozen under `prefers-reduced-motion`.
 */
const LiveChain: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>(seed);
  const [shift, setShift] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [anchorFlash, setAnchorFlash] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const nextN = useRef(1036 + VISIBLE);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let visible = false;
    let timers: number[] = [];
    let loop: number | null = null;
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    const cycle = () => {
      const track = trackRef.current;
      if (!track || track.children.length < 3) return;
      // Slot = one block + one link, measured so the layout can change per breakpoint.
      const slot = (track.children[2] as HTMLElement).offsetLeft - (track.children[0] as HTMLElement).offsetLeft;
      const n = nextN.current++;
      setBlocks((bs) => [...bs, { n, hash: hex(), prev: bs[bs.length - 1]!.hash, stage: 'cifrando' }]);
      requestAnimationFrame(() => {
        setAnimate(true);
        setShift(slot);
      });
      later(900, () => setBlocks((bs) => bs.map((b, i) => (i === bs.length - 1 ? { ...b, stage: 'conferindo' } : b))));
      later(1800, () => {
        setBlocks((bs) => bs.map((b, i) => (i === bs.length - 1 ? { ...b, stage: 'selado' } : b)));
        if (n % ANCHOR_EVERY === 0) {
          setAnchorFlash(true);
          later(1400, () => setAnchorFlash(false));
        }
      });
      // Drop the block that left the frame and snap back without a transition.
      later(2600, () => {
        setAnimate(false);
        setShift(0);
        setBlocks((bs) => bs.slice(1));
      });
    };

    const start = () => {
      if (loop !== null || !visible || document.hidden) return;
      cycle();
      loop = window.setInterval(cycle, 3200);
    };
    const stop = () => {
      if (loop !== null) window.clearInterval(loop);
      loop = null;
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
      setAnimate(false);
      setShift(0);
      setBlocks((bs) => (bs.length > VISIBLE ? bs.slice(bs.length - VISIBLE).map((b) => ({ ...b, stage: 'selado' })) : bs));
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    }, { threshold: 0.2 });
    if (rootRef.current) io.observe(rootRef.current);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      stop();
    };
  }, []);

  return (
    <div ref={rootRef} className="relative" aria-hidden="true">
      <div className="relative overflow-hidden rounded-2xl border border-cyan-300/15 bg-[#060d1d]/80 px-3 py-5 sm:px-5 sm:py-6 shadow-[0_30px_80px_-30px_rgba(34,211,238,0.35)]">
        <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none" />
        <div className="relative flex items-center justify-between mb-4 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.18em]">
          <span className="flex items-center gap-2 text-cyan-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Simulação do quadro público
          </span>
          <span className="text-gray-500">bloco #{blocks[blocks.length - 1]!.n}</span>
        </div>

        {/* The track: fades at both edges so blocks arrive and leave through light, not a hard cut. */}
        <div className="relative [mask-image:linear-gradient(to_right,transparent,black_6%,black_88%,transparent)]">
          <div
            ref={trackRef}
            className="flex items-center"
            style={{
              transform: `translateX(-${shift}px)`,
              transition: animate ? 'transform 800ms cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
            }}
          >
            {blocks.map((b, i) => {
              const st = STAGE[b.stage];
              const fresh = b.stage !== 'selado';
              return (
                <React.Fragment key={b.n}>
                  {i > 0 && (
                    <div className="flex w-7 sm:w-9 shrink-0 flex-col items-center">
                      <div className={cn('h-px w-full', fresh ? 'bg-amber-300/50' : 'bg-gradient-to-r from-cyan-300/70 to-emerald-300/70')} />
                      <Link2 className={cn('h-4 w-4 -mt-2 rotate-45', fresh ? 'text-amber-300/80' : 'text-cyan-300')} />
                    </div>
                  )}
                  <div
                    className={cn(
                      'relative w-[7.6rem] sm:w-[9.5rem] shrink-0 overflow-hidden rounded-xl border p-2.5 sm:p-3 transition-[border-color,box-shadow] duration-500',
                      fresh
                        ? 'border-amber-300/40 bg-amber-300/[0.04] shadow-[0_0_30px_-6px_rgba(252,211,77,0.35)]'
                        : 'border-cyan-300/25 bg-white/[0.03] shadow-[0_0_24px_-10px_rgba(34,211,238,0.5)]',
                    )}
                  >
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#2563eb] via-[#22d3ee] to-[#34d399]" />
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-white">#{b.n}</span>
                      <VotrixMark className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <dl className="mt-2 space-y-1 font-mono text-[9px] sm:text-[10px] leading-tight">
                      <div>
                        <dt className="text-gray-500">anterior</dt>
                        <dd className="text-cyan-200/80 truncate">{short(b.prev)}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">hash</dt>
                        <dd className={cn('truncate', fresh ? 'text-amber-200' : 'text-emerald-200')}>{fresh && b.stage === 'cifrando' ? '········' : short(b.hash)}</dd>
                      </div>
                    </dl>
                    <div className={cn('mt-2 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold', st.cls)}>
                      {st.icon}
                      {st.label}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4 font-mono text-[10px] sm:text-[11px]">
          <span className="text-gray-400">
            último hash → <span className="text-cyan-200">{short(blocks[blocks.length - 1]!.hash)}</span>
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-all duration-500',
              anchorFlash
                ? 'border-orange-300/70 bg-orange-400/15 text-orange-200 shadow-[0_0_24px_rgba(251,146,60,0.45)]'
                : 'border-white/10 bg-white/[0.03] text-gray-400',
            )}
          >
            <Anchor className="h-3 w-3" />
            {anchorFlash ? 'carimbando no Bitcoin…' : 'âncora: Bitcoin (OpenTimestamps)'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveChain;
