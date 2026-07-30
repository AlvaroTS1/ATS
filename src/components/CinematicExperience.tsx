import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { computePinState } from '../lib/pinScrollMath';
import { stepProgress } from '../lib/scrollEasing';
import { Timeline } from '../cinematic/Timeline';
import { SceneEngine } from '../cinematic/SceneEngine';
import { SCENE_REGISTRY } from '../cinematic/SceneRegistry';
import { SCENE_ASSETS } from '../cinematic/sceneAssets';
import { SCENE_DURATIONS } from '../cinematic/timeline.config';
import { getHoloHallFramePath, HOLOHALL_FRAME_COUNT } from '../cinematic/scenes/holohall/holohall.assets';
import { AmbientLayer } from '../cinematic/shared/AmbientLayer';
import { cinematicEvents } from '../cinematic/EventBus';
import { intToRgb } from '../cinematic/shared/colorLerp';
import { getDeviceTier } from '../lib/deviceTier';
import HoloProductPanels from './cinematic-overlays/HoloProductPanels';
import HeroHUD from './cinematic-overlays/HeroHUD';
import FilmGrain from './cinematic-overlays/FilmGrain';

/**
 * Mobile-first: `timeline.config.ts` distances ARE the mobile pacing.
 * Desktop — more screen, a mouse-driven scroll that covers ground faster —
 * gets a touch more room per scene, so it expands instead of mobile being
 * a shrunk-down desktop.
 */
const DESKTOP_DISTANCE_SCALE = 4 / 3;
const MOBILE_BREAKPOINT_PX = 768;

/**
 * Host for the whole cinematic Scene Engine. Owns exactly the pin/unpin
 * mechanics (via `pinScrollMath.ts`, unchanged) and the stacked canvases —
 * one per scene, ordered so the earliest scene sits on top and fades away
 * to reveal the next one underneath. Every visual decision beyond that
 * belongs to the scenes themselves. `HoloProductPanels` is the one
 * exception: real interactive React UI layered above every canvas,
 * choosing for itself when it can receive pointer events (see that
 * component and `HoloHallScene.ts`).
 */
const CinematicExperience: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const nucleusCanvasRef = useRef<HTMLCanvasElement>(null);
  const portalCorridorCanvasRef = useRef<HTMLCanvasElement>(null);
  const holoHallCanvasRef = useRef<HTMLCanvasElement>(null);
  const hallCanvasRef = useRef<HTMLCanvasElement>(null);
  const ambientCanvasRef = useRef<HTMLCanvasElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SceneEngine | null>(null);
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
    const nucleusCanvas = nucleusCanvasRef.current;
    const portalCorridorCanvas = portalCorridorCanvasRef.current;
    const holoHallCanvas = holoHallCanvasRef.current;
    const hallCanvas = hallCanvasRef.current;
    const ambientCanvas = ambientCanvasRef.current;
    if (
      !wrapper ||
      !pin ||
      !nucleusCanvas ||
      !portalCorridorCanvas ||
      !holoHallCanvas ||
      !hallCanvas ||
      !ambientCanvas
    )
      return;

    let cancelled = false;

    // The one layer that never pauses for scroll — a handful of drifting
    // motes plus a slow breathing glow, so the environment keeps feeling
    // alive even while the user (and every scroll-driven scene) is still.
    const ambientLayer = new AmbientLayer();
    ambientLayerRef.current = ambientLayer;
    ambientLayer.mount(ambientCanvas, getDeviceTier() === 'low' ? 16 : 42);

    // A focused product (see HoloProductPanels) leans the whole ambience
    // toward its brand color — the environment itself reacts, not just the panel.
    const unsubscribeProductStage = cinematicEvents.on('products:stage', ({ color }) => {
      ambientLayerRef.current?.setTint(color !== null ? intToRgb(color) : null);
    });

    // Sizing the pin wrapper never waits on scene construction — it only
    // needs the timeline's total distance, known synchronously up front.
    const timeline = new Timeline(SCENE_DURATIONS);
    const distanceScale = window.innerWidth < MOBILE_BREAKPOINT_PX ? 1 : DESKTOP_DISTANCE_SCALE;
    const totalDistance = Math.round(timeline.getTotalDistance() * distanceScale);
    wrapper.style.height = `calc(100vh + ${totalDistance}px)`;

    let ticking = false;
    let targetProgress = 0;
    let smoothedProgress = 0;
    let easeRafId: number | null = null;

    /** Sizing is a resize concern, not a per-frame one — kept off the eased loop. */
    const resizeWorld = () => {
      engineRef.current?.resizeAll(pin.clientWidth, pin.clientHeight);
      ambientLayerRef.current?.resize(pin.clientWidth, pin.clientHeight);
    };

    /** Everything that lives on scroll progress reads the SMOOTHED value. */
    const pushWorldProgress = (p: number) => {
      engineRef.current?.tick(p);
      ambientLayerRef.current?.setScrollProgress(p);
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

      // The pin itself is NEVER smoothed — a lagging fixed/absolute toggle
      // would visibly detach the pinned layer from the page.
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
      resizeWorld();
      pushWorldProgress(smoothedProgress);
    };

    applyPinState();
    resizeWorld();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    SceneEngine.create(SCENE_REGISTRY, SCENE_ASSETS, timeline).then((engine) => {
      if (cancelled) {
        engine.unmountAll();
        return;
      }
      engineRef.current = engine;
      engine.mountAll({
        nucleus: nucleusCanvas,
        'portal-corridor': portalCorridorCanvas,
        'holo-hall': holoHallCanvas,
        hall: hallCanvas,
      });
      engine.preloadAll();
      // The engine missed every frame drawn before it existed — size it and
      // paint the current progress immediately, without easing in from 0.
      applyPinState();
      resizeWorld();
      smoothedProgress = targetProgress;
      pushWorldProgress(smoothedProgress);
    });

    return () => {
      cancelled = true;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (easeRafId !== null) cancelAnimationFrame(easeRafId);
      easeRafId = null;
      engineRef.current?.unmountAll();
      engineRef.current = null;
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
        <img
          src={getHoloHallFramePath(HOLOHALL_FRAME_COUNT - 1)}
          alt=""
          className="h-full w-full object-cover md:object-contain"
        />
      </div>
    );
  }

  return (
    <div id="home" ref={wrapperRef} aria-hidden="true" className="relative w-full bg-space-black">
      <div
        ref={pinRef}
        className="absolute inset-x-0 h-screen w-full overflow-hidden flex items-center justify-center pointer-events-none"
      >
        {/* Ambient dressing fills any letterboxed edges, matching the site's identity */}
        <div className="absolute inset-0 cyber-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]" />
        <div className="absolute top-1/3 left-1/4 w-[520px] h-[520px] bg-neon-cyan/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[460px] h-[460px] bg-cyber-purple/10 rounded-full blur-[130px]" />

        {/* One continuous cinematic take (nucleus -> portal-corridor -> holo-hall -> return),
            stacked earliest-on-top so each fades away to reveal the next one underneath. */}
        <canvas ref={hallCanvasRef} className="absolute inset-0 z-[-20] h-full w-full" />
        <canvas ref={holoHallCanvasRef} className="absolute inset-0 z-[-10] h-full w-full" />
        <canvas ref={portalCorridorCanvasRef} className="absolute inset-0 z-0 h-full w-full" />
        <canvas ref={nucleusCanvasRef} className="absolute inset-0 z-20 h-full w-full" />

        {/*
          V8: the Sede layer is gone, and z-[21] is deliberately left empty
          for the Guardian to return into.

          It held two things, and the audit killed both. The wireframe
          monument competed with the footage instead of adding to it —
          `holo-hall` and the Hall footage already ARE monumental
          architecture with integrated holograms, so drawing a second,
          line-art building over photoreal architecture put two buildings
          in one frame. And the Guardian was a rectangle: measured against
          this stack's near-black (luma ~7), his plate's borders sat at luma
          45-72, a 6-10x step at the edge, on a frame that crops his skull
          and shoulders so no feather could hide it, over a background too
          bright to key without eating his own armour.

          The headquarters is the FOOTAGE. The Guardian comes back only
          when he can be an inhabitant of it rather than a plate over it.
        */}

        {/* Always breathing, independent of scroll — see AmbientLayer.ts */}
        <canvas ref={ambientCanvasRef} className="absolute inset-0 z-[25] h-full w-full pointer-events-none" />

        {/* Extremely subtle vignette — a hint of lens falloff at the edges,
            just enough to keep every scene reading like one continuous shot. */}
        <div className="absolute inset-0 z-[26] pointer-events-none [background:radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.4)_100%)]" />

        <HoloProductPanels />
        <HeroHUD />

        {/* Above EVERYTHING, footage and interface alike — that is the whole
            point: one shared surface is what stops the eye reading two
            layers. See FilmGrain.tsx. */}
        <FilmGrain />

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
