import React from 'react';
import {
  Anchor,
  ArrowUpRight,
  BadgeCheck,
  Blocks,
  Building2,
  Check,
  Fingerprint,
  GraduationCap,
  Handshake,
  Landmark,
  Lock,
  Mail,
  ScanSearch,
  Users,
  X,
} from 'lucide-react';
import { getProduct } from '../data/products';
import { useReveal } from '../hooks/useReveal';
import { REVEAL_DORMANT, revealDelay } from '../lib/reveal';
import { cn } from '../lib/utils';
import ProductMicroEnvironment from './ProductMicroEnvironment';
import SectionHeading from './ui/SectionHeading';
import VotrixMark from './votrix/VotrixMark';
import LiveChain from './votrix/LiveChain';
import TamperDemo from './votrix/TamperDemo';

const APP = 'https://votrix.atssistemas.ia.br';
const GRADIENT = 'bg-gradient-to-r from-[#3b82f6] via-[#22d3ee] to-[#34d399]';

const pillars = [
  {
    icon: ScanSearch,
    word: 'Verificável',
    title: 'Você confere. Qualquer um confere.',
    text: 'Ao votar, você recebe um comprovante com código de rastreio e encontra o seu voto no quadro público — sem revelar a escolha. No fim, o verificador independente recalcula a apuração inteira a partir dos dados públicos, sem precisar confiar no servidor. Nem na ATS.',
    proof: 'Comprovante + verificador independente',
  },
  {
    icon: Fingerprint,
    word: 'Intransferível',
    title: 'Uma pessoa, uma credencial, um voto.',
    text: 'Cada participante recebe uma credencial única e anônima, emitida por assinatura cega: o sistema confirma que você pode votar sem conseguir ligar a credencial a você. Cada credencial vale um único voto, e com a Identidade Verificada cada CPF é uma só pessoa — sem contas duplicadas, sem robôs.',
    proof: 'Assinatura cega (RFC 9474) + CPF verificado',
  },
  {
    icon: Blocks,
    word: 'Imutável',
    title: 'Depois de selado, não muda.',
    text: 'Cada cédula entra num bloco que carrega o hash do bloco anterior. Mudar uma vírgula quebra a corrente dali em diante — e todo mundo vê. O resumo do quadro (a raiz de Merkle) é carimbado no Bitcoin: um registro público, fora do nosso controle, prova que nada foi trocado depois.',
    proof: 'Corrente de hashes + carimbo no Bitcoin',
  },
];

const steps = [
  { icon: Mail, title: 'Convite no e-mail', text: 'A organização cadastra quem participa. Cada pessoa recebe um link pessoal — sem senha, sem código e sem instalar nada.' },
  { icon: Lock, title: 'Voto cifrado no aparelho', text: 'A escolha é cifrada no seu celular antes de sair dele. Nem a organização nem a ATS conseguem ler em quem você votou.' },
  { icon: Blocks, title: 'Vira um bloco da corrente', text: 'A cédula cifrada é selada no quadro público, ligada à anterior. Você guarda o comprovante com o código de rastreio.' },
  { icon: BadgeCheck, title: 'Resultado com prova', text: 'Guardiões de confiança revelam juntos só o total, com provas matemáticas. A raiz vai para o Bitcoin e qualquer pessoa audita.' },
];

const compare: [string, string, string][] = [
  ['Quem garante o resultado?', 'Você precisa confiar em quem organizou.', 'A matemática — e qualquer pessoa pode recalcular.'],
  ['Sigilo do voto', 'Quem administra o formulário ou a planilha vê tudo.', 'Cifrado no aparelho; só o total é revelado.'],
  ['Voto duplicado ou de robô', 'Basta criar outro e-mail.', 'Credencial única; CPF verificado; defesa anti-robô.'],
  ['Alteração depois', 'Ninguém percebe.', 'A corrente quebra e o carimbo no Bitcoin denuncia.'],
  ['Comprovante para quem votou', 'Nenhum.', 'Código de rastreio para conferir o próprio voto.'],
];

const audiences = [
  { icon: Building2, label: 'Condomínios' },
  { icon: Users, label: 'Associações' },
  { icon: Handshake, label: 'Cooperativas' },
  { icon: Landmark, label: 'Conselhos' },
  { icon: GraduationCap, label: 'Universidades' },
];

const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className, delay = 0 }) => {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.12 });
  return (
    <div ref={ref} className={cn(visible ? 'animate-reveal' : REVEAL_DORMANT, className)} style={visible ? revealDelay(delay) : undefined}>
      {children}
    </div>
  );
};

const PrimaryCTA: React.FC<{ className?: string; children: React.ReactNode; href?: string }> = ({ className, children, href = `${APP}/cadastro` }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      'group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-[#04121a] shadow-[0_12px_40px_-10px_rgba(34,211,238,0.6)] transition-all duration-300 hover:brightness-110 active:scale-[0.98]',
      GRADIENT,
      className,
    )}
  >
    {children}
    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
  </a>
);

const GhostCTA: React.FC<{ href: string; children: React.ReactNode; external?: boolean }> = ({ href, children, external }) => (
  <a
    href={href}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:border-cyan-300/40 hover:bg-white/[0.07]"
  >
    {children}
  </a>
);

/**
 * VOTRIX — the flagship section. Placed right after the cinematic Hero so
 * it is the first thing the page explains, and reachable from the header
 * banner and nav. Every claim here mirrors what the product itself says on
 * votrix.atssistemas.ia.br (Bitcoin anchoring via OpenTimestamps is active in
 * production; nothing personal ever goes on-chain).
 */
const VotrixSection: React.FC = () => {
  const product = getProduct('votrix')!;

  return (
    <section id="votrix" className="relative overflow-hidden bg-[#050b18] scroll-mt-20">
      <ProductMicroEnvironment product={product} />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 cyber-grid opacity-30 [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_80%)]" />

      {/* ── 1. Promise + live chain ───────────────────────────── */}
      <div className="container relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-16 md:px-6 md:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14 [&>*]:min-w-0">
          <Reveal>
            <div className="flex items-center gap-3">
              <VotrixMark className="h-12 w-12 md:h-14 md:w-14 drop-shadow-[0_0_20px_rgba(34,211,238,0.45)]" title="VOTRIX" />
              <div>
                <p className="text-2xl md:text-3xl font-black tracking-[0.22em] text-white">
                  VOTRI<span className="text-cyan-300">X</span>
                </p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">uma tecnologia ATS Sistemas</p>
              </div>
              <span className="ml-auto sm:ml-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> No ar
              </span>
            </div>

            <h2 className="mt-8 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.03] tracking-tight text-white">
              Seu voto.
              <span className={cn('mt-1 block text-transparent bg-clip-text', GRADIENT)}>
                Verificável.
                <br />
                Intransferível.
                <br />
                Imutável.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-gray-300">
              Votação digital com a tecnologia da <strong className="text-white">blockchain</strong>: cada voto é cifrado no seu celular, vira um bloco
              encadeado ao anterior e o resumo de tudo é <strong className="text-white">carimbado no Bitcoin</strong>. Ninguém vê em quem você votou — e
              qualquer pessoa pode conferir o resultado.
            </p>
            <p className="mt-3 text-sm font-semibold text-cyan-200/90">Não basta confiar. Você pode verificar.</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryCTA>Criar votação grátis</PrimaryCTA>
              <GhostCTA href="#votrix-como">Ver como funciona</GhostCTA>
            </div>
            <p className="mt-4 text-xs text-gray-500">7 dias grátis, sem cartão · quem vota nunca paga · funciona no navegador</p>
          </Reveal>

          <Reveal delay={150}>
            <LiveChain />
          </Reveal>
        </div>
      </div>

      {/* ── 2. The three promises ─────────────────────────────── */}
      <div className="container relative z-10 mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.word} delay={i * 120} className="h-full">
              <article className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-7 transition-all duration-500 hover:-translate-y-1 hover:border-cyan-300/30">
                <div className={cn('absolute inset-x-0 top-0 h-[2px] opacity-60 group-hover:opacity-100', GRADIENT)} />
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-300">
                  <p.icon className="h-6 w-6" />
                </div>
                <p className={cn('mt-6 text-3xl font-black tracking-tight text-transparent bg-clip-text', GRADIENT)}>{p.word}</p>
                <h3 className="mt-1 text-lg font-bold text-white">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">{p.text}</p>
                <p className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-3 py-1 font-mono text-[10px] text-emerald-300">
                  <Check className="h-3 w-3" /> {p.proof}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── 3. How it works ───────────────────────────────────── */}
      <div id="votrix-como" className="container relative z-10 mx-auto max-w-7xl px-4 py-16 md:px-6 scroll-mt-24">
        <SectionHeading
          eyebrow="Como funciona"
          eyebrowIcon={<VotrixMark className="h-3.5 w-3.5" />}
          title={
            <>
              Do convite ao resultado,{' '}
              <span className={cn('text-transparent bg-clip-text', GRADIENT)}>em 4 passos</span>
            </>
          }
          description="Para quem vota, é simples como abrir um link. Por baixo, cada etapa deixa uma prova que qualquer pessoa pode conferir."
        />
        <div className="relative mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className={cn('pointer-events-none absolute left-[12%] right-[12%] top-7 hidden h-px opacity-40 lg:block', GRADIENT)} />
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 110}>
              <div className="relative">
                <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/30 bg-[#081427] text-cyan-300 shadow-[0_0_30px_-8px_rgba(34,211,238,0.6)]">
                  <s.icon className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 font-mono text-[11px] font-bold text-[#04121a]">
                    {i + 1}
                  </span>
                </div>
                <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
                  <h3 className="text-base font-bold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── 4. Blockchain without mystery: try to cheat ───────── */}
      <div className="container relative z-10 mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center [&>*]:min-w-0">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-300">
              <Anchor className="h-3.5 w-3.5 text-orange-300" /> Blockchain sem mistério
            </p>
            <h2 className="mt-5 text-3xl md:text-5xl font-bold leading-[1.1] tracking-tight text-white">
              Tente adulterar <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-orange-300">um voto.</span>
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-gray-400">
              <p>
                Um <strong className="text-white">hash</strong> é a impressão digital de um dado: mude uma única letra e ele muda por completo. No VOTRIX,
                cada bloco carrega a impressão digital do bloco anterior — é isso que forma a corrente.
              </p>
              <p>
                Por isso não dá para trocar, apagar ou enfiar um voto escondido: a conta deixa de fechar, e o resumo já carimbado no Bitcoin não pode ser
                reescrito por ninguém — nem por nós.
              </p>
              <p className="text-sm text-gray-500">
                Experimente ao lado: é SHA-256 de verdade, rodando no seu navegador. No Bitcoin vai só um resumo matemático (a raiz de Merkle) — nunca
                votos, nomes ou dados pessoais.
              </p>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <TamperDemo />
          </Reveal>
        </div>
      </div>

      {/* ── 5. Compared to the usual way ──────────────────────── */}
      <div className="container relative z-10 mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionHeading
          eyebrow="Por que VOTRIX"
          eyebrowIcon={<ScanSearch className="h-3.5 w-3.5 text-cyan-300" />}
          title={
            <>
              Formulário online <span className="text-gray-500">×</span>{' '}
              <span className={cn('text-transparent bg-clip-text', GRADIENT)}>VOTRIX</span>
            </>
          }
          description="A diferença entre pedir confiança e entregar prova."
        />
        <Reveal className="mt-12">
          <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
            <div className="hidden grid-cols-[1fr_1fr_1.2fr] bg-white/[0.04] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400 md:grid">
              <span />
              <span>Votação por formulário comum</span>
              <span className="text-cyan-300">Com o VOTRIX</span>
            </div>
            {compare.map(([q, usual, votrix]) => (
              <div key={q} className="grid gap-2 border-t border-white/[0.06] px-5 py-4 md:grid-cols-[1fr_1fr_1.2fr] md:items-center md:gap-4">
                <span className="text-sm font-semibold text-white">{q}</span>
                <span className="flex items-start gap-2 text-sm text-gray-500">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400/80" />
                  {usual}
                </span>
                <span className="flex items-start gap-2 text-sm text-gray-200">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {votrix}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ── 6. Who + call to action ───────────────────────────── */}
      <div className="container relative z-10 mx-auto max-w-7xl px-4 pt-8 pb-24 md:px-6 md:pb-32">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-[#0b1a33] via-[#071226] to-[#06201c] p-7 md:p-12">
            <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-[90px]" />
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/15 blur-[90px]" />
            <VotrixMark className="pointer-events-none absolute right-6 top-6 h-24 w-24 opacity-[0.08] md:h-40 md:w-40" />

            <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Para quem decide junto</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {audiences.map((a) => (
                    <li key={a.label} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-gray-200">
                      <a.icon className="h-4 w-4 text-cyan-300" />
                      {a.label}
                    </li>
                  ))}
                </ul>
                <h2 className="mt-8 text-3xl md:text-4xl font-black leading-tight tracking-tight text-white">
                  A próxima decisão da sua organização pode ter <span className={cn('text-transparent bg-clip-text', GRADIENT)}>prova</span>.
                </h2>
                <p className="mt-4 text-gray-400">
                  Eleições internas, assembleias, prestação de contas e consultas públicas — com sigilo para quem vota e transparência para todos.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
                <p className="text-sm text-gray-400">Plano anual, tudo incluído</p>
                <p className="mt-1 text-4xl font-black tracking-tight text-white">
                  12x <span className={cn('text-transparent bg-clip-text', GRADIENT)}>R$ 49</span>
                </p>
                <p className="mt-1 text-sm text-gray-400">ou R$ 490 à vista por ano</p>
                <ul className="mt-5 space-y-2 text-sm text-gray-300">
                  {['7 dias grátis, sem cartão', 'Sem cobrança por voto ou por participante', 'Quem vota nunca paga', 'Português, inglês e espanhol'].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400" />
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-col gap-3">
                  <PrimaryCTA className="w-full">Começar grátis agora</PrimaryCTA>
                  <GhostCTA href={APP} external>
                    Conhecer o VOTRIX <ArrowUpRight className="h-4 w-4" />
                  </GhostCTA>
                </div>
              </div>
            </div>
            <p className="relative mt-8 text-[11px] text-gray-600">
              O VOTRIX é para votações de organizações e não se destina a eleições oficiais. Segurança aberta à comunidade em{' '}
              <a className="underline decoration-gray-700 hover:text-gray-400" href={`${APP}/seguranca`} target="_blank" rel="noopener noreferrer">
                Audite o VOTRIX
              </a>
              .
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default VotrixSection;
