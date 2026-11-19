import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CHAPTERS, ECOSYSTEM_ORDER } from '../../experience/chapters';
import { OPENING, frameUrl } from '../../experience/media';
import { getProduct, type Product } from '../../data/products';
import ProductCTAs from '../ui/ProductCTAs';

/**
 * The same story without motion — for visitors who ask for reduced motion
 * and for devices without WebGL. Normal page flow, no pinning, no canvas,
 * zero video requests: two still frames of the opening footage carry the
 * identity, everything else is typography and the products' own colours.
 */
const StaticExperience: React.FC = () => {
  const products = ECOSYSTEM_ORDER.map((id) => getProduct(id)).filter((p): p is Product => Boolean(p));
  const [nucleo, inteligencia, ecossistema, inovacao, futuro] = CHAPTERS;

  return (
    <section id="home" aria-label="Apresentação da ATS Sistemas" className="relative bg-space-black">
      <div className="relative flex min-h-[88svh] items-end overflow-hidden pb-16 pt-32">
        <img
          src={frameUrl(OPENING, 0)}
          alt="Esfera metálica com a marca ATS, o núcleo tecnológico da empresa"
          className="absolute inset-0 h-full w-full object-cover object-[50%_40%] opacity-80 md:object-contain"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-space-black via-space-black/40 to-transparent" />
        <div className="container relative mx-auto px-5 md:px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-neon-cyan">{nucleo.eyebrow}</p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl">{nucleo.title}</h1>
          <p className="mt-4 max-w-xl text-gray-300">{nucleo.body}</p>
          <a
            href="#solutions"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-cyan to-cyber-purple px-5 py-3 text-sm font-bold text-space-black"
          >
            Explorar soluções <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="container mx-auto grid gap-10 px-5 py-20 md:grid-cols-2 md:px-6">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-neon-cyan">{inteligencia.eyebrow}</p>
          <h2 className="text-3xl font-black text-white md:text-4xl">{inteligencia.title}</h2>
          <p className="mt-4 text-gray-300">{inteligencia.body}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {inteligencia.tags?.map((t) => (
              <li key={t} className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">
                {t}
              </li>
            ))}
          </ul>
        </div>
        <img
          src={frameUrl(OPENING, OPENING.count - 1)}
          alt="O núcleo de energia revelado dentro da esfera ATS"
          loading="lazy"
          className="mx-auto max-h-[420px] rounded-2xl object-cover"
        />
      </div>

      <div className="container mx-auto px-5 py-16 md:px-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-neon-cyan">{ecossistema.eyebrow}</p>
        <h2 className="text-3xl font-black text-white md:text-4xl">{ecossistema.title}</h2>
        <p className="mt-4 max-w-2xl text-gray-300">{ecossistema.body}</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl border bg-white/[0.02] p-6"
              style={{ borderColor: `${p.accent.from}40` }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: p.accent.from }}>
                {p.category}
              </p>
              <h3 className="mt-2 text-xl font-bold text-white">{p.name}</h3>
              <p className="mt-2 text-sm text-gray-400">{p.short}</p>
              <ProductCTAs product={p} size="sm" className="mt-5" />
            </article>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-5 py-16 md:px-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-neon-cyan">{inovacao.eyebrow}</p>
        <h2 className="text-3xl font-black text-white md:text-4xl">{inovacao.title}</h2>
        <p className="mt-4 max-w-2xl text-gray-300">{inovacao.body}</p>
      </div>

      <div className="container mx-auto px-5 pb-20 pt-10 text-center md:px-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-neon-cyan">{futuro.eyebrow}</p>
        <h2 className="text-3xl font-black text-white md:text-4xl">{futuro.title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-gray-300">{futuro.body}</p>
      </div>
    </section>
  );
};

export default StaticExperience;
