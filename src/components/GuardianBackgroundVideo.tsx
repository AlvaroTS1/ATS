import { useEffect, useRef } from 'react';

const GuardianBackgroundVideo = () => {
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // ── Particle System (Atmospheric Dust) ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
      hue: number;
      life: number;
      maxLife: number;
    };

    let W = 0, H = 0;
    let particles: Particle[] = [];

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };

    const spawn = (): Particle => ({
      x: Math.random() * W,
      y: H + Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(0.04 + Math.random() * 0.1),
      r: 0.4 + Math.random() * 1.3,
      alpha: 0.04 + Math.random() * 0.18,
      hue: Math.random() > 0.5 ? 200 : 270,
      life: 0,
      maxLife: 350 + Math.random() * 450,
    });

    const init = () => {
      resize();
      particles = Array.from({ length: 50 }, () => {
        const p = spawn();
        p.y = Math.random() * H;
        p.life = Math.random() * p.maxLife;
        return p;
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const t = p.life / p.maxLife;
        const fade = t < 0.15 ? t / 0.15 : t > 0.8 ? (1 - t) / 0.2 : 1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 55%, 70%, ${p.alpha * fade})`;
        ctx.fill();

        if (p.life >= p.maxLife || p.y < -10) {
          particles[i] = spawn();
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    init();
    draw();

    const onResize = () => { resize(); };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // ── Autoplay Handler ────────────────────────────────────────────────────────
  useEffect(() => {
    const playVid = (vid: HTMLVideoElement | null) => {
      if (!vid) return;
      vid.muted = true;
      vid.play().catch(() => {
        const unlock = () => {
          if (leftVideoRef.current) leftVideoRef.current.play().catch(() => {});
          if (rightVideoRef.current) rightVideoRef.current.play().catch(() => {});
          document.removeEventListener('click', unlock);
          document.removeEventListener('touchstart', unlock);
        };
        document.addEventListener('click', unlock, { once: true });
        document.addEventListener('touchstart', unlock, { once: true });
      });
    };

    playVid(leftVideoRef.current);
    playVid(rightVideoRef.current);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: -10, // Behind all content
        backgroundColor: '#030712',
      }}
    >
      {/* ── Guardian Video Left ──────────────────────────────────────────────── */}
      <video
        ref={leftVideoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="guardian-left-video"
      >
        <source src="/dreamina-2026-06-04-5958-Cinematic portrait video, ultra-realisti....mp4" type="video/mp4" />
      </video>

      {/* ── Guardian Video Right ─────────────────────────────────────────────── */}
      <video
        ref={rightVideoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="guardian-right-video"
      >
        <source src="/dreamina-2026-06-04-8102-Create an original fictional biomechanic....mp4" type="video/mp4" />
      </video>

      {/* ── Vignette / Content readability layer ─────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          background: 'radial-gradient(ellipse 60% 85% at 50% 50%, rgba(3,7,18,0.5) 0%, rgba(3,7,18,0.85) 65%, rgba(3,7,18,0.95) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Floor Fog ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '35vh',
          zIndex: 21,
          background: 'linear-gradient(to top, rgba(3,7,18,1) 0%, rgba(3,7,18,0.5) 60%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Particle Canvas ──────────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 22,
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />

      {/* ── Dual Setup Framing and Responsiveness CSS ────────────────────────── */}
      <style>{`
        /* Desktop / Default styles */
        .guardian-left-video {
          position: fixed;
          left: -2%;
          top: 50%;
          transform: translateY(-50%);
          width: 48vw;
          height: 100vh;
          object-fit: contain;
          opacity: 0.80;
          z-index: 10;
          
          /* Masks: top-bottom fade combined with inner edge (right) fade */
          -webkit-mask-image: 
            linear-gradient(to right, black 65%, transparent 100%),
            linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
          mask-image: 
            linear-gradient(to right, black 65%, transparent 100%),
            linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
          -webkit-mask-composite: source-in;
          mask-composite: intersect;
        }

        .guardian-right-video {
          position: fixed;
          right: -2%;
          top: 50%;
          transform: translateY(-50%);
          width: 48vw;
          height: 100vh;
          object-fit: contain;
          opacity: 0.70;
          z-index: 10;

          /* Masks: top-bottom fade combined with inner edge (left) fade */
          -webkit-mask-image: 
            linear-gradient(to left, black 65%, transparent 100%),
            linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
          mask-image: 
            linear-gradient(to left, black 65%, transparent 100%),
            linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
          -webkit-mask-composite: source-in;
          mask-composite: intersect;
        }

        /* Tablet scales */
        @media (max-width: 1023px) and (min-width: 768px) {
          .guardian-left-video {
            width: 49vw;
            opacity: 0.75;
          }
          .guardian-right-video {
            width: 49vw;
            opacity: 0.65;
          }
        }

        /* Mobile layout */
        @media (max-width: 767px) {
          .guardian-left-video {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            transform: none;
            object-fit: cover;
            opacity: 0.70;
            -webkit-mask-image: none;
            mask-image: none;
          }
          .guardian-right-video {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default GuardianBackgroundVideo;
