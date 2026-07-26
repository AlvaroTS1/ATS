import React from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Coffee,
  ShoppingBag,
  Clock,
  Fingerprint,
  Users,
  Activity,
  Server,
  Sparkles,
  Search,
  Boxes,
} from 'lucide-react';
import { getProduct, type Product } from '../data/products';
import SectionHeading from './ui/SectionHeading';
import StatusBadge from './ui/StatusBadge';
import ProductCTAs from './ui/ProductCTAs';

const featureIcons = [Fingerprint, Users, Activity];

/** Shared text column for a product deep-dive, driven by ecosystem data. */
const ProductIntro: React.FC<{ product: Product; className?: string }> = ({
  product,
  className,
}) => {
  const Icon = product.icon;
  return (
    <div className={className}>
      <div className="flex items-center gap-3.5 mb-6">
        <div
          className="p-3 rounded-xl border"
          style={{
            backgroundColor: `${product.accent.from}14`,
            borderColor: `${product.accent.from}33`,
            color: product.accent.from,
          }}
        >
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <span
            className="text-xs font-semibold uppercase tracking-widest block"
            style={{ color: product.accent.from }}
          >
            {product.category}
          </span>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl md:text-4xl font-bold text-white tracking-tight">
              {product.name}
            </h3>
            <StatusBadge status={product.status} />
          </div>
        </div>
      </div>

      <p className="text-gray-400 text-base leading-relaxed mb-8 font-light">
        {product.long}
      </p>

      <div className="space-y-5 mb-10">
        {product.highlights.map((h, i) => {
          const FIcon = featureIcons[i] ?? Sparkles;
          return (
            <div key={h.title} className="flex gap-4">
              <div
                className="w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.06)',
                  color: product.accent.from,
                }}
              >
                <FIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">{h.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {h.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <ProductCTAs product={product} />
    </div>
  );
};

// ── Reencontra browser mockup ────────────────────────────────────────────────
const ReencontraMockup: React.FC = () => (
  <div className="relative">
    <div className="absolute -inset-4 bg-gradient-to-r from-neon-cyan to-cyber-purple rounded-3xl blur-2xl opacity-15" />
    <div className="relative mx-auto rounded-2xl border border-white/10 bg-space-dark/95 shadow-2xl p-5 md:p-6 font-mono text-xs max-w-lg lg:max-w-none">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/30" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/30" />
          <span className="w-3 h-3 rounded-full bg-green-500/30" />
        </div>
        <div className="text-[10px] text-gray-500 tracking-wider">
          reencontra.atssistemas.ia.br
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-cyber-emerald bg-cyber-emerald/10 px-2 py-0.5 rounded-full border border-cyber-emerald/20">
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald animate-pulse" />
          <span>SEGURO</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-neon-cyan animate-pulse" />
            <div>
              <span className="text-white font-bold block text-xs">
                LOCALIZAÇÃO ATIVA
              </span>
              <span className="text-[9px] text-gray-500">
                Canal seguro com a família
              </span>
            </div>
          </div>
          <span className="text-cyber-emerald font-bold text-xs">ONLINE</span>
        </div>

        <div className="bg-space-black/60 border border-white/5 p-4 rounded-xl space-y-3.5">
          <div className="text-[9px] text-gray-500 uppercase tracking-widest font-bold flex justify-between">
            <span>// LINHA DO TEMPO</span>
            <Server className="w-3.5 h-3.5 text-gray-600" />
          </div>
          <div className="flex items-start gap-2.5 py-1 border-b border-white/5">
            <span className="text-neon-cyan text-xs mt-0.5">📷</span>
            <div>
              <div className="text-white text-xs font-semibold">
                QR escaneado
              </div>
              <div className="text-[10px] text-gray-500">
                Alguém encontrou e acionou a família
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2.5 py-1 border-b border-white/5">
            <span className="text-neon-cyan text-xs mt-0.5">📍</span>
            <div>
              <div className="text-white text-xs font-semibold">
                Localização compartilhada
              </div>
              <div className="text-[10px] text-gray-500">
                Posição enviada em tempo real
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2.5 py-1">
            <span className="text-cyber-emerald text-xs mt-0.5">✔</span>
            <div>
              <div className="text-white text-xs font-semibold">
                Família notificada
              </div>
              <div className="text-[10px] text-gray-500">
                Responsáveis alertados na hora
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-center">
            <span className="text-[9px] text-gray-500 uppercase block">
              Proteção
            </span>
            <span className="text-base font-bold text-white mt-1 block">
              Crianças · Idosos · Pets
            </span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-center">
            <span className="text-[9px] text-gray-500 uppercase block">
              SOS
            </span>
            <span className="text-base font-bold text-cyber-emerald mt-1 block">
              Biométrico
            </span>
          </div>
        </div>
      </div>
    </div>
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute -bottom-5 -right-5 bg-space-dark border border-white/10 p-3.5 rounded-xl shadow-2xl font-mono text-[9px] text-gray-400 hidden md:block"
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-neon-cyan animate-ping" />
        <span>FAMÍLIA CONECTADA</span>
      </div>
    </motion.div>
  </div>
);

// ── Fusion Buy AI chat mockup ────────────────────────────────────────────────
const FusionBuyMockup: React.FC = () => (
  <div className="relative">
    <div className="absolute -inset-4 bg-gradient-to-r from-cyber-purple to-cyber-pink rounded-3xl blur-2xl opacity-15" />
    <div className="relative mx-auto rounded-2xl border border-white/10 bg-space-dark/95 shadow-2xl p-5 md:p-6 max-w-lg lg:max-w-none">
      <div className="flex items-center gap-2.5 border-b border-white/5 pb-4 mb-5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-purple to-cyber-pink flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">
            Fusion Buy AI
          </div>
          <div className="text-[10px] text-cyber-emerald flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald animate-pulse" />
            online agora
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* user message */}
        <div className="flex justify-end">
          <div className="max-w-[80%] bg-white/[0.06] border border-white/10 rounded-2xl rounded-br-sm px-3.5 py-2.5 text-xs text-gray-200">
            Preciso de um fone bom para trabalho, até R$ 300.
          </div>
        </div>
        {/* ai message */}
        <div className="flex justify-start">
          <div className="max-w-[85%] bg-gradient-to-br from-cyber-purple/15 to-cyber-pink/10 border border-cyber-purple/20 rounded-2xl rounded-bl-sm px-3.5 py-3 text-xs text-gray-200 space-y-2">
            <p>Encontrei 3 boas opções com cancelamento de ruído. 👇</p>
            <div className="bg-space-black/60 border border-white/5 rounded-lg p-2.5 flex items-center gap-2.5">
              <Search className="w-4 h-4 text-cyber-purple flex-shrink-0" />
              <div className="flex-1">
                <div className="text-white font-semibold text-[11px]">
                  Melhor custo-benefício
                </div>
                <div className="text-[10px] text-gray-500">
                  Ótimo microfone · bateria 30h · R$ 279
                </div>
              </div>
              <span className="text-cyber-emerald text-[10px] font-bold">
                98%
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Quer que eu compare bateria e conforto?
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 bg-space-black border border-white/10 rounded-xl px-3 py-2.5">
        <input
          disabled
          placeholder="Pergunte o que quiser comprar..."
          className="flex-1 bg-transparent text-xs text-gray-400 placeholder:text-gray-600 outline-none"
        />
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyber-purple to-cyber-pink flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
    </div>
  </div>
);

// ── Coffee Break phone mockup ────────────────────────────────────────────────
const CoffeeBreakMockup: React.FC = () => (
  <div className="relative">
    <div className="relative mx-auto border-gray-950 bg-black border-[12px] rounded-[3rem] h-[560px] w-[272px] shadow-2xl flex flex-col overflow-hidden shadow-orange-500/5">
      <div className="h-[32px] w-[3px] bg-gray-900 absolute -left-[15px] top-[72px] rounded-l-lg" />
      <div className="h-[46px] w-[3px] bg-gray-900 absolute -left-[15px] top-[124px] rounded-l-lg" />
      <div className="h-[64px] w-[3px] bg-gray-900 absolute -right-[15px] top-[142px] rounded-r-lg" />
      <div className="w-full h-full bg-gradient-to-br from-space-dark to-black relative overflow-hidden flex flex-col">
        <div className="w-full h-8 flex justify-between items-center px-6 text-[10px] text-white/50 z-20">
          <span>9:41</span>
          <div className="w-2.5 h-1.5 rounded-sm border border-white/30" />
        </div>
        <div className="px-5 pt-2 pb-1 z-10">
          <div className="flex justify-between items-center mb-5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Coffee className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10" />
          </div>
          <h3 className="text-xl font-bold text-white leading-tight">
            Coffee <span className="text-orange-500">Break</span>
          </h3>
          <p className="text-[10px] text-gray-500">Sua pausa, mais rápida</p>
        </div>
        <div className="px-5 py-1.5 z-10">
          <div className="w-full h-8 bg-white/[0.02] rounded-lg border border-white/5 flex items-center px-3">
            <Search className="w-3 h-3 text-gray-600" />
          </div>
        </div>
        <div className="px-5 py-3 flex gap-2 overflow-x-hidden z-10">
          {['Cafés', 'Snacks', 'Bebidas'].map((cat, i) => (
            <div
              key={cat}
              className={`px-3 py-1 rounded-md text-[10px] font-semibold ${
                i === 0
                  ? 'bg-orange-500 text-space-black'
                  : 'bg-white/5 text-gray-400'
              }`}
            >
              {cat}
            </div>
          ))}
        </div>
        <div className="flex-1 px-5 pb-5 overflow-hidden z-10 relative">
          <div className="w-full h-28 rounded-xl bg-gradient-to-r from-orange-600 to-orange-400 p-3.5 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-full bg-black/10 -skew-x-12 transform translate-x-4" />
            <p className="text-white font-bold text-base">Oferta relâmpago</p>
            <p className="text-white/80 text-[10px]">Espresso + Croissant</p>
            <div className="mt-3 px-2 py-0.5 bg-black/20 backdrop-blur-md rounded text-[10px] text-white inline-block">
              R$ 14,90
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-white/[0.02] border border-white/5 p-2"
              >
                <div className="w-full h-14 rounded-lg bg-white/5 mb-1.5" />
                <div className="h-2.5 w-3/4 bg-white/10 rounded mb-1" />
                <div className="h-1.5 w-1/2 bg-white/5 rounded" />
              </div>
            ))}
          </div>
          <div className="absolute bottom-3 right-3 z-30">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20"
            >
              <ShoppingBag className="w-4 h-4 text-space-black" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-20 -right-8 bg-space-dark/85 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl hidden md:block"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <Clock className="w-4 h-4 text-orange-500" />
        </div>
        <div>
          <p className="text-[10px] text-gray-500 uppercase font-semibold">
            Pedido pronto em
          </p>
          <p className="text-white font-bold text-sm">15 min</p>
        </div>
      </div>
    </motion.div>
  </div>
);

const AppsDevSection: React.FC = () => {
  const reencontra = getProduct('reencontra')!;
  const fusionBuy = getProduct('fusion-buy')!;
  const coffee = getProduct('coffee-break')!;

  return (
    <section
      id="apps"
      className="relative py-24 md:py-28 bg-space-black/70 backdrop-blur-[2px] overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-40 right-0 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[110px]" />
        <div className="absolute bottom-40 left-0 w-72 h-72 bg-cyber-purple/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 cyber-grid opacity-15" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <SectionHeading
          eyebrow="Produtos em destaque"
          eyebrowIcon={<Boxes className="w-3.5 h-3.5 text-neon-cyan" />}
          title={
            <>
              Conheça de perto o que{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-cyber-purple to-cyber-pink">
                já está no ar
              </span>
            </>
          }
          description="Três produtos disponíveis agora — cada um resolvendo um problema real, com a mesma qualidade e identidade ATS."
        />

        {/* Reencontra */}
        <div
          id="reencontra"
          className="scroll-mt-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-24 mb-32"
        >
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1"
          >
            <ProductIntro product={reencontra} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2"
          >
            <ReencontraMockup />
          </motion.div>
        </div>

        {/* Fusion Buy AI (reversed) */}
        <div
          id="fusion-buy"
          className="scroll-mt-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32"
        >
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <FusionBuyMockup />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <ProductIntro product={fusionBuy} />
          </motion.div>
        </div>

        {/* Coffee Break */}
        <div
          id="coffee-break"
          className="scroll-mt-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1"
          >
            <ProductIntro product={coffee} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2"
          >
            <CoffeeBreakMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AppsDevSection;
