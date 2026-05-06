import { MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useSiteContact } from "@/hooks/useSiteContact";
import { buildWhatsAppUrl } from "@/lib/contact";

const WhatsAppFab = () => {
  const { contact } = useSiteContact();
  const whatsappLink = buildWhatsAppUrl(
    contact.whatsapp_phone,
    "Hi, I would like to enquire about your products",
  );

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-[hsl(142,70%,40%)] text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      aria-label="Chat on WhatsApp"
      onClick={() => trackEvent("whatsapp_fab_clicked", { source: "fab" })}
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
};

export default WhatsAppFab;
