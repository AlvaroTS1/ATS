import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { X, Send, Loader2, CheckCircle2, XCircle, BellRing } from 'lucide-react';

interface WaitlistContextValue {
  /** Open the waitlist modal for a given product name. */
  open: (productName: string) => void;
}

const WaitlistContext = createContext<WaitlistContextValue | null>(null);

/** Hook to trigger the waitlist modal from anywhere in the tree. */
export function useWaitlist(): WaitlistContextValue {
  const ctx = useContext(WaitlistContext);
  if (!ctx) throw new Error('useWaitlist must be used within WaitlistProvider');
  return ctx;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export const WaitlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [product, setProduct] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  const open = useCallback((productName: string) => {
    setProduct(productName);
    setStatus('idle');
  }, []);

  const close = useCallback(() => setProduct(null), []);

  // Lock body scroll + close on Escape while the modal is open.
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [product, close]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    const formData = new FormData(e.currentTarget);
    formData.append('_subject', `Lista de espera: ${product}`);
    formData.append('_captcha', 'false');
    formData.append('_template', 'table');
    formData.append('produto', product ?? '');

    try {
      const res = await fetch(
        'https://formsubmit.co/ajax/contato@atssistemas.ia.br',
        { method: 'POST', body: formData },
      );
      const data = await res.json();
      if (data.success === 'true' || res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <WaitlistContext.Provider value={{ open }}>
      {children}
      {product && (
          <div
            className="animate-waitlist-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Lista de espera do ${product}`}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-space-black/80 backdrop-blur-sm"
              onClick={close}
            />

            <div
              className="animate-waitlist-panel relative w-full max-w-md bg-space-dark/95 border border-white/10 rounded-2xl shadow-2xl p-7 md:p-8 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-cyan to-cyber-purple" />

              <button
                onClick={close}
                aria-label="Fechar"
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>

              {status === 'success' ? (
                <div className="text-center py-6">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-cyber-emerald/10 border border-cyber-emerald/25 flex items-center justify-center mb-5">
                    <CheckCircle2 className="w-7 h-7 text-cyber-emerald" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Você está na lista! 🎉
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Assim que o <strong className="text-white">{product}</strong>{' '}
                    for lançado, você será um dos primeiros a saber.
                  </p>
                  <button
                    onClick={close}
                    className="mt-6 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-cyber-purple/20 border border-white/10 flex items-center justify-center text-neon-cyan">
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-neon-cyan font-semibold">
                        Acesso antecipado
                      </p>
                      <h3 className="text-lg font-bold text-white leading-tight">
                        Lista de espera · {product}
                      </h3>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mt-3 mb-6">
                    Deixe seu contato e avisamos você em primeira mão no
                    lançamento. Sem spam — só a novidade que importa.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="wl-name"
                        className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 block mb-1.5"
                      >
                        Nome
                      </label>
                      <input
                        id="wl-name"
                        name="nome"
                        type="text"
                        required
                        placeholder="Como podemos te chamar?"
                        className="w-full bg-space-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="wl-email"
                        className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 block mb-1.5"
                      >
                        E-mail
                      </label>
                      <input
                        id="wl-email"
                        name="email"
                        type="email"
                        required
                        placeholder="seu@email.com"
                        className="w-full bg-space-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full bg-gradient-to-r from-neon-cyan to-cyber-purple text-space-black font-bold text-sm tracking-wide uppercase py-3.5 rounded-xl hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Entrar na lista
                        </>
                      )}
                    </button>

                    {status === 'error' && (
                      <div className="flex items-center gap-2 text-red-400 text-xs font-medium">
                        <XCircle className="w-4 h-4 flex-shrink-0" />
                        Não foi possível enviar. Tente novamente em instantes.
                      </div>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>
        )}
    </WaitlistContext.Provider>
  );
};

export default WaitlistProvider;
