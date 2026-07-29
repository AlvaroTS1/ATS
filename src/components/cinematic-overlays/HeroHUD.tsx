import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cinematicEvents } from '../../cinematic/EventBus';
import { cn } from '../../lib/utils';

const stats = [
  { value: '5', label: 'Produtos' },
  { value: '2', label: 'A caminho' },
  { value: '100%', label: 'Problemas reais' },
];

/** `.animate-materialize`'s two keyframes are comma-paired — see `HoloPanel.tsx` for why. */
const materializeDelay = (ms: number) => ({ animationDelay: `${ms}ms, ${850 + ms}ms` });
const dormant = 'opacity-0 blur-lg scale-[0.4] brightness-[2.2] pointer-events-none';

/**
 * The Hero isn't a page section — it's the interface that materializes
 * inside the still-pinned universe, once the arrival at the Hall has
 * settled (`'hall:hero-ready'`, emitted by `HallScene`).
 * One holographic panel, not a two-column marketing block: same visual
 * grammar as `HoloPanel.tsx` (glass, emissive border, corner brackets),
 * anchored low so the Guardian — also present here, near his own second
 * peak on `GuardianPresence`'s curve — reads clearly above it rather than
 * competing for the same center of frame.
 */
const HeroHUD: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return cinematicEvents.on('hall:hero-ready', ({ visible }) => setVisible(visible));
  }, []);

  return (
    <div
      className="absolute inset-x-0 bottom-[6%] z-40 flex justify-center px-6"
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <div
        className={cn(
          'relative w-full max-w-[360px] md:max-w-md overflow-hidden rounded-2xl border backdrop-blur-md px-6 py-7 md:px-8 md:py-8',
          visible ? 'animate-materialize' : dormant,
        )}
        style={{
          ...(visible ? materializeDelay(0) : {}),
          backgroundColor: 'rgba(7, 11, 20, 0.6)',
          borderColor: 'rgba(41, 171, 226, 0.35)',
          boxShadow:
            '0 0 0 1px rgba(41, 171, 226, 0.12), 0 20px 60px -20px rgba(41, 171, 226, 0.3), inset 0 0 30px rgba(41, 171, 226, 0.06)',
        }}
      >
        {(['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r', 'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'] as const).map(
          (pos) => (
            <span key={pos} className={cn('absolute h-3 w-3 md:h-4 md:w-4 border-neon-cyan/60', pos)} />
          ),
        )}

        <div
          className={cn('relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-semibold text-gray-300 tracking-wide mb-4', visible ? 'animate-materialize' : dormant)}
          style={visible ? materializeDelay(80) : undefined}
        >
          <Sparkles className="w-3 h-3 text-neon-cyan" />
          <span>Ecossistema de software inteligente</span>
        </div>

        <h1
          className={cn('relative text-2xl md:text-4xl font-black tracking-tight text-white leading-[1.1]', visible ? 'animate-materialize' : dormant)}
          style={visible ? materializeDelay(160) : undefined}
        >
          Tecnologia que resolve{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-glow-blue to-cyber-purple">
            problemas reais.
          </span>
        </h1>

        <p
          className={cn('relative text-sm text-gray-400 font-light leading-relaxed mt-3', visible ? 'animate-materialize' : dormant)}
          style={visible ? materializeDelay(280) : undefined}
        >
          A ATS Sistemas de Automações reúne, em um só ecossistema, produtos
          que resolvem problemas reais — de proteção familiar a assistentes
          de IA.
        </p>

        <div
          className={cn('relative flex flex-col sm:flex-row gap-3 mt-5', visible ? 'animate-materialize' : dormant)}
          style={visible ? materializeDelay(400) : undefined}
        >
          <a
            href="#solutions"
            className="group px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-cyber-purple text-space-black font-bold text-sm hover:brightness-110 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Explorar soluções
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#contact"
            className="px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white font-medium text-sm hover:border-neon-cyan/40 hover:bg-white/[0.06] transition-all duration-300 text-center"
          >
            Falar com a ATS
          </a>
        </div>

        <div
          className={cn('relative grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-white/5', visible ? 'animate-materialize' : dormant)}
          style={visible ? materializeDelay(520) : undefined}
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-lg md:text-xl font-black text-white tracking-tight">{s.value}</div>
              <div className="text-[9px] md:text-[10px] text-gray-500 mt-0.5 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroHUD;
