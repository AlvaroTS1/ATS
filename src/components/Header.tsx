import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Matches the fade+10px-slide `framer-motion` previously drove for the
 * mobile dropdown (`initial={{opacity:0,y:-10}}`, `animate={{opacity:1,y:0}}`,
 * default tween timing). Replaced because `motion` + `motion-dom` alone
 * measured at 383KB rendered — ~45% of the whole critical-path bundle —
 * for exactly this one fade/slide and one other in `WaitlistProvider`.
 * Neither used any framer-motion feature (drag, layout animation, gesture
 * physics) that CSS transitions cannot reproduce.
 */
const MENU_TRANSITION_MS = 200;

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Kept mounted slightly past `isMenuOpen: false` so the closing transition
  // — the CSS replacement for `AnimatePresence`'s exit animation — has time
  // to play before the element leaves the DOM.
  const [isMenuRendered, setIsMenuRendered] = useState(false);
  const unmountTimer = useRef<number | null>(null);

  useEffect(() => {
    if (isMenuOpen) {
      if (unmountTimer.current !== null) window.clearTimeout(unmountTimer.current);
      setIsMenuRendered(true);
      return;
    }
    unmountTimer.current = window.setTimeout(() => setIsMenuRendered(false), MENU_TRANSITION_MS);
    return () => {
      if (unmountTimer.current !== null) window.clearTimeout(unmountTimer.current);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Início', href: '#home' },
    { name: 'Soluções', href: '#solutions' },
    { name: 'Roadmap', href: '#roadmap' },
    { name: 'Sobre', href: '#about' },
    { name: 'Contato', href: '#contact' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled 
          ? 'py-3' 
          : 'py-6'
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div 
          className={cn(
            'flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-500',
            isScrolled 
              ? 'bg-space-black/70 backdrop-blur-lg border border-white/10 shadow-[0_4px_30px_rgba(3,7,18,0.4)] md:max-w-6xl mx-auto neon-glow-cyan' 
              : 'bg-transparent border border-transparent'
          )}
        >
          <a href="#home" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 flex items-center justify-center bg-gradient-to-br from-neon-cyan/20 to-cyber-purple/20 rounded-xl border border-neon-cyan/30 group-hover:border-neon-cyan/80 transition-colors">
              <Cpu className="w-5 h-5 text-neon-cyan group-hover:text-glow-blue transition-colors group-hover:rotate-90 duration-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan to-cyber-purple opacity-0 group-hover:opacity-10 blur-md transition-opacity rounded-xl" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-neon-cyan transition-colors flex items-center gap-1">
                ATS <span className="w-1.5 h-1.5 rounded-full bg-cyber-purple animate-ping"></span>
              </span>
              <span className="text-[8px] tracking-[0.25em] text-gray-500 uppercase font-semibold group-hover:text-white transition-colors">
                Sistemas de Automações
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-neon-cyan transition-colors relative py-2 group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-neon-cyan to-cyber-purple group-hover:w-full transition-all duration-300" />
              </a>
            ))}
            <a
              href="#contact"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan/15 to-cyber-purple/15 border border-neon-cyan/45 text-neon-cyan hover:from-neon-cyan hover:to-cyber-purple hover:text-space-black font-semibold text-xs tracking-wider uppercase transition-all duration-500 shadow-[0_0_15px_rgba(41,171,226,0.1)] hover:shadow-[0_0_25px_rgba(41,171,226,0.4)]"
            >
              Fale Conosco
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-neon-cyan transition-colors rounded-xl bg-white/5 border border-white/10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuRendered && (
        <div
          className="md:hidden mx-4 mt-2 bg-space-black/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-[opacity,transform] ease-out"
          style={{
            transitionDuration: `${MENU_TRANSITION_MS}ms`,
            opacity: isMenuOpen ? 1 : 0,
            transform: isMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
          }}
        >
          <nav className="flex flex-col p-5 gap-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-400 hover:text-neon-cyan py-2.5 border-b border-white/5 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="#contact"
              className="mt-3 text-center py-3.5 rounded-xl bg-gradient-to-r from-neon-cyan to-cyber-purple text-space-black font-bold text-sm tracking-wide uppercase shadow-lg shadow-neon-cyan/20"
              onClick={() => setIsMenuOpen(false)}
            >
              Fale Conosco
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;