import { useMemo, useState } from "react";
import { Search, MessageCircle, Home, Info, Phone, Clock3 } from "lucide-react";
import { OilDrumIcon } from "@/components/icons/OilDrumIcon";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggleIcon } from "@/components/ui/theme-toggle-icon";
import { NavLink } from "@/components/NavLink";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import QuoteListSection, { type QuoteListItem } from "@/components/QuoteListSection";
import { trackEvent } from "@/lib/analytics";
import { useSiteContact } from "@/hooks/useSiteContact";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { buildWhatsAppUrl } from "@/lib/contact";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: (origin?: { x: number; y: number }) => void;
  quoteItems: QuoteListItem[];
  onRemoveQuoteItem: (productId: string, size: string | null) => void;
  onUpdateQuoteItemQuantity: (productId: string, size: string | null, quantity: number) => void;
  onClearQuoteList: () => void;
  onQuoteTargetReady?: (target: "desktop" | "mobile", element: HTMLButtonElement | null) => void;
  quoteCountPulseKey?: number;
  showQuoteList?: boolean;
}

const Header = ({
  searchQuery,
  onSearchChange,
  isDarkMode,
  onToggleDarkMode,
  quoteItems,
  onRemoveQuoteItem,
  onUpdateQuoteItemQuantity,
  onClearQuoteList,
  onQuoteTargetReady,
  quoteCountPulseKey = 0,
  showQuoteList = true,
}: HeaderProps) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const quoteCount = quoteItems.reduce((sum, item) => sum + item.quantity, 0);
  const { contact } = useSiteContact();
  const { settings } = useSiteSettings();
  const whatsappLink = buildWhatsAppUrl(
    contact.whatsapp_phone,
    "Hi, I would like to enquire about your products",
  );
  const navClassName =
    "text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground";
  const navActiveClassName = "text-foreground";
  const mobileNavItems = useMemo(
    () =>
      [
        { to: "/", enabled: true, icon: Home, label: "Home", end: true },
        { to: "/about", enabled: settings.show_about, icon: Info, label: "About" },
        { to: "/contact", enabled: settings.show_contact, icon: Phone, label: "Contact" },
        { to: "/operating-hours", enabled: settings.show_operating_hours, icon: Clock3, label: "Hours" },
      ].filter((item) => item.enabled),
    [settings.show_about, settings.show_contact, settings.show_operating_hours],
  );
  const mobileControlCount = mobileNavItems.length + 3 + (showQuoteList ? 1 : 0);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto section-padding">
        <div className="flex items-center justify-between h-16 gap-3">

          <nav className="hidden md:flex items-center gap-3 lg:gap-4">
            <NavLink to="/" className={navClassName} activeClassName={navActiveClassName} end>
              Home
            </NavLink>
            {settings.show_about ? (
              <NavLink to="/about" className={navClassName} activeClassName={navActiveClassName}>
                About
              </NavLink>
            ) : null}
            {settings.show_contact ? (
              <NavLink to="/contact" className={navClassName} activeClassName={navActiveClassName}>
                Contact
              </NavLink>
            ) : null}
            {settings.show_operating_hours ? (
              <NavLink to="/operating-hours" className={navClassName} activeClassName={navActiveClassName}>
                Hours
              </NavLink>
            ) : null}
          </nav>

          {/* Search - Desktop */}
          <div className="hidden sm:flex flex-1 max-w-xs lg:max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  trackEvent("header_search_changed", { hasQuery: Boolean(e.target.value.trim()) });
                }}
                className="w-full h-10 pl-10 pr-4 rounded-md bg-secondary text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={(event) => onToggleDarkMode({ x: event.clientX, y: event.clientY })}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={isDarkMode}
              title={isDarkMode ? "Light mode" : "Dark mode"}
              className="hidden sm:inline-flex"
            >
              <motion.span
                className="relative h-4 w-4"
                whileTap={prefersReducedMotion ? undefined : { scale: 0.88 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
              >
                <ThemeToggleIcon
                  isDarkMode={isDarkMode}
                  reducedMotion={Boolean(prefersReducedMotion)}
                  className="absolute inset-0 text-foreground"
                />
              </motion.span>
            </Button>
            <Button asChild variant="whatsapp" size="sm" className="hidden sm:inline-flex">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp"
                onClick={() => trackEvent("header_whatsapp_clicked", { source: "desktop_header" })}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </Button>
            {showQuoteList ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    id="order-list-trigger-desktop"
                    className="hidden sm:inline-flex relative border border-primary/30 bg-background/80 text-foreground backdrop-blur-md shadow-[0_16px_32px_-20px_rgba(0,0,0,0.85)] hover:border-primary/55 hover:bg-background transition-all"
                    ref={(element) => onQuoteTargetReady?.("desktop", element)}
                    onClick={() => trackEvent("header_quote_panel_opened", { source: "desktop_header" })}
                  >
                    <motion.span
                      key={`desktop-drum-${quoteCount}-${quoteCountPulseKey}`}
                      initial={prefersReducedMotion ? false : { scale: 1 }}
                      animate={
                        prefersReducedMotion
                          ? undefined
                          : quoteCount > 0
                            ? { scale: [1, 1.18, 0.96, 1] }
                            : { scale: 1 }
                      }
                      transition={{ duration: 0.45, ease: "easeOut" }}
                      whileHover={prefersReducedMotion ? undefined : { y: -1, scale: 1.03 }}
                      className="inline-flex h-8 w-8 items-center justify-center overflow-hidden [&_img]:!h-[46px] [&_img]:!w-[46px] [&_img]:object-contain"
                    >
                      <OilDrumIcon className="!h-[60px] !w-[60px] contrast-125 brightness-110 [image-rendering:-webkit-optimize-contrast] dark:invert dark:contrast-150 dark:brightness-125" />
                    </motion.span>
                    Order List
                    <AnimatePresence initial={false} mode="wait">
                      {quoteCount > 0 && (
                        <motion.span
                          key={`${quoteCount}-${quoteCountPulseKey}-desktop`}
                          initial={prefersReducedMotion ? { opacity: 1 } : { scale: 0.72, opacity: 0, y: -3 }}
                          animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
                          exit={prefersReducedMotion ? { opacity: 1 } : { scale: 0.72, opacity: 0, y: -3 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="ml-1 inline-flex min-w-5 h-5 px-1 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold ring-2 ring-background shadow-sm"
                        >
                          {quoteCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader className="mb-4">
                    <SheetTitle>Your Order List</SheetTitle>
                    <SheetDescription>
                      Review weekly specials and send your WhatsApp order.
                    </SheetDescription>
                  </SheetHeader>
                  <QuoteListSection
                    items={quoteItems}
                    onRemoveItem={onRemoveQuoteItem}
                    onUpdateQuantity={onUpdateQuoteItemQuantity}
                    onClearAll={onClearQuoteList}
                  />
                </SheetContent>
              </Sheet>
            ) : null}
          </div>
          <div
            className="sm:hidden grid w-full gap-1.5 py-2"
            style={{ gridTemplateColumns: `repeat(${mobileControlCount}, minmax(0, 1fr))` }}
          >
              {mobileNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border/70 bg-card/80 text-foreground transition-colors hover:bg-primary/10"
                  activeClassName="border-primary/45 text-primary"
                  aria-label={item.label}
                >
                  <item.icon className="h-4 w-4" />
                </NavLink>
              ))}
              <Button
                asChild
                variant="whatsapp"
                size="icon"
                className="h-11 w-full rounded-lg"
              >
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with us on WhatsApp"
                  onClick={() => trackEvent("header_whatsapp_clicked", { source: "mobile_header" })}
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </Button>
              {showQuoteList ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      id="order-list-trigger-mobile"
                      className="h-11 w-full rounded-lg relative border border-primary/30 bg-background/80 text-foreground backdrop-blur-md shadow-[0_16px_32px_-20px_rgba(0,0,0,0.85)] hover:border-primary/55 hover:bg-background transition-all"
                      aria-label="Open order list"
                      ref={(element) => onQuoteTargetReady?.("mobile", element)}
                      onClick={() => trackEvent("header_quote_panel_opened", { source: "mobile_header" })}
                    >
                      <motion.span
                        key={`mobile-drum-${quoteCount}-${quoteCountPulseKey}`}
                        initial={prefersReducedMotion ? false : { scale: 1 }}
                        animate={
                          prefersReducedMotion
                            ? undefined
                            : quoteCount > 0
                              ? { scale: [1, 1.2, 0.95, 1] }
                              : { scale: 1 }
                        }
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        whileHover={prefersReducedMotion ? undefined : { y: -1, scale: 1.03 }}
                        className="inline-flex h-[28.8px] w-[28.8px] items-center justify-center overflow-hidden [&_img]:!h-[36.8px] [&_img]:!w-[36.8px] [&_img]:object-contain"
                      >
                        <OilDrumIcon className="!h-[48px] !w-[48px] contrast-125 brightness-110 [image-rendering:-webkit-optimize-contrast] dark:invert dark:contrast-150 dark:brightness-125" />
                      </motion.span>
                      <AnimatePresence initial={false} mode="wait">
                        {quoteCount > 0 && (
                          <motion.span
                            key={`${quoteCount}-${quoteCountPulseKey}-mobile`}
                            initial={prefersReducedMotion ? { opacity: 1 } : { scale: 0.72, opacity: 0, y: -3 }}
                            animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
                            exit={prefersReducedMotion ? { opacity: 1 } : { scale: 0.72, opacity: 0, y: -3 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute -top-1 -right-1 inline-flex min-w-5 h-5 px-1 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold ring-2 ring-background shadow-sm"
                          >
                            {quoteCount}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader className="mb-4">
                      <SheetTitle>Your Order List</SheetTitle>
                      <SheetDescription>
                        Review weekly specials and send your WhatsApp order.
                      </SheetDescription>
                    </SheetHeader>
                    <QuoteListSection
                      items={quoteItems}
                      onRemoveItem={onRemoveQuoteItem}
                      onUpdateQuantity={onUpdateQuoteItemQuantity}
                      onClearAll={onClearQuoteList}
                    />
                  </SheetContent>
                </Sheet>
              ) : null}
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border/70 bg-card/80 text-foreground hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Toggle search"
                aria-pressed={mobileSearchOpen}
                onClick={() => {
                  const next = !mobileSearchOpen;
                  setMobileSearchOpen(next);
                  trackEvent("header_mobile_search_toggled", { open: next });
                }}
              >
                <Search className="h-4 w-4" />
              </button>
              <Button
                variant="outline"
                size="icon"
                onClick={(event) => onToggleDarkMode({ x: event.clientX, y: event.clientY })}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                aria-pressed={isDarkMode}
                className="h-11 w-full rounded-lg"
              >
                <ThemeToggleIcon
                  isDarkMode={isDarkMode}
                  reducedMotion={Boolean(prefersReducedMotion)}
                  className="h-4 w-4 text-foreground"
                />
              </Button>
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="sm:hidden pb-3 pt-1">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  trackEvent("header_search_changed", { hasQuery: Boolean(e.target.value.trim()) });
                }}
                className="w-full h-11 pl-10 pr-4 rounded-md bg-secondary text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
