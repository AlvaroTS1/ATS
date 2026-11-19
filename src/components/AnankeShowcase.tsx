import React, { useEffect, useState } from 'react';
import {
  WifiOff,
  Lock,
  Siren,
  MapPin,
  KeyRound,
  Radio,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import { ANANKE_APK_INFO, ANANKE_APK_URL, ANANKE_WEB_URL, type Product } from '../data/products';
import StatusBadge from './ui/StatusBadge';
import ProductCTAs from './ui/ProductCTAs';
import ProductMicroEnvironment from './ProductMicroEnvironment';
import { useReveal } from '../hooks/useReveal';
import { REVEAL_DORMANT, revealDelay } from '../lib/reveal';
import { cn } from '../lib/utils';

const GOLD = '#F2C867';
const GOLD_DEEP = '#C48C2C';

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
};

const Reveal: React.FC<{ children: React.ReactNode; className?: string; delayMs?: number }> = ({
  children,
  className,
  delayMs = 0,
}) => {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.2 });
  return (
    <div
      ref={ref}
      className={cn(className, visible ? 'animate-reveal' : REVEAL_DORMANT)}
      style={visible ? revealDelay(delayMs) : undefined}
    >
      {children}
    </div>
  );
};

/**
 * A mensagem saltando de aparelho em aparelho (A → B → C → D), sem torre e
 * sem servidor — o conceito inteiro da ANANKE num desenho só. SVG puro com
 * `animateMotion`: zero JS por quadro, leve no celular.
 */
const MeshDiagram: React.FC<{ animate: boolean }> = ({ animate }) => {
  const nodes = [
    { x: 30, y: 92, label: 'Você' },
    { x: 104, y: 40, label: '' },
    { x: 178, y: 96, label: '' },
    { x: 250, y: 44, label: 'Família' },
  ];
  const path = 'M30 92 L104 40 L178 96 L250 44';
  return (
    <svg viewBox="0 0 280 130" className="w-full h-auto" aria-hidden="true">
      <defs>
        <linearGradient id="ananke-link" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={GOLD} stopOpacity="0.15" />
          <stop offset="0.5" stopColor={GOLD} stopOpacity="0.7" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0.15" />
        </linearGradient>
        <radialGradient id="ananke-pulse">
          <stop offset="0" stopColor="#fff7dc" />
          <stop offset="0.4" stopColor={GOLD} />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={path} fill="none" stroke="url(#ananke-link)" strokeWidth="1.5" strokeDasharray="4 5" />
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="15" fill={GOLD} opacity="0.08">
            {animate && (
              <animate
                attributeName="r"
                values="13;19;13"
                dur="3s"
                begin={`${i * 0.6}s`}
                repeatCount="indefinite"
              />
            )}
          </circle>
          {/* um celular estilizado em cada nó */}
          <rect
            x={n.x - 6}
            y={n.y - 10}
            width="12"
            height="20"
            rx="3"
            fill="#0b0f18"
            stroke={GOLD}
            strokeWidth="1.2"
          />
          <rect x={n.x - 3.5} y={n.y - 7} width="7" height="11" rx="1" fill={GOLD} opacity="0.35" />
          {n.label && (
            <text
              x={n.x}
              y={n.y + 26}
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill="#d6c79e"
              letterSpacing="0.5"
            >
              {n.label}
            </text>
          )}
        </g>
      ))}
      {animate ? (
        <circle r="6" fill="url(#ananke-pulse)">
          <animateMotion dur="3.6s" repeatCount="indefinite" path={path} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
        </circle>
      ) : (
        <circle cx="178" cy="96" r="6" fill="url(#ananke-pulse)" />
      )}
    </svg>
  );
};

/** O celular: modo sem internet, malha local e um SOS confirmado. */
const AnankePhone: React.FC<{ animate: boolean }> = ({ animate }) => (
  <div className="relative mx-auto w-[272px] sm:w-[290px]">
    <div
      className="absolute -inset-10 rounded-full blur-3xl opacity-40 pointer-events-none"
      style={{ background: `radial-gradient(circle, ${GOLD}55, transparent 65%)` }}
    />
    <div className="relative border-[11px] border-[#0c0c0f] bg-black rounded-[2.8rem] shadow-2xl overflow-hidden ring-1 ring-[#f2c867]/20">
      <div className="bg-gradient-to-b from-[#0d1220] via-[#07090f] to-black px-5 pt-3 pb-6">
        <div className="flex justify-between items-center text-[10px] text-white/50 mb-4">
          <span>9:41</span>
          <span className="flex items-center gap-1 text-amber-200/80">
            <WifiOff className="w-3 h-3" /> sem internet
          </span>
        </div>

        <div className="flex items-center gap-2.5 mb-4">
          <img src="/ananke/simbolo.webp" alt="" className="w-11 h-auto" draggable={false} />
          <div>
            <p className="text-white font-bold text-sm tracking-[0.18em] leading-tight">ANANKE</p>
            <p className="text-[10px] text-[#d6c79e]/80">Conectados. Sempre.</p>
          </div>
        </div>

        <div className="rounded-xl border border-[#f2c867]/20 bg-[#f2c867]/[0.05] px-3 py-2.5 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#f2c867]">
              Rede local
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              4 aparelhos
            </span>
          </div>
          <MeshDiagram animate={animate} />
          <p className="text-[9px] text-gray-500 -mt-1">Wi-Fi local · Bluetooth · sem servidor</p>
        </div>

        <div className="rounded-xl border border-red-400/25 bg-red-500/[0.08] px-3 py-2.5 mb-2.5">
          <div className="flex items-center gap-2 mb-1">
            <Siren className="w-3.5 h-3.5 text-red-300" />
            <span className="text-[11px] font-bold text-red-200">Pedido de ajuda (SOS)</span>
          </div>
          <p className="text-[10px] text-gray-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> GPS ±8 m · há 2 min
          </p>
          <p className="mt-1.5 text-[10px] text-emerald-300 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> confirmado por 3 aparelhos
          </p>
        </div>

        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-br from-[#f2c867]/25 to-[#c48c2c]/15 border border-[#f2c867]/25 px-3 py-2 text-[11px] text-amber-50">
            Estamos bem, no abrigo da escola.
            <span className="mt-0.5 flex items-center justify-end gap-1 text-[9px] text-[#d6c79e]/80">
              <Lock className="w-2.5 h-2.5" /> cifrada · entregue ✓✓
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const STEPS = [
  {
    icon: KeyRound,
    title: 'Crie sua identidade',
    text: '12 palavras geradas no seu aparelho, protegidas por PIN. Sem cadastro, sem número de telefone.',
  },
  {
    icon: Radio,
    title: 'Conecte quem está perto',
    text: 'Por QR code ou automaticamente, no mesmo Wi-Fi ou por Bluetooth — mesmo com a internet desligada.',
  },
  {
    icon: ShieldCheck,
    title: 'A mensagem chega',
    text: 'Ela salta de celular em celular até o destino, e só aparece "entregue" com o recibo assinado de quem recebeu.',
  },
];

/**
 * ANANKE — a deep-dive environment like the other products, but with the
 * brand's own world behind it: the goddess embracing the globe, gold motes,
 * and the phone showing the network working with no internet at all.
 */
const AnankeShowcase: React.FC<{ product: Product }> = ({ product }) => {
  const reducedMotion = usePrefersReducedMotion();
  return (
    <div id="ananke" className="relative scroll-mt-20 min-h-screen overflow-hidden py-24 md:py-28">
      {/* Arte da marca como ambiente: no celular fica no topo e se dissolve
          no texto; no desktop ocupa a lateral direita. */}
      <div className="absolute inset-0 -z-20 pointer-events-none">
        <img
          src="/ananke/ananke-abraco.webp"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute right-0 top-0 h-[70vh] w-full object-cover object-[50%_20%] opacity-35 md:h-full md:w-[62%] md:opacity-45"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-space-black/20 via-space-black/80 to-space-black md:bg-gradient-to-r md:from-space-black md:via-space-black/85 md:to-space-black/10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-space-black to-transparent" />
      </div>
      <ProductMicroEnvironment product={product} className="absolute inset-0 -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
          <Reveal>
            <div className="flex items-center gap-3 mb-5">
              <img src="/ananke/simbolo.webp" alt="" className="w-16 h-auto drop-shadow-[0_0_18px_rgba(242,200,103,0.45)]" draggable={false} />
              <StatusBadge status={product.status} />
            </div>
            <span
              className="text-xs font-semibold uppercase tracking-widest block mb-2"
              style={{ color: GOLD }}
            >
              {product.category}
            </span>
            <h3 className="text-4xl md:text-6xl font-black tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-r from-[#fff1c4] via-[#f2c867] to-[#c48c2c]">
              ANANKE
            </h3>
            <p className="mt-3 text-lg md:text-xl font-semibold text-white">
              Quando tudo cai, a sua rede continua de pé.
            </p>
            <p className="mt-5 text-gray-300/90 text-base leading-relaxed font-light">
              {product.long}
            </p>

            <div className="mt-8 grid gap-4">
              {product.highlights.map((h, i) => {
                const HIcon = [WifiOff, Siren, MapPin][i] ?? Globe;
                return (
                  <div
                    key={h.title}
                    className="flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm"
                  >
                    <div
                      className="w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${GOLD}12`, borderColor: `${GOLD}30`, color: GOLD }}
                    >
                      <HIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">{h.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{h.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <ProductCTAs product={product} className="mt-9" />
            {ANANKE_APK_URL ? (
              <div className="mt-5 space-y-3">
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {[`Versão ${ANANKE_APK_INFO.version}`, ANANKE_APK_INFO.size, ANANKE_APK_INFO.minAndroid, 'Grátis'].map((t) => (
                    <span key={t} className="rounded-full border border-[#f2c867]/20 bg-[#f2c867]/[0.05] px-2.5 py-1 text-[#e9d9a8]">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-gray-500">
                  Ao abrir o arquivo, o Android pede para permitir a instalação desta fonte — é só
                  autorizar. Em breve também no Google Play. Sem Android à mão?{' '}
                  <a
                    href={ANANKE_WEB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-dotted underline-offset-2 hover:text-[#f2c867]"
                  >
                    Abra a versão web
                  </a>{' '}
                  (Bluetooth e Wi-Fi automático só no app).
                </p>
              </div>
            ) : (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#f2c867]/15 bg-[#f2c867]/[0.04] px-4 py-3 text-xs leading-relaxed text-gray-400">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f2c867] animate-pulse" />
                <span>
                  A versão web abre direto no navegador e pode ser adicionada à tela inicial.
                  O <strong className="font-semibold text-[#f2c867]">app para Android</strong> (com
                  Bluetooth e Wi-Fi automático) chega em breve — primeiro por APK, depois no Google Play.
                </span>
              </div>
            )}
          </Reveal>

          <Reveal delayMs={180} className="lg:pl-8">
            <AnankePhone animate={!reducedMotion} />
          </Reveal>
        </div>

        {/* Como funciona — no celular vira um carrossel de deslizar. */}
        <Reveal delayMs={120} className="mt-20">
          <p
            className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] mb-6"
            style={{ color: GOLD }}
          >
            Como funciona
          </p>
          <div className="-mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible">
            {STEPS.map((step, i) => {
              const SIcon = step.icon;
              return (
                <div
                  key={step.title}
                  className="snap-center shrink-0 w-[80%] sm:w-[60%] md:w-auto rounded-2xl border border-[#f2c867]/15 bg-gradient-to-b from-[#f2c867]/[0.06] to-transparent p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-space-black"
                      style={{ backgroundImage: `linear-gradient(135deg, ${GOLD}, ${GOLD_DEEP})` }}
                    >
                      {i + 1}
                    </span>
                    <SIcon className="w-5 h-5" style={{ color: GOLD }} />
                  </div>
                  <h4 className="text-white font-bold mb-1.5">{step.title}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.text}</p>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </div>
  );
};

export default AnankeShowcase;
