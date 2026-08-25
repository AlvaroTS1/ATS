import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { computePinState } from '../lib/pinScrollMath';
import { stepProgress } from '../lib/scrollEasing';
import { AmbientLayer } from '../cinematic/shared/AmbientLayer';
import { cinematicEvents } from '../cinematic/EventBus';
import { intToRgb } from '../cinematic/shared/colorLerp';
import { getDeviceTier } from '../lib/deviceTier';
import HologramConsole from './cinematic-overlays/HologramConsole';
import HeroHUD from './cinematic-overlays/HeroHUD';
import FilmGrain from './cinematic-overlays/FilmGrain';

/**
 * Mobile-first: distances below ARE the mobile pacing. Desktop — more
 * screen, a mouse-driven scroll that covers ground faster — gets a touch
 * more room, so it expands instead of mobile being a shrunk-down desktop.
 */
const DESKTOP_DISTANCE_SCALE = 4 / 3;
const MOBILE_BREAKPOINT_PX = 768;

/**
 * Total scroll-px dedicated to the pinned journey. One take now, not four
 * scenes stitched together — see the "novo vídeo para o hero" mission that
 * retired `nucleus`/`portal-corridor`/`holo-hall`/`hall`. Sized to give the
 * three installations (below) and the Hero HUD's arrival enough room each,
 * without the old multi-scene total (7400px mobile).
 */
const PIN_DISTANCE = 3200;

const GUARDIAN_VIDEO = '/cinematic/guardian/guardian.mp4';

/** The shipped source is 720x1280 — HologramConsole's placement fit reads this. */
export const GUARDIAN_SOURCE_WIDTH = 720;
export const GUARDIAN_SOURCE_HEIGHT = 1280;

interface Sector {
  productId: string;
  anchor: { x: number; y: number };
  from: number;
  to: number;
}

/**
 * Three installations, walked past one at a time rather than presented side
 * by side — same grammar `holohall.assets.ts` used, reproduced here because
 * this scene no longer exists. The footage itself is a single continuous
 * take with no baked-in console geometry to anchor to, so these anchors are
 * a deliberate placement choice (left / centre / right, held mid-frame)
 * rather than a measurement.
 */
const SECTORS: ReadonlyArray<Sector> = [
  { productId: 'fusion-buy', anchor: { x: 0.24, y: 0.5 }, from: 0.14, to: 0.36 },
  { productId: 'reencontra', anchor: { x: 0.5, y: 0.5 }, from: 0.38, to: 0.6 },
  { productId: 'coffee-break', anchor: { x: 0.76, y: 0.5 }, from: 0.62, to: 0.84 },
];

/** Fraction of a sector's window spent waking, and again spent returning to standby. */
const WAKE_RAMP = 0.28;

/** Past this, the pinned journey has settled enough for the Hero HUD to resolve. */
const HERO_READY_AT = 0.86;

const smoothstep = (t: number): number => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

/**
 * Host for the Hero. One scroll-scrubbed video (see `guardian.mp4`) full
 * bleed behind the interface, no WebGL — the matte/composite stack this
 * replaced existed to key a small figure out of a void-plate; this footage
 * is a complete, already-lit shot, so a plain `<video>` scrubbed by scroll
 * progress is both the correct fit and the lighter one.
 */
const CinematicExperience: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ambientCanvasRef = useRef<HTMLCanvasElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const ambientLayerRef = useRef<AmbientLayer | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useLayoutEffect(() => {
    if (prefersReducedMotion) return;
    const wrapper = wrapperRef.current;
    const pin = pinRef.current;
    const video = videoRef.current;
    const ambientCanvas = ambientCanvasRef.current;
    if (!wrapper || !pin || !video || !ambientCanvas) return;

    const ambientLayer = new AmbientLayer();
    ambientLayerRef.current = ambientLayer;
    ambientLayer.mount(ambientCanvas, getDeviceTier() === 'low' ? 16 : 42);

    // The awake installation leans the whole ambience toward its brand
    // colour — the environment reacts, not just the panel.
    const unsubscribeProductStage = cinematicEvents.on('products:stage', ({ color }) => {
      ambientLayerRef.current?.setTint(color !== null ? intToRgb(color) : null);
    });

    const distanceScale = window.innerWidth < MOBILE_BREAKPOINT_PX ? 1 : DESKTOP_DISTANCE_SCALE;
    const totalDistance = Math.round(PIN_DISTANCE * distanceScale);
    wrapper.style.height = `calc(100vh + ${totalDistance}px)`;

    let ticking = false;
    let targetProgress = 0;
    let smoothedProgress = 0;
    let easeRafId: number | null = null;
    let heroReady = false;
    const sectorOut = { productId: null as string | null, wake: 0, anchorX: 0.5, anchorY: 0.5 };

    const resolveSector = (progress: number): void => {
      sectorOut.productId = null;
      sectorOut.wake = 0;
      for (const sector of SECTORS) {
        if (progress < sector.from || progress > sector.to) continue;
        const t = (progress - sector.from) / (sector.to - sector.from);
        sectorOut.productId = sector.productId;
        sectorOut.wake = Math.min(
          smoothstep(t / WAKE_RAMP),
          smoothstep((1 - t) / WAKE_RAMP),
        );
        sectorOut.anchorX = sector.anchor.x;
        sectorOut.anchorY = sector.anchor.y;
        return;
      }
    };

    const pushWorldProgress = (p: number) => {
      // Scrubbed, not played — the whole clip maps onto the pinned scroll
      // range, so scrolling back always retracts to an earlier frame.
      if (video.duration) {
        const target = Math.min(video.duration, Math.max(0, p * video.duration));
        if (Math.abs(target - video.currentTime) >= 1 / 60) video.currentTime = target;
      }

      ambientLayerRef.current?.setScrollProgress(p);
      resolveSector(p);
      cinematicEvents.emit('holo-hall:sector', {
        productId: sectorOut.productId,
        wake: sectorOut.wake,
        anchorX: sectorOut.anchorX,
        anchorY: sectorOut.anchorY,
      });

      const ready = p >= HERO_READY_AT;
      if (ready !== heroReady) {
        heroReady = ready;
        cinematicEvents.emit('hall:hero-ready', { visible: ready });
      }

      if (cueRef.current) {
        cueRef.current.style.opacity = p < 0.04 ? String(1 - p / 0.04) : '0';
      }
    };

    const stepEase = () => {
      const { value, keepEasing } = stepProgress(smoothedProgress, targetProgress);
      smoothedProgress = value;
      pushWorldProgress(smoothedProgress);
      easeRafId = keepEasing ? requestAnimationFrame(stepEase) : null;
    };

    const startEasing = () => {
      if (easeRafId === null) easeRafId = requestAnimationFrame(stepEase);
    };

    const applyPinState = () => {
      const rect = wrapper.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const { position, top, progress } = computePinState(
        rect.top,
        rect.bottom,
        rect.height,
        viewportH,
      );

      // Never smoothed — a lagging fixed/absolute toggle would visibly
      // detach the pinned layer from the page.
      pin.style.position = position;
      pin.style.top = `${top}px`;

      targetProgress = progress;
      startEasing();
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        applyPinState();
        ticking = false;
      });
    };

    const onResize = () => {
      applyPinState();
      ambientLayerRef.current?.resize(pin.clientWidth, pin.clientHeight);
    };

    video.addEventListener(
      'loadedmetadata',
      () => {
        applyPinState();
        smoothedProgress = targetProgress;
        pushWorldProgress(smoothedProgress);
      },
      { once: true },
    );

    applyPinState();
    ambientLayerRef.current?.resize(pin.clientWidth, pin.clientHeight);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (easeRafId !== null) cancelAnimationFrame(easeRafId);
      easeRafId = null;
      ambientLayerRef.current?.unmount();
      ambientLayerRef.current = null;
      unsubscribeProductStage();
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    // Respect the user's preference: a static frame, normal (non-pinned) height.
    return (
      <div
        id="home"
        aria-hidden="true"
        className="relative w-full h-[70vh] md:h-screen bg-space-black overflow-hidden flex items-center justify-center"
      >
        <video
          src={GUARDIAN_VIDEO}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div id="home" ref={wrapperRef} aria-hidden="true" className="relative w-full bg-space-black">
      <FilmGrain />
      <div
        ref={pinRef}
        className="absolute inset-x-0 h-screen w-full overflow-hidden flex items-center justify-center pointer-events-none"
      >
        <video
          ref={videoRef}
          src={GUARDIAN_VIDEO}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />

        {/* Always breathing, independent of scroll — see AmbientLayer.ts */}
        <canvas ref={ambientCanvasRef} className="absolute inset-0 z-[25] h-full w-full pointer-events-none" />

        {/* Extremely subtle vignette — a hint of lens falloff at the edges. */}
        <div className="absolute inset-0 z-[26] pointer-events-none [background:radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.4)_100%)]" />

        {/* The bottom of the frame dissolves into the page's own colour
            before the pin's edge ever arrives — see the prior version's
            note on why a hard clip line reads as "the video ended here". */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 z-30 h-56 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgb(3, 7, 18))' }}
        />

        <HologramConsole />
        <HeroHUD />

        <div
          ref={cueRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-gray-500 z-30"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">
            Role para explorar
          </span>
        </div>
      </div>
    </div>
  );
};

export default CinematicExperience;
