import React, { useEffect, useRef, useState } from 'react';
import { Home, LayoutGrid, MessageCircle, Vote, Infinity as InfinityIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface DockItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
  /** Destaque central, elevado (lançamento). */
  featured?: boolean;
}

const ITEMS: DockItem[] = [
  { id: 'home', label: 'Início', href: '#home', icon: Home },
  { id: 'solutions', label: 'Soluções', href: '#solutions', icon: LayoutGrid },
  { id: 'ananke', label: 'ANANKE', href: '#ananke', icon: InfinityIcon, featured: true },
  { id: 'votrix', label: 'VOTRIX', href: 'https://votrix.atssistemas.ia.br', icon: Vote, external: true },
  { id: 'contact', label: 'Contato', href: '#contact', icon: MessageCircle },
];

/** Seções observadas para marcar onde a pessoa está. */
const TRACKED = ['home', 'solutions', 'ananke', 'contact'];

/**
 * Barra de navegação flutuante, só no celular — ao alcance do polegar, como
 * num app. Some enquanto a pessoa rola para baixo (a cena fica livre, sem
 * interface na frente) e volta ao rolar para cima ou ao parar. Durante a
 * jornada 3D do topo ela fica guardada.
 */
const MobileDock: React.FC = () => {
  const [hidden, setHidden] = useState(true);
  const [active, setActive] = useState('home');
  const lastY = useRef(0);
  const idleTimer = useRef<number | null>(null);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const goingDown = y > lastY.current + 4;
      const goingUp = y < lastY.current - 4;
      lastY.current = y;

      // Dentro da jornada 3D a cena tem a própria interface (painéis,
      // indicador de capítulo): a barra só aparece depois que ela termina.
      const journey = document.getElementById('home');
      const inJourney = journey ? journey.getBoundingClientRect().bottom > window.innerHeight + 4 : y < 80;

      if (inJourney) setHidden(true);
      else if (goingDown) setHidden(true);
      else if (goingUp) setHidden(false);

      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        const j = document.getElementById('home');
        const stillInJourney = j ? j.getBoundingClientRect().bottom > window.innerHeight + 4 : window.scrollY < 80;
        if (!stillInJourney) setHidden(false);
      }, 700);

      // Seção ativa: a última cujo topo já passou de 40% da tela.
      const line = window.innerHeight * 0.4;
      let current = 'home';
      for (const id of TRACKED) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current);
    };
  }, []);

  return (
    <nav
      aria-label="Navegação rápida"
      className={cn(
        'md:hidden fixed inset-x-0 bottom-0 z-50 px-3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        hidden ? 'translate-y-[130%]' : 'translate-y-0',
      )}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto max-w-md flex items-end justify-between rounded-2xl border border-white/10 bg-space-black/75 backdrop-blur-xl px-2 pt-1.5 pb-1.5 shadow-[0_-8px_40px_rgba(3,7,18,0.6)]">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          if (item.featured) {
            return (
              <a
                key={item.id}
                href={item.href}
                className="-mt-6 flex flex-col items-center gap-1 px-1 active:scale-95 transition-transform"
              >
                <span
                  className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-full text-space-black shadow-[0_6px_24px_rgba(242,200,103,0.45)] ring-4 ring-space-black',
                    isActive && 'ring-[#f2c867]/30',
                  )}
                  style={{ backgroundImage: 'linear-gradient(135deg, #fff1c4, #f2c867 45%, #c48c2c)' }}
                >
                  <Icon className="h-7 w-7" />
                </span>
                <span className="text-[10px] font-bold tracking-wider text-[#f2c867]">{item.label}</span>
              </a>
            );
          }
          return (
            <a
              key={item.id}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'flex min-w-[3.5rem] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-semibold transition-colors active:bg-white/5',
                isActive ? 'text-neon-cyan' : 'text-gray-400',
                item.external && 'text-cyan-300/90',
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
              <span
                className={cn(
                  'h-1 w-1 rounded-full bg-neon-cyan transition-opacity',
                  isActive ? 'opacity-100' : 'opacity-0',
                )}
              />
            </a>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileDock;
