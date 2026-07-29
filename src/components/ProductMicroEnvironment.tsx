import React, { useEffect, useRef } from 'react';
import type { Product } from '../data/products';
import { createMoteSprite } from '../cinematic/shared/moteSprite';
import { hexStringToRgb } from '../cinematic/shared/colorLerp';
import { getDeviceTier } from '../lib/deviceTier';

interface Mote {
  baseX: number;
  baseY: number;
  phase: number;
  speed: number;
  radius: number;
  alpha: number;
}

const MOTE_COUNT_HIGH = 34;
const MOTE_COUNT_LOW = 14;

interface ProductMicroEnvironmentProps {
  product: Product;
  /** Focused/dominant instance — intensifies; unfocused instances stay at a quiet baseline, never fully hidden ("cada ambiente tem sua energia" applies to all, focus just directs attention). */
  active?: boolean;
  className?: string;
}

/**
 * Each product's own atmosphere — particles and a soft glow tinted by its
 * brand color (`product.accent`, the same single source of truth the Holo
 * panels already use). Plain 2D canvas, same technique as `AmbientLayer`,
 * deliberately NOT Three.js: this mounts once per product, in up to two
 * places at once (behind the Holo Hall panels, and again in the regular
 * product deep-dive sections) — stacking several live WebGL contexts
 * across the page would risk hitting the browser's context limit and cost
 * real battery on mobile, where a handful of cheap canvas draws don't.
 *
 * Gated by IntersectionObserver (only animates while actually visible)
 * and the Page Visibility API, same discipline as every other ambient
 * layer in this project.
 */
const ProductMicroEnvironment: React.FC<ProductMicroEnvironmentProps> = ({
  product,
  active = true,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rgb = hexStringToRgb(product.accent.from).join(', ');
    const texture = createMoteSprite(rgb);
    const moteCount = getDeviceTier() === 'high' ? MOTE_COUNT_HIGH : MOTE_COUNT_LOW;
    const motes: Mote[] = Array.from({ length: moteCount }, () => ({
      baseX: Math.random(),
      baseY: Math.random(),
      phase: Math.random() * Math.PI * 2,
      speed: 0.05 + Math.random() * 0.09,
      radius: 0.9 + Math.random() * 1.8,
      alpha: 0.06 + Math.random() * 0.14,
    }));

    let intensity = active ? 1 : 0.35;
    let rafId: number | null = null;
    let visible = true;
    let startTime = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      const pixelW = Math.round(w * dpr);
      const pixelH = Math.round(h * dpr);
      if (canvas.width !== pixelW || canvas.height !== pixelH) {
        canvas.width = pixelW;
        canvas.height = pixelH;
      }
    };

    const draw = (t: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;

      const target = activeRef.current ? 1 : 0.35;
      intensity += (target - intensity) * 0.03;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      for (const mote of motes) {
        const x = mote.baseX * w + Math.sin(t * mote.speed + mote.phase) * 22;
        const y = mote.baseY * h + Math.cos(t * mote.speed * 0.7 + mote.phase) * 16;
        const breathe = 0.7 + Math.sin(t * 0.28 + mote.phase) * 0.3;
        ctx.globalAlpha = mote.alpha * breathe * intensity;
        const size = mote.radius * 7;
        ctx.drawImage(texture, x - size / 2, y - size / 2, size, size);
      }

      const glowBreathe = 0.5 + Math.sin(t * 0.22) * 0.5;
      const gradient = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, Math.max(w, h) * 0.6);
      gradient.addColorStop(0, `rgba(${rgb}, ${0.05 * glowBreathe * intensity})`);
      gradient.addColorStop(1, `rgba(${rgb}, 0)`);
      ctx.globalAlpha = 1;
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    };

    const start = () => {
      if (rafId !== null || document.hidden || !visible) return;
      startTime = performance.now();
      const tick = (now: number) => {
        draw((now - startTime) / 1000);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    };

    resize();
    start();

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0.05 },
    );
    observer.observe(canvas);

    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `active` is read via activeRef so the rAF loop never needs to restart
  }, [product]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className ?? 'absolute inset-0 h-full w-full pointer-events-none'}
    />
  );
};

export default ProductMicroEnvironment;
