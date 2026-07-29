import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { computePinState } from '../lib/pinScrollMath';
import { Timeline } from '../cinematic/Timeline';
import { SceneEngine } from '../cinematic/SceneEngine';
import { SCENE_REGISTRY } from '../cinematic/SceneRegistry';
import { SCENE_ASSETS } from '../cinematic/sceneAssets';
import { SCENE_DURATIONS } from '../cinematic/timeline.config';
import { getHoloHallFramePath, HOLOHALL_FRAME_COUNT } from '../cinematic/scenes/holohall/holohall.assets';
import { AmbientLayer } from '../cinematic/shared/AmbientLayer';
import type { GuardianPresence } from '../cinematic/shared/GuardianPresence';
import { cinematicEvents } from '../cinematic/EventBus';
import { intToRgb } from '../cinematic/shared/colorLerp';
import { getDeviceTier } from '../lib/deviceTier';
import HoloProductPanels from './cinematic-overlays/HoloProductPanels';
import HeroHUD from './cinematic-overlays/HeroHUD';

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
  const returnCanvasRef = useRef<HTMLCanvasElement>(null);
  const ambientCanvasRef = useRef<HTMLCanvasElement>(null);
  const guardianPresenceCanvasRef = useRef<HTMLCanvasElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SceneEngine | null>(null);
  const ambientLayerRef = useRef<AmbientLayer | null>(null);
  const guardianPresenceRef = useRef<GuardianPresence | null>(null);
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
    const returnCanvas = returnCanvasRef.current;
    const ambientCanvas = ambientCanvasRef.current;
    const guardianPresenceCanvas = guardianPresenceCanvasRef.current;
    if (
      !wrapper ||
      !pin ||
      !nucleusCanvas ||
      !portalCorridorCanvas ||
      !holoHallCanvas ||
      !returnCanvas ||
      !ambientCanvas ||
      !guardianPresenceCanvas
    )
      return;

    let cancelled = false;

    // The one layer that never pauses for scroll — a handful of drifting
    // motes plus a slow breathing glow, so the environment keeps feeling
    // alive even while the user (and every scroll-driven scene) is still.
    const ambientLayer = new AmbientLayer();
    ambientLayerRef.current = ambientLayer;
    ambientLayer.mount(ambientCanvas, getDeviceTier() === 'low' ? 16 : 42);

    // The Guardian belongs to the whole journey, not one scene — mounted
    // once here, driven by global pin progress (see GuardianPresence.ts).
    // Dynamically imported so Three.js never lands in the eager main
    // bundle — CinematicExperience itself isn't lazy-loaded, so a static
    // import here would drag the ~500KB library into first paint (the
    // exact bug the scene factories were built async to avoid).
    import('../cinematic/shared/GuardianPresence').then(({ GuardianPresence }) => {
      if (cancelled) return;
      const guardianPresence = new GuardianPresence();
      guardianPresenceRef.current = guardianPresence;
      void guardianPresence.mount(guardianPresenceCanvas, getDeviceTier() === 'high' ? 2 : 1.5);
    });

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

    const applyPinState = () => {
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

      const engine = engineRef.current;
      if (engine) {
        engine.resizeAll(pin.clientWidth, pin.clientHeight);
        engine.tick(progress);
      }
      ambientLayerRef.current?.resize(pin.clientWidth, pin.clientHeight);
      ambientLayerRef.current?.setScrollProgress(progress);
      guardianPresenceRef.current?.resize(pin.clientWidth, pin.clientHeight);
      guardianPresenceRef.current?.setProgress(progress);

      if (cueRef.current) {
        cueRef.current.style.opacity = progress < 0.04 ? String(1 - progress / 0.04) : '0';
      }
    };

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
        return: returnCanvas,
      });
      engine.preloadAll();
      applyPinState();
    });

    return () => {
      cancelled = true;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      engineRef.current?.unmountAll();
      engineRef.current = null;
      ambientLayerRef.current?.unmount();
      ambientLayerRef.current = null;
      guardianPresenceRef.current?.unmount();
      guardianPresenceRef.current = null;
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
        <canvas ref={returnCanvasRef} className="absolute inset-0 z-[-20] h-full w-full" />
        <canvas ref={holoHallCanvasRef} className="absolute inset-0 z-[-10] h-full w-full" />
        <canvas ref={portalCorridorCanvasRef} className="absolute inset-0 z-0 h-full w-full" />
        <canvas ref={nucleusCanvasRef} className="absolute inset-0 z-20 h-full w-full" />

        {/* The Guardian — a persistent inhabitant, not a scene, so he sits
            above every region canvas rather than inside the stack. See
            GuardianPresence.ts. */}
        <canvas ref={guardianPresenceCanvasRef} className="absolute inset-0 z-[22] h-full w-full pointer-events-none" />

        {/* Always breathing, independent of scroll — see AmbientLayer.ts */}
        <canvas ref={ambientCanvasRef} className="absolute inset-0 z-[25] h-full w-full pointer-events-none" />

        {/* Extremely subtle vignette — a hint of lens falloff at the edges,
            just enough to keep every scene reading like one continuous shot. */}
        <div className="absolute inset-0 z-[26] pointer-events-none [background:radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.4)_100%)]" />

        <HoloProductPanels />
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
