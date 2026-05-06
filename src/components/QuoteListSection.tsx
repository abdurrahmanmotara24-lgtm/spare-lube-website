import { useEffect, useRef, useState } from "react";
import { MessageCircle, Minus, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackEvent } from "@/lib/analytics";
import { useSiteContact } from "@/hooks/useSiteContact";
import { sanitizePhoneForWhatsapp } from "@/lib/contact";

export interface QuoteListItem {
  productId: string;
  productName: string;
  brandName: string;
  size: string | null;
  quantity: number;
  unitsPerPack?: number | null;
}

interface QuoteListSectionProps {
  items: QuoteListItem[];
  onRemoveItem: (productId: string, size: string | null) => void;
  onUpdateQuantity: (productId: string, size: string | null, quantity: number) => void;
  onClearAll: () => void;
}

const buildWhatsAppQuoteMessage = (
  items: QuoteListItem[],
  name: string,
  businessName: string,
  contact: string,
) => {
  const lines = items.map((item, index) => {
    const hasPack = !!item.unitsPerPack && !!item.size;
    const sizeText = item.size
      ? hasPack
        ? ` ${item.unitsPerPack} × ${item.size}`
        : ` ${item.size}`
      : "";
    if (hasPack) {
      const totalUnits = item.quantity * (item.unitsPerPack as number);
      const boxLabel = item.quantity === 1 ? "box" : "boxes";
      const unitLabel = totalUnits === 1 ? "unit" : "units";
      return `${index + 1}. ${item.brandName} ${item.productName}${sizeText} - ${item.quantity} ${boxLabel} (${totalUnits} ${unitLabel})`;
    }
    return `${index + 1}. ${item.brandName} ${item.productName}${sizeText} - Qty ${item.quantity}`;
  });

  const totalQuantity = items.reduce((sum, item) => {
    const multiplier = item.unitsPerPack && item.size ? item.unitsPerPack : 1;
    return sum + item.quantity * multiplier;
  }, 0);

  const message = [
    `Hi, my name is ${name} from ${businessName}.`,
    "",
    "I'd like to place an order for the following items:",
    "",
    lines.join("\n"),
    "",
    `Total Items: ${totalQuantity}`,
    "",
    `Contact Number: ${contact}`,
    "",
    "Thank you.",
  ].join("\n");

  return encodeURIComponent(message);
};

const QuoteListSection = ({ items, onRemoveItem, onUpdateQuantity, onClearAll }: QuoteListSectionProps) => {
  const { contact: siteContact } = useSiteContact();
  const [isClearing, setIsClearing] = useState(false);
  const clearTimeoutRef = useRef<number | null>(null);
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<{ name?: string; businessName?: string; contact?: string }>({});
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasItems = items.length > 0;

  const validate = () => {
    const next: { name?: string; businessName?: string; contact?: string } = {};
    if (!name.trim()) next.name = "Name is required";
    if (!businessName.trim()) next.businessName = "Business name is required";
    if (!contact.trim()) next.contact = "Contact number is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSendOrder = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!validate()) {
      event.preventDefault();
      return;
    }
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("weekly-specials-order-pending", "1");
    }
    trackEvent("quote_list_submitted_whatsapp", {
      uniqueItems: items.length,
      totalItems,
    });
  };

  const whatsappUrl = `https://wa.me/${sanitizePhoneForWhatsapp(siteContact.whatsapp_phone)}?text=${buildWhatsAppQuoteMessage(items, name.trim(), businessName.trim(), contact.trim())}`;

  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current !== null) {
        window.clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section>
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-heading text-xl font-semibold text-foreground uppercase tracking-wide">
              Order List
            </h3>
            <p className="text-sm text-muted-foreground">
              {totalItems} item{totalItems !== 1 ? "s" : ""} selected
            </p>
          </div>
          {hasItems && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-10"
              disabled={isClearing}
              onClick={() => {
                if (isClearing) return;
                setIsClearing(true);
                clearTimeoutRef.current = window.setTimeout(() => {
                  onClearAll();
                  trackEvent("quote_list_cleared");
                  setIsClearing(false);
                }, 620);
              }}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center overflow-visible">
                <svg viewBox="0 0 24 24" className="h-5 w-5 scale-[1.98]" aria-hidden>
                  <motion.g
                    animate={isClearing ? { rotate: [0, -42, 0] } : { rotate: 0 }}
                    transition={{ duration: 0.56, ease: "easeInOut", times: [0, 0.5, 1] }}
                    style={{ transformOrigin: "12px 7px" }}
                  >
                    <path
                      d="M9.35 5.35h5.3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M7.35 7.35h9.3"
                      stroke="currentColor"
                      strokeWidth="1.85"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </motion.g>
                  <path
                    d="M8.55 8.55h6.9l-.55 9.05a1.68 1.68 0 0 1-1.68 1.52h-2.44A1.68 1.68 0 0 1 9.1 17.6l-.55-9.05Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <path
                    d="M10.8 11.05v5.05M13.2 11.05v5.05"
                    stroke="currentColor"
                    strokeWidth="1.45"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
              Clear List
            </Button>
          )}
        </div>

        {!hasItems ? (
          <p className="text-sm text-muted-foreground">
            Add weekly specials to build your order list.
          </p>
        ) : (
          <>
            <div className="space-y-2 mb-5">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size ?? "no-size"}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.brandName} {item.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.size
                        ? item.unitsPerPack
                          ? `${item.unitsPerPack} × ${item.size}`
                          : item.size
                        : "No size selected"}
                      {" - "}
                      {item.unitsPerPack && item.size
                        ? `${item.quantity} ${item.quantity === 1 ? "box" : "boxes"} (${item.quantity * item.unitsPerPack} units)`
                        : `Qty: ${item.quantity}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center rounded-md border border-border/80 bg-background">
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-l-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label={`Decrease quantity for ${item.productName}`}
                        disabled={item.quantity <= 1}
                        onClick={() => {
                          const nextQuantity = Math.max(1, item.quantity - 1);
                          onUpdateQuantity(item.productId, item.size, nextQuantity);
                          trackEvent("quote_list_item_quantity_changed", {
                            productId: item.productId,
                            size: item.size ?? "none",
                            quantity: nextQuantity,
                          });
                        }}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="inline-flex min-w-8 justify-center px-1 text-xs font-semibold text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label={`Increase quantity for ${item.productName}`}
                        onClick={() => {
                          const nextQuantity = item.quantity + 1;
                          onUpdateQuantity(item.productId, item.size, nextQuantity);
                          trackEvent("quote_list_item_quantity_changed", {
                            productId: item.productId,
                            size: item.size ?? "none",
                            quantity: nextQuantity,
                          });
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label={`Remove ${item.productName}`}
                      onClick={() => {
                        onRemoveItem(item.productId, item.size);
                        trackEvent("quote_list_item_removed", {
                          productId: item.productId,
                          size: item.size ?? "none",
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-4">
              <div className="space-y-1.5">
                <Label htmlFor="order-name" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Name
                </Label>
                <Input
                  id="order-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  placeholder="Your full name"
                  maxLength={100}
                  aria-invalid={!!errors.name}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name ? (
                  <p className="text-xs text-destructive">{errors.name}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="order-business" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Business Name
                </Label>
                <Input
                  id="order-business"
                  type="text"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    if (errors.businessName) setErrors((p) => ({ ...p, businessName: undefined }));
                  }}
                  placeholder="Your business name"
                  maxLength={100}
                  aria-invalid={!!errors.businessName}
                  className={errors.businessName ? "border-destructive" : ""}
                />
                {errors.businessName ? (
                  <p className="text-xs text-destructive">{errors.businessName}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="order-contact" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Contact Number
                </Label>
                <Input
                  id="order-contact"
                  type="tel"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    if (errors.contact) setErrors((p) => ({ ...p, contact: undefined }));
                  }}
                  placeholder="e.g. 082 123 4567"
                  maxLength={20}
                  aria-invalid={!!errors.contact}
                  className={errors.contact ? "border-destructive" : ""}
                />
                {errors.contact ? (
                  <p className="text-xs text-destructive">{errors.contact}</p>
                ) : null}
              </div>
            </div>

            <Button asChild variant="quote" size="lg" className="w-full sm:w-auto min-h-11">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSendOrder}
              >
                <MessageCircle className="h-4 w-4" />
                Send Order via WhatsApp
              </a>
            </Button>
          </>
        )}
      </div>
    </section>
  );
};

export default QuoteListSection;
