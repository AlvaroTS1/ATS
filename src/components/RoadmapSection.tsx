import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, CheckCircle2, Loader, CircleDot } from 'lucide-react';
import SectionHeading from './ui/SectionHeading';

type Phase = 'done' | 'active' | 'next';

interface RoadmapItem {
  phase: Phase;
  period: string;
  title: string;
  description: string;
  items: string[];
}

const roadmap: RoadmapItem[] = [
  {
    phase: 'done',
    period: 'Lançado',
    title: 'Produtos no ar',
    description:
      'Soluções já disponíveis e em uso real por pessoas e empresas.',
    items: [
      'Reencontra — proteção familiar via QR',
      'Coffee Break — app publicado na Play Store',
      'Fusion Buy AI — assistente de compras',
    ],
  },
  {
    phase: 'active',
    period: 'Em desenvolvimento',
    title: 'Construindo agora',
    description:
      'O que estamos criando neste momento para lançar em breve.',
    items: [
      'Fusion AI — experiência de IA imersiva',
      'Giro IA — automação inteligente de operações',
      'Evolução contínua dos produtos ativos',
    ],
  },
  {
    phase: 'next',
    period: 'No horizonte',
    title: 'O que vem por aí',
    description:
      'Sempre haverá novidades. O ecossistema ATS não para de crescer.',
    items: [
      'Novas soluções orientadas por IA',
      'Integrações entre os produtos do ecossistema',
      'Recursos pedidos pela nossa comunidade',
    ],
  },
];

const phaseMeta: Record<
  Phase,
  { icon: React.ReactNode; label: string; color: string; ring: string }
> = {
  done: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: 'Concluído',
    color: 'text-cyber-emerald',
    ring: 'border-cyber-emerald/30 bg-cyber-emerald/10',
  },
  active: {
    icon: <Loader className="w-4 h-4 animate-[spin_3s_linear_infinite]" />,
    label: 'Em progresso',
    color: 'text-neon-cyan',
    ring: 'border-neon-cyan/30 bg-neon-cyan/10',
  },
  next: {
    icon: <CircleDot className="w-4 h-4" />,
    label: 'Planejado',
    color: 'text-amber-300',
    ring: 'border-amber-300/30 bg-amber-300/10',
  },
};

const RoadmapSection: React.FC = () => {
  return (
    <section
      id="roadmap"
      className="relative py-24 md:py-28 bg-space-black/70 backdrop-blur-[2px] overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-gradient-to-r from-neon-cyan/5 to-cyber-purple/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <SectionHeading
          eyebrow="Evolução contínua"
          eyebrowIcon={<Rocket className="w-3.5 h-3.5 text-neon-cyan" />}
          title={
            <>
              Nosso{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-cyber-purple">
                Roadmap
              </span>
            </>
          }
          description="Estamos em movimento constante — do que já está no ar ao que ainda vamos surpreender você."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {roadmap.map((col, i) => {
            const meta = phaseMeta[col.phase];
            return (
              <motion.div
                key={col.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7"
              >
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${meta.ring} ${meta.color}`}
                >
                  {meta.icon}
                  {col.period}
                </div>

                <h3 className="text-xl font-bold text-white mt-5">
                  {col.title}
                </h3>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  {col.description}
                </p>

                <ul className="mt-6 space-y-3">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${meta.color.replace(
                          'text-',
                          'bg-',
                        )}`}
                      />
                      <span className="text-sm text-gray-300 leading-snug">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;
