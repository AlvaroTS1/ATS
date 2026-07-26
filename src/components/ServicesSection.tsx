import React from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Bot,
  MessageSquare,
  BrainCircuit,
  Cloud,
  Code,
  Wrench,
} from 'lucide-react';
import SectionHeading from './ui/SectionHeading';

const services = [
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: 'Aplicativos móveis',
    description:
      'Apps Android e multiplataforma rápidos, bonitos e fáceis de usar — do conceito à publicação nas lojas.',
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: 'Agentes e assistentes de IA',
    description:
      'Assistentes inteligentes que entendem linguagem natural e ajudam pessoas e times a decidir e agir mais rápido.',
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: 'Chatbots e atendimento',
    description:
      'Automação de atendimento integrada a WhatsApp e outros canais, com respostas úteis e humanas.',
  },
  {
    icon: <BrainCircuit className="w-6 h-6" />,
    title: 'Automação de processos',
    description:
      'Fluxos automatizados que eliminam tarefas repetitivas e liberam tempo para o que realmente importa.',
  },
  {
    icon: <Cloud className="w-6 h-6" />,
    title: 'Plataformas web e SaaS',
    description:
      'Sistemas web escaláveis e seguros na nuvem, prontos para crescer junto com o seu negócio.',
  },
  {
    icon: <Code className="w-6 h-6" />,
    title: 'Soluções sob medida',
    description:
      'Tem um desafio específico? Desenhamos e construímos a solução certa para o seu contexto.',
  },
];

const ServicesSection: React.FC = () => {
  return (
    <section
      id="services"
      className="relative py-24 md:py-28 bg-space-black/70 backdrop-blur-[2px] overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.03)_0%,transparent_70%)]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <SectionHeading
          eyebrow="O que fazemos"
          eyebrowIcon={<Wrench className="w-3.5 h-3.5 text-neon-cyan" />}
          title={
            <>
              Tecnologia de ponta,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-cyber-purple">
                do jeito simples
              </span>
            </>
          }
          description="Unimos inteligência artificial, desenvolvimento mobile e automação para criar produtos e soluções que funcionam de verdade."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: (index % 3) * 0.08, duration: 0.5 }}
              className="group p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-neon-cyan/30 hover:bg-white/[0.03] transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="mb-6 p-3 rounded-xl bg-white/[0.03] border border-white/5 w-fit text-neon-cyan group-hover:bg-gradient-to-br group-hover:from-neon-cyan group-hover:to-cyber-purple group-hover:text-space-black transition-all duration-300">
                {service.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-neon-cyan transition-colors">
                {service.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
