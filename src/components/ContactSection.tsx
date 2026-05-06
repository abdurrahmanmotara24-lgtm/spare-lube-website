import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { useSiteContact } from "@/hooks/useSiteContact";
import { buildWhatsAppUrl, sanitizePhoneForHref } from "@/lib/contact";

const ContactSection = () => {
  const { contact } = useSiteContact();
  const whatsappLink = buildWhatsAppUrl(
    contact.whatsapp_phone,
    "Hi, I would like to enquire about your products",
  );
  const phoneLink = `tel:${sanitizePhoneForHref(contact.phone)}`;

  return (
    <section className="max-w-7xl mx-auto section-padding py-20 text-center">
      <p className="text-[10px] sm:text-xs font-semibold tracking-[0.14em] sm:tracking-[0.3em] uppercase text-primary mb-3">
        Reach Out
      </p>
      <h2 className="font-heading text-[1.5rem] sm:text-4xl font-bold text-foreground uppercase tracking-[0.005em] sm:tracking-wide mb-4">
        Get in Touch
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground mb-10 max-w-lg mx-auto">
        Ready to place an order or need more information? Reach out to us directly.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="whatsapp" size="lg" className="tracking-wider uppercase min-h-12">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("contact_whatsapp_clicked", { source: "contact_section" })}
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp Us
          </a>
        </Button>
        <Button asChild variant="outline" size="lg" className="tracking-wider uppercase min-h-12">
          <a href={phoneLink} onClick={() => trackEvent("contact_call_clicked", { source: "contact_section" })}>
            <Phone className="h-5 w-5" />
            Call Us
          </a>
        </Button>
      </div>
    </section>
  );
};

export default ContactSection;
