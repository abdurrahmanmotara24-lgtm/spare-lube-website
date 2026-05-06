import { useMemo, useState, useEffect, useCallback } from "react";
import ProductCard from "@/components/ProductCard";
import { useDbProducts } from "@/hooks/useDbProducts";
import { useDbBrands } from "@/hooks/useDbBrands";
import { useDbCategories } from "@/hooks/useDbCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import type { Product } from "@/data/products";
import type { PackSizeRules } from "@/lib/packSizes";

interface ProductCatalogProps {
  selectedBrand: string | null;
  selectedCategory: string | null;
  selectedSize: string | null;
  searchQuery: string;
  onBackToBrands: () => void;
  onBrandChange: (brandId: string | null) => void;
  onSearchChange: (query: string) => void;
  onCategoryChange: (cat: string | null) => void;
  onSizeChange: (size: string | null) => void;
  onAddToQuote: (
    product: Product,
    selectedSize: string | null,
    meta?: { sourceRect: DOMRect; imageSrc?: string },
  ) => void;
  orderingEnabled?: boolean;
  packSizeRules?: PackSizeRules;
}

const allSizes = ["250ml", "500ml", "750ml", "1L", "5L", "20L"];

const ProductCatalog = ({
  selectedBrand,
  selectedCategory,
  selectedSize,
  searchQuery,
  onBackToBrands,
  onBrandChange,
  onSearchChange,
  onCategoryChange,
  onSizeChange,
  onAddToQuote,
  orderingEnabled = true,
  packSizeRules,
}: ProductCatalogProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mobilePreviewId, setMobilePreviewId] = useState<string | null>(null);
  const { dbProducts, loading } = useDbProducts();
  const { brands } = useDbBrands();
  const { categories } = useDbCategories();

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleMobilePreviewToggle = useCallback((id: string) => {
    setMobilePreviewId((prev) => (prev === id ? null : id));
  }, []);

  const allProducts = useMemo(() => dbProducts, [dbProducts]);

  const combinedSearch = searchQuery.trim();

  const brandScopedProducts = useMemo(() => {
    if (!selectedBrand) return allProducts;
    return allProducts.filter((p) => p.brand === selectedBrand);
  }, [allProducts, selectedBrand]);

  const availableCategories = useMemo(() => {
    return Array.from(new Set(brandScopedProducts.map((p) => p.category))).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [brandScopedProducts]);

  const availableSizes = useMemo(() => {
    return Array.from(new Set(brandScopedProducts.flatMap((p) => p.sizes))).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [brandScopedProducts]);

  useEffect(() => {
    if (selectedCategory && !availableCategories.includes(selectedCategory)) {
      onCategoryChange(null);
    }
    if (selectedSize && !availableSizes.includes(selectedSize)) {
      onSizeChange(null);
    }
  }, [
    selectedBrand,
    selectedCategory,
    selectedSize,
    availableCategories,
    availableSizes,
    onCategoryChange,
    onSizeChange,
  ]);

  const filtered = useMemo(() => {
    const base = allProducts.filter((p) => {
      if (selectedBrand && p.brand !== selectedBrand) return false;
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedSize && !p.sizes.includes(selectedSize)) return false;
      if (combinedSearch) {
        const q = combinedSearch.toLowerCase();
        const brandName = brands.find((b) => b.id === p.brand)?.name || "";
        return (
          p.name.toLowerCase().includes(q) ||
          brandName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    });

    return base.sort((a, b) => {
      if (a.brand === b.brand) return 0;
      return a.name.localeCompare(b.name);
    });
  }, [selectedBrand, selectedCategory, selectedSize, combinedSearch, allProducts, brands]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    filtered.forEach((p) => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    });
    return map;
  }, [filtered]);

  const brandName = selectedBrand
    ? brands.find((b) => b.id === selectedBrand)?.name
    : null;

  const hasAnyFilter = Boolean(selectedBrand || selectedCategory || selectedSize || combinedSearch);
  const emptyContext = [
    brandName || null,
    selectedCategory || null,
    selectedSize || null,
    combinedSearch ? `search "${combinedSearch}"` : null,
  ]
    .filter(Boolean)
    .join(" + ");

  const clearAllFilters = () => {
    trackEvent("catalog_filters_cleared");
    onBrandChange(null);
    onCategoryChange(null);
    onSizeChange(null);
    onSearchChange("");
  };

  return (
    <section className="max-w-7xl mx-auto section-padding py-16">
      {brandName && (
        <div className="mb-5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
          <button
            onClick={() => {
              onBackToBrands();
              trackEvent("catalog_back_to_brands_clicked");
            }}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors mr-1 min-h-10"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <p className="text-sm font-medium text-foreground">
            Active brand: <span className="text-primary">{brandName}</span>
          </p>
          <button
            onClick={() => {
              onBrandChange(null);
              trackEvent("catalog_brand_filter_cleared");
            }}
            className="text-xs font-semibold text-primary hover:underline min-h-10 px-1"
          >
            Clear brand
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="static sm:sticky sm:top-16 z-20 bg-background/95 sm:backdrop-blur-sm -mx-2 px-2 py-2 rounded-lg border border-border/60 mb-8">
        <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.06em] sm:tracking-wider font-semibold text-muted-foreground mb-2">
          Find products
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              trackEvent("catalog_search_changed", { hasQuery: Boolean(e.target.value.trim()) });
            }}
            className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={selectedCategory || ""}
          onChange={(e) => {
            const next = e.target.value || null;
            onCategoryChange(next);
            trackEvent("catalog_category_changed", { category: next || "all" });
          }}
          className="h-11 px-4 rounded-lg bg-muted text-foreground text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Categories</option>
          {categories
            .filter((cat) => !selectedBrand || availableCategories.includes(cat.name))
            .map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
        </select>

        <select
          value={selectedSize || ""}
          onChange={(e) => {
            const next = e.target.value || null;
            onSizeChange(next);
            trackEvent("catalog_size_changed", { size: next || "all" });
          }}
          className="h-11 px-4 rounded-lg bg-muted text-foreground text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Sizes</option>
          {(selectedBrand ? availableSizes : allSizes).map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>

        {hasAnyFilter && (
          <button
            onClick={clearAllFilters}
            className="text-xs sm:text-sm text-primary font-semibold hover:underline self-center min-h-11 px-2"
          >
            Clear all filters
          </button>
        )}
      </div>
      </div>

      {hasAnyFilter && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Active filters
          </span>
          {brandName && (
            <button
              onClick={() => {
                onBrandChange(null);
                trackEvent("catalog_brand_filter_chip_cleared");
              }}
              className="text-xs px-2.5 py-1 rounded-full border border-border bg-card hover:border-primary/40 max-w-[180px] truncate"
            >
              Brand: {brandName} ×
            </button>
          )}
          {selectedCategory && (
            <button
              onClick={() => {
                onCategoryChange(null);
                trackEvent("catalog_category_filter_chip_cleared");
              }}
              className="text-xs px-2.5 py-1 rounded-full border border-border bg-card hover:border-primary/40 max-w-[180px] truncate"
            >
              Category: {selectedCategory} ×
            </button>
          )}
          {selectedSize && (
            <button
              onClick={() => {
                onSizeChange(null);
                trackEvent("catalog_size_filter_chip_cleared");
              }}
              className="text-xs px-2.5 py-1 rounded-full border border-border bg-card hover:border-primary/40 max-w-[180px] truncate"
            >
              Size: {selectedSize} ×
            </button>
          )}
          {combinedSearch && (
            <button
              onClick={() => {
                onSearchChange("");
                trackEvent("catalog_search_chip_cleared");
              }}
              className="text-xs px-2.5 py-1 rounded-full border border-border bg-card hover:border-primary/40 max-w-[220px] truncate"
            >
              Search: {combinedSearch} ×
            </button>
          )}
        </div>
      )}

      {/* Title */}
      <h2 className="font-heading text-[1.125rem] sm:text-3xl font-bold text-foreground uppercase tracking-[0.005em] sm:tracking-wide mb-2">
        {brandName ? `${brandName} Products` : "All Products"}
      </h2>
      <p className="text-muted-foreground text-xs sm:text-sm mb-10">
        {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
      </p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-5 rounded-lg border border-border">
              <Skeleton className="h-36 w-full rounded-md mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-4" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg text-foreground mb-2">
            No products found{emptyContext ? ` for ${emptyContext}` : "."}
          </p>
          <p className="text-sm mb-4">Try broadening your filters or clearing all filters to see the full catalog.</p>
          {hasAnyFilter && (
            <div className="flex items-center justify-center gap-4">
              <button onClick={clearAllFilters} className="text-sm font-semibold text-primary hover:underline">
                Clear all filters
              </button>
              <button
                onClick={() => {
                  onBackToBrands();
                  trackEvent("catalog_no_results_back_to_brands");
                }}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Browse brands
              </button>
            </div>
          )}
        </div>
      ) : (
        Object.entries(grouped).map(([category, prods]) => (
          <div key={category} className="mb-14">
            <h3 className="font-heading text-lg font-semibold text-foreground uppercase tracking-wider mb-6 pb-3 border-b border-border">
              {category}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {prods.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isExpanded={expandedId === product.id}
                  isMobilePreviewActive={mobilePreviewId === product.id}
                  onToggleExpand={handleToggleExpand}
                  onMobilePreviewToggle={handleMobilePreviewToggle}
                  onAddToQuote={onAddToQuote}
                  orderingEnabled={orderingEnabled}
                  packSizeRules={packSizeRules}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
};

export default ProductCatalog;
