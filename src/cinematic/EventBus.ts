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
  'holo-hall:panels': { visible: boolean };
  /**
   * Fired once the arrival at the Hall has settled enough for the Hero to
   * exist — the interface is born inside the still-pinned universe, not
   * after it releases into a separate page section.
   */
  'hall:hero-ready': { visible: boolean };
  /**
   * Fired whenever any frame-sequence scene advances to a newly-loaded
   * frame — the one wire connecting footage to interface. `brightness` is
   * that frame's average luma (0-1). Consumers (AmbientLayer, the Holo
   * panels' glow) lerp toward it instead of jumping, so the environment's
   * light reads as *lit by* the footage, not layered independently on top.
   */
  'cinematic:ambient-light': { brightness: number };
  [key: string]: unknown;
}

/** Shared bus for the whole cinematic experience. */
export const cinematicEvents = new EventBus<CinematicEventMap>();
