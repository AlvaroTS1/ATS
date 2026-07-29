import React, { useRef } from 'react';
import type { Product } from '../../data/products';
import ProductCTAs from '../ui/ProductCTAs';
import StatusBadge from '../ui/StatusBadge';
import { cn } from '../../lib/utils';
import { REVEAL_DORMANT, revealDelay } from '../../lib/reveal';

interface HoloPanelProps {
  product: Product;
  visible: boolean;
  /** Another panel in the group is being hovered — this one steps back, never hides. */
  dimmed: boolean;
  onHoverChange: (hovered: boolean) => void;
  /** Stagger the focus pull so panels don't all resolve at once. */
  delayMs?: number;
  size?: 'sm' | 'lg';
}

const MAX_TILT_DEG = 9;

/**
 * A real, clickable React panel that reads as a holographic HUD screen —
 * matching the aesthetic of the Holo Hall footage it sits on top of. It
 * doesn't fade in and it isn't born: it was already projected here, out
 * of focus and blown out, and the camera resolves it
 * (`.animate-reveal` / `lib/reveal.ts` — the shared primitive every piece
 * of ATS interface uses, not a holo-panel-only effect). Once resolved it
 * never sits perfectly still, and it tilts toward the cursor like a
 * physical sheet of glass — never a card floating over a video.
 *
 * Three independently-controlled layers avoid fighting over the same CSS
 * property: reveal/idle (opacity+filter via animation), attention
 * dimming (opacity+filter via a plain transition), and cursor tilt
 * (transform, via CSS custom properties so mousemove never triggers a
 * React re-render). The reveal deliberately owns NO transform, which is
 * what leaves the transform channel free for the tilt.
 */
const HoloPanel: React.FC<HoloPanelProps> = ({
  product,
  visible,
  dimmed,
  onHoverChange,
  delayMs = 0,
  size = 'sm',
}) => {
  const Icon = product.icon;
  const tiltRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0-1
    const py = (e.clientY - rect.top) / rect.height; // 0-1
    el.style.setProperty('--tilt-x', `${(0.5 - py) * MAX_TILT_DEG}deg`);
    el.style.setProperty('--tilt-y', `${(px - 0.5) * MAX_TILT_DEG}deg`);
    el.style.setProperty('--sheen-x', `${px * 100}%`);
    el.style.setProperty('--sheen-y', `${py * 100}%`);
    el.style.setProperty('--sheen-opacity', '1');
  };

  const handleMouseLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
    el.style.setProperty('--sheen-opacity', '0');
    onHoverChange(false);
  };

  return (
    <div
      className={cn(
        'transition-[opacity,filter] duration-500 ease-out',
        visible ? 'animate-reveal' : REVEAL_DORMANT,
        dimmed && 'opacity-60 brightness-[0.82]',
      )}
      style={visible ? revealDelay(delayMs) : undefined}
    >
      <div
        ref={tiltRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={handleMouseLeave}
        className="relative transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform:
            'perspective(900px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl border backdrop-blur-md',
            size === 'lg' ? 'w-[280px] md:w-[340px] p-6 md:p-7' : 'w-[220px] md:w-[260px] p-5 md:p-6',
          )}
          style={{
            backgroundColor: 'rgba(7, 11, 20, 0.55)',
            borderColor: `${product.accent.from}55`,
            boxShadow: `0 0 0 1px ${product.accent.from}22, 0 12px 40px -12px ${product.accent.glow}, inset 0 0 24px ${product.accent.from}11`,
            filter: 'brightness(var(--ambient-light))',
          }}
        >
          {/* The room's colour on the glass, same wire as the Hero panel. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.09]"
            style={{ background: 'linear-gradient(to top, var(--ambient-tint), transparent 70%)' }}
          />
          {/* Cursor-following sheen — the "physical glass" reflection */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: 'var(--sheen-opacity, 0)',
              background: `radial-gradient(circle at var(--sheen-x, 50%) var(--sheen-y, 50%), ${product.accent.from}33, transparent 55%)`,
            }}
          />

          {/* Corner brackets — the sci-fi HUD detail that ties this to the footage's own UI language */}
          {(['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r', 'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'] as const).map(
            (pos) => (
              <span
                key={pos}
                className={cn('absolute h-3 w-3 md:h-4 md:w-4', pos)}
                style={{ borderColor: product.accent.from }}
              />
            ),
          )}

          <div className="relative flex items-center justify-between mb-4">
            <div
              className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg border"
              style={{
                backgroundColor: `${product.accent.from}1a`,
                borderColor: `${product.accent.from}44`,
                color: product.accent.from,
              }}
            >
              <Icon className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <StatusBadge status={product.status} className="scale-90" />
          </div>

          <h3 className="relative text-base md:text-lg font-bold text-white tracking-tight">
            {product.name}
          </h3>
          <p className="relative mt-1.5 text-xs md:text-sm text-gray-400 leading-snug">
            {product.tagline}
          </p>

          <div className="relative mt-4 md:mt-5">
            <ProductCTAs product={product} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoloPanel;
