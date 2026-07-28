import { cinematicEvents } from '../EventBus';

interface Mote {
  baseX: number;
  baseY: number;
  phase: number;
  speed: number;
  radius: number;
  alpha: number;
}

/**
 * Same soft radial-glow look as `shared/particleTexture.ts`, but drawn
 * directly onto a plain canvas instead of wrapped in a `THREE.CanvasTexture`
 * — this layer must stay Three.js-free. It's mounted eagerly (always
 * breathing, never scroll-gated), so importing `three` here would drag the
 * ~500KB library back into the app's critical bundle, undoing the
 * code-splitting work from earlier phases.
 */
function createMoteSprite(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(0, 212, 255, 1)');
    grad.addColorStop(0.6, 'rgba(41, 171, 226, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
  }
  return canvas;
}

/**
 * The one thing every other cinematic layer deliberately does NOT do:
 * animate on a real clock instead of scroll progress. Everything else in
 * this experience is scroll-driven on purpose (so it never runs away from
 * the user) — but if the user stops scrolling entirely, the world must
 * still feel alive, not frozen. This is a single, cheap, always-on 2D
 * canvas — a handful of drifting dust motes plus a slow breathing glow —
 * sitting above every scene canvas and below the interactive Holo panels.
 *
 * Not a `Scene`: it never participates in `Timeline`/`SceneEngine`, has no
 * progress, no preload. It owns its own `requestAnimationFrame` loop,
 * paused via the Page Visibility API so a backgrounded tab costs nothing.
 */
export class AmbientLayer {
  private canvas: HTMLCanvasElement | null = null;
  private motes: Mote[] = [];
  private texture: HTMLCanvasElement | null = null;
  private rafId: number | null = null;
  private startTime = 0;
  /** Smoothed brightness (0-1) the currently-visible footage is lit at — lerped, never snapped, toward `targetLight`. */
  private ambientLight = 0.5;
  private targetLight = 0.5;
  private unsubscribeLight: (() => void) | null = null;
  private onVisibilityChange = (): void => {
    if (document.hidden) this.stop();
    else this.start();
  };

  mount(canvas: HTMLCanvasElement, moteCount: number): void {
    this.canvas = canvas;
    this.texture = createMoteSprite();
    this.motes = Array.from({ length: moteCount }, () => ({
      baseX: Math.random(),
      baseY: Math.random(),
      phase: Math.random() * Math.PI * 2,
      speed: 0.06 + Math.random() * 0.1,
      radius: 0.8 + Math.random() * 1.6,
      alpha: 0.05 + Math.random() * 0.12,
    }));
    this.resize(canvas.clientWidth, canvas.clientHeight);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.unsubscribeLight = cinematicEvents.on('cinematic:ambient-light', ({ brightness }) => {
      this.targetLight = brightness;
    });
    this.start();
  }

  resize(cssWidth: number, cssHeight: number): void {
    const canvas = this.canvas;
    if (!canvas || cssWidth === 0 || cssHeight === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelW = Math.round(cssWidth * dpr);
    const pixelH = Math.round(cssHeight * dpr);
    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
    }
  }

  private start(): void {
    if (this.rafId !== null || document.hidden) return;
    this.startTime = performance.now();
    const tick = (now: number) => {
      this.draw((now - this.startTime) / 1000);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  private draw(t: number): void {
    const canvas = this.canvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (cssW === 0 || cssH === 0) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    // Lerp toward the footage's own brightness instead of snapping — this is
    // what keeps the ambient layer reading as *lit by* the video rather than
    // an independent overlay (see `createFrameSequenceScene`'s emit).
    this.ambientLight += (this.targetLight - this.ambientLight) * 0.04;
    // Floored so darker shots dim the ambience without ever going dead —
    // "extremamente discreto", not a lighting rig.
    const lightMul = 0.75 + this.ambientLight * 0.5;

    // Slow drifting dust — deterministic sine drift per ART_DIRECTION.md,
    // never Math.random() per frame.
    if (this.texture) {
      for (const mote of this.motes) {
        const x = mote.baseX * cssW + Math.sin(t * mote.speed + mote.phase) * 18;
        const y = mote.baseY * cssH + Math.cos(t * mote.speed * 0.7 + mote.phase) * 14;
        const breathe = 0.7 + Math.sin(t * 0.3 + mote.phase) * 0.3;
        ctx.globalAlpha = mote.alpha * breathe * lightMul;
        const size = mote.radius * 6;
        ctx.drawImage(this.texture, x - size / 2, y - size / 2, size, size);
      }
    }

    // A slow, barely-perceptible breathing glow — "brilho pulsando lentamente".
    const breatheGlow = 0.5 + Math.sin(t * 0.25) * 0.5;
    const gradient = ctx.createRadialGradient(
      cssW * 0.5,
      cssH * 0.42,
      0,
      cssW * 0.5,
      cssH * 0.42,
      Math.max(cssW, cssH) * 0.55,
    );
    gradient.addColorStop(0, `rgba(41, 171, 226, ${0.025 * breatheGlow * lightMul})`);
    gradient.addColorStop(1, 'rgba(41, 171, 226, 0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, cssW, cssH);
  }

  unmount(): void {
    this.stop();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.unsubscribeLight?.();
    this.unsubscribeLight = null;
    this.canvas = null;
    this.motes = [];
    this.texture = null;
  }
}
