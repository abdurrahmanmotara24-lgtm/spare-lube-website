import { useState } from "react";
import { Search, MessageCircle, Menu, X } from "lucide-react";
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
import spareLubeLogo from "@/assets/spare-lube-logo.jpg";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuId = "mobile-header-menu";
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

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto section-padding">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <div
              className={`rounded-md px-1.5 py-1 transition-colors ${
                isDarkMode ? "bg-white/95 shadow-sm ring-1 ring-white/20" : "bg-transparent"
              }`}
            >
              <img
                src={spareLubeLogo}
                alt="Spare Lube - Auto Lubricant Distributors"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </div>
          </div>

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
          <div className="hidden sm:flex flex-1 max-w-xs lg:max-w-md mx-2 lg:mx-4">
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
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
            <Button
              asChild
              variant="whatsapp"
              size="icon"
              className="sm:hidden h-12 w-12 rounded-lg"
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
                    className="sm:hidden h-12 w-12 rounded-xl relative border border-primary/30 bg-background/80 text-foreground backdrop-blur-md shadow-[0_16px_32px_-20px_rgba(0,0,0,0.85)] hover:border-primary/55 hover:bg-background transition-all"
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
              className="sm:hidden min-h-12 min-w-12 p-3 rounded-lg text-foreground hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => {
                const next = !mobileMenuOpen;
                setMobileMenuOpen(next);
                trackEvent("header_mobile_menu_toggled", { open: next });
              }}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls={mobileMenuId}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div id={mobileMenuId} className="sm:hidden pb-5 pt-1 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <NavLink
                to="/"
                end
                className="rounded-md border border-border bg-card px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </NavLink>
              {settings.show_about ? (
                <NavLink
                  to="/about"
                  className="rounded-md border border-border bg-card px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </NavLink>
              ) : null}
              {settings.show_contact ? (
                <NavLink
                  to="/contact"
                  className="rounded-md border border-border bg-card px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </NavLink>
              ) : null}
              {settings.show_operating_hours ? (
                <NavLink
                  to="/operating-hours"
                  className="rounded-md border border-border bg-card px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hours
                </NavLink>
              ) : null}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(event) => onToggleDarkMode({ x: event.clientX, y: event.clientY })}
              className="w-full min-h-11"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={isDarkMode}
            >
              <motion.span
                className="relative h-4 w-4"
                whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
              >
                <ThemeToggleIcon
                  isDarkMode={isDarkMode}
                  reducedMotion={Boolean(prefersReducedMotion)}
                  className="absolute inset-0 text-foreground"
                />
              </motion.span>
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
