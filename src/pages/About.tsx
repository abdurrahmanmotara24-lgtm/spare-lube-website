import PublicLayout from "@/components/PublicLayout";
import aboutBg from "@/assets/about-bg.png";
import { usePageContent, type PageContent } from "@/hooks/usePageContent";
import { ShieldCheck, Boxes, Truck, Wrench, Building2 } from "lucide-react";

const DEFAULT_ABOUT_CONTENT: PageContent = {
  id: "about",
  eyebrow: "ABOUT SPARELUBE",
  heading: "Reliable Lubricant Supply Since 2010",
  subheading: "",
  body_paragraph_1:
    "SpareLube Auto Lubricant Distributors has been operating since 2010, supplying high-quality automotive lubricants to registered dealers and distributors. With extensive experience in the retail automotive sector, we understand the demands of the industry and deliver solutions that meet them.",
  body_paragraph_2:
    "We are a service-oriented supplier committed to reliability, efficiency, and excellence. Our strong distribution network, broad product range, and focus on customer satisfaction position us as a preferred distributor for all automotive lubricant requirements.",
  body_paragraph_3:
    "At SpareLube, we take pride in our customer service. Every client's needs are carefully assessed to provide tailored solutions. From the moment an order is placed through to final delivery, we ensure a smooth, dependable experience that meets and exceeds expectations.",
};

const About = () => {
  const { content } = usePageContent("about", DEFAULT_ABOUT_CONTENT);
  const highlights = [
    { icon: ShieldCheck, title: "Trusted Distributor", text: "Reliable lubricant supply with consistent service standards." },
    { icon: Boxes, title: "Bulk Orders", text: "Workshop and commercial volume orders handled efficiently." },
    { icon: Truck, title: "Fast Delivery", text: "Quick fulfillment backed by responsive logistics support." },
    { icon: Wrench, title: "Major Brands", text: "Premium automotive product lines for everyday demand." },
    { icon: Building2, title: "Since 2010", text: "Established industry experience with long-term client trust." },
  ];

  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-background transition-colors duration-300">
        <img
          src={aboutBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover brightness-90 contrast-110"
          width={1920}
          height={1080}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.55) 35%, rgba(0, 0, 0, 0.25) 65%, rgba(0, 0, 0, 0) 100%)",
          }}
        />
        <div className="max-w-6xl mx-auto section-padding py-16 sm:py-20">
          <div className="relative max-w-[760px] pr-2 sm:pr-4 text-left">
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-3">{content.eyebrow}</p>
            <h1
              className="font-heading text-3xl sm:text-[40px] lg:text-[42px] font-bold uppercase tracking-[0.02em] text-white leading-[1.15] mb-4 sm:mb-5 max-w-[550px]"
              style={{ textShadow: "0 2px 6px rgba(0,0,0,0.4)" }}
            >
              {content.heading}
            </h1>
            <div className="max-w-[680px] mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {highlights.map((item) => (
                <article key={item.title} className="rounded-xl border border-white/15 bg-black/35 p-3.5 backdrop-blur-sm">
                  <item.icon className="h-4.5 w-4.5 text-primary mb-2" />
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-xs text-white/80 leading-relaxed">{item.text}</p>
                </article>
              ))}
            </div>
            <div className="max-w-[680px] mt-4 text-xs sm:text-sm text-white/85 leading-relaxed space-y-2">
              {content.body_paragraph_1 ? <p>{content.body_paragraph_1}</p> : null}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default About;

