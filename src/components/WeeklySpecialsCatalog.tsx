import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Expand, ShoppingCart, ZoomIn, ZoomOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useWeeklySpecials } from "@/hooks/useWeeklySpecials";
import { useDbProducts } from "@/hooks/useDbProducts";
import type { Product } from "@/data/products";

const formatMoney = (amount: number) => amount.toFixed(2);

// Compute end-of-week (Sunday 23:59:59 local) for the live countdown
const getWeekEnd = () => {
  const now = new Date();
  const end = new Date(now);
  const day = now.getDay(); // 0=Sun
  const daysUntilSunday = (7 - day) % 7;
  end.setDate(now.getDate() + daysUntilSunday);
  end.setHours(23, 59, 59, 999);
  if (end.getTime() <= now.getTime()) end.setDate(end.getDate() + 7);
  return end;
};

const useCountdown = (target: Date) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds };
};

interface WeeklySpecialsCatalogProps {
  onAddToOrderList: (
    product: Product,
    selectedSize: string | null,
    meta?: { sourceRect: DOMRect; imageSrc?: string },
  ) => void;
  onOrderReadyConfirmationDismiss: () => void;
  showOrderReadyConfirmation: boolean;
}

const WeeklySpecialsCatalog = ({
  onAddToOrderList,
  onOrderReadyConfirmationDismiss,
  showOrderReadyConfirmation,
}: WeeklySpecialsCatalogProps) => {
  const { weeklySpecials, loading } = useWeeklySpecials(true);
  const { dbProducts } = useDbProducts();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  const weekEnd = useMemo(() => getWeekEnd(), []);
  const { days, hours, minutes, seconds } = useCountdown(weekEnd);

  const specialCards = useMemo(() => {
    return weeklySpecials
      .map((special) => {
        const dbProduct = dbProducts.find((product) => product.id === special.productId);
        if (!dbProduct) return null;
        return { special, product: dbProduct as Product };
      })
      .filter(Boolean) as { special: (typeof weeklySpecials)[number]; product: Product }[];
  }, [weeklySpecials, dbProducts]);

  const getQty = (id: string) => quantities[id] ?? 1;
  const setQty = (id: string, next: number) =>
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, Math.min(99, next)) }));

  const addToOrder = (
    specialId: string,
    product: Product,
    meta?: { sourceRect: DOMRect; imageSrc?: string },
  ) => {
    const qty = getQty(specialId);
    for (let i = 0; i < qty; i += 1) {
      onAddToOrderList(product, null, i === 0 ? meta : undefined);
    }
    setQty(specialId, 1);
  };

  const quickView = quickViewId
    ? specialCards.find(({ special }) => special.id === quickViewId) ?? null
    : null;

  return (
    <section className="max-w-7xl mx-auto section-padding py-10 sm:py-14">
      {/* Header */}
      <div className="rounded-xl border border-border/60 bg-card p-5 sm:p-6">
        <div className="flex flex-col items-center text-center">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-wide text-foreground">
            Weekly Specials
          </h2>
          <span
            aria-hidden
            className="mt-2 block h-[3px] w-12 rounded-full bg-gradient-to-r from-primary/80 via-primary to-primary/40"
          />
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Premium weekly pricing across trusted lubricant lines.
          </p>

          <div className="relative mt-4 inline-flex items-center gap-2 sm:gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
            {/* Soft red glow behind countdown */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-3 -z-10 rounded-2xl bg-primary/15 blur-2xl"
            />
            {[
              { label: "Days", value: days },
              { label: "Hrs", value: hours },
              { label: "Min", value: minutes },
              { label: "Sec", value: seconds },
            ].map((unit, idx) => (
              <div key={unit.label} className="flex items-center gap-2 sm:gap-3">
                <div className="flex flex-col items-center min-w-[38px] sm:min-w-[48px]">
                  <span className="font-heading text-xl sm:text-3xl font-bold text-foreground tabular-nums leading-none">
                    {String(unit.value).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                    {unit.label}
                  </span>
                </div>
                {idx < 3 ? <span className="text-primary/60 font-bold">:</span> : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showOrderReadyConfirmation ? (
        <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="font-semibold text-foreground">✅ Order Ready</p>
          <p className="text-sm mt-1 text-muted-foreground">
            Your order has been prepared and sent via WhatsApp. If you haven't sent it yet, please tap send in WhatsApp to complete your order.
          </p>
          <Button type="button" className="w-full min-h-12 mt-3" onClick={onOrderReadyConfirmationDismiss}>
            Close
          </Button>
        </div>
      ) : null}

      {/* Cards */}
      {loading ? (
        <div className="mt-6 rounded-xl border border-border p-4 text-sm text-muted-foreground">Loading weekly specials...</div>
      ) : specialCards.length === 0 ? (
        <div className="mt-6 rounded-xl border border-border p-4 text-sm text-muted-foreground">No specials available yet.</div>
      ) : (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {specialCards.map(({ special, product }) => {
            const qty = getQty(special.id);
            return (
              <article
                key={special.id}
                className="group relative flex h-full flex-col rounded-xl border border-border/60 bg-card p-2.5 sm:p-3.5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/15 hover:border-primary/30 active:scale-[0.99] active:shadow-[0_0_14px_hsl(var(--primary)/0.18)]"
              >
                {/* Image - tap to quick view */}
                <button
                  type="button"
                  onClick={() => setQuickViewId(special.id)}
                  className="relative flex h-36 sm:h-44 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-transparent transition-colors duration-300 group-hover:border-primary/30"
                  aria-label={`Quick view ${product.name}`}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain p-2 transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-transparent">
                      <div className="text-xl font-semibold text-muted-foreground/80">
                        {product.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Image coming soon</div>
                    </div>
                  )}
                  {product.image ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setLightboxImage({ src: product.image, alt: product.name });
                      }}
                      className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-background/70 text-foreground/70 backdrop-blur-sm transition-all duration-300 hover:bg-background/90 hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Enlarge image"
                    >
                      <Expand className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </button>
                  ) : null}
                </button>

                {/* Product name */}
                <h3 className="mt-2 text-sm font-semibold text-foreground line-clamp-2 leading-snug min-h-[2.4rem]">
                  {product.name}
                </h3>

                {/* Price */}
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-foreground leading-none">
                    R{formatMoney(special.specialPrice)}
                  </span>
                  {special.originalPrice ? (
                    <span className="text-xs text-muted-foreground line-through">
                      R{formatMoney(special.originalPrice)}
                    </span>
                  ) : null}
                </div>

                {/* Spacer pushes controls to bottom for equal height */}
                <div className="flex-1" />

                {/* Quantity selector — ghost circular controls */}
                <div className="mt-2.5 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQty(special.id, qty - 1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground transition disabled:opacity-40"
                    aria-label="Decrease quantity"
                    disabled={qty <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-[1.5rem] text-center text-sm font-semibold tabular-nums">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(special.id, qty + 1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={(event) =>
                    addToOrder(special.id, product, {
                      sourceRect: event.currentTarget.getBoundingClientRect(),
                      imageSrc: special.productImage || undefined,
                    })
                  }
                  className="mt-2 inline-flex w-full min-h-10 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Order
                </button>

                {/* Custom description (only if admin-provided) */}
                {special.customDescription && special.customDescription.trim() ? (
                  <div className="mt-3 pt-2 border-t border-border/40">
                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                      {special.customDescription.trim()}
                    </p>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {/* Quick view modal */}
      <Dialog open={!!quickView} onOpenChange={(open) => !open && setQuickViewId(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogTitle className="sr-only">{quickView?.product.name ?? "Product"}</DialogTitle>
          {quickView ? (
            <div className="flex flex-col">
              <div className="relative flex h-72 items-center justify-center bg-muted">
                {quickView.product.image ? (
                  <img
                    src={quickView.product.image}
                    alt={quickView.product.name}
                    className="max-h-full max-w-full object-contain p-4"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">No image</span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-heading text-lg font-semibold text-foreground">{quickView.product.name}</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold text-foreground">
                    R{formatMoney(quickView.special.specialPrice)}
                  </span>
                  {quickView.special.originalPrice ? (
                    <span className="text-sm text-muted-foreground line-through">
                      R{formatMoney(quickView.special.originalPrice)}
                    </span>
                  ) : null}
                </div>
                {quickView.special.customDescription && quickView.special.customDescription.trim() ? (
                  <p className="mt-3 text-xs text-muted-foreground">{quickView.special.customDescription.trim()}</p>
                ) : null}
                <Button
                  type="button"
                  className="mt-4 w-full min-h-11"
                  onClick={(event) => {
                    addToOrder(quickView.special.id, quickView.product, {
                      sourceRect: event.currentTarget.getBoundingClientRect(),
                      imageSrc: quickView.special.productImage || undefined,
                    });
                    setQuickViewId(null);
                  }}
                >
                  Add to Order
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ZoomableLightbox
        open={!!lightboxImage}
        onOpenChange={(open) => {
          if (!open) setLightboxImage(null);
        }}
        src={lightboxImage?.src ?? ""}
        alt={lightboxImage?.alt ?? "Product image"}
      />
    </section>
  );
};

interface ZoomableLightboxProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  src: string;
  alt: string;
}

const ZoomableLightbox = ({ open, onOpenChange, src, alt }: ZoomableLightboxProps) => {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);

  const reset = () => {
    setScale(1);
    setTx(0);
    setTy(0);
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const clampScale = (s: number) => Math.min(5, Math.max(1, s));

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.002;
    setScale((s) => {
      const next = clampScale(s + delta);
      if (next === 1) {
        setTx(0);
        setTy(0);
      }
      return next;
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, tx, ty };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setTx(dragRef.current.tx + (e.clientX - dragRef.current.x));
    setTy(dragRef.current.ty + (e.clientY - dragRef.current.y));
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { dist: Math.hypot(dx, dy), scale };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const next = clampScale(pinchRef.current.scale * (dist / pinchRef.current.dist));
      setScale(next);
      if (next === 1) {
        setTx(0);
        setTy(0);
      }
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) pinchRef.current = null;
  };

  const onDoubleClick = () => {
    if (scale > 1) reset();
    else setScale(2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideCloseButtonOnMobile className="max-w-4xl bg-background/95 backdrop-blur-md border-border p-2 sm:p-4">
        <DialogTitle className="sr-only">{alt}</DialogTitle>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-20 sm:hidden inline-flex items-center gap-1 rounded-md border border-border bg-background/90 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted min-h-9"
          aria-label="Back to products"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <div className="absolute top-3 left-3 z-10 flex gap-1 bg-background/80 backdrop-blur-sm rounded-md border border-border p-1">
          <button
            onClick={() => setScale((s) => clampScale(s - 0.5))}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-foreground"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={reset}
            className="h-7 px-2 text-xs flex items-center justify-center rounded hover:bg-muted text-foreground tabular-nums"
            aria-label="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={() => setScale((s) => clampScale(s + 0.5))}
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-foreground"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        <div
          className="flex items-center justify-center min-h-[300px] sm:min-h-[500px] overflow-hidden select-none touch-none"
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onDoubleClick={onDoubleClick}
          style={{ cursor: scale > 1 ? "grab" : "zoom-in" }}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="max-h-[75vh] max-w-full object-contain rounded-lg transition-transform duration-100 ease-out"
            style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}
          />
        </div>
        <p className="text-center text-sm font-medium text-foreground mt-2">{alt}</p>
        <p className="text-center text-[11px] text-muted-foreground">
          Scroll, pinch, or double-click to zoom · drag to pan
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklySpecialsCatalog;
