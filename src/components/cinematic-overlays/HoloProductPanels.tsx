import React, { useEffect, useRef, useState } from 'react';
import { cinematicEvents } from '../../cinematic/EventBus';
import { getProduct } from '../../data/products';
import HoloPanel from './HoloPanel';

const reencontra = getProduct('reencontra')!;
const fusionBuy = getProduct('fusion-buy')!;
const coffeeBreak = getProduct('coffee-break')!;

/**
 * The Holo Hall's three "holographic panels" made real: actual clickable
 * React UI, positioned over the frozen footage where the video's own
 * holographic screens sit. `holo-hall:panels` (emitted by
 * `HoloHallScene.ts`, only on real state changes) is the single signal
 * that drives both the entrance/exit animation AND whether this layer can
 * receive pointer events at all — every other cinematic layer stays
 * `pointer-events: none` for good reason, so this must opt back in only
 * while it's actually the thing on screen.
 *
 * When one panel has focus, the others step back (dim, never hide) —
 * attention is directed, not forced.
 */
const HoloProductPanels: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return cinematicEvents.on('holo-hall:panels', ({ visible }) => setVisible(visible));
  }, []);

  useEffect(() => {
    // Same brightness signal AmbientLayer lerps toward — mapped to a subtle
    // 0.85-1.15 multiplier so the panels read as lit by the shot they sit
    // on, not a fixed HTML overlay. Set directly on a ref (no React state):
    // this is a hot per-frame-change path, not something a render should
    // ever run for.
    return cinematicEvents.on('cinematic:ambient-light', ({ brightness }) => {
      containerRef.current?.style.setProperty('--ambient-light', String(0.85 + brightness * 0.3));
    });
  }, []);

  const dimmed = (id: string) => hoveredId !== null && hoveredId !== id;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-40 flex items-center gap-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory px-6 md:justify-center md:gap-8 md:overflow-visible md:px-12"
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      {/* Mobile: a swipeable row (orthogonal to the page's own vertical scroll,
          so it never fights the pin/scrub mechanism) — 3 full-size cards
          simply don't fit a phone's width side by side. Desktop: centered row. */}
      <div className="shrink-0 snap-center md:shrink">
        <HoloPanel
          product={fusionBuy}
          visible={visible}
          dimmed={dimmed(fusionBuy.id)}
          onHoverChange={(hovered) => setHoveredId(hovered ? fusionBuy.id : null)}
          delayMs={120}
        />
      </div>
      <div className="shrink-0 snap-center md:shrink">
        <HoloPanel
          product={reencontra}
          visible={visible}
          dimmed={dimmed(reencontra.id)}
          onHoverChange={(hovered) => setHoveredId(hovered ? reencontra.id : null)}
          delayMs={0}
          size="lg"
        />
      </div>
      <div className="shrink-0 snap-center md:shrink">
        <HoloPanel
          product={coffeeBreak}
          visible={visible}
          dimmed={dimmed(coffeeBreak.id)}
          onHoverChange={(hovered) => setHoveredId(hovered ? coffeeBreak.id : null)}
          delayMs={240}
        />
      </div>
    </div>
  );
};

export default HoloProductPanels;
