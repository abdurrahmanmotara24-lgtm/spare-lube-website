import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import heroBgDefault from "@/assets/hero-bg.png";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface HeroProps {
  onBrowseClick: () => void;
}

const Hero = ({ onBrowseClick }: HeroProps) => {
  const { settings } = useSiteSettings();
  const bg = settings.hero_image_url || heroBgDefault;
  const overlay = settings.hero_overlay_opacity;

  return (
    <section className="relative overflow-hidden" id="home">
      <img
        src={bg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      {/* Dynamic dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right,
            hsl(var(--hero-overlay-base) / ${overlay}),
            hsl(var(--hero-overlay-base) / ${overlay * 0.94}),
            hsl(var(--hero-overlay-base) / ${overlay * 0.82}))`,
        }}
      />

      <div className="relative max-w-7xl mx-auto section-padding py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl px-5 py-7 text-center sm:px-8 sm:py-10">
        <p className="text-[10px] sm:text-sm font-semibold tracking-[0.14em] sm:tracking-[0.3em] uppercase text-primary mb-4">
          {settings.hero_eyebrow}
        </p>
        <h1 className="font-heading text-[2rem] sm:text-6xl lg:text-7xl font-bold tracking-[0.005em] sm:tracking-wide uppercase text-primary-foreground mb-5 leading-tight">
          Premium Lubricants & Automotive Products
        </h1>
        <p className="text-[0.9rem] sm:text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto tracking-[0.005em] sm:tracking-wide">
          Trusted major brands, dependable bulk supply, and fast delivery support for workshops, fleets, and commercial buyers.
        </p>
        <Button size="lg" onClick={onBrowseClick} className="text-base tracking-wider uppercase font-semibold">
          Browse Products
          <ChevronDown className="h-5 w-5 ml-1" />
        </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
