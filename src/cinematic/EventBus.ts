type Handler<T> = (payload: T) => void;

/**
 * Minimal typed pub/sub — the "Event Layer" the cinematic experience emits
 * lifecycle events onto. Nothing subscribes to most of these yet, but the
 * seams exist for future consumers (analytics, audio cues, haptics,
 * preloading hints, bloom/particle reactions, Hero handoff signals) without
 * ever touching SceneEngine or scene internals.
 */
export class EventBus<Events extends Record<string, unknown>> {
  private handlers = new Map<keyof Events, Set<Handler<unknown>>>();

  on<K extends keyof Events>(event: K, handler: Handler<Events[K]>): () => void {
    const set = this.handlers.get(event) ?? new Set();
    set.add(handler as Handler<unknown>);
    this.handlers.set(event, set);
    return () => this.off(event, handler);
  }

  off<K extends keyof Events>(event: K, handler: Handler<Events[K]>): void {
    this.handlers.get(event)?.delete(handler as Handler<unknown>);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.handlers.get(event)?.forEach((handler) => handler(payload));
  }

  clear(): void {
    this.handlers.clear();
  }
}

export interface CinematicEventMap {
  'scene:enter': { id: string };
  'scene:complete': { id: string };
  'experience:complete': undefined;
  /** Fired only when the in-focus product actually changes (not every frame). `null` fields mean nothing is focused — the environment settles back to ATS cyan. */
  'products:stage': { productId: string | null; name: string | null; color: number | null };
  /** Fired only when the Holo Hall's interactive panel window is entered/exited (not every frame). */
  /**
   * Fired once the arrival at the Hall has settled enough for the Hero to
   * exist — the interface is born inside the still-pinned universe, not
   * after it releases into a separate page section.
   */
  'hall:hero-ready': { visible: boolean };
  /**
   * Fired whenever any frame-sequence scene advances to a newly-loaded
   * frame — the one wire connecting footage to interface. `brightness` is
   * that frame's average luma (0-1); `r`/`g`/`b` are its average color
   * (0-255), i.e. the temperature the shot is lit at. Consumers
   * (AmbientLayer, the Holo panels, the Hero HUD) lerp toward both instead
   * of jumping, so the interface reads as *lit by* the footage rather than
   * layered independently on top.
   *
   * V7-E added the color channels. With brightness alone this wire was a
   * dimmer: the interface tracked how bright the room was but was always
   * lit by the same imaginary white lamp, no matter what color the room
   * actually was.
   */
  'cinematic:ambient-light': { brightness: number; r: number; g: number; b: number };
  /**
   * Which holographic installation in the Hall is awake, and how much.
   *
   * V8 replaced `holo-hall:panels` (a boolean that turned a row of three
   * cards on and off at once) with this. The products are no longer
   * presented side by side: they are installations at three points of the
   * architecture, walked past one at a time, waking as the user approaches
   * and returning to standby as they leave. `anchorX`/`anchorY` are
   * normalized to the SOURCE frame, so the console can be placed on the
   * footage's own console through `computeFrameFit`.
   */
  'holo-hall:sector': {
    productId: string | null;
    wake: number;
    anchorX: number;
    anchorY: number;
  };
  /**
   * The last installation has returned to standby. The Guardian releases
   * his light on this rather than on a hardcoded global progress, which is
   * what used to couple him to this region's scroll distance — change the
   * distance and the beam silently fired in the wrong place.
   */
  'holo-hall:sectors-complete': { done: boolean };
  [key: string]: unknown;
}

/** Shared bus for the whole cinematic experience. */
export const cinematicEvents = new EventBus<CinematicEventMap>();
