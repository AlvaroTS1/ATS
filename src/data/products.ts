import {
  ShieldCheck,
  ShoppingBag,
  Coffee,
  Boxes,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export type ProductStatus = 'available' | 'soon';

export interface ProductCTA {
  /** Visible label */
  label: string;
  /** External/hash href. If omitted and `waitlist` is true, opens the waitlist modal. */
  href?: string;
  /** When true, this button opens the waitlist modal for this product. */
  waitlist?: boolean;
  /** Visual weight of the button. */
  variant: 'primary' | 'ghost';
  /** Whether the link opens in a new tab. */
  external?: boolean;
}

export interface Product {
  id: string;
  name: string;
  /** One-line positioning statement. */
  tagline: string;
  /** Category eyebrow shown above the name. */
  category: string;
  status: ProductStatus;
  /** Short marketing description for cards. */
  short: string;
  /** Longer description for detail contexts. */
  long: string;
  /** 3 key capabilities. */
  highlights: { title: string; description: string }[];
  icon: LucideIcon;
  /**
   * Tailwind-friendly accent tokens. `from`/`to` are hex used for gradients and glows.
   * Keeping colors here is what makes every product feel part of one ecosystem.
   */
  accent: {
    from: string;
    to: string;
    /** rgba used for soft glows */
    glow: string;
  };
  ctas: ProductCTA[];
}

/**
 * Single source of truth for the whole ATS ecosystem.
 * Every card, badge, roadmap entry and detail view reads from here so a new
 * product is added in one place and appears everywhere consistently.
 */
export const products: Product[] = [
  {
    id: 'reencontra',
    name: 'Reencontra',
    category: 'Proteção Familiar · SaaS',
    tagline: 'Segurança que reconecta famílias em segundos.',
    status: 'available',
    short:
      'Plataforma de proteção familiar com QR Codes inteligentes. Ao escanear, aciona localização e um canal seguro com a família — para crianças, idosos e pets.',
    long:
      'O Reencontra é a plataforma SaaS de proteção familiar da ATS. QR Codes criptografados conectam quem encontra alguém perdido diretamente à família, com localização em tempo real, chat seguro e alertas de emergência com verificação biométrica.',
    highlights: [
      {
        title: 'QR de Reencontro',
        description:
          'Etiqueta segura para crianças, idosos e pets. Ao escanear, a família é notificada na hora.',
      },
      {
        title: 'Localização em Tempo Real',
        description:
          'Compartilhamento de posição e canal de mensagens seguro entre quem encontrou e os responsáveis.',
      },
      {
        title: 'SOS com Biometria',
        description:
          'Alerta de emergência acionado por biometria nativa, sem senha, com telemetria contínua.',
      },
    ],
    icon: ShieldCheck,
    accent: { from: '#29ABE2', to: '#6366F1', glow: 'rgba(41,171,226,0.35)' },
    ctas: [
      {
        label: 'Acessar aplicativo',
        href: 'https://reencontra.atssistemas.ia.br',
        variant: 'primary',
        external: true,
      },
      { label: 'Saiba mais', href: '#reencontra', variant: 'ghost' },
    ],
  },
  {
    id: 'fusion-buy',
    name: 'Fusion Buy AI',
    category: 'Assistente de Compras · IA',
    tagline: 'Seu assistente inteligente para comprar melhor.',
    status: 'available',
    short:
      'Um assistente de IA que entende o que você precisa, compara opções e recomenda a melhor compra — com contexto, preço e economia de tempo.',
    long:
      'O Fusion Buy AI é um assistente de compras conversacional. Você diz o que precisa e ele interpreta a intenção, compara alternativas, resume prós e contras e recomenda a decisão mais inteligente — transformando pesquisa demorada em uma conversa de segundos.',
    highlights: [
      {
        title: 'Busca por Intenção',
        description:
          'Descreva o que procura em linguagem natural; a IA entende o contexto, não só palavras-chave.',
      },
      {
        title: 'Comparação Inteligente',
        description:
          'Avalia opções, preços e características e resume os prós e contras de cada uma.',
      },
      {
        title: 'Recomendação com Contexto',
        description:
          'Sugere a melhor escolha para o seu caso, com justificativa clara e transparente.',
      },
    ],
    icon: ShoppingBag,
    accent: { from: '#A855F7', to: '#EC4899', glow: 'rgba(168,85,247,0.35)' },
    ctas: [
      {
        label: 'Experimentar',
        href: 'https://fusionbuy.atssistemas.ia.br',
        variant: 'primary',
        external: true,
      },
      { label: 'Saiba mais', href: '#fusion-buy', variant: 'ghost' },
    ],
  },
  {
    id: 'coffee-break',
    name: 'Coffee Break',
    category: 'App Mobile · Alimentação',
    tagline: 'Pausas alimentares, do jeito rápido e moderno.',
    status: 'available',
    short:
      'Aplicativo mobile de autoatendimento e alimentação. Pedidos ágeis, checkout em segundos e experiência pensada para o dia a dia corporativo.',
    long:
      'O Coffee Break é o aplicativo mobile da ATS para modernizar pausas alimentares em ambientes corporativos e do dia a dia. Interface ágil, checkout rápido e disponibilidade resiliente em uma experiência frictionless.',
    highlights: [
      {
        title: 'Experiência Frictionless',
        description:
          'Jornada de compra otimizada para mobile, com checkout em poucos segundos.',
      },
      {
        title: 'Disponível na Play Store',
        description:
          'App Android publicado e pronto para uso, com atualizações contínuas.',
      },
      {
        title: 'Automação Inteligente',
        description:
          'Notificações e apoio à operação com inteligência para estoque e reposição.',
      },
    ],
    icon: Coffee,
    // NOTE: Coffee Break keeps its warm signature orange within the shared system.
    accent: { from: '#F97316', to: '#F59E0B', glow: 'rgba(249,115,22,0.35)' },
    ctas: [
      {
        label: 'Baixar na Play Store',
        href: 'https://play.google.com/store/apps/details?id=com.mano.coffeebreak',
        variant: 'primary',
        external: true,
      },
      { label: 'Saiba mais', href: '#coffee-break', variant: 'ghost' },
    ],
  },
  {
    id: 'fusion-ai',
    name: 'Fusion AI',
    category: 'Universo de IA · Em breve',
    tagline: 'Uma nova experiência de inteligência criativa.',
    status: 'soon',
    short:
      'Um projeto ambicioso que une inteligência artificial e experiência imersiva. Em construção — e vai valer a espera.',
    long:
      'O Fusion AI é o próximo grande passo do ecossistema ATS: uma experiência que combina inteligência artificial e interatividade imersiva. Estamos construindo algo diferente — entre na lista para ser um dos primeiros a experimentar.',
    highlights: [
      {
        title: 'IA no Centro',
        description:
          'Inteligência generativa aplicada a uma experiência criativa e interativa.',
      },
      {
        title: 'Experiência Imersiva',
        description:
          'Visual e interação de alto nível, pensados para encantar desde o primeiro contato.',
      },
      {
        title: 'Acesso Antecipado',
        description:
          'Quem entrar na lista de espera terá prioridade no lançamento.',
      },
    ],
    icon: Sparkles,
    accent: { from: '#00D4FF', to: '#A855F7', glow: 'rgba(0,212,255,0.35)' },
    ctas: [{ label: 'Quero ser avisado', waitlist: true, variant: 'primary' }],
  },
  {
    id: 'giro-ia',
    name: 'Giro IA',
    category: 'Automação Inteligente · Em breve',
    tagline: 'Inteligência que gira o seu negócio.',
    status: 'soon',
    short:
      'Automação inteligente para acelerar operações e decisões. Estamos afinando os detalhes — reserve seu lugar na lista de espera.',
    long:
      'O Giro IA é a solução de automação inteligente da ATS para dar ritmo às operações do seu negócio. Fluxos automatizados, inteligência aplicada e decisões mais rápidas. Em breve — entre na lista de espera e seja avisado no lançamento.',
    highlights: [
      {
        title: 'Operações no Ritmo Certo',
        description:
          'Automatize tarefas repetitivas e libere o time para o que importa.',
      },
      {
        title: 'Decisões com Inteligência',
        description:
          'Dados e IA trabalhando juntos para apoiar decisões mais rápidas.',
      },
      {
        title: 'Lista de Espera Aberta',
        description:
          'Cadastre-se e receba novidades e acesso prioritário no lançamento.',
      },
    ],
    icon: Boxes,
    accent: { from: '#10B981', to: '#29ABE2', glow: 'rgba(16,185,129,0.35)' },
    ctas: [{ label: 'Lista de espera', waitlist: true, variant: 'primary' }],
  },
];

export const availableProducts = products.filter((p) => p.status === 'available');
export const soonProducts = products.filter((p) => p.status === 'soon');

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
