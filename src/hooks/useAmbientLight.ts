import { useEffect, useRef } from 'react';
import { cinematicEvents } from '../cinematic/EventBus';

/**
 * Ties a piece of interface to the light of the shot it sits on: level AND
 * temperature, from `'cinematic:ambient-light'` (see `sampleAmbient.ts`).
 *
 * Writes two custom properties on the element:
 *
 *   --ambient-light  a 0.85-1.15 brightness multiplier
 *   --ambient-tint   the shot's average colour
 *
 * Both are registered with `@property` in `index.css`, and the element
 * these are written on must carry `.ambient-lit`, which transitions THEM
 * rather than the `filter` and gradients that depend on them — the tint is
 * consumed as a gradient, and gradients cannot be transitioned directly.
 * See the `@property` blocks for the full reasoning.
 *
 * Note the transition has to live on the same element the writes land on:
 * that's where the property actually changes. Descendants inherit the
 * already-interpolated value, which is why `HoloPanel` needs no transition
 * of its own.
 *
 * Deliberately NOT React state. This fires on every frame change of the
 * footage; routing it through a render would rebuild the whole panel
 * subtree dozens of times a second for what is, in the end, two string
 * writes.
 *
 * The brightness range is deliberately narrow. The interface should feel
 * lit by the room, not strobe with it — a panel that swings across the
 * full 0-1 range announces that something is driving it.
 */
export function useAmbientLight<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    return cinematicEvents.on('cinematic:ambient-light', ({ brightness, r, g, b }) => {
      const el = ref.current;
      if (!el) return;
      el.style.setProperty('--ambient-light', String(0.85 + brightness * 0.3));
      // A real colour value, not "r, g, b" tokens — `syntax: '<color>'`
      // is what makes it interpolable.
      el.style.setProperty(
        '--ambient-tint',
        `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`,
      );
    });
  }, []);

  return ref;
}
