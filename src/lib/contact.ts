export const sanitizePhoneForHref = (value: string) => value.replace(/[^\d+]/g, "");

export const sanitizePhoneForWhatsapp = (value: string) => value.replace(/\D/g, "");

export const buildWhatsAppUrl = (phone: string, message: string) =>
  `https://wa.me/${sanitizePhoneForWhatsapp(phone)}?text=${encodeURIComponent(message)}`;

