import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus } from 'lucide-react';
import SectionHeading from './ui/SectionHeading';

const faqs = [
  {
    q: 'O que é a ATS Sistemas de Automações?',
    a: 'Somos uma empresa de tecnologia que cria produtos digitais inteligentes. Em vez de projetos isolados, construímos um ecossistema de soluções — de proteção familiar a assistentes de IA — que resolvem problemas reais do dia a dia.',
  },
  {
    q: 'Os produtos já estão disponíveis?',
    a: 'Sim. Reencontra, Coffee Break e Fusion Buy AI já estão no ar e podem ser acessados agora. Fusion AI e Giro IA estão em desenvolvimento — você pode entrar na lista de espera para ser avisado no lançamento.',
  },
  {
    q: 'Como faço para acessar ou baixar um produto?',
    a: 'Cada solução tem seus próprios botões de acesso na seção "Nossas Soluções". O Coffee Break está disponível na Play Store, o Reencontra e o Fusion Buy AI funcionam direto pelo navegador.',
  },
  {
    q: 'Como entro na lista de espera dos próximos lançamentos?',
    a: 'Basta clicar em "Quero ser avisado" ou "Lista de espera" no card do produto. Você deixa seu e-mail e avisamos em primeira mão quando lançar — sem spam.',
  },
  {
    q: 'A ATS desenvolve soluções sob medida?',
    a: 'Sim. Além dos nossos produtos, criamos soluções inteligentes para empresas. Fale com a gente pela seção de contato e conte o que você precisa automatizar.',
  },
];

const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative py-24 md:py-28 bg-space-black/70 backdrop-blur-[2px] overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <SectionHeading
          eyebrow="Dúvidas frequentes"
          eyebrowIcon={<HelpCircle className="w-3.5 h-3.5 text-neon-cyan" />}
          title={
            <>
              Perguntas{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-cyber-purple">
                frequentes
              </span>
            </>
          }
          description="Tudo o que você precisa saber para começar a explorar o ecossistema ATS."
        />

        <div className="mt-14 max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group"
                >
                  <span className="text-base font-semibold text-white group-hover:text-neon-cyan transition-colors">
                    {faq.q}
                  </span>
                  <span
                    className={`flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-neon-cyan transition-transform duration-300 ${
                      isOpen ? 'rotate-45 bg-neon-cyan/10' : ''
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="px-6 pb-5 text-sm text-gray-400 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
