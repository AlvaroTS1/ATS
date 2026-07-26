import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { products } from '../data/products';
import StatusBadge from './ui/StatusBadge';

// Code-split the WebGL scene (three.js) so it never blocks first paint.
const AIHeroScene = lazy(() => import('./AIHeroScene'));

const stats = [
  { value: '5', label: 'Produtos no ecossistema' },
  { value: '2', label: 'Lançamentos a caminho' },
  { value: '100%', label: 'Foco em problemas reais' },
];

const HeroSection: React.FC = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden pt-32 pb-20"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 -z-0">
        <div className="absolute inset-0 cyber-grid [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_90%)]" />
        <div className="absolute top-1/4 -left-20 w-[520px] h-[520px] bg-neon-cyan/[0.07] rounded-full blur-[130px] animate-pulse-glow" />
        <div
          className="absolute bottom-10 right-0 w-[440px] h-[440px] bg-cyber-purple/[0.07] rounded-full blur-[120px] animate-pulse-glow"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left: copy + CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-gray-300 tracking-wide mb-7"
            >
              <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
              <span>O ecossistema de software inteligente da ATS</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]"
            >
              Tecnologia que resolve
              <br className="hidden sm:block" />{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-glow-blue to-cyber-purple">
                problemas reais.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.8 }}
              className="text-lg sm:text-xl text-gray-400 font-light leading-relaxed max-w-xl mx-auto lg:mx-0 mt-7"
            >
              A{' '}
              <span className="text-white font-semibold">
                ATS Sistemas de Automações
              </span>{' '}
              é uma empresa de tecnologia que reúne, em um só ecossistema,
              produtos inteligentes que resolvem problemas reais — de proteção
              familiar a assistentes de IA.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-9"
            >
              <a
                href="#solutions"
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-neon-cyan to-cyber-purple text-space-black font-bold text-base hover:brightness-110 transition-all duration-300 shadow-[0_10px_30px_-8px_rgba(41,171,226,0.4)] flex items-center gap-2"
              >
                Explorar soluções
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#contact"
                className="px-8 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white font-medium text-base hover:border-neon-cyan/40 hover:bg-white/[0.06] transition-all duration-300"
              >
                Falar com a ATS
              </a>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 mt-12 pt-8 border-t border-white/5"
            >
              {stats.map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-tight">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: ecosystem core */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative mx-auto max-w-md lg:max-w-none"
            >
              <div className="absolute -inset-2 bg-gradient-to-tr from-neon-cyan/20 to-cyber-purple/20 rounded-3xl blur-2xl opacity-40" />

              <div className="relative rounded-3xl bg-space-dark/60 backdrop-blur-md border border-white/10 overflow-hidden shadow-2xl min-h-[420px]">
                {/* 3D core */}
                <div className="absolute inset-0 z-0">
                  <Suspense fallback={null}>
                    <AIHeroScene />
                  </Suspense>
                </div>

                {/* Ecosystem label overlay */}
                <div className="relative z-10 flex flex-col h-full min-h-[420px] p-6 justify-between pointer-events-none">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                      Ecossistema ATS
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-neon-cyan font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                      ATIVO
                    </span>
                  </div>

                  {/* Product chips */}
                  <div className="flex flex-wrap gap-2 pointer-events-auto">
                    {products.map((p) => {
                      const Icon = p.icon;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 rounded-xl bg-space-black/70 border border-white/10 px-3 py-2 backdrop-blur-sm"
                        >
                          <Icon
                            className="w-3.5 h-3.5"
                            style={{ color: p.accent.from }}
                          />
                          <span className="text-[11px] font-semibold text-white">
                            {p.name}
                          </span>
                          <StatusBadge status={p.status} className="scale-90" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#solutions"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-gray-500 hover:text-neon-cyan transition-colors"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">
          Explorar
        </span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </motion.a>
    </section>
  );
};

export default HeroSection;
