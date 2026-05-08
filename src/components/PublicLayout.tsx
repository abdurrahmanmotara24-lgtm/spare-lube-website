import { ReactNode, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { MessageCircle } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { ThemeToggleIcon } from "@/components/ui/theme-toggle-icon";
import Footer from "@/components/Footer";
import ScrollToTopFab from "@/components/ScrollToTopFab";
import spareLubeLogo from "@/assets/spare-lube-logo.jpg";
import { useSiteContact } from "@/hooks/useSiteContact";
import { buildWhatsAppUrl } from "@/lib/contact";
import { applyThemeToDocument, useSiteSettings } from "@/hooks/useSiteSettings";

interface PublicLayoutProps {
  children: ReactNode;
}

const navLinkClass =
  "text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground";
const activeNavLinkClass = "text-foreground";

const PublicLayout = ({ children }: PublicLayoutProps) => {
  type ThemeToggleOrigin = { x: number; y: number };
  type ViewTransitionCapableDocument = Document & {
    startViewTransition?: (updateCallback: () => void) => {
      ready: Promise<void>;
      finished: Promise<void>;
    };
  };

  const { contact } = useSiteContact();
  const { settings } = useSiteSettings();
  const isThemeTransitioningRef = useRef(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem("color-mode");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const whatsappLink = buildWhatsAppUrl(
    contact.whatsapp_phone,
    "Hi, I would like to enquire about your products.",
  );

  useEffect(() => {
    const root = document.documentElement;
    applyThemeToDocument(settings);
    root.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("color-mode", isDarkMode ? "dark" : "light");
    if (!isDarkMode) {
      root.style.removeProperty("--background");
      root.style.removeProperty("--foreground");
      root.style.removeProperty("--card");
      root.style.removeProperty("--card-foreground");
      root.style.removeProperty("--popover");
      root.style.removeProperty("--popover-foreground");
      root.style.removeProperty("--secondary");
      root.style.removeProperty("--secondary-foreground");
      root.style.removeProperty("--muted");
      root.style.removeProperty("--muted-foreground");
      root.style.removeProperty("--accent-foreground");
      root.style.removeProperty("--border");
      root.style.removeProperty("--input");
      root.style.removeProperty("--hero-overlay-base");
      return;
    }

    root.style.setProperty("--background", "0 0% 5%");
    root.style.setProperty("--foreground", "0 0% 96%");
    root.style.setProperty("--card", "0 0% 8%");
    root.style.setProperty("--card-foreground", "0 0% 96%");
    root.style.setProperty("--popover", "0 0% 8%");
    root.style.setProperty("--popover-foreground", "0 0% 96%");
    root.style.setProperty("--secondary", "0 0% 12%");
    root.style.setProperty("--secondary-foreground", "0 0% 94%");
    root.style.setProperty("--muted", "0 0% 11%");
    root.style.setProperty("--muted-foreground", "0 0% 70%");
    root.style.setProperty("--accent-foreground", "0 0% 96%");
    root.style.setProperty("--border", "0 0% 18%");
    root.style.setProperty("--input", "0 0% 18%");
    root.style.setProperty("--hero-overlay-base", "0 0% 0%");
  }, [isDarkMode, settings]);

  const toggleDarkMode = async (origin?: ThemeToggleOrigin) => {
    if (isThemeTransitioningRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isLikelyMobile = window.matchMedia("(max-width: 767px), (hover: none), (pointer: coarse)").matches;
    const nextIsDarkMode = !isDarkMode;
    const root = document.documentElement;
    const viewDoc = document as ViewTransitionCapableDocument;

    if (!origin || prefersReducedMotion || !viewDoc.startViewTransition) {
      setIsDarkMode(nextIsDarkMode);
      return;
    }

    isThemeTransitioningRef.current = true;
    const toLight = !nextIsDarkMode;
    root.dataset.themeTransition = toLight ? "to-light" : "to-dark";

    try {
      const transition = viewDoc.startViewTransition(() => {
        flushSync(() => setIsDarkMode(nextIsDarkMode));
      });

      await transition.ready;

      const endRadius = Math.hypot(
        Math.max(origin.x, window.innerWidth - origin.x),
        Math.max(origin.y, window.innerHeight - origin.y),
      );

      const viewportCenterX = window.innerWidth / 2;
      const sunriseOriginY = window.innerHeight * 1.08;
      const nightfallOriginY = window.innerHeight * -0.08;
      const fullClip = `ellipse(${endRadius}px ${endRadius * 0.82}px at ${viewportCenterX}px ${window.innerHeight / 2}px)`;
      const sunriseClip = [
        `ellipse(0px 0px at ${viewportCenterX}px ${sunriseOriginY}px)`,
        `ellipse(${endRadius}px ${endRadius * 0.82}px at ${viewportCenterX}px ${sunriseOriginY}px)`,
      ];
      const nightfallClip = [
        `ellipse(0px 0px at ${viewportCenterX}px ${nightfallOriginY}px)`,
        `ellipse(${endRadius}px ${endRadius * 0.82}px at ${viewportCenterX}px ${nightfallOriginY}px)`,
      ];

      const transitionDuration = isLikelyMobile ? 900 : 1380;
      const animations: Animation[] = [];

      if (toLight) {
        animations.push(
          root.animate(
            { clipPath: sunriseClip },
            {
              duration: transitionDuration,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              fill: "both",
              pseudoElement: "::view-transition-new(root)",
            },
          ),
        );
        animations.push(
          root.animate(
            isLikelyMobile
              ? [
                  { clipPath: fullClip, opacity: 1, offset: 0 },
                  { clipPath: fullClip, opacity: 0, offset: 0.9 },
                  { clipPath: fullClip, opacity: 0, offset: 1 },
                ]
              : { clipPath: [fullClip, fullClip], opacity: [1, 0] },
            {
              duration: transitionDuration,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "both",
              pseudoElement: "::view-transition-old(root)",
            },
          ),
        );
      } else {
        animations.push(
          root.animate(
            { clipPath: nightfallClip },
            {
              duration: transitionDuration,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              fill: "both",
              pseudoElement: "::view-transition-new(root)",
            },
          ),
        );
        animations.push(
          root.animate(
            isLikelyMobile
              ? [
                  { clipPath: fullClip, opacity: 1, offset: 0 },
                  { clipPath: fullClip, opacity: 0, offset: 0.9 },
                  { clipPath: fullClip, opacity: 0, offset: 1 },
                ]
              : { clipPath: [fullClip, fullClip], opacity: [1, 0] },
            {
              duration: transitionDuration,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "both",
              pseudoElement: "::view-transition-old(root)",
            },
          ),
        );
      }

      await Promise.allSettled([transition.finished, ...animations.map((animation) => animation.finished)]);
      if (isLikelyMobile) {
        await new Promise((resolve) => window.setTimeout(resolve, 80));
      }
    } finally {
      delete root.dataset.themeTransition;
      isThemeTransitioningRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-10">
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto section-padding h-16 flex items-center justify-between gap-4">
          <NavLink to="/" className="shrink-0">
            <img
              src={spareLubeLogo}
              alt="Spare Lube - Auto Lubricant Distributors"
              className="h-11 sm:h-12 w-auto object-contain"
            />
          </NavLink>
          <nav className="hidden md:flex items-center gap-5">
            <NavLink to="/" end className={navLinkClass} activeClassName={activeNavLinkClass}>
              Home
            </NavLink>
            {settings.show_about ? (
              <NavLink to="/about" className={navLinkClass} activeClassName={activeNavLinkClass}>
                About
              </NavLink>
            ) : null}
            {settings.show_contact ? (
              <NavLink to="/contact" className={navLinkClass} activeClassName={activeNavLinkClass}>
                Contact
              </NavLink>
            ) : null}
            {settings.show_operating_hours ? (
              <NavLink to="/operating-hours" className={navLinkClass} activeClassName={activeNavLinkClass}>
                Operating Hours
              </NavLink>
            ) : null}
          </nav>
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={(event) => toggleDarkMode({ x: event.clientX, y: event.clientY })}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={isDarkMode}
              title={isDarkMode ? "Light mode" : "Dark mode"}
            >
              <ThemeToggleIcon
                isDarkMode={isDarkMode}
                reducedMotion={false}
                className="h-4 w-4 text-foreground"
              />
            </Button>
            <Button asChild variant="whatsapp" size="sm">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          </div>
          <Button asChild variant="whatsapp" size="sm" className="sm:hidden">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
              Chat
            </a>
          </Button>
        </div>
        <div className="md:hidden border-t border-border/70">
          <div className="max-w-7xl mx-auto section-padding py-2 flex items-center gap-4 overflow-x-auto">
            <NavLink to="/" end className={navLinkClass} activeClassName={activeNavLinkClass}>
              Home
            </NavLink>
            {settings.show_about ? (
              <NavLink to="/about" className={navLinkClass} activeClassName={activeNavLinkClass}>
                About
              </NavLink>
            ) : null}
            {settings.show_contact ? (
              <NavLink to="/contact" className={navLinkClass} activeClassName={activeNavLinkClass}>
                Contact
              </NavLink>
            ) : null}
            {settings.show_operating_hours ? (
              <NavLink to="/operating-hours" className={navLinkClass} activeClassName={activeNavLinkClass}>
                Hours
              </NavLink>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => toggleDarkMode({ x: event.clientX, y: event.clientY })}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={isDarkMode}
              className="ml-auto min-h-9"
            >
              <ThemeToggleIcon
                isDarkMode={isDarkMode}
                reducedMotion={false}
                className="h-4 w-4 text-foreground"
              />
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <Footer />
      <ScrollToTopFab />
    </div>
  );
};

export default PublicLayout;

