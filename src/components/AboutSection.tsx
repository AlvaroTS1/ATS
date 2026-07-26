import React from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Eye,
  Compass,
  ShieldCheck,
  Zap,
  Heart,
  Layers,
} from 'lucide-react';
import SectionHeading from './ui/SectionHeading';

const differentials = [
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'Confiança em primeiro lugar',
    desc: 'Segurança, privacidade e transparência no centro de cada produto.',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Inteligência aplicada',
    desc: 'IA usada para resolver problemas concretos, não para parecer moderna.',
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: 'Ecossistema integrado',
    desc: 'Produtos que compartilham identidade, qualidade e evolução constante.',
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: 'Feito para pessoas',
    desc: 'Experiências simples e cuidadas — do primeiro clique ao suporte.',
  },
];

const AboutSection: React.FC = () => {
  return (
    <section
      id="about"
      className="relative py-24 md:py-28 bg-space-black/70 backdrop-blur-[2px] overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-1/3 h-full bg-neon-cyan/5 -skew-x-12 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-cyber-purple/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <SectionHeading
          eyebrow="Quem somos"
          eyebrowIcon={<Compass className="w-3.5 h-3.5 text-neon-cyan" />}
          title={
            <>
              Mais que software.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-cyber-purple">
                Soluções que fazem sentido.
              </span>
            </>
          }
          description="A ATS Sistemas de Automações nasceu para transformar tecnologia avançada em produtos úteis, confiáveis e agradáveis de usar."
        />

        {/* Mission / Vision */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-neon-cyan to-transparent" />
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Nossa missão</h3>
            <p className="text-gray-400 leading-relaxed">
              Criar produtos digitais inteligentes que resolvem problemas reais
              — com tecnologia de ponta, segurança e uma experiência que as
              pessoas confiam e adoram usar.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyber-purple to-transparent" />
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyber-purple/10 border border-cyber-purple/20 text-cyber-purple mb-5">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Nossa visão</h3>
            <p className="text-gray-400 leading-relaxed">
              Ser um ecossistema de referência em software inteligente, onde cada
              novo produto fortalece o conjunto e amplia o valor entregue a
              pessoas e empresas.
            </p>
          </motion.div>
        </div>

        {/* Differentials */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {differentials.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 hover:border-neon-cyan/25 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.03] border border-white/10 text-neon-cyan mb-4 group-hover:bg-neon-cyan/10 transition-colors">
                {d.icon}
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">{d.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
