import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, LogOut, Upload, ArrowLeft, Pencil, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useDbBrands } from "@/hooks/useDbBrands";
import { useDbCategories } from "@/hooks/useDbCategories";
import { useDbSizes } from "@/hooks/useDbSizes";
import { normalizeCategoryName } from "@/lib/categoryNormalization";
import BrandManager from "@/components/admin/BrandManager";
import CategoryManager from "@/components/admin/CategoryManager";
import SizeManager from "@/components/admin/SizeManager";
import PackSizeManager from "@/components/admin/PackSizeManager";
import DesignSettings from "@/components/admin/DesignSettings";
import WeeklySpecialsManager from "@/components/admin/WeeklySpecialsManager";
import PublicPageContentManager from "@/components/admin/PublicPageContentManager";
import ContactTeamManager from "@/components/admin/ContactTeamManager";
import OperatingHoursManager from "@/components/admin/OperatingHoursManager";
import SiteContactManager from "@/components/admin/SiteContactManager";
import { ThemeToggleIcon } from "@/components/ui/theme-toggle-icon";
import ScrollToTopFab from "@/components/ScrollToTopFab";

interface DbProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  sizes: string[] | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
  sort_order?: number;
}

const Admin = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const { brands } = useDbBrands();
  const { categories } = useDbCategories();
  const { sizes: sizeLibrary } = useDbSizes();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Full product edit state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editSizes, setEditSizes] = useState<string[]>([]);
  const [editDescription, setEditDescription] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [draggingProductId, setDraggingProductId] = useState<string | null>(null);
  const [draggingBrandId, setDraggingBrandId] = useState<string | null>(null);
  const [supportsSortOrder, setSupportsSortOrder] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem("color-mode");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });


  const toggleSize = (s: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(s) ? list.filter((x) => x !== s) : [...list, s]);
  };

  const moveSize = (s: string, dir: -1 | 1, list: string[], setter: (v: string[]) => void) => {
    const i = list.indexOf(s);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    setter(next);
  };

  const fetchProducts = async () => {
    const withSort = await supabase
      .from("products")
      .select("*")
      .order("brand", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    const missingSortOrder = withSort.error?.message.toLowerCase().includes("sort_order");
    const { data, error } = missingSortOrder
      ? await supabase
          .from("products")
          .select("*")
          .order("brand", { ascending: true })
          .order("created_at", { ascending: true })
      : withSort;
    if (missingSortOrder) {
      setSupportsSortOrder(false);
    }
    if (!error && data) {
      const normalized = data.map((product) => ({
        ...product,
        category: normalizeCategoryName(product.category),
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        sort_order: product.sort_order ?? 0,
      }));
      setProducts(normalized);
    }
    setLoadingProducts(false);
  };

  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
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
  }, [isDarkMode]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    let image_url = "";

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile);

      if (uploadError) {
        toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);
      image_url = urlData.publicUrl;
    }

    const maxSortInBrand = products
      .filter((p) => p.brand === brand)
      .reduce((max, p) => Math.max(max, p.sort_order ?? 0), 0);

    const insertPayload = supportsSortOrder
      ? {
          name,
          brand,
          category,
          sizes: selectedSizes,
          description,
          image_url,
          sort_order: maxSortInBrand + 10,
        }
      : {
          name,
          brand,
          category,
          sizes: selectedSizes,
          description,
          image_url,
        };

    const { error } = await supabase.from("products").insert(insertPayload);

    if (error) {
      toast({ title: "Error adding product", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product added successfully" });
      setName("");
      setBrand("");
      setCategory("");
      setSelectedSizes([]);
      setDescription("");
      setImageFile(null);
      fetchProducts();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting product", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product deleted" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const startEditProduct = (product: DbProduct) => {
    setEditingProductId(product.id);
    setEditName(product.name);
    setEditBrand(product.brand);
    setEditCategory(normalizeCategoryName(product.category));
    setEditSizes(Array.isArray(product.sizes) ? product.sizes : []);
    setEditDescription(product.description || "");
    setEditImageUrl(product.image_url || "");
    setEditImageFile(null);
  };

  const saveProductEdit = async (id: string) => {
    setSavingEdit(true);
    let nextImageUrl = editImageUrl;
    if (editImageFile) {
      const ext = editImageFile.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, editImageFile);
      if (uploadError) {
        toast({ title: "Image upload failed", description: uploadError.message, variant: "destructive" });
        setSavingEdit(false);
        return;
      }
      nextImageUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    }

    const { error } = await supabase.from("products").update({
      name: editName,
      brand: editBrand,
      category: normalizeCategoryName(editCategory),
      sizes: editSizes,
      description: editDescription,
      image_url: nextImageUrl || null,
    }).eq("id", id);
    if (error) {
      toast({ title: "Error updating product", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product updated" });
      setEditingProductId(null);
      fetchProducts();
    }
    setSavingEdit(false);
  };

  const persistBrandOrder = async (brandId: string, orderedIds: string[]) => {
    if (!supportsSortOrder) {
      const startTs = Date.now();
      const legacyUpdates = orderedIds.map((id, index) =>
        supabase
          .from("products")
          .update({ created_at: new Date(startTs + index).toISOString() })
          .eq("id", id)
          .eq("brand", brandId),
      );
      const legacyResults = await Promise.all(legacyUpdates);
      const legacyFailed = legacyResults.find((result) => result.error);
      if (legacyFailed?.error) throw legacyFailed.error;
      return;
    }

    const updates = orderedIds.map((id, index) =>
      supabase
        .from("products")
        .update({ sort_order: (index + 1) * 10 })
        .eq("id", id)
        .eq("brand", brandId),
    );

    const results = await Promise.all(updates);
    const failed = results.find((result) => result.error);
    if (failed?.error) {
      if (failed.error.message.toLowerCase().includes("sort_order")) {
        setSupportsSortOrder(false);
        const startTs = Date.now();
        const legacyUpdates = orderedIds.map((id, index) =>
          supabase
            .from("products")
            .update({ created_at: new Date(startTs + index).toISOString() })
            .eq("id", id)
            .eq("brand", brandId),
        );
        const legacyResults = await Promise.all(legacyUpdates);
        const legacyFailed = legacyResults.find((result) => result.error);
        if (legacyFailed?.error) throw legacyFailed.error;
        return;
      }
      throw failed.error;
    }
  };

  const moveProductWithinBrand = async (product: DbProduct, dir: -1 | 1) => {
    const brandId = product.brand;
    const inBrand = products.filter((p) => p.brand === brandId);
    const ids = inBrand.map((p) => p.id);
    const current = ids.indexOf(product.id);
    const target = current + dir;
    if (current < 0 || target < 0 || target >= ids.length) return;
    const nextIds = [...ids];
    [nextIds[current], nextIds[target]] = [nextIds[target], nextIds[current]];

    setProducts((prev) => {
      const byId = new Map(prev.map((p) => [p.id, p]));
      const reorderedInBrand = nextIds.map((id) => byId.get(id)).filter(Boolean) as DbProduct[];
      return [
        ...prev.filter((p) => p.brand !== brandId),
        ...reorderedInBrand.map((p, i) => ({ ...p, sort_order: (i + 1) * 10 })),
      ];
    });

    try {
      await persistBrandOrder(brandId, nextIds);
      await fetchProducts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to persist product order";
      toast({ title: "Error reordering products", description: message, variant: "destructive" });
      fetchProducts();
    }
  };

  const reorderProductsByDrag = async (brandId: string, draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;
    const inBrand = products.filter((p) => p.brand === brandId);
    const ids = inBrand.map((p) => p.id);
    const from = ids.indexOf(draggedId);
    if (from < 0) return;
    const withoutDragged = ids.filter((id) => id !== draggedId);
    const targetIndex = withoutDragged.indexOf(targetId);
    if (targetIndex < 0) return;
    withoutDragged.splice(targetIndex, 0, draggedId);

    setProducts((prev) => {
      const byId = new Map(prev.map((p) => [p.id, p]));
      const reorderedInBrand = withoutDragged.map((id) => byId.get(id)).filter(Boolean) as DbProduct[];
      return [
        ...prev.filter((p) => p.brand !== brandId),
        ...reorderedInBrand.map((p, i) => ({ ...p, sort_order: (i + 1) * 10 })),
      ];
    });

    try {
      await persistBrandOrder(brandId, withoutDragged);
      await fetchProducts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to persist product order";
      toast({ title: "Error reordering products", description: message, variant: "destructive" });
      fetchProducts();
    }
  };

  const groupedProducts = useMemo(() => {
    const map: Record<string, DbProduct[]> = {};
    products.forEach((p) => {
      if (!map[p.brand]) map[p.brand] = [];
      map[p.brand].push(p);
    });
    return map;
  }, [products]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <h1 className="font-heading text-lg font-bold text-foreground">Product Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDarkMode((prev) => !prev)}
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
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">
            Quick Links
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              ["design-settings", "Design Settings"],
              ["public-page-content", "Public Page Content"],
              ["main-contact-channels", "Main Contact Channels"],
              ["contact-team", "Contact Team"],
              ["operating-hours", "Operating Hours"],
              ["brand-manager", "Brands"],
              ["category-manager", "Categories"],
              ["size-manager", "Sizes"],
              ["pack-size-manager", "Pack Sizes"],
              ["add-product", "Add Product"],
              ["weekly-specials", "Weekly Specials"],
              ["database-products", "Products List"],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="inline-flex min-h-9 items-center rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Design Settings */}
        <div id="design-settings" className="scroll-mt-24">
          <DesignSettings />
        </div>
        <div id="public-page-content" className="scroll-mt-24">
          <PublicPageContentManager />
        </div>
        <div id="main-contact-channels" className="scroll-mt-24">
          <SiteContactManager />
        </div>
        <div id="contact-team" className="scroll-mt-24">
          <ContactTeamManager />
        </div>
        <div id="operating-hours" className="scroll-mt-24">
          <OperatingHoursManager />
        </div>

        {/* Brand Manager */}
        <div id="brand-manager" className="scroll-mt-24">
          <BrandManager />
        </div>

        {/* Category Manager */}
        <div id="category-manager" className="scroll-mt-24">
          <CategoryManager />
        </div>

        {/* Size Manager */}
        <div id="size-manager" className="scroll-mt-24">
          <SizeManager />
        </div>

        {/* Pack Size Manager */}
        <div id="pack-size-manager" className="scroll-mt-24">
          <PackSizeManager />
        </div>

        {/* Add Product Form */}
        <div id="add-product" className="bg-card border border-border rounded-xl p-6 mb-10 scroll-mt-24">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" /> Add New Product
          </h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Shell Helix HX5" required />
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <select
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm"
                required
              >
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm"
                required
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label>Sizes</Label>
              {sizeLibrary.length === 0 ? (
                <p className="text-xs text-muted-foreground mt-1">
                  No sizes defined yet. Add some in the Manage Sizes section above.
                </p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {sizeLibrary.map((s) => {
                      const checked = selectedSizes.includes(s.name);
                      return (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => toggleSize(s.name, selectedSizes, setSelectedSizes)}
                          className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                            checked
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-foreground border-input hover:border-primary/50"
                          }`}
                        >
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                  {selectedSizes.length > 1 && (
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Selection order: {selectedSizes.join(" → ")}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Product description..." rows={3} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="image">Product Image</Label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md border border-input bg-background text-sm text-foreground hover:bg-muted transition-colors">
                  <Upload className="h-4 w-4" />
                  {imageFile ? imageFile.name : "Choose file"}
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Product"}
              </Button>
            </div>
          </form>
        </div>

        <div id="weekly-specials" className="scroll-mt-24">
          <WeeklySpecialsManager />
        </div>

        {/* Product List */}
        <h2 id="database-products" className="font-heading text-lg font-semibold text-foreground mb-4 scroll-mt-24">
          Database Products ({products.length})
        </h2>
        {loadingProducts ? (
          <p className="text-muted-foreground">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground">No database products yet. Add one above.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedProducts).map(([brandId, items]) => (
              <div key={brandId} className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {brands.find((b) => b.id === brandId)?.name || brandId} ({items.length})
                </h3>
                {items.map((product, index) => {
              const isEditing = editingProductId === product.id;
              const productSizes = Array.isArray(product.sizes) ? product.sizes : [];
              return (
                <div
                  key={product.id}
                  className={`bg-card border rounded-lg p-4 transition-colors ${
                    draggingProductId === product.id
                      ? "border-primary/60 opacity-80"
                      : "border-border"
                  }`}
                  draggable={!isEditing}
                  onDragStart={(e) => {
                    if (isEditing) return;
                    setDraggingProductId(product.id);
                    setDraggingBrandId(product.brand);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", product.id);
                  }}
                  onDragOver={(e) => {
                    if (!draggingProductId || !draggingBrandId) return;
                    if (draggingBrandId !== product.brand) return;
                    if (draggingProductId === product.id) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (!draggingProductId || !draggingBrandId) return;
                    if (draggingBrandId !== product.brand) return;
                    void reorderProductsByDrag(product.brand, draggingProductId, product.id);
                    setDraggingProductId(null);
                    setDraggingBrandId(null);
                  }}
                  onDragEnd={() => {
                    setDraggingProductId(null);
                    setDraggingBrandId(null);
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="pt-1 text-muted-foreground" title="Drag to reorder within this brand">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-16 w-16 rounded-md object-contain shrink-0" />
                    ) : (
                      <div className="h-16 w-16 rounded-md border border-border flex items-center justify-center text-2xl opacity-30 shrink-0">🛢️</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {brands.find((b) => b.id === product.brand)?.name || product.brand} · {product.category}
                        {productSizes.length > 0 && ` · ${productSizes.join(", ")}`}
                      </p>
                      {product.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{product.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0 items-center">
                      <Button variant="outline" size="icon" onClick={() => void moveProductWithinBrand(product, -1)} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => void moveProductWithinBrand(product, 1)} disabled={index === items.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (isEditing) {
                            setEditingProductId(null);
                          } else {
                            startEditProduct(product);
                          }
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        {isEditing ? "Close" : "Edit"}
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label className="text-xs">Product name</Label>
                          <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-xs">Brand</Label>
                          <select
                            value={editBrand}
                            onChange={(e) => setEditBrand(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm"
                          >
                            {brands.map((b) => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">Category</Label>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">Image URL</Label>
                          <Input value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-xs">Replace image file (optional)</Label>
                          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md border border-input bg-background text-sm text-foreground hover:bg-muted transition-colors w-fit mt-1">
                            <Upload className="h-4 w-4" />
                            {editImageFile ? editImageFile.name : "Choose file"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                            />
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-xs">Description</Label>
                          <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
                        </div>
                      </div>

                      <p className="text-xs font-medium text-foreground mb-2">Assign sizes (click to toggle)</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {sizeLibrary.map((s) => {
                          const checked = editSizes.includes(s.name);
                          return (
                            <button
                              type="button"
                              key={s.id}
                              onClick={() => toggleSize(s.name, editSizes, setEditSizes)}
                              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                                checked
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background text-foreground border-input hover:border-primary/50"
                              }`}
                            >
                              {s.name}
                            </button>
                          );
                        })}
                      </div>
                      {editSizes.length > 0 && (
                        <>
                          <p className="text-xs font-medium text-foreground mb-2">Display order</p>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {editSizes.map((s) => (
                              <div key={s} className="flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-background text-xs">
                                <span>{s}</span>
                                <button
                                  type="button"
                                  className="text-muted-foreground hover:text-foreground px-1"
                                  onClick={() => moveSize(s, -1, editSizes, setEditSizes)}
                                  aria-label="Move up"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  className="text-muted-foreground hover:text-foreground px-1"
                                  onClick={() => moveSize(s, 1, editSizes, setEditSizes)}
                                  aria-label="Move down"
                                >
                                  ↓
                                </button>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveProductEdit(product.id)} disabled={savingEdit}>
                          {savingEdit ? "Saving..." : "Save product"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingProductId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
                })}
              </div>
            ))}
          </div>
        )}
      </main>
      <ScrollToTopFab />
    </div>
  );
};

export default Admin;
