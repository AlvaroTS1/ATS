import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent, useTransform } from 'framer-motion';
import { CINEMATIC_FRAME_COUNT, getCinematicFramePath } from '../data/cinematic';

/** How many viewport-heights of scroll it takes to scrub through the whole sequence. */
const SCROLL_LENGTH_VH = 300;
/** Frames loaded eagerly (in parallel) before the sequence is considered ready. */
const EAGER_FRAME_COUNT = 20;

/**
 * Full-bleed, scroll-scrubbed cinematic reveal.
 *
 * The source video is portrait (9:16), so frames are drawn "contain"-fit and
 * centered rather than cropped — it reads as a cinematic frame within the
 * page rather than a stretched, blurry background.
 */
const CinematicScrollSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!prefersReducedMotion) renderAtProgress(v);
  });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const onResize = () => renderAtProgress(scrollYProgress.get());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [prefersReducedMotion, renderAtProgress, scrollYProgress]);

  const cueOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  if (prefersReducedMotion) {
    // Respect the user's preference: a static frame, normal (non-pinned) height.
    return (
      <section
        aria-hidden="true"
        className="relative w-full h-[70vh] md:h-screen bg-space-black overflow-hidden flex items-center justify-center"
      >
        <img
          src={getCinematicFramePath(CINEMATIC_FRAME_COUNT - 1)}
          alt=""
          className="h-full w-auto max-w-full object-contain"
        />
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      aria-hidden="true"
      style={{ height: `${SCROLL_LENGTH_VH}vh` }}
      className="relative w-full bg-space-black"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Ambient dressing fills the letterboxed sides, matching the site's identity */}
        <div className="absolute inset-0 cyber-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]" />
        <div className="absolute top-1/3 left-1/4 w-[520px] h-[520px] bg-neon-cyan/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[460px] h-[460px] bg-cyber-purple/10 rounded-full blur-[130px]" />

        <canvas ref={canvasRef} className="relative z-10 h-full w-full" />

        <motion.div
          style={{ opacity: cueOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-gray-500 z-10"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">
            Role para explorar
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default CinematicScrollSection;
