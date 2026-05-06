import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import BrandSection from "@/components/BrandSection";
import ProductCatalog from "@/components/ProductCatalog";
import WeeklySpecialsCatalog from "@/components/WeeklySpecialsCatalog";
import WhyChoose from "@/components/WhyChoose";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ScrollToTopFab from "@/components/ScrollToTopFab";
import { type QuoteListItem } from "@/components/QuoteListSection";
import type { Product } from "@/data/products";
import { getBrandThemeSuggestion } from "@/lib/brandThemeSuggestions";
import { applyThemeToDocument, useSiteSettings } from "@/hooks/useSiteSettings";
import { useDbBrands } from "@/hooks/useDbBrands";
import { usePackSizeRules } from "@/hooks/usePackSizeRules";
import { getUnitsPerPack } from "@/lib/packSizes";
import { Home, ShoppingBag, Sparkles, Phone, PackageCheck, ChevronDown, ChevronUp } from "lucide-react";

const QUOTE_LIST_STORAGE_KEY = "spare-lube-quote-list";
const ORDER_PENDING_KEY = "weekly-specials-order-pending";

const Index = () => {
  type ThemeToggleOrigin = { x: number; y: number };
  type AddToQuoteMeta = { sourceRect: DOMRect; imageSrc?: string };
  type FlyToQuoteAnimation = {
    id: number;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    imageSrc?: string;
  };
  type ViewTransitionCapableDocument = Document & {
    startViewTransition?: (updateCallback: () => void) => {
      ready: Promise<void>;
      finished: Promise<void>;
    };
  };

  const { settings } = useSiteSettings();
  const { brands } = useDbBrands();
  const { rules: packSizeRules } = usePackSizeRules();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [brandViewMode, setBrandViewMode] = useState<"grid" | "brandFocused">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quoteItems, setQuoteItems] = useState<QuoteListItem[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = window.localStorage.getItem(QUOTE_LIST_STORAGE_KEY);
    if (!stored) return [];

    try {
      const parsed = JSON.parse(stored) as QuoteListItem[];
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem("color-mode");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const catalogRef = useRef<HTMLDivElement>(null);
  const isThemeTransitioningRef = useRef(false);
  const quoteDesktopButtonRef = useRef<HTMLButtonElement | null>(null);
  const quoteMobileButtonRef = useRef<HTMLButtonElement | null>(null);
  const flyAnimationCounterRef = useRef(0);
  const [flyToQuoteAnimation, setFlyToQuoteAnimation] = useState<FlyToQuoteAnimation | null>(null);
  const [quoteCountPulseKey, setQuoteCountPulseKey] = useState(0);
  const [showOrderReadyConfirmation, setShowOrderReadyConfirmation] = useState(false);
  const [mobileNavMinimized, setMobileNavMinimized] = useState(false);

  const brandScopedTheme = useMemo(() => {
    if (!selectedBrand) return settings;
    const selectedBrandData = brands.find((brand) => brand.id === selectedBrand);
    const selectedBrandName = selectedBrandData?.name;
    const suggestion = getBrandThemeSuggestion(selectedBrand, selectedBrandName, {
      primary_color: selectedBrandData?.theme_primary_color ?? undefined,
      accent_color: selectedBrandData?.theme_accent_color ?? undefined,
      button_color: selectedBrandData?.theme_button_color ?? undefined,
      button_foreground_color: selectedBrandData?.theme_button_foreground_color ?? undefined,
    });
    return {
      ...settings,
      primary_color: suggestion.primary_color,
      accent_color: suggestion.accent_color,
      button_color: suggestion.button_color,
      button_foreground_color: suggestion.button_foreground_color,
    };
  }, [selectedBrand, settings, brands]);

  useEffect(() => {
    applyThemeToDocument(brandScopedTheme);
  }, [brandScopedTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("color-mode", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    window.localStorage.setItem(QUOTE_LIST_STORAGE_KEY, JSON.stringify(quoteItems));
  }, [quoteItems]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(ORDER_PENDING_KEY) === "1") {
      setShowOrderReadyConfirmation(true);
      window.sessionStorage.removeItem(ORDER_PENDING_KEY);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
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
  }, [isDarkMode, brandScopedTheme]);

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!searchQuery.trim()) return;

    const isMobileViewport = window.matchMedia("(max-width: 767px), (hover: none), (pointer: coarse)").matches;
    if (!isMobileViewport) return;

    const catalogNode = catalogRef.current;
    if (!catalogNode) return;

    const { top } = catalogNode.getBoundingClientRect();
    if (top > 96) {
      catalogNode.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchQuery]);

  const handleBrandSelect = (brandId: string | null) => {
    setSelectedBrand(brandId);
    if (brandId) {
      setBrandViewMode("brandFocused");
      return;
    }
    setBrandViewMode("grid");
  };

  const handleBackToBrandGrid = () => {
    setSelectedBrand(null);
    setBrandViewMode("grid");
  };

  const openOrderListFromMobileNav = () => {
    const mobileTrigger = document.getElementById("order-list-trigger-mobile");
    if (mobileTrigger) {
      (mobileTrigger as HTMLButtonElement).click();
      return;
    }
    const desktopTrigger = document.getElementById("order-list-trigger-desktop");
    if (desktopTrigger) (desktopTrigger as HTMLButtonElement).click();
  };

  const handleCatalogBrandChange = (brandId: string | null) => {
    setSelectedBrand(brandId);
    setBrandViewMode(brandId ? "brandFocused" : "grid");
  };

  const getQuoteTargetRect = () => {
    const isSmallViewport = window.matchMedia("(max-width: 639px)").matches;
    const targetElement = isSmallViewport ? quoteMobileButtonRef.current : quoteDesktopButtonRef.current;
    return targetElement?.getBoundingClientRect() ?? null;
  };

  const handleAddToQuote = (product: Product, selectedSize: string | null, meta?: AddToQuoteMeta) => {
    const brandName = brands.find((brand) => brand.id === product.brand)?.name ?? "Brand";
    const unitsPerPack = getUnitsPerPack(brandName, selectedSize, packSizeRules);

    setQuoteItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.size === selectedSize,
      );

      if (existingIndex === -1) {
        return [
          ...prev,
          {
            productId: product.id,
            productName: product.name,
            brandName,
            size: selectedSize,
            quantity: 1,
            unitsPerPack,
          },
        ];
      }

      return prev.map((item, index) =>
        index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item,
      );
    });

    if (!meta || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const targetRect = getQuoteTargetRect();
    if (!targetRect) {
      return;
    }

    flyAnimationCounterRef.current += 1;
    setFlyToQuoteAnimation({
      id: flyAnimationCounterRef.current,
      fromX: meta.sourceRect.left + meta.sourceRect.width / 2,
      fromY: meta.sourceRect.top + meta.sourceRect.height / 2,
      toX: targetRect.left + targetRect.width / 2,
      toY: targetRect.top + targetRect.height / 2,
      imageSrc: meta.imageSrc,
    });
  };

  const handleRemoveQuoteItem = (productId: string, size: string | null) => {
    setQuoteItems((prev) => prev.filter((item) => !(item.productId === productId && item.size === size)));
  };

  const handleUpdateQuoteItemQuantity = (
    productId: string,
    size: string | null,
    quantity: number,
  ) => {
    const nextQuantity = Math.max(1, Math.floor(quantity));
    setQuoteItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: nextQuantity }
          : item,
      ),
    );
  };

  const handleClearQuoteList = () => {
    setQuoteItems([]);
  };

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
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        quoteItems={quoteItems}
        onRemoveQuoteItem={handleRemoveQuoteItem}
        onUpdateQuoteItemQuantity={handleUpdateQuoteItemQuantity}
        onClearQuoteList={handleClearQuoteList}
        quoteCountPulseKey={quoteCountPulseKey}
        onQuoteTargetReady={(target, element) => {
          if (target === "desktop") {
            quoteDesktopButtonRef.current = element;
            return;
          }
          quoteMobileButtonRef.current = element;
        }}
      />
      <Hero onBrowseClick={scrollToCatalog} />
      <TrustBar />
      <div id="specials">
        <WeeklySpecialsCatalog
          onAddToOrderList={handleAddToQuote}
          showOrderReadyConfirmation={showOrderReadyConfirmation}
          onOrderReadyConfirmationDismiss={() => setShowOrderReadyConfirmation(false)}
        />
      </div>
      <BrandSection
        selectedBrand={selectedBrand}
        viewMode={brandViewMode}
        onBrandSelect={handleBrandSelect}
        onBackToGrid={handleBackToBrandGrid}
      />
      <div ref={catalogRef} id="shop">
        <ProductCatalog
          selectedBrand={selectedBrand}
          selectedCategory={selectedCategory}
          selectedSize={selectedSize}
          searchQuery={searchQuery}
          onBackToBrands={handleBackToBrandGrid}
          onBrandChange={handleCatalogBrandChange}
          onSearchChange={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          onSizeChange={setSelectedSize}
          onAddToQuote={handleAddToQuote}
          orderingEnabled={false}
          packSizeRules={packSizeRules}
        />
      </div>
      <WhyChoose />
      <div id="contact">
        <ContactSection />
      </div>
      <Footer />
      <ScrollToTopFab />
      {!mobileNavMinimized ? (
        <nav
          className="fixed inset-x-3 bottom-3 z-50 sm:hidden"
          aria-label="Mobile quick navigation"
        >
          <div className="relative mx-auto max-w-md rounded-2xl border border-primary/35 bg-background/72 p-1 shadow-[0_18px_36px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setMobileNavMinimized(true)}
              className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-md text-foreground/85 transition-colors hover:bg-primary/15 hover:text-primary"
              aria-label="Minimize quick navigation"
              aria-expanded
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            <div className="grid grid-cols-5 gap-1 pr-6">
              <a href="#home" className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-primary/16 hover:text-primary">
                <Home className="h-3.5 w-3.5" />
                Home
              </a>
              <a href="#shop" className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-primary/16 hover:text-primary">
                <ShoppingBag className="h-3.5 w-3.5" />
                Shop
              </a>
              <a href="#specials" className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-primary/16 hover:text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Specials
              </a>
              <a href="#contact" className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-primary/16 hover:text-primary">
                <Phone className="h-3.5 w-3.5" />
                Contact
              </a>
              <button
                type="button"
                onClick={openOrderListFromMobileNav}
                className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-primary/16 hover:text-primary"
              >
                <PackageCheck className="h-3.5 w-3.5" />
                Order
              </button>
            </div>
          </div>
        </nav>
      ) : (
        <button
          type="button"
          onClick={() => setMobileNavMinimized(false)}
          className="fixed bottom-3 right-3 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/40 bg-background/74 text-primary shadow-[0_14px_30px_-18px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:hidden"
          aria-label="Open quick navigation"
          aria-expanded={false}
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
      <AnimatePresence>
        {flyToQuoteAnimation && (
          <motion.div
            key={flyToQuoteAnimation.id}
            className="pointer-events-none fixed left-0 top-0 z-[70] h-10 w-10 overflow-hidden rounded-full border border-primary/40 bg-primary/20 shadow-lg backdrop-blur-sm"
            initial={{
              x: flyToQuoteAnimation.fromX - 20,
              y: flyToQuoteAnimation.fromY - 20,
              scale: 1,
              opacity: 0.95,
            }}
            animate={{
              x: flyToQuoteAnimation.toX - 20,
              y: flyToQuoteAnimation.toY - 20,
              scale: 0.3,
              opacity: 0.1,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => {
              setFlyToQuoteAnimation(null);
              setQuoteCountPulseKey((previous) => previous + 1);
            }}
          >
            {flyToQuoteAnimation.imageSrc ? (
              <img
                src={flyToQuoteAnimation.imageSrc}
                alt=""
                className="h-full w-full object-cover opacity-80"
                aria-hidden
              />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
