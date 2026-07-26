import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const FinalCTASection: React.FC = () => {
  return (
    <section className="relative py-24 md:py-28 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-br from-space-dark/90 to-space-black/90 overflow-hidden px-6 py-16 md:px-16 md:py-20 text-center"
        >
          {/* Glow accents */}
          <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-neon-cyan/10 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-cyber-purple/10 blur-[100px]" />
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-gray-300 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
              Sempre haverá uma próxima novidade
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
              Pronto para explorar o{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-cyber-purple">
                ecossistema ATS?
              </span>
            </h2>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed mt-5 max-w-2xl mx-auto">
              Conheça nossos produtos, entre na lista de espera dos próximos
              lançamentos ou converse com a gente sobre a sua ideia.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-9">
              <a
                href="#solutions"
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-neon-cyan to-cyber-purple text-space-black font-bold text-base hover:brightness-110 transition-all duration-300 shadow-[0_10px_30px_-8px_rgba(41,171,226,0.4)] flex items-center gap-2"
              >
                Ver todas as soluções
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#contact"
                className="px-8 py-4 rounded-xl bg-white/[0.03] border border-white/10 text-white font-medium text-base hover:border-neon-cyan/40 hover:bg-white/[0.06] transition-all duration-300"
              >
                Falar com a ATS
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
