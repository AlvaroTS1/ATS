/** Declares the static assets a scene needs, so paths never scatter through the codebase. */
export interface SceneAssets {
  id: string;
  textures?: string[];
  frames?: string[];
  videos?: string[];
  /** Lower runs first / more eagerly. */
  preloadPriority: number;
}

/**
 * A scene never draws directly in response to being asked "what do you look
 * like at progress X" — it separates that into two steps so Animator and
 * Renderer concerns can't blur together:
 *  - `update`: pure state computation from scroll progress (the Animator's job).
 *  - `render`: draws the last computed state, blended by `opacity` for
 *    cross-fade during scene overlap (the Renderer's job).
 *
 * `mount()` only ever hands a scene a blank `<canvas>` — what fills it is
 * entirely the scene's own business. Nothing in `SceneEngine` or `Timeline`
 * ever inspects HOW a scene renders, so any of these three strategies
 * (or a future fourth one) plugs in without touching either:
 *  - Procedural (WebGL/Three.js) — see `scenes/genesis`, `scenes/ecosystem`.
 *  - Pre-extracted frame sequence, drawn via `ctx.drawImage(image, ...)`
 *    each frame — see `scenes/core`.
 *  - Scroll-synced video, drawn via `ctx.drawImage(videoElement, ...)` each
 *    frame while `shared/VideoSource.ts` drives `video.currentTime` from
 *    the scene's local progress — no scene using this yet, but the
 *    primitive exists and needs no engine changes to adopt.
 */
export interface Scene {
  readonly id: string;
  preload(assets: SceneAssets): Promise<void>;
  mount(canvas: HTMLCanvasElement): void;
  update(localProgress: number): void;
  render(opacity: number): void;
  resize(cssWidth: number, cssHeight: number): void;
  unmount(): void;
}

/**
 * Factory so the registry can construct scenes without the engine knowing
 * their internals. Async on purpose: a scene that pulls in a heavy library
 * (e.g. Three.js) can defer that import to runtime via `import()`, instead
 * of dragging it into the app's eagerly-loaded entry bundle.
 */
export type SceneFactory = () => Promise<Scene>;

/** One entry of the scroll timeline, expressed in scroll-distance px — never hand-typed fractions. */
export interface SceneDurationConfig {
  id: string;
  /** Dedicated scroll distance (px) for this scene, before considering overlap. */
  distance: number;
  /** Fraction of THIS scene's own distance spent cross-fading into the next scene. */
  overlap?: number;
}

/** What the timeline reports for a scene that is currently active at a given progress. */
export interface ActiveSceneEntry {
  id: string;
  /** 0-1 progress local to this scene's own duration. */
  localProgress: number;
  /** 0-1 render opacity (1 outside overlap windows, cross-fading inside them). */
  opacity: number;
}
