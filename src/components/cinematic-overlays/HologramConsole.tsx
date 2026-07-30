import React, { useEffect, useRef, useState } from 'react';
import { cinematicEvents } from '../../cinematic/EventBus';
import { computeFrameFit } from '../../cinematic/shared/frameFit';
import { hexStringToInt } from '../../cinematic/shared/colorLerp';
import { getProduct } from '../../data/products';
import ProductCTAs from '../ui/ProductCTAs';
import StatusBadge from '../ui/StatusBadge';
import { useAmbientLight } from '../../hooks/useAmbientLight';
import { cn } from '../../lib/utils';

/** The source frames are 540x960; the anchors are normalized against them. */
const SOURCE_WIDTH = 540;
const SOURCE_HEIGHT = 960;

/** Console size. One at a time means it only has to fit the frame, not two siblings. */
const CONSOLE_MAX_WIDTH = 320;
/** Never closer than this to a screen edge. */
const EDGE_MARGIN = 16;

/** Wake below which the console is present but unlit — a device on standby. */
const STANDBY_UNTIL = 0.06;

interface Placement {
  left: number;
  top: number;
  width: number;
}

/**
 * A holographic installation belonging to the architecture, not a product
 * card floating over it.
 *
 * ONE is awake at a time, and that is the decision everything else follows
 * from. Three abreast could never be anchored to the footage's own consoles
 * — they needed 508px of separation and the footage offers 149px — so the
 * old row had no choice but to sit centred over the shot as obvious HTML.
 * With one, the only constraint is the frame: 320px centred on the left
 * anchor spans x 639-959 of a 1920px screen.
 *
 * It is placed through `computeFrameFit`, the same function the renderer
 * uses to lay the footage into the canvas, so the console lands on the
 * footage's own console at any viewport instead of at a guessed percentage.
 *
 * Standby matters as much as waking. The structure stays visible and unlit
 * between visits, because a device you can see sleeping is part of the
 * room, while one that appears from nothing is interface being delivered
 * to you.
 */
const HologramConsole: React.FC = () => {
  const [productId, setProductId] = useState<string | null>(null);
  const [wake, setWake] = useState(0);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef({ x: 0.5, y: 0.556 });
  const litRef = useAmbientLight<HTMLDivElement>();

  useEffect(() => {
    const place = () => {
      const el = containerRef.current;
      if (!el) return;
      const { clientWidth: w, clientHeight: h } = el;
      if (w === 0 || h === 0) return;
      // Exactly the placement the footage itself got.
      const fit = computeFrameFit(SOURCE_WIDTH, SOURCE_HEIGHT, w, h);
      const width = Math.min(CONSOLE_MAX_WIDTH, w - EDGE_MARGIN * 2);
      const centreX = fit.x + anchorRef.current.x * fit.width;

      // Clamped into the viewport. In `cover` the footage overflows
      // sideways, so an anchor near the source's edge maps off-screen —
      // measured on a 375px phone, the left installation landed at x -94
      // and the right one ran to 459. On a narrow screen all three end up
      // centred, which is correct: a phone has no room for three distinct
      // lateral positions, and there the SEQUENCE carries the discovery,
      // not the placement.
      const left = Math.min(
        Math.max(centreX - width / 2, EDGE_MARGIN),
        w - width - EDGE_MARGIN,
      );
      setPlacement({ left, top: fit.y + anchorRef.current.y * fit.height, width });
    };

    const unsubscribe = cinematicEvents.on(
      'holo-hall:sector',
      ({ productId: id, wake: w, anchorX, anchorY }) => {
        anchorRef.current = { x: anchorX, y: anchorY };
        setProductId(id);
        setWake(w);
        place();
      },
    );

    place();
    window.addEventListener('resize', place);
    return () => {
      unsubscribe();
      window.removeEventListener('resize', place);
    };
  }, []);

  const product = productId ? getProduct(productId) : null;
  const awake = wake > STANDBY_UNTIL;

  useEffect(() => {
    // The whole environment leans toward whichever installation is awake —
    // `AmbientLayer`'s dust and glow lerp to this colour (via the host), so
    // the room reacts, not only the console. Carried over from the row this
    // replaced; without it the ambience would have quietly gone monochrome.
    cinematicEvents.emit('products:stage', {
      productId: awake ? (product?.id ?? null) : null,
      name: awake ? (product?.name ?? null) : null,
      color: awake && product ? hexStringToInt(product.accent.from) : null,
    });
  }, [product, awake]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-40 pointer-events-none">
      {product && placement && (
        <div
          className="absolute"
          style={{
            width: placement.width,
            // Centred on the anchor, so the console sits ON the footage's
            // own console rather than beside it — already clamped into the
            // viewport when the anchor would have pushed it off-screen.
            left: placement.left,
            top: placement.top,
            transform: 'translateY(-50%)',
            pointerEvents: awake ? 'auto' : 'none',
          }}
        >
          <div
            ref={litRef}
            className="ambient-lit relative rounded-xl border backdrop-blur-[3px]"
            style={{
              // The footage's consoles are thin cyan structure over a barely
              // tinted fill. Matching that grammar is what makes this belong;
              // the old cards used a near-opaque fill and a thick brand-coloured
              // border, which is the visual language of a web card.
              borderColor: `rgba(41, 171, 226, ${0.2 + wake * 0.45})`,
              backgroundColor: `rgba(8, 16, 26, ${0.14 + wake * 0.3})`,
              boxShadow: `0 0 ${18 + wake * 34}px -12px rgba(41, 171, 226, ${0.15 + wake * 0.4})`,
              filter: `brightness(var(--ambient-light))`,
              // Standby is dim and desaturated, waking brings it up. Scale
              // and position never change — the console does not grow into
              // existence, it lights up (see `lib/reveal.ts`).
              opacity: 0.24 + wake * 0.76,
            }}
          >
            {/* Corner brackets: the footage's own HUD detail, and here the
                dominant framing rather than an accent. */}
            {(
              [
                'top-0 left-0 border-t border-l',
                'top-0 right-0 border-t border-r',
                'bottom-0 left-0 border-b border-l',
                'bottom-0 right-0 border-b border-r',
              ] as const
            ).map((pos) => (
              <span
                key={pos}
                className={cn('absolute h-3.5 w-3.5', pos)}
                style={{ borderColor: `rgba(41, 171, 226, ${0.35 + wake * 0.5})` }}
              />
            ))}

            <div className="px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: product.accent.from }}
                >
                  {product.category}
                </span>
                <StatusBadge status={product.status} className="scale-90" />
              </div>

              <h3 className="mt-2 text-base font-bold tracking-tight text-white">
                {product.name}
              </h3>
              <p className="mt-1.5 text-xs leading-snug text-gray-400">{product.tagline}</p>

              {/* The controls only exist once the installation is awake —
                  a console on standby has nothing to press. */}
              <div
                className="mt-4 transition-opacity duration-500"
                style={{ opacity: awake ? 1 : 0 }}
                aria-hidden={!awake}
              >
                <ProductCTAs product={product} size="sm" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HologramConsole;
