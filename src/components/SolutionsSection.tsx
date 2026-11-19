import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Plus, ArrowRight, Hand } from 'lucide-react';
import { products, type Product } from '../data/products';
import SectionHeading from './ui/SectionHeading';
import StatusBadge from './ui/StatusBadge';
import ProductCTAs from './ui/ProductCTAs';

const ProductCard: React.FC<{ product: Product; index: number }> = ({
  product,
  index,
}) => {
  const Icon = product.icon;
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="group relative flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-7 overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 snap-center shrink-0 w-[86%] sm:w-[64%] md:w-auto"
      style={{ boxShadow: `inset 0 1px 0 ${product.accent.from}14` }}
    >
      {/* Accent glow on hover */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ backgroundColor: product.accent.glow }}
      />
      {/* Top accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity"
        style={{
          backgroundImage: `linear-gradient(to right, transparent, ${product.accent.from}, ${product.accent.to}, transparent)`,
        }}
      />

      <div className="relative z-10 flex items-start justify-between mb-6">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 transition-transform duration-500 group-hover:scale-110"
          style={{
            backgroundImage: `linear-gradient(135deg, ${product.accent.from}22, ${product.accent.to}22)`,
            color: product.accent.from,
          }}
        >
          <Icon className="h-6 w-6" />
        </div>
        <StatusBadge status={product.status} />
      </div>

      <div className="relative z-10 flex-1">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.16em] mb-1.5"
          style={{ color: product.accent.from }}
        >
          {product.category}
        </p>
        <h3 className="text-xl font-bold text-white tracking-tight">
          {product.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-gray-300">
          {product.tagline}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-gray-400">
          {product.short}
        </p>
      </div>

      <div className="relative z-10 mt-7">
        <ProductCTAs product={product} size="sm" />
      </div>
    </motion.article>
  );
};

/** "Coming soon" placeholder card that keeps space for future products. */
const FutureCard: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.1 }}
    className="group relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-8 text-center min-h-[220px] transition-colors hover:border-neon-cyan/30 snap-center shrink-0 w-[86%] sm:w-[64%] md:w-auto"
  >
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-gray-500 group-hover:text-neon-cyan transition-colors">
      <Plus className="h-6 w-6" />
    </div>
    <h3 className="text-base font-bold text-gray-300">Novas soluções a caminho</h3>
    <p className="mt-2 text-sm text-gray-500 max-w-[220px]">
      Estamos sempre construindo. O ecossistema ATS cresce a cada lançamento.
    </p>
    <a
      href="#contact"
      className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-neon-cyan hover:gap-2.5 transition-all"
    >
      Sugerir uma ideia <ArrowRight className="h-3.5 w-3.5" />
    </a>
  </motion.div>
);

const SolutionsSection: React.FC = () => {
  // Progresso do carrossel no celular (no desktop é uma grade comum).
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  };

  return (
    <section
      id="solutions"
      className="relative py-24 md:py-28 bg-space-black/70 backdrop-blur-[2px] overflow-hidden"
    >
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <SectionHeading
          eyebrow="Ecossistema ATS"
          eyebrowIcon={<Layers className="w-3.5 h-3.5 text-neon-cyan" />}
          title={
            <>
              Nossas{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-cyber-purple">
                Soluções
              </span>
            </>
          }
          description="Não são aplicativos isolados: cada produto faz parte do ecossistema ATS — mesma qualidade, mesma identidade e evolução constante. Um resolve o seu problema hoje; o próximo já está a caminho."
        />

        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="mt-12 md:mt-16 -mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none overscroll-x-contain md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:overflow-visible"
        >
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
          <FutureCard />
        </div>

        {/* Só no celular: barra de progresso + dica de gesto. */}
        <div className="md:hidden mt-5 flex items-center gap-3 px-1">
          <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-neon-cyan to-cyber-purple"
              style={{ width: `${Math.max(12, progress * 100)}%` }}
            />
          </div>
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            <Hand className="h-3.5 w-3.5" /> Deslize
          </span>
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;
