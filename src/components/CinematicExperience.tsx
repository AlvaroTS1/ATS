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
import type { Guardian } from '../cinematic/shared/Guardian';
import { cinematicEvents } from '../cinematic/EventBus';
import { intToRgb } from '../cinematic/shared/colorLerp';
import { getDeviceTier } from '../lib/deviceTier';
import HologramConsole from './cinematic-overlays/HologramConsole';
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
 * How far past the pinned journey the Guardian's light takes to clear, in
 * scroll px.
 *
 * This is what removes the interval. The flash used to live inside the pin,
 * so it died the instant the pin released and the first section then slid
 * up as an ordinary scroll — the seam every version since V5.1 has been
 * fighting. Held across the boundary instead, the page scrolls into place
 * WHILE the screen is still white, and the light clears onto a site that is
 * simply already there. The viewer never sees anything arrive.
 *
 * Roughly two thirds of a viewport: long enough to cover the handoff,
 * short enough that nobody is left staring at white.
 */
const FLASH_CLEAR_PX = 620;

/**
 * Host for the whole cinematic Scene Engine. Owns exactly the pin/unpin
 * mechanics (via `pinScrollMath.ts`, unchanged) and the stacked canvases —
 * one per scene, ordered so the earliest scene sits on top and fades away
 * to reveal the next one underneath. Every visual decision beyond that
 * belongs to the scenes themselves. `HologramConsole` is the one
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
  const guardianCanvasRef = useRef<HTMLCanvasElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SceneEngine | null>(null);
  const ambientLayerRef = useRef<AmbientLayer | null>(null);
  const guardianRef = useRef<Guardian | null>(null);
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
    const guardianCanvas = guardianCanvasRef.current;
    if (
      !wrapper ||
      !pin ||
      !nucleusCanvas ||
      !portalCorridorCanvas ||
      !holoHallCanvas ||
      !hallCanvas ||
      !ambientCanvas ||
      !guardianCanvas
    )
      return;

    let cancelled = false;

    // The one layer that never pauses for scroll — a handful of drifting
    // motes plus a slow breathing glow, so the environment keeps feeling
    // alive even while the user (and every scroll-driven scene) is still.
    const ambientLayer = new AmbientLayer();
    ambientLayerRef.current = ambientLayer;
    ambientLayer.mount(ambientCanvas, getDeviceTier() === 'low' ? 16 : 42);

    // The awake installation (see HologramConsole) leans the whole ambience
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

    // The Guardian. Dynamically imported so Three.js never lands in the
    // eager main bundle — CinematicExperience isn't lazy-loaded, so a
    // static import here would drag the ~500KB library into first paint
    // (a bug this migration hit twice; the bundle is checked every build).
    //
    // The `import()` — and with it `guardian.mp4`'s fetch — is deferred one
    // idle tick past mount. Measured on load: without this, his 697KB video
    // starts downloading at the same instant as the nucleus scene's eager
    // frame batch, competing for bandwidth in the single most
    // bandwidth-constrained moment of the visit. He has no visual reason to
    // rush: his pose curve keeps him fully transparent until global progress
    // 0.5, thousands of pixels of scroll away, so losing a beat here costs
    // nothing he needs and gives the nucleus frames — what the user is
    // actually looking at — the network first.
    // `timeout` is load-bearing, not decoration. Measured: with no timeout,
    // this experience's own continuous rAF loops (AmbientLayer's breathing,
    // the scroll-easing loop) keep the main thread signalling "not idle"
    // indefinitely — `requestIdleCallback` never fired at all in a 6.5s
    // window. The timeout forces it to run anyway once that much time has
    // passed, which is still well before he needs to be visible.
    const scheduleIdle =
      typeof requestIdleCallback === 'function'
        ? (cb: () => void) => requestIdleCallback(cb, { timeout: 1500 })
        : (cb: () => void) => setTimeout(cb, 1500);
    scheduleIdle(() => {
      if (cancelled) return;
      import('../cinematic/shared/Guardian').then(({ Guardian }) => {
        if (cancelled) return;
        const tier = getDeviceTier();
        const guardian = new Guardian();
        guardianRef.current = guardian;
        void guardian.mount(guardianCanvas, tier === 'high' ? 2 : 1.5, tier).then(() => {
          if (cancelled) return;
          guardian.resize(pin.clientWidth, pin.clientHeight);
          guardian.setProgress(smoothedProgress);
        });
      });
    });

    /** Sizing is a resize concern, not a per-frame one — kept off the eased loop. */
    const resizeWorld = () => {
      engineRef.current?.resizeAll(pin.clientWidth, pin.clientHeight);
      ambientLayerRef.current?.resize(pin.clientWidth, pin.clientHeight);
      guardianRef.current?.resize(pin.clientWidth, pin.clientHeight);
    };

    // The Guardian reports how bright his light is; how much of it reaches
    // the screen also depends on how far past the pin we have scrolled.
    let flashIntensity = 0;
    const paintFlash = () => {
      const el = flashRef.current;
      if (!el) return;
      const rect = wrapper.getBoundingClientRect();
      // How far the viewport has travelled beyond the end of the journey.
      const overshoot = Math.max(0, window.innerHeight - rect.bottom);
      const clearing = Math.min(1, overshoot / FLASH_CLEAR_PX);
      const opacity = flashIntensity * (1 - clearing);
      el.style.opacity = String(opacity);
      // Kept out of the compositor entirely when it has nothing to show.
      el.style.visibility = opacity > 0.002 ? 'visible' : 'hidden';
    };

    const unsubscribeFlash = cinematicEvents.on('guardian:flash', ({ intensity }) => {
      flashIntensity = intensity;
      paintFlash();
    });

    /** Everything that lives on scroll progress reads the SMOOTHED value. */
    const pushWorldProgress = (p: number) => {
      engineRef.current?.tick(p);
      ambientLayerRef.current?.setScrollProgress(p);
      guardianRef.current?.setProgress(p);
      paintFlash();
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
      // Past the pin `progress` is pinned at 1, so the clearing has to be
      // driven from the raw scroll or the light would freeze on screen.
      paintFlash();
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
      guardianRef.current?.unmount();
      guardianRef.current = null;
      unsubscribeProductStage();
      unsubscribeFlash();
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
      {/*
        The Guardian's released light. OUTSIDE the pin and `fixed`, so it
        survives the pin releasing and can fade out over the page — see
        FLASH_CLEAR_PX. Inside the pin it died at the boundary and the site
        slid up behind it, which is the interval this removes.
      */}
      <div
        ref={flashRef}
        aria-hidden="true"
        className="fixed inset-0 z-[60] bg-white pointer-events-none"
        style={{ opacity: 0, visibility: 'hidden' }}
      />

      {/*
        One grain surface over the WHOLE document — footage, interface,
        the released light and the page below it. Outside the pin for the
        same reason the flash is: inside, it stopped at the pin's edge and
        left a texture seam exactly where the handover happens.
      */}
      <FilmGrain />
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
          The Guardian, above the footage he inhabits (see Guardian.ts).
          A persistent layer rather than a scene, driven by global journey
          progress — he doesn't belong to one region, he belongs to the
          whole trip.

          V8 rebuilt him from scratch against a source shot to spec: a true
          black void, so a luma matte separates him with no mask painting,
          and an edge feather forces alpha to zero before the plate's own
          border can ever reach the screen. His predecessor was retired
          because none of that was possible — a cropped bust on a mid-tone
          teal background, borders 6-10x brighter than this stack's
          near-black, armour darker than the background it sat on.

          The wireframe monument that shared this layer is gone for good:
          the footage already IS monumental architecture with integrated
          holograms, and a second line-art building over photoreal
          architecture just put two buildings in one frame.
        */}
        <canvas
          ref={guardianCanvasRef}
          className="absolute inset-0 z-[21] h-full w-full pointer-events-none"
        />

        {/* Always breathing, independent of scroll — see AmbientLayer.ts */}
        <canvas ref={ambientCanvasRef} className="absolute inset-0 z-[25] h-full w-full pointer-events-none" />

        {/* Extremely subtle vignette — a hint of lens falloff at the edges,
            just enough to keep every scene reading like one continuous shot. */}
        <div className="absolute inset-0 z-[26] pointer-events-none [background:radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.4)_100%)]" />

        {/*
          The bottom of the frame dissolves into the page's own colour
          before the pin's edge ever arrives.

          `overflow: hidden` clips the footage dead straight at the pin's
          bottom, and the footage is a LIT corridor — so however well the
          base colours matched (both are rgb(3,7,18)), a bright plate was
          butting against flat colour along a razor-straight line. That
          line was the last thing announcing "the video ended here".
          Fading to exactly the page colour means the clip happens where
          both sides are already identical, and there is nothing left for
          the edge to reveal.

          Sits above every canvas but BELOW the interface, so it softens
          the footage without dimming the Hero panel that floats over it.
        */}
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
