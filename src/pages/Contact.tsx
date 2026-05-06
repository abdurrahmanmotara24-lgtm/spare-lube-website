import PublicLayout from "@/components/PublicLayout";
import { useContactTeam } from "@/hooks/useContactTeam";
import { usePageContent, type PageContent } from "@/hooks/usePageContent";

const DEFAULT_CONTACT_CONTENT: PageContent = {
  id: "contact",
  eyebrow: "Contact Us",
  heading: "Speak With Our Team",
  subheading: "Reach out directly to our sales team for product support, pricing, and order assistance.",
  body_paragraph_1: null,
  body_paragraph_2: null,
  body_paragraph_3: null,
};

const Contact = () => {
  const { contacts } = useContactTeam();
  const { content } = usePageContent("contact", DEFAULT_CONTACT_CONTENT);

  return (
    <PublicLayout>
      <section className="max-w-6xl mx-auto section-padding py-16 sm:py-20">
        <p className="text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-muted-foreground mb-3">
          {content.eyebrow}
        </p>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold text-foreground uppercase tracking-[0.02em] mb-5">
          {content.heading}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground/90 max-w-2xl leading-relaxed">
          {content.subheading}
        </p>
      </section>

      <section className="max-w-6xl mx-auto section-padding pb-20">
        <div className="mx-auto max-w-[560px]">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Sales Contacts
          </p>
          <div className="space-y-4 sm:space-y-5">
            {contacts.map((contact) => (
              <article
                key={contact.name}
                className="rounded-2xl border border-[rgba(255,59,48,0.15)] bg-[#F9FAFB] px-5 py-4 text-left shadow-[0_0_0_rgba(255,59,48,0)] transition-all duration-300 ease-in-out hover:-translate-y-[2px] hover:shadow-[0_0_20px_rgba(255,59,48,0.25)] dark:bg-[#141414]"
              >
                <p className="text-[17px] sm:text-[18px] font-semibold tracking-[0.01em] text-foreground">
                  {contact.name}
                </p>
                <p className="mt-1 text-sm font-normal text-muted-foreground/85">{contact.title}</p>
                <a
                  href={`tel:${contact.phone.replace(/\D/g, "")}`}
                  className="mt-2.5 inline-block text-base font-normal tracking-[0.01em] text-foreground/90 transition-colors duration-300 hover:text-[#FF3B30]"
                >
                  {contact.phone}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Contact;

