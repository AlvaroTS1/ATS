import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CINEMATIC_FRAME_COUNT, getCinematicFramePath } from '../data/cinematic';
import { computePinState } from '../lib/pinScrollMath';

/**
 * Scroll distance (px) dedicated to scrubbing through the sequence while
 * pinned — an Apple-style intro is brief (~1200–1800px), never a scroll trap.
 */
const PIN_DISTANCE = 1500;
/** Frames loaded eagerly (in parallel) before background streaming begins. */
const EAGER_FRAME_COUNT = 20;

/**
 * Apple-style cinematic scroll intro: pinned only for `PIN_DISTANCE` px of
 * scroll, then unpins for good and hands off to the normal page flow.
 *
 * Deliberately avoids `position: sticky` — any ancestor with a non-`visible`
 * `overflow-x` (the page root here uses `overflow-x-hidden`) makes the
 * browser compute an implicit `overflow-y: auto` on it, which can hijack
 * sticky's scrolling container and make it appear permanently pinned. It
 * also avoids adding GSAP: the pin/unpin state machine in `pinScrollMath.ts`
 * is the same technique ScrollTrigger uses internally (toggle
 * `position: fixed` <-> `absolute` inside a wrapper that reserves the
 * scroll space), applied directly via imperative DOM mutation on scroll so
 * React never re-renders on the hot path.
 */
const CinematicScrollSection: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(
    Array(CINEMATIC_FRAME_COUNT).fill(null),
  );
  const currentFrameRef = useRef(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (cssW === 0 || cssH === 0) return;
    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    // "contain" fit, centered — preserves the portrait frame instead of cropping it.
    const scale = Math.min(cssW / img.naturalWidth, cssH / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, (cssW - w) / 2, (cssH - h) / 2, w, h);
  }, []);

  const renderAtProgress = useCallback(
    (progress: number) => {
      const clamped = Math.min(1, Math.max(0, progress));
      const target = Math.min(
        CINEMATIC_FRAME_COUNT - 1,
        Math.round(clamped * (CINEMATIC_FRAME_COUNT - 1)),
      );
      currentFrameRef.current = target;
      // Draw the nearest already-loaded frame at or before the target so the
      // canvas never flashes blank while the rest of the sequence streams in.
      let i = target;
      while (i >= 0 && !imagesRef.current[i]) i--;
      if (i < 0) i = imagesRef.current.findIndex(Boolean);
      if (i >= 0) drawFrame(i);
    },
    [drawFrame],
  );

  // Progressive preload: first frames eagerly, the rest sequentially in the background.
  useEffect(() => {
    if (prefersReducedMotion) return;
    let cancelled = false;

    const loadOne = (i: number) =>
      new Promise<void>((resolve) => {
        if (imagesRef.current[i]) return resolve();
        const img = new Image();
        img.decoding = 'async';
        img.setAttribute('fetchpriority', i === 0 ? 'high' : 'low');
        img.src = getCinematicFramePath(i);
        img.onload = () => {
          imagesRef.current[i] = img;
          resolve();
        };
        img.onerror = () => resolve();
      });

    (async () => {
      await Promise.all(
        Array.from({ length: Math.min(EAGER_FRAME_COUNT, CINEMATIC_FRAME_COUNT) }, (_, i) =>
          loadOne(i),
        ),
      );
      if (cancelled) return;
      drawFrame(0);

      for (let i = EAGER_FRAME_COUNT; i < CINEMATIC_FRAME_COUNT; i++) {
        if (cancelled) return;
        await loadOne(i);
        if (i === currentFrameRef.current) drawFrame(i);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [drawFrame, prefersReducedMotion]);

  // Pin/unpin: imperative DOM mutation on every scroll tick (no React
  // re-render on the hot path — keeps this at 60fps).
  const applyPinState = useCallback(() => {
    const wrapper = wrapperRef.current;
    const pin = pinRef.current;
    if (!wrapper || !pin) return;

    const rect = wrapper.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const { position, top, progress } = computePinState(
      rect.top,
      rect.bottom,
      rect.height,
      viewportH,
    );

    pin.style.position = position;
    pin.style.top = `${top}px`;

    renderAtProgress(progress);

    if (cueRef.current) {
      cueRef.current.style.opacity = progress < 0.06 ? String(1 - progress / 0.06) : '0';
    }
  }, [renderAtProgress]);

  // useLayoutEffect: runs before paint, so the pin element is positioned
  // correctly from the very first frame (no flash of unstyled layout).
  useLayoutEffect(() => {
    if (prefersReducedMotion) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        applyPinState();
        ticking = false;
      });
    };

    applyPinState();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [applyPinState, prefersReducedMotion]);

  if (prefersReducedMotion) {
    // Respect the user's preference: a static frame, normal (non-pinned) height.
    return (
      <div
        aria-hidden="true"
        className="relative w-full h-[70vh] md:h-screen bg-space-black overflow-hidden flex items-center justify-center"
      >
        <img
          src={getCinematicFramePath(CINEMATIC_FRAME_COUNT - 1)}
          alt=""
          className="h-full w-auto max-w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="relative w-full bg-space-black"
      style={{ height: `calc(100vh + ${PIN_DISTANCE}px)` }}
    >
      <div
        ref={pinRef}
        className="absolute inset-x-0 h-screen w-full overflow-hidden flex items-center justify-center pointer-events-none"
      >
        {/* Ambient dressing fills the letterboxed sides, matching the site's identity */}
        <div className="absolute inset-0 cyber-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]" />
        <div className="absolute top-1/3 left-1/4 w-[520px] h-[520px] bg-neon-cyan/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[460px] h-[460px] bg-cyber-purple/10 rounded-full blur-[130px]" />

        <canvas ref={canvasRef} className="relative z-10 h-full w-full" />

        <div
          ref={cueRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-gray-500 z-10"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">
            Role para explorar
          </span>
        </div>
      </div>
    </div>
  );
};

export default CinematicScrollSection;
