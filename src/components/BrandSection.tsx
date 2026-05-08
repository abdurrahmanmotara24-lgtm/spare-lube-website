import { useEffect, useMemo, useRef, useState } from "react";
import { useDbBrands } from "@/hooks/useDbBrands";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { trackEvent } from "@/lib/analytics";

interface BrandSectionProps {
  selectedBrand: string | null;
  viewMode: "grid" | "brandFocused";
  onBrandSelect: (brandId: string | null) => void;
  onBackToGrid: () => void;
}

const FOCUS_CAMERA_START_DELAY_MS = 120;
const RETURN_CAMERA_START_DELAY_MS = 120;
const CAMERA_GLIDE_MS = 950;
const CAMERA_EASE = [0.22, 1, 0.36, 1] as const;
const CAMERA_ADAPTIVE_MAX_MS = 5200;
const CAMERA_ADAPTIVE_SETTLE_PX = 0.5;
const CAMERA_ADAPTIVE_SETTLE_FRAMES = 28;
const CAMERA_ADAPTIVE_STABILIZE_MS = 0;
const CAMERA_ADAPTIVE_MIN_STEP = 0.2;
const CAMERA_SMOOTH_TIME_S = 0.4;
const MOBILE_ANIMATION_SPEED_MULTIPLIER = 1.6;

const BrandSection = ({ selectedBrand, viewMode, onBrandSelect, onBackToGrid }: BrandSectionProps) => {
  const { brands, loading } = useDbBrands();
  const isMobileViewport =
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px), (hover: none), (pointer: coarse)").matches;
  const mobileDurationMultiplier = isMobileViewport ? MOBILE_ANIMATION_SPEED_MULTIPLIER : 1;
  const returnCameraStartDelayMs = RETURN_CAMERA_START_DELAY_MS;
  const returnCameraMode: "fixed" | "adaptive" = "adaptive";
  const tileMicroDuration = 0.32 * mobileDurationMultiplier;
  const tileMicroDelay = 0.22;
  const tileMove = {
    type: "tween" as const,
    duration: 0.95 * mobileDurationMultiplier,
    ease: CAMERA_EASE,
  };

  const focusedTileWrapperRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedBrandRef = useRef<string | null>(null);
  const [returningBrandId, setReturningBrandId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollGuideRafRef = useRef<number | null>(null);
  const scrollGuideStartRef = useRef<number>(0);
  const scrollGuideTimerRef = useRef<number | null>(null);
  const selectedBrandData = useMemo(
    () => brands.find((brand) => brand.id === selectedBrand) || null,
    [brands, selectedBrand],
  );
  const activeFocusedBrandId =
    viewMode === "brandFocused" ? selectedBrandData?.id ?? null : returningBrandId;
  const activeFocusedBrandData = useMemo(
    () => brands.find((brand) => brand.id === activeFocusedBrandId) || null,
    [brands, activeFocusedBrandId],
  );
  const shouldReduceMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const stopScrollGuide = () => {
    if (scrollGuideTimerRef.current) window.clearTimeout(scrollGuideTimerRef.current);
    scrollGuideTimerRef.current = null;
    if (scrollGuideRafRef.current) window.cancelAnimationFrame(scrollGuideRafRef.current);
    scrollGuideRafRef.current = null;
  };

  const startCameraFollow = (
    resolveTarget: () => HTMLElement | null,
    startDelayMs: number,
    mode: "fixed" | "adaptive" = "fixed",
    glideDurationMs: number = CAMERA_GLIDE_MS,
    cancelOnUserIntent: boolean = true,
  ) => {
    stopScrollGuide();
    let cancelledByUser = false;
    const stopOnUserIntent = () => {
      cancelledByUser = true;
      stopScrollGuide();
    };
    const interactionEvents: Array<keyof WindowEventMap> = [
      "wheel",
      "touchstart",
      "pointerdown",
      "keydown",
    ];
    const cleanupUserListeners = () => {
      interactionEvents.forEach((eventName) =>
        window.removeEventListener(eventName, stopOnUserIntent),
      );
    };
    if (cancelOnUserIntent) {
      interactionEvents.forEach((eventName) =>
        window.addEventListener(eventName, stopOnUserIntent, { passive: true }),
      );
    }

    scrollGuideTimerRef.current = window.setTimeout(() => {
      if (cancelledByUser) return;
      scrollGuideStartRef.current = performance.now();
      if (mode === "fixed") {
        const node = resolveTarget();
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const targetCenterY = rect.top + rect.height / 2;
        const viewportCenterY = window.innerHeight / 2;
        const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const to = Math.min(maxScrollY, Math.max(0, window.scrollY + (targetCenterY - viewportCenterY)));
        const from = window.scrollY;
        const delta = to - from;
        const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);

        const animateFixed = (ts: number) => {
          if (cancelledByUser) return;
          const p = Math.min(1, (ts - scrollGuideStartRef.current) / glideDurationMs);
          const eased = easeInOutCubic(p);
          window.scrollTo({ top: from + delta * eased, left: 0, behavior: "auto" });
          if (p < 1) {
            scrollGuideRafRef.current = window.requestAnimationFrame(animateFixed);
          } else {
            cleanupUserListeners();
          }
        };

        scrollGuideRafRef.current = window.requestAnimationFrame(animateFixed);
        return;
      }

      let stableFrames = 0;
      let velocity = 0;
      let stabilizedDesired: number | null = null;
      const adaptiveStartTs = performance.now();
      let lastTs = adaptiveStartTs;
      const animateAdaptive = (ts: number) => {
        if (cancelledByUser) return;
        const node = resolveTarget();
        if (!node) {
          if (ts - adaptiveStartTs <= CAMERA_ADAPTIVE_MAX_MS) {
            scrollGuideRafRef.current = window.requestAnimationFrame(animateAdaptive);
          }
          return;
        }
        const rect = node.getBoundingClientRect();
        const targetCenterY = rect.top + rect.height / 2;
        const viewportCenterY = window.innerHeight / 2;
        const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const desired = Math.min(maxScrollY, Math.max(0, window.scrollY + (targetCenterY - viewportCenterY)));
        stabilizedDesired = desired;

        if (stabilizedDesired === null) {
          if (ts - adaptiveStartTs <= CAMERA_ADAPTIVE_MAX_MS) {
            scrollGuideRafRef.current = window.requestAnimationFrame(animateAdaptive);
          }
          return;
        }
        if (ts - adaptiveStartTs < CAMERA_ADAPTIVE_STABILIZE_MS) {
          scrollGuideRafRef.current = window.requestAnimationFrame(animateAdaptive);
          return;
        }
        const effectiveDesired = stabilizedDesired;
        const current = window.scrollY;
        const dt = Math.max(0.001, Math.min(0.05, (ts - lastTs) / 1000));
        lastTs = ts;

        // SmoothDamp-style solver (prevents overshoot and kickoff jitter with moving targets).
        const omega = 2 / CAMERA_SMOOTH_TIME_S;
        const x = omega * dt;
        const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
        const change = current - effectiveDesired;
        const temp = (velocity + omega * change) * dt;
        velocity = (velocity - omega * temp) * exp;
        let next = effectiveDesired + (change + temp) * exp;

        // Clamp tiny oscillations.
        if (Math.abs(next - current) < CAMERA_ADAPTIVE_MIN_STEP) {
          next = current + Math.sign(effectiveDesired - current) * Math.min(CAMERA_ADAPTIVE_MIN_STEP, Math.abs(effectiveDesired - current));
        }

        const maxScrollY2 = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        next = Math.min(maxScrollY2, Math.max(0, next));
        window.scrollTo({ top: next, left: 0, behavior: "auto" });

        const error = effectiveDesired - next;
        if (Math.abs(error) <= CAMERA_ADAPTIVE_SETTLE_PX && Math.abs(velocity) < 0.28) {
          stableFrames += 1;
        } else {
          stableFrames = 0;
        }

        if (stableFrames >= CAMERA_ADAPTIVE_SETTLE_FRAMES) {
          cleanupUserListeners();
          return;
        }

        if (ts - adaptiveStartTs > CAMERA_ADAPTIVE_MAX_MS) {
          cleanupUserListeners();
          return;
        }
        scrollGuideRafRef.current = window.requestAnimationFrame(animateAdaptive);
      };

      scrollGuideRafRef.current = window.requestAnimationFrame(animateAdaptive);
    }, startDelayMs);

    return () => {
      cleanupUserListeners();
      stopScrollGuide();
    };
  };

  useEffect(() => {
    if (shouldReduceMotion) return;
    if (viewMode !== "grid") return;
    const returningBrandId = lastFocusedBrandRef.current;
    if (!returningBrandId) return;
    const stopFollow = startCameraFollow(
      () => sectionRef.current?.querySelector<HTMLElement>(`[data-brand-role="focus-tile"]`) || null,
      returnCameraStartDelayMs,
      returnCameraMode,
      CAMERA_GLIDE_MS,
      !isMobileViewport,
    );

    return () => {
      stopFollow?.();
    };
  }, [viewMode, shouldReduceMotion, returnCameraStartDelayMs, returnCameraMode]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    if (viewMode !== "brandFocused" || !selectedBrandData) return;
    if (lastFocusedBrandRef.current !== selectedBrandData.id) {
      lastFocusedBrandRef.current = selectedBrandData.id;
    }
    setReturningBrandId(selectedBrandData.id);

    return startCameraFollow(
      () => focusedTileWrapperRef.current,
      FOCUS_CAMERA_START_DELAY_MS,
      "fixed",
    );
  }, [viewMode, selectedBrandData, shouldReduceMotion]);

  useEffect(() => {
    if (viewMode !== "grid" || !returningBrandId) return;
    const returnHoldMs = Math.round(950 * mobileDurationMultiplier + 320);
    const timeout = window.setTimeout(() => setReturningBrandId(null), returnHoldMs);
    return () => window.clearTimeout(timeout);
  }, [viewMode, returningBrandId, mobileDurationMultiplier]);

  const handleBrandClick = (brandId: string) => {
    const next = selectedBrand === brandId ? null : brandId;
    if (next) {
      trackEvent("brand_selected", { brandId: next, source: "brand_grid" });
      onBrandSelect(next);
      return;
    }
    if (viewMode === "brandFocused") {
      trackEvent("brand_cleared", { brandId, source: "focused_brand" });
      onBackToGrid();
      return;
    }
    trackEvent("brand_cleared", { brandId, source: "brand_grid" });
    onBrandSelect(null);
  };

  return (
    <section ref={sectionRef} id="brands" className="max-w-7xl mx-auto section-padding py-16 sm:py-18">
      <h2 className="font-heading text-[1.5rem] sm:text-4xl font-bold text-foreground text-center uppercase tracking-[0.005em] sm:tracking-wide mb-12">
        Browse by Brand
      </h2>

      <LayoutGroup id="brand-tiles">
        <motion.div
          layout
          transition={tileMove}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))
            : brands.map((brand, idx) => {
                const isFocused = viewMode === "brandFocused";
                const isSelected = selectedBrand === brand.id;
                const showSelectedPlaceholder = isFocused && isSelected;
                if (showSelectedPlaceholder) {
                  return (
                    <motion.div
                      key={brand.id}
                      layout
                      className="p-6 rounded-xl border border-transparent opacity-0 pointer-events-none"
                      aria-hidden="true"
                    >
                      <div className="w-full h-14 sm:h-16 mb-3" />
                      <div className="h-4 w-20 mx-auto" />
                    </motion.div>
                  );
                }
                return (
                  <motion.button
                    key={brand.id}
                    layout
                    layoutId={`brand-tile-${brand.id}`}
                    data-brand-id={brand.id}
                    data-brand-role="grid-tile"
                    onClick={() => handleBrandClick(brand.id)}
                    aria-pressed={selectedBrand === brand.id}
                    aria-label={`${brand.name}${selectedBrand === brand.id ? " selected" : ""}`}
                    initial={false}
                    animate={{
                      opacity: isFocused ? 0.34 : 1,
                      y: isFocused ? 4 : 0,
                      scale: isFocused ? 0.985 : 1,
                    }}
                    transition={{
                      ...tileMove,
                      opacity: {
                        duration: tileMicroDuration,
                        ease: [0.22, 1, 0.36, 1],
                        delay: tileMicroDelay,
                      },
                      y: {
                        duration: tileMicroDuration,
                        ease: [0.22, 1, 0.36, 1],
                        delay: tileMicroDelay,
                      },
                      scale: {
                        duration: tileMicroDuration,
                        ease: [0.22, 1, 0.36, 1],
                        delay: tileMicroDelay,
                      },
                    }}
                    className={`group relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl cursor-pointer border
                      active:scale-[0.97]
                      ${
                        selectedBrand === brand.id
                          ? "bg-primary text-primary-foreground border-primary shadow-2xl ring-2 ring-primary/40 z-10"
                          : "bg-card border-border hover:shadow-lg hover:scale-[1.015] hover:border-primary/30"
                      }
                      ${isFocused ? "pointer-events-none" : ""}`}
                  >
                    <span
                      className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                        selectedBrand === brand.id ? "opacity-100" : "opacity-0"
                      } bg-[radial-gradient(circle_at_top,hsl(var(--primary-foreground)/0.25),transparent_60%)]`}
                    />
                    <div className="w-full h-12 sm:h-14 flex items-center justify-center mb-2.5">
                      {brand.image_url ? (
                        <img
                          src={brand.image_url}
                          alt={`${brand.name} logo`}
                          className={`max-h-full max-w-[82%] object-contain transition-all duration-500 ease-out ${
                            selectedBrand === brand.id ? "scale-110" : "scale-100"
                          }`}
                        />
                      ) : (
                        <span className="text-3xl">{brand.logo || "🛢️"}</span>
                      )}
                    </div>
                    <span
                      className={`font-semibold text-xs sm:text-sm tracking-wide text-center ${
                        selectedBrand === brand.id ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {brand.name}
                    </span>
                  </motion.button>
                );
              })}
        </motion.div>

        <AnimatePresence>
          {activeFocusedBrandData && (
            <motion.div
              ref={focusedTileWrapperRef}
              layout
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95 * mobileDurationMultiplier, ease: CAMERA_EASE }}
              className="mt-10 flex flex-col items-center gap-3"
            >
              <motion.button
                layoutId={`brand-tile-${activeFocusedBrandData.id}`}
                data-brand-role="focus-tile"
                onClick={() => handleBrandClick(activeFocusedBrandData.id)}
                aria-pressed
                aria-label={`${activeFocusedBrandData.name} selected`}
                transition={tileMove}
                className="group relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer border bg-primary text-primary-foreground border-primary shadow-2xl ring-2 ring-primary/40 z-20 w-full max-w-[260px]"
              >
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary-foreground)/0.25),transparent_60%)]" />
                <div className="w-full h-14 sm:h-16 flex items-center justify-center mb-3">
                  {activeFocusedBrandData.image_url ? (
                    <img
                      src={activeFocusedBrandData.image_url}
                      alt={`${activeFocusedBrandData.name} logo`}
                      className="max-h-full max-w-[80%] object-contain"
                    />
                  ) : (
                    <span className="text-3xl">{activeFocusedBrandData.logo || "🛢️"}</span>
                  )}
                </div>
                <span className="font-semibold text-xs sm:text-sm tracking-wide text-center text-primary-foreground">
                  {activeFocusedBrandData.name}
                </span>
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/90">
                  Selected
                </span>
              </motion.button>

              <button
                onClick={() => {
                  trackEvent("brand_show_all_clicked", { brandId: activeFocusedBrandData.id });
                  onBackToGrid();
                }}
                className="text-sm font-semibold text-primary hover:underline min-h-11 px-3"
              >
                Show all brands
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </section>
  );
};

export default BrandSection;
