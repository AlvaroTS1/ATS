import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowLeft } from 'lucide-react';
import Footer from './Footer';

interface LegalLayoutProps {
  title: string;
  updatedAt: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}

/** Shared shell for legal pages: minimal header, readable prose, shared footer. */
const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  updatedAt,
  intro,
  children,
}) => {
  // SPA: keep the browser tab title in sync with the current legal page.
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} | ATS Sistemas de Automações`;
    return () => {
      document.title = previous;
    };
  }, [title]);

  return (
    <div className="min-h-screen bg-space-black text-white relative overflow-x-hidden">
      {/* Minimal header */}
      <header className="sticky top-0 z-50 bg-space-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 flex items-center justify-center bg-neon-cyan/5 rounded-xl border border-neon-cyan/20">
              <Cpu className="w-5 h-5 text-neon-cyan" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              ATS{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-cyber-purple text-sm font-semibold">
                SISTEMAS
              </span>
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-neon-cyan transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-neon-cyan/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-300 mb-5">
              Documento legal
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
              {title}
            </h1>
            <p className="text-sm text-gray-500 mt-4">
              Última atualização: {updatedAt}
            </p>
            {intro && (
              <div className="mt-6 text-gray-400 leading-relaxed">{intro}</div>
            )}

            <div className="legal-prose mt-10 space-y-8">{children}</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

/** A titled section within a legal document. */
export const LegalSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <section>
    <h2 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">
      {title}
    </h2>
    <div className="text-gray-400 leading-relaxed space-y-3">{children}</div>
  </section>
);

export default LegalLayout;
