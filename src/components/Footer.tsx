import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Linkedin, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-space-black to-black pt-20 pb-10 overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="max-w-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 flex items-center justify-center bg-neon-cyan/5 rounded-xl border border-neon-cyan/20 shadow-[0_0_10px_rgba(41,171,226,0.1)]">
                <Cpu className="w-5 h-5 text-neon-cyan" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                ATS <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-cyber-purple font-mono text-sm font-semibold ml-1">SISTEMAS</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Um ecossistema de software inteligente que resolve problemas reais — de proteção familiar a assistentes de IA. Confiança, tecnologia e evolução constante.
            </p>
          </div>

          {/* Links Column */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full lg:w-auto">
            <div>
              <h4 className="text-white text-xs font-mono uppercase tracking-wider mb-4">// NAVEGAÇÃO</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/#home" className="hover:text-neon-cyan transition-colors">Início</Link></li>
                <li><Link to="/#solutions" className="hover:text-neon-cyan transition-colors">Soluções</Link></li>
                <li><Link to="/#roadmap" className="hover:text-neon-cyan transition-colors">Roadmap</Link></li>
                <li><Link to="/#about" className="hover:text-neon-cyan transition-colors">Sobre</Link></li>
                <li><Link to="/#faq" className="hover:text-neon-cyan transition-colors">FAQ</Link></li>
                <li><Link to="/#contact" className="hover:text-neon-cyan transition-colors">Contato</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-xs font-mono uppercase tracking-wider mb-4">// SOLUÇÕES</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="https://reencontra.atssistemas.ia.br" target="_blank" rel="noopener noreferrer" className="hover:text-neon-cyan transition-colors">Reencontra</a></li>
                <li><a href="https://fusionbuy.atssistemas.ia.br" target="_blank" rel="noopener noreferrer" className="hover:text-neon-cyan transition-colors">Fusion Buy AI</a></li>
                <li><a href="https://play.google.com/store/apps/details?id=com.mano.coffeebreak" target="_blank" rel="noopener noreferrer" className="hover:text-neon-cyan transition-colors">Coffee Break</a></li>
                <li><Link to="/#solutions" className="hover:text-neon-cyan transition-colors">Fusion AI · Em breve</Link></li>
                <li><Link to="/#solutions" className="hover:text-neon-cyan transition-colors">Giro IA · Em breve</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-xs font-mono uppercase tracking-wider mb-4">// CONTATO</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="mailto:contato@atssistemas.ia.br" className="hover:text-neon-cyan transition-colors break-all">contato@atssistemas.ia.br</a></li>
                <li>Espumoso, RS - Brasil</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-xs font-mono uppercase tracking-wider mb-4">// SOCIAL</h4>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/ats.sistemas" target="_blank" rel="noopener noreferrer" aria-label="Instagram da ATS Sistemas" className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-400 hover:bg-cyber-purple hover:text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300">
                  <Instagram size={16} />
                </a>
                <a href="https://www.linkedin.com/company/ats-sistemas" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn da ATS Sistemas" className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-400 hover:bg-neon-cyan hover:text-space-black hover:shadow-[0_0_15px_rgba(41,171,226,0.4)] transition-all duration-300">
                  <Linkedin size={16} />
                </a>
                <a href="mailto:contato@atssistemas.ia.br" aria-label="Enviar e-mail para a ATS Sistemas" className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-400 hover:bg-cyber-pink hover:text-white hover:shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all duration-300">
                  <Mail size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal area */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-gray-600">
          <div className="flex flex-col md:flex-row items-center gap-2 text-center md:text-left">
            <p>
              &copy; {new Date().getFullYear()} ATS Sistemas de Automações.
            </p>
            <span className="hidden md:block text-gray-800">|</span>
            <p>
              CNPJ: 65.402.484/0001-40
            </p>
          </div>
          <div className="flex gap-6">
            <Link to="/privacidade" className="hover:text-neon-cyan transition-colors">Política de Privacidade</Link>
            <Link to="/termos" className="hover:text-neon-cyan transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;