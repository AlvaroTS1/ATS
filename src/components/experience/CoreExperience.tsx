import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { computePinState } from '../../lib/pinScrollMath';
import { stepProgress } from '../../lib/scrollEasing';
import { getDeviceTier } from '../../lib/deviceTier';
import { getProduct, type Product } from '../../data/products';
import {
  CHAPTERS,
  CHAPTER_RANGES,
  ECOSYSTEM_INTRO,
  ECOSYSTEM_ORDER,
  JOURNEY_LENGTH_VH,
  chapterAt,
  ecosystemFocus,
  localOf,
  windowOpacity,
} from '../../experience/chapters';
import { OPENING, frameUrl, readySlots, type MediaSlot } from '../../experience/media';
import { FootageLayer } from '../../experience/FootageLayer';
import { ECO_TRAVEL } from '../../experience/world/layout';
import type { CoreWorld, WorldFrame } from '../../experience/world/CoreWorld';
import ProductCTAs from '../ui/ProductCTAs';
import StatusBadge from '../ui/StatusBadge';
import StaticExperience from './StaticExperience';
import { cn } from '../../lib/utils';

/** Group labels of the Inteligência network, in the same order as the world's groups. */
const GROUP_LABELS = [
  { label: 'Inteligência humana', color: '#EAF6FF' },
  { label: 'Inteligência artificial', color: '#00D4FF' },
  { label: 'Engenharia de software', color: '#A855F7' },
];

const POSTER = frameUrl(OPENING, 0);

function detectMode(): 'cinematic' | 'static' {
  if (typeof window === 'undefined') return 'cinematic';
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return 'static';
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return 'static';
    (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    return 'static';
  }
  return 'cinematic';
}

/**
 * ATS Core Experience — the cinematic opening of the site.
 *
 * Layers inside the pinned stage, back to front:
 *   1. Core World (Three.js) — one persistent 3D place for all five chapters
 *   2. Dreamina layers (`media.manifest.json`, `kind: loop`) composited with
 *      `screen` blend — absent until a clip is ingested, never required
 *   3. Opening footage — the ATS sphere, scroll-scrubbed, dissolving into the core
 *   4. Interface — real, accessible DOM: chapter copy, product panels, labels
 *      projected from 3D positions, chapter rail
 *
 * Nothing here blocks first paint: the poster frame and the H1 are plain
 * DOM; Three.js arrives in its own chunk after the browser is idle, and the
 * footage streams in behind it. Scroll works from the first millisecond.
 */
const CoreExperience: React.FC = () => {
  const [mode, setMode] = useState<'cinematic' | 'static'>(detectMode);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setMode(detectMode());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (mode === 'static') return <StaticExperience />;
  return <CinematicStage onWebGLFailure={() => setMode('static')} />;
};

const CinematicStage: React.FC<{ onWebGLFailure: () => void }> = ({ onWebGLFailure }) => {
  const wrapperRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldCanvasRef = useRef<HTMLCanvasElement>(null);
  const footageCanvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const markerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rootLabelRef = useRef<HTMLDivElement>(null);
  const railRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const chipDotRef = useRef<HTMLSpanElement>(null);
  const chipTextRef = useRef<HTMLSpanElement>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const progressRef = useRef(0);

  const products = useMemo(
    () => ECOSYSTEM_ORDER.map((id) => getProduct(id)).filter((p): p is Product => Boolean(p)),
    [],
  );
  const videoSlots = useMemo(() => readySlots('loop'), []);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    const footageCanvas = footageCanvasRef.current;
    const worldCanvas = worldCanvasRef.current;
    if (!wrapper || !stage || !footageCanvas || !worldCanvas) return;

    const tier = getDeviceTier();
    const isMobile = () => window.innerWidth < 768;
    let world: CoreWorld | null = null;
    let disposed = false;

    // ── opening footage ──
    const footage = new FootageLayer(footageCanvas, OPENING, tier === 'low' ? 2 : 1);
    footage.resize(stage.clientWidth, stage.clientHeight);
    void footage.load(() => {
      if (disposed) return;
      footage.draw(0, 1);
      if (posterRef.current) posterRef.current.style.opacity = '0';
    });

    // Toque háptico curtíssimo a cada novo capítulo ou produto em foco
    // (Android; o iPhone ignora `vibrate`). Nunca no primeiro quadro.
    const canBuzz = typeof navigator.vibrate === 'function' && window.matchMedia('(pointer: coarse)').matches;
    let lastBeat = '';
    const beat = (key: string) => {
      if (key === lastBeat) return;
      const first = lastBeat === '';
      lastBeat = key;
      if (first || !canBuzz) return;
      try {
        navigator.vibrate(10);
      } catch {
        /* sem gesto do usuário ainda: o navegador recusa, sem problema */
      }
    };

    // ── per-progress DOM: chapters, panels, rail ──
    const applyProgress = (p: number) => {
      progressRef.current = p;
      const { index: current } = chapterAt(p);

      // opening footage: scrub, push in, dissolve into the 3D core
      const nucleo = localOf(p, 'nucleo');
      const footT = Math.min(1, nucleo / 0.7);
      const zoom = 1 + Math.max(0, (nucleo - 0.55) / 0.45) ** 2 * 0.9;
      const footOpacity = 1 - Math.min(1, Math.max(0, (nucleo - 0.7) / 0.24));
      footageCanvas.style.opacity = String(footOpacity);
      // wide screens: the sphere starts right of the headline, then glides to
      // centre — where the 3D core waits — before the hand-off
      const wide = stage.clientWidth / stage.clientHeight > 1.1;
      const glide = Math.min(1, Math.max(0, (nucleo - 0.35) / 0.35));
      const centerX = wide ? 0.62 - 0.12 * (glide * glide * (3 - 2 * glide)) : 0.5;
      if (footOpacity > 0) footage.draw(footT, zoom, centerX);

      CHAPTERS.forEach((c, i) => {
        const el = chapterRefs.current[i];
        if (!el) return;
        const local = localOf(p, c.id);
        let o = 0;
        if (c.id === 'nucleo') o = p <= CHAPTER_RANGES[0].end ? 1 - Math.min(1, Math.max(0, (local - 0.42) / 0.2)) : 0;
        else if (c.id === 'ecossistema') o = windowOpacity(local, 0.3, 0.3, 0, 0.2);
        else if (c.id === 'futuro') o = p >= CHAPTER_RANGES[4].start ? Math.min(1, Math.max(0, (local - 0.3) / 0.25)) : 0;
        else o = windowOpacity(local, 0.18, 0.18, 0.08, 0.92);
        setLayer(el, o, (1 - o) * 26);
      });

      // product panels
      const eco = localOf(p, 'ecossistema');
      const inEco = current === CHAPTER_RANGES.findIndex((r) => r.id === 'ecossistema');
      const { index: focus, slice } = ecosystemFocus(eco, products.length);
      products.forEach((_, i) => {
        const panel = panelRefs.current[i];
        const o = inEco && focus === i ? windowOpacity(slice, 0.2, 0.14, ECO_TRAVEL - 0.08, 1) : 0;
        if (panel) setLayer(panel, o, (1 - o) * 18);
        const marker = markerRefs.current[i];
        if (marker) marker.dataset.o = String(o);
      });

      // Inteligência group labels / Inovação root caption — opacity here, position in onFrame
      const intel = localOf(p, 'inteligencia');
      const groupO = current === 1 ? windowOpacity(intel, 0.2, 0.2, 0.15, 0.85) : 0;
      groupRefs.current.forEach((g) => g && (g.dataset.o = String(groupO)));
      const inov = localOf(p, 'inovacao');
      if (rootLabelRef.current) rootLabelRef.current.dataset.o = String(current === 3 ? windowOpacity(inov, 0.2, 0.15, 0.82, 1) : 0);

      railRefs.current.forEach((b, i) => {
        if (!b) return;
        b.dataset.active = String(i === current);
        if (i === current) b.setAttribute('aria-current', 'step');
        else b.removeAttribute('aria-current');
      });
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;

      // Celular: onde estou na jornada (capítulo, ou o produto em foco).
      const focused = inEco && focus >= 0 ? products[focus] : null;
      beat(focused ? `p-${focused.id}` : `c-${current}`);
      if (chipTextRef.current) {
        const text = focused
          ? `${String(current + 1).padStart(2, '0')} · ${focused.name}`
          : `${String(current + 1).padStart(2, '0')} / ${String(CHAPTERS.length).padStart(2, '0')} · ${CHAPTERS[current].label}`;
        if (chipTextRef.current.textContent !== text) chipTextRef.current.textContent = text;
      }
      if (chipDotRef.current) chipDotRef.current.style.backgroundColor = focused ? focused.accent.from : '#29ABE2';
      if (chipRef.current) chipRef.current.style.opacity = p > 0.02 && p < 0.985 ? '1' : '0';
      if (cueRef.current) cueRef.current.style.opacity = p < 0.02 ? String(1 - p / 0.02) : '0';

      // Dreamina layers: only near their chapter are they even loaded
      for (const slot of videoSlots) {
        const v = videoRefs.current[slot.id];
        if (!v) continue;
        const ci = CHAPTER_RANGES.findIndex((r) => r.id === slot.chapter);
        const near = Math.abs(ci - current) <= 1;
        const o = windowOpacity(localOf(p, slot.chapter), 0.2, 0.2) * slot.opacity;
        if (near && !v.src) {
          const src = isMobile() ? slot.mobile ?? slot.desktop : slot.desktop ?? slot.mobile;
          if (src) {
            const canWebm = !!src.webm && v.canPlayType('video/webm; codecs="vp9"') !== '';
            if (slot.poster) v.poster = slot.poster;
            v.src = canWebm ? src.webm! : src.mp4;
          }
        }
        v.style.opacity = String(o);
        if (o > 0.01 && v.paused) void v.play().catch(() => {});
        else if (o <= 0.01 && !v.paused) v.pause();
      }

      world?.setProgress(p);
    };

    // a label centred on a projected point must never spill off screen
    const clampX = (x: number, el: HTMLElement) => {
      const half = el.offsetWidth / 2 + 12;
      return Math.min(stage.clientWidth - half, Math.max(half, x));
    };

    // projected labels follow the 3D world every rendered frame
    const onWorldFrame = (f: WorldFrame) => {
      f.products.forEach((sp, i) => {
        const m = markerRefs.current[i];
        if (!m) return;
        const o = Number(m.dataset.o || 0);
        m.style.opacity = sp.visible ? String(o) : '0';
        if (o > 0) m.style.transform = `translate3d(${sp.x}px, ${sp.y}px, 0)`;
      });
      f.groups.forEach((sp, i) => {
        const g = groupRefs.current[i];
        if (!g) return;
        const o = Number(g.dataset.o || 0);
        g.style.opacity = sp.visible ? String(o) : '0';
        if (o > 0) g.style.transform = `translate3d(${clampX(sp.x, g)}px, ${sp.y}px, 0) translate(-50%, -140%)`;
      });
      const rl = rootLabelRef.current;
      if (rl) {
        const o = Number(rl.dataset.o || 0);
        rl.style.opacity = f.chainRoot.visible ? String(o) : '0';
        if (o > 0) rl.style.transform = `translate3d(${clampX(f.chainRoot.x, rl)}px, ${f.chainRoot.y}px, 0) translate(-50%, -260%)`;
      }
    };

    // ── scroll → eased progress (same pin model the site already used) ──
    let target = 0;
    let smoothed = 0;
    let easeRaf: number | null = null;
    let ticking = false;
    const step = () => {
      const { value, keepEasing } = stepProgress(smoothed, target);
      smoothed = value;
      applyProgress(smoothed);
      easeRaf = keepEasing ? requestAnimationFrame(step) : null;
    };
    const applyPin = () => {
      const rect = wrapper.getBoundingClientRect();
      const stageH = stage.clientHeight;
      const { position, top, progress } = computePinState(rect.top, rect.bottom, rect.height, stageH);
      stage.style.position = position;
      stage.style.top = `${top}px`;
      target = progress;
      if (easeRaf === null) easeRaf = requestAnimationFrame(step);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        applyPin();
      });
    };
    const onResize = () => {
      footage.resize(stage.clientWidth, stage.clientHeight);
      world?.resize(stage.clientWidth, stage.clientHeight);
      applyPin();
      applyProgress(smoothed);
    };
    // Giroscópio (Android): inclinar o celular move a câmera dentro do
    // mundo, como olhar ao redor. O iPhone exigiria um diálogo de permissão
    // — que quebraria a imersão —, então lá a câmera segue o toque.
    let gyroActive = false;
    let baseBeta: number | null = null;
    let baseGamma: number | null = null;
    const clampUnit = (v: number) => Math.max(-1, Math.min(1, v));
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      if (baseBeta === null || baseGamma === null) {
        baseBeta = e.beta;
        baseGamma = e.gamma;
      }
      gyroActive = true;
      world?.setPointer(clampUnit((e.gamma - baseGamma) / 16), clampUnit(-(e.beta - baseBeta) / 16));
      // a postura "neutra" acompanha devagar quem muda o jeito de segurar
      baseBeta += (e.beta - baseBeta) * 0.004;
      baseGamma += (e.gamma - baseGamma) * 0.004;
    };
    const DOE = window.DeviceOrientationEvent as
      | (typeof DeviceOrientationEvent & { requestPermission?: unknown })
      | undefined;
    const useGyro = Boolean(DOE) && typeof DOE?.requestPermission !== 'function' && window.matchMedia('(pointer: coarse)').matches;
    if (useGyro) window.addEventListener('deviceorientation', onOrientation);

    const onPointer = (e: PointerEvent) => {
      if (gyroActive && e.pointerType !== 'mouse') return;
      world?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    };

    applyPin();
    smoothed = target;
    applyProgress(smoothed);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointer, { passive: true });

    // the world sleeps while the stage is off screen
    const io = new IntersectionObserver(([entry]) => world?.setActive(entry.isIntersecting), { rootMargin: '200px' });
    io.observe(wrapper);

    // ── Three.js: loaded after first paint, in its own chunk ──
    const schedule =
      typeof requestIdleCallback === 'function'
        ? (cb: () => void) => requestIdleCallback(cb, { timeout: 1200 })
        : (cb: () => void) => window.setTimeout(cb, 300);
    schedule(() => {
      import('../../experience/world/CoreWorld')
        .then(({ CoreWorld }) => {
          if (disposed) return;
          try {
            world = new CoreWorld(
              worldCanvas,
              products.map((p) => ({ id: p.id, from: p.accent.from, to: p.accent.to, soon: p.status === 'soon' })),
              tier,
            );
          } catch {
            onWebGLFailure();
            return;
          }
          world.onFrame = onWorldFrame;
          world.resize(stage.clientWidth, stage.clientHeight);
          world.setProgress(progressRef.current);
          world.start();
          worldCanvas.style.opacity = '1';
          worldCanvas.addEventListener('webglcontextlost', (ev) => ev.preventDefault(), { once: true });
        })
        .catch(() => onWebGLFailure());
    });

    return () => {
      disposed = true;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('deviceorientation', onOrientation);
      if (easeRaf !== null) cancelAnimationFrame(easeRaf);
      io.disconnect();
      footage.cancel();
      world?.dispose();
      world = null;
    };
  }, [products, videoSlots, onWebGLFailure]);

  const scrollToChapter = (i: number) => {
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    if (!wrapper || !stage) return;
    const range = wrapper.offsetHeight - stage.clientHeight;
    const r = CHAPTER_RANGES[i];
    const offset = i === 0 ? 0 : r.start + (r.end - r.start) * 0.35;
    window.scrollTo({ top: wrapper.offsetTop + range * offset + 1, behavior: 'smooth' });
  };

  const scrollToProduct = (i: number) => {
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    if (!wrapper || !stage) return;
    const range = wrapper.offsetHeight - stage.clientHeight;
    const r = CHAPTER_RANGES[2];
    const local = ECOSYSTEM_INTRO + ((i + 0.7) / products.length) * (1 - ECOSYSTEM_INTRO);
    window.scrollTo({ top: wrapper.offsetTop + range * (r.start + (r.end - r.start) * local), behavior: 'smooth' });
  };

  const renderChapter = (c: (typeof CHAPTERS)[number], i: number) => {
            const Heading = i === 0 ? 'h1' : 'h2';
            return (
              <div
                key={c.id}
                ref={(el) => {
                  chapterRefs.current[i] = el;
                }}
                className={cn('chapter-block absolute', `chapter-${c.id}`)}
                onFocus={(e) => isKeyboardFocus(e.target) && scrollToChapter(i)}
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-neon-cyan md:text-xs">{c.eyebrow}</p>
                <Heading className="text-balance text-[2rem] font-black leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
                  {c.title}
                </Heading>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-300 md:text-base">{c.body}</p>
                {c.tags && (
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label="Destaques">
                    {c.tags.map((t) => (
                      <li key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-gray-300 backdrop-blur-sm">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
                {c.id === 'nucleo' && (
                  <div className="pointer-events-auto mt-7 flex flex-col gap-3 sm:flex-row">
                    <a
                      href="#solutions"
                      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-cyber-purple px-5 py-3 text-sm font-bold text-space-black transition hover:brightness-110"
                    >
                      Explorar soluções
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                    <a
                      href="https://votrix.atssistemas.ia.br"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:border-neon-cyan/50"
                    >
                      Conheça o VOTRIX
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                )}
                {c.id === 'futuro' && (
                  <div className="pointer-events-auto mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <a
                      href="#solutions"
                      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-cyber-purple px-6 py-3.5 text-sm font-bold text-space-black transition hover:brightness-110"
                    >
                      Conhecer os projetos
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                    <a
                      href="#contact"
                      className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition hover:border-neon-cyan/50"
                    >
                      Falar com a ATS
                    </a>
                  </div>
                )}
              </div>
            )
  };

  return (
    <section
      id="home"
      ref={wrapperRef}
      aria-label="Apresentação da ATS Sistemas"
      className="core-journey relative w-full bg-space-black"
      style={{ ['--journey' as string]: JOURNEY_LENGTH_VH }}
    >
      <a
        href="#solutions"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-24 focus:z-[80] focus:rounded-lg focus:bg-space-dark focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Pular a apresentação
      </a>

      <div ref={stageRef} className="core-stage absolute inset-x-0 top-0 w-full overflow-hidden">
        {/* 1 · the 3D world */}
        <canvas
          ref={worldCanvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-1000"
        />

        {/* 2 · Dreamina layers, composited in `screen` (pure black = transparent) */}
        {videoSlots.map((slot: MediaSlot) => (
          <video
            key={slot.id}
            ref={(el) => {
              videoRefs.current[slot.id] = el;
            }}
            aria-hidden="true"
            muted
            loop
            playsInline
            preload="none"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0"
            style={{ mixBlendMode: slot.blend === 'screen' ? 'screen' : 'normal' }}
          />
        ))}

        {/* 3 · opening footage + its poster (the LCP element) */}
        <img
          ref={posterRef}
          src={POSTER}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="core-poster pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-500"
        />
        <canvas ref={footageCanvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_50%,rgba(3,7,18,0.7)_100%)]"
        />

        {/* 4 · interface */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {/* Group labels (Inteligência) — projected from the network */}
          {GROUP_LABELS.map((g, i) => (
            <div
              key={g.label}
              ref={(el) => {
                groupRefs.current[i] = el;
              }}
              aria-hidden="true"
              className="absolute left-0 top-0 hidden whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-0 backdrop-blur-sm md:block"
              style={{ color: g.color, borderColor: `${g.color}55`, background: 'rgba(3,7,18,0.55)' }}
            >
              {g.label}
            </div>
          ))}

          {/* Merkle root caption (Inovação) */}
          <div
            ref={rootLabelRef}
            aria-hidden="true"
            className="absolute left-0 top-0 whitespace-nowrap rounded-full border border-white/20 bg-space-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white opacity-0 backdrop-blur-sm"
          >
            Raiz de Merkle · carimbo no Bitcoin
          </div>

          {/* Product markers — follow each product body in 3D */}
          {products.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => {
                markerRefs.current[i] = el;
              }}
              aria-hidden="true"
              className="absolute left-0 top-0 opacity-0"
            >
              <div
                className="-translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full border"
                style={{ borderColor: `${p.accent.from}aa`, boxShadow: `0 0 24px ${p.accent.glow}` }}
              />
            </div>
          ))}

          {/* Chapter copy, in reading order: products sit inside Ecossistema */}
          {CHAPTERS.slice(0, 3).map((c, i) => renderChapter(c, i))}

          {/* Product panels (Ecossistema) — one per product, real data and links */}
          {products.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              className="product-panel absolute"
              style={{ opacity: 0 }}
              onFocus={(e) => isKeyboardFocus(e.target) && scrollToProduct(i)}
            >
              <article
                className="relative overflow-hidden rounded-2xl border px-5 py-5 backdrop-blur-md md:px-7 md:py-7"
                style={{
                  borderColor: `${p.accent.from}55`,
                  background: 'rgba(5,9,18,0.72)',
                  boxShadow: `0 24px 60px -24px ${p.accent.glow}, inset 0 0 40px ${p.accent.glow.replace('0.35', '0.06')}`,
                }}
                aria-label={p.name}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-[2px]"
                  style={{ backgroundImage: `linear-gradient(90deg, ${p.accent.from}, ${p.accent.to})` }}
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] md:text-[11px]" style={{ color: p.accent.from }}>
                    {p.category}
                  </p>
                  <StatusBadge status={p.status} className="shrink-0" />
                </div>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">{p.name}</h3>
                <p className="mt-1 text-sm font-medium text-gray-200">{p.tagline}</p>
                <p className="mt-3 hidden text-sm leading-relaxed text-gray-400 md:block">{p.short}</p>
                <ul className="mt-4 hidden flex-wrap gap-2 md:flex">
                  {p.highlights.map((h) => (
                    <li key={h.title} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-gray-300">
                      {h.title}
                    </li>
                  ))}
                </ul>
                <div className="pointer-events-auto mt-5">
                  <ProductCTAs product={p} size="sm" />
                </div>
              </article>
            </div>
          ))}
          {CHAPTERS.slice(3).map((c, i) => renderChapter(c, i + 3))}
        </div>

        {/* Chapter rail */}
        <nav aria-label="Capítulos da apresentação" className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 md:block lg:right-8">
          <ol className="flex flex-col gap-3">
            {CHAPTERS.map((c, i) => (
              <li key={c.id}>
                <button
                  ref={(el) => {
                    railRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => scrollToChapter(i)}
                  className="rail-dot group flex items-center justify-end gap-3"
                  aria-label={`Ir para ${c.label}`}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-data-[active=true]:text-neon-cyan group-data-[active=true]:opacity-100">
                    {c.label}
                  </span>
                  <span className="h-2 w-2 rounded-full border border-white/30 transition-all group-data-[active=true]:h-6 group-data-[active=true]:border-neon-cyan group-data-[active=true]:bg-neon-cyan/60" />
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* mobile: capítulo / produto atual */}
        <div
          ref={chipRef}
          aria-hidden="true"
          className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 opacity-0 transition-opacity duration-500 md:hidden"
        >
          <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-space-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-300 backdrop-blur-md">
            <span ref={chipDotRef} className="h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: '#29ABE2' }} />
            <span ref={chipTextRef} />
          </div>
        </div>

        {/* mobile progress */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-20 h-[2px] bg-white/5 md:hidden">
          <div ref={barRef} className="h-full origin-left bg-gradient-to-r from-neon-cyan to-cyber-purple" style={{ transform: 'scaleX(0)' }} />
        </div>

        <div
          ref={cueRef}
          aria-hidden="true"
          className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-400"
        >
          Role para entrar
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
          style={{ background: 'linear-gradient(to bottom, transparent, rgb(3,7,18))' }}
        />
      </div>
    </section>
  );
};

/** Only keyboard focus should move the journey — a mouse click on a link must not fight its own navigation. */
function isKeyboardFocus(target: EventTarget): boolean {
  try {
    return (target as HTMLElement).matches(':focus-visible');
  } catch {
    return false;
  }
}

function setLayer(el: HTMLElement, opacity: number, translateY: number): void {
  el.style.opacity = String(opacity);
  el.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
  el.style.pointerEvents = opacity > 0.6 ? 'auto' : 'none';
}

export default CoreExperience;
