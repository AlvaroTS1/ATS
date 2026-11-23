// Canais de contato da ATS (públicos — nada de segredo aqui).

/** Número comercial da ATS no WhatsApp (atendido pela IA comercial + equipe). */
export const WHATSAPP_NUMERO = '555491462117';

/** Webhook do n8n que registra o lead no CRM e inicia a conversa no WhatsApp. */
export const LEAD_WEBHOOK_URL = 'https://pointyfinch-n8n.cloudfy.live/webhook/ats-sales-site';

/** Fallback por e-mail, usado só se o webhook falhar (para não perder o lead). */
export const EMAIL_FALLBACK_URL = 'https://formsubmit.co/ajax/contato@atssistemas.ia.br';

export const whatsappLink = (mensagem = 'Olá! Vim pelo site da ATS e quero saber mais.') =>
  `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
