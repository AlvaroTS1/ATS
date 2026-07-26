import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, Loader2, CheckCircle, XCircle, Terminal, Cpu } from 'lucide-react';

const ContactSection = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Usando o FormSubmit.co para envio sem backend
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch("https://formsubmit.co/ajax/contato@atssistemas.ia.br", {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success === "true" || response.ok) {
        setStatus('success');
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-space-black/75 backdrop-blur-[2px]">
      {/* Background decoration */}
      <div className="absolute inset-0 cyber-grid-dense opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyber-purple/5 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-xs font-mono text-gray-400 mb-4 tracking-wider uppercase">
            <Terminal className="w-3.5 h-3.5 text-neon-cyan" /> Portal de Integração
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
            Inicie a <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-cyan to-cyber-purple font-mono">Conexão</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Tem um projeto ou fluxo para automatizar? Estabeleça contato com nossos engenheiros de sistemas.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/3 flex flex-col justify-start"
          >
            <div className="bg-space-dark/85 backdrop-blur-md p-8 rounded-2xl border border-white/5 shadow-2xl relative group overflow-hidden">
              {/* Decorative top line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-cyan to-cyber-purple" />
              
              <h3 className="text-xl font-bold text-white mb-8 tracking-tight flex items-center gap-2">
                <Cpu className="w-5 h-5 text-neon-cyan" /> Canais Operacionais
              </h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20 text-neon-cyan">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-mono">// EMAIL</p>
                    <a href="mailto:contato@atssistemas.ia.br" className="text-white text-sm font-semibold hover:text-neon-cyan transition-colors break-all">
                      contato@atssistemas.ia.br
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-cyber-purple/5 border border-cyber-purple/20 text-cyber-purple">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-mono">// SEDE</p>
                    <p className="text-white text-sm font-semibold">Espumoso, RS - Brasil</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-2/3"
          >
            <form onSubmit={handleSubmit} className="bg-space-dark/85 backdrop-blur-md p-8 rounded-2xl border border-white/5 shadow-2xl relative">
              {/* Decorative top line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyber-purple to-cyber-pink" />

              {/* Configurações ocultas do FormSubmit */}
              <input type="hidden" name="_subject" value="Novo contato pelo site ATS!" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-mono text-gray-500 uppercase tracking-wider">Nome Completo</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    required
                    className="w-full bg-space-black border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 focus:shadow-[0_0_15px_rgba(41,171,226,0.15)] transition-all duration-300"
                    placeholder="Identifique-se"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-mono text-gray-500 uppercase tracking-wider">Email Corporativo</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    required
                    className="w-full bg-space-black border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 focus:shadow-[0_0_15px_rgba(41,171,226,0.15)] transition-all duration-300"
                    placeholder="seu@dominio.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-xs font-mono text-gray-500 uppercase tracking-wider">Telefone / WhatsApp</label>
                  <input 
                    type="tel" 
                    id="phone"
                    name="phone"
                    className="w-full bg-space-black border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 focus:shadow-[0_0_15px_rgba(41,171,226,0.15)] transition-all duration-300"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="company" className="text-xs font-mono text-gray-500 uppercase tracking-wider">Empresa</label>
                  <input 
                    type="text" 
                    id="company"
                    name="company"
                    className="w-full bg-space-black border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 focus:shadow-[0_0_15px_rgba(41,171,226,0.15)] transition-all duration-300"
                    placeholder="Nome da corporação"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <label htmlFor="message" className="text-xs font-mono text-gray-500 uppercase tracking-wider">Protocolo de Mensagem</label>
                <textarea 
                  id="message"
                  name="message"
                  required
                  rows={4}
                  className="w-full bg-space-black border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/30 focus:shadow-[0_0_15px_rgba(41,171,226,0.15)] transition-all duration-300 resize-none"
                  placeholder="Descreva as especificações do seu projeto ou sistema..."
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-neon-cyan to-cyber-purple text-space-black font-extrabold text-sm tracking-widest uppercase py-4 rounded-xl hover:brightness-110 active:scale-[0.99] transition-all duration-300 shadow-[0_0_20px_rgba(41,171,226,0.2)] hover:shadow-[0_0_35px_rgba(41,171,226,0.5)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Transmitindo...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Transmitir Protocolo
                  </>
                )}
              </button>

              {status === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-cyber-emerald/10 border border-cyber-emerald/30 rounded-xl flex items-center gap-3 text-cyber-emerald text-sm font-mono"
                >
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <p>Protocolo transmitido com sucesso! Retornaremos o contato em breve.</p>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm font-mono"
                >
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <p>Falha na transmissão. Por favor, revise a conexão e tente novamente.</p>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;