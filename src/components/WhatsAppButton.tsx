import { whatsappLink } from '../lib/contato';

export const WhatsAppIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.43-9.43 2.52 0 4.88.98 6.66 2.77a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.43 9.43m8.02-17.45A11.27 11.27 0 0 0 12.05.72C5.8.72.71 5.8.71 12.05c0 2 .52 3.95 1.52 5.67L.62 23.6l6.02-1.58a11.3 11.3 0 0 0 5.41 1.38h.01c6.25 0 11.34-5.08 11.34-11.33 0-3.03-1.18-5.88-3.33-8.02" />
  </svg>
);

/** Botão flutuante: abre conversa com a IA comercial da ATS no WhatsApp. */
const WhatsAppButton = () => (
  <a
    href={whatsappLink()}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Conversar com a ATS no WhatsApp"
    title="Fale com a ATS no WhatsApp"
    className="fixed bottom-24 right-4 md:bottom-5 md:right-5 z-[60] isolate group flex items-center gap-2 rounded-full bg-[#25D366] text-white shadow-[0_0_24px_rgba(37,211,102,0.45)] hover:shadow-[0_0_36px_rgba(37,211,102,0.7)] hover:brightness-110 active:scale-95 transition-all duration-300 p-3.5 md:pl-4 md:pr-5"
  >
    {/* pulso suave para chamar atenção enquanto acompanha a rolagem */}
    <span aria-hidden="true" className="absolute inset-0 -z-10 rounded-full bg-[#25D366] opacity-40 animate-ping motion-reduce:hidden" />
    <WhatsAppIcon className="w-6 h-6 md:w-5 md:h-5" />
    <span className="hidden md:inline text-sm font-bold tracking-wide">WhatsApp</span>
  </a>
);

export default WhatsAppButton;
