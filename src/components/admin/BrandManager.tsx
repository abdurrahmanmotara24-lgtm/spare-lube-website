import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDbBrands, type DbBrand } from "@/hooks/useDbBrands";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Upload, Pencil, X, Check, GripVertical, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BRAND_THEME_SUGGESTIONS,
  getBrandThemeSuggestion,
  removeStoredBrandThemeOverride,
  setStoredBrandThemeOverride,
  type BrandThemeEditable,
} from "@/lib/brandThemeSuggestions";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface RowProps {
  brand: DbBrand;
  isEditing: boolean;
  isThemeEditing: boolean;
  hasCustomTheme: boolean;
  editName: string;
  editLogo: string;
  editImage: File | null;
  themeDraft: BrandThemeEditable;
  onStartEdit: (b: DbBrand) => void;
  onStartThemeEdit: (b: DbBrand) => void;
  onCancelEdit: () => void;
  onCancelThemeEdit: () => void;
  onSaveEdit: (id: string) => void;
  onSaveTheme: (id: string) => void;
  onResetTheme: (id: string) => void;
  onDelete: (id: string) => void;
  onPreviewTheme: (id: string) => void;
  setEditName: (v: string) => void;
  setEditLogo: (v: string) => void;
  setEditImage: (f: File | null) => void;
  setThemeDraft: (v: BrandThemeEditable) => void;
}

function hslStringToHex(hsl: string): string {
  const m = hsl.trim().match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!m) return "#000000";
  const h = parseFloat(m[1]);
  const s = parseFloat(m[2]) / 100;
  const l = parseFloat(m[3]) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m2 = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  const to = (v: number) => Math.round((v + m2) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function hexToHslString(hex: string): string {
  const v = hex.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16) / 255;
  const g = parseInt(v.slice(2, 4), 16) / 255;
  const b = parseInt(v.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const SortableBrandRow = (p: RowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: p.brand.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  const b = p.brand;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-background border border-border rounded-lg p-3 flex items-center gap-3"
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none p-1 text-muted-foreground hover:text-foreground"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0">
        {b.image_url ? (
          <img src={b.image_url} alt={b.name} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-xl">{b.logo || "🛢️"}</span>
        )}
      </div>
      {p.isEditing ? (
        <div className="flex-1 flex flex-wrap items-center gap-2">
          <Input value={p.editName} onChange={(e) => p.setEditName(e.target.value)} className="w-40" placeholder="Name" />
          <Input value={p.editLogo} onChange={(e) => p.setEditLogo(e.target.value)} className="w-20" placeholder="Emoji" />
          <label className="flex items-center gap-1 cursor-pointer px-3 py-2 rounded-md border border-input bg-background text-xs hover:bg-muted">
            <Upload className="h-3 w-3" />
            <span className="truncate max-w-[100px]">{p.editImage ? p.editImage.name : "Replace image"}</span>
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => p.setEditImage(e.target.files?.[0] || null)} />
          </label>
          <Button size="icon" variant="default" onClick={() => p.onSaveEdit(b.id)}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={p.onCancelEdit}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{b.name}</p>
            <p className="text-xs text-muted-foreground truncate">id: {b.id}</p>
            {BRAND_THEME_SUGGESTIONS[b.id] && (
              <p className="text-[10px] text-muted-foreground mt-0.5 italic">
                Theme suggestion: {BRAND_THEME_SUGGESTIONS[b.id].label}
              </p>
            )}
            {p.hasCustomTheme && (
              <p className="text-[10px] text-primary mt-0.5 font-medium">Custom theme saved</p>
            )}
          </div>
          <Button
            size="icon"
            variant="outline"
            title="Preview active theme on storefront by selecting this brand"
            onClick={() => p.onPreviewTheme(b.id)}
          >
            <Palette className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => p.onStartThemeEdit(b)}>
            Theme
          </Button>
          <Button size="icon" variant="outline" onClick={() => p.onStartEdit(b)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="destructive" onClick={() => p.onDelete(b.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
      {p.isThemeEditing && (
        <div className="w-full mt-3 pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {([
            ["primary_color", "Primary"],
            ["accent_color", "Accent"],
            ["button_color", "Button"],
            ["button_foreground_color", "Button text"],
          ] as const).map(([key, label]) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs">{label}</Label>
              <input
                type="color"
                value={hslStringToHex(p.themeDraft[key])}
                onChange={(e) => p.setThemeDraft({ ...p.themeDraft, [key]: hexToHslString(e.target.value) })}
                className="h-9 w-full rounded border border-input bg-background cursor-pointer"
              />
            </div>
          ))}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => p.onSaveTheme(b.id)}>
              Save Theme
            </Button>
            <Button size="sm" variant="outline" onClick={() => p.onResetTheme(b.id)}>
              Reset Theme
            </Button>
            <Button size="sm" variant="ghost" onClick={p.onCancelThemeEdit}>
              Close
            </Button>
          </div>
          <p className="sm:col-span-2 lg:col-span-4 text-[11px] text-muted-foreground">
            Theme overrides are saved in Supabase and applied across devices when this brand is selected.
          </p>
        </div>
      )}
    </div>
  );
};

const BrandManager = () => {
  const { toast } = useToast();
  const { brands, loading, refetch } = useDbBrands();

  // Local ordering buffer for drag-and-drop
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  useEffect(() => {
    setOrderedIds(brands.map((b) => b.id));
  }, [brands]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Add form
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newLogo, setNewLogo] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLogo, setEditLogo] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [themeEditingId, setThemeEditingId] = useState<string | null>(null);
  const [themeDraft, setThemeDraft] = useState<BrandThemeEditable>({
    primary_color: "0 85% 46%",
    accent_color: "45 100% 51%",
    button_color: "0 85% 46%",
    button_foreground_color: "0 0% 100%",
  });
  const uploadLogo = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("brand-logos").upload(path, file);
    if (error) throw error;
    return supabase.storage.from("brand-logos").getPublicUrl(path).data.publicUrl;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let image_url = "";
      if (newImage) image_url = await uploadLogo(newImage);

      const id = newId.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const { error } = await supabase.from("brands").insert({
        id,
        name: newName,
        logo: newLogo,
        image_url,
        sort_order: (brands[brands.length - 1]?.sort_order ?? 0) + 10,
      });
      if (error) throw error;

      toast({ title: "Brand added" });
      setNewId(""); setNewName(""); setNewLogo(""); setNewImage(null);
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (b: DbBrand) => {
    setEditingId(b.id);
    setEditName(b.name);
    setEditLogo(b.logo || "");
    setEditImage(null);
  };

  const startThemeEdit = (b: DbBrand) => {
    const suggestion = getBrandThemeSuggestion(b.id, b.name, {
      primary_color: b.theme_primary_color ?? undefined,
      accent_color: b.theme_accent_color ?? undefined,
      button_color: b.theme_button_color ?? undefined,
      button_foreground_color: b.theme_button_foreground_color ?? undefined,
    });
    setThemeDraft({
      primary_color: suggestion.primary_color,
      accent_color: suggestion.accent_color,
      button_color: suggestion.button_color,
      button_foreground_color: suggestion.button_foreground_color,
    });
    setThemeEditingId(b.id);
  };

  const saveEdit = async (id: string) => {
    try {
      const update: any = { name: editName, logo: editLogo };
      if (editImage) update.image_url = await uploadLogo(editImage);
      const { error } = await supabase.from("brands").update(update).eq("id", id);
      if (error) throw error;
      toast({ title: "Brand updated" });
      setEditingId(null);
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handlePreviewTheme = (brandId: string) => {
    const brand = brands.find((b) => b.id === brandId);
    const suggestion = getBrandThemeSuggestion(brandId, brand?.name);
    toast({
      title: "Brand theme preview",
      description: `${suggestion.label}. Colors now switch automatically when that brand is selected on the homepage.`,
    });
  };

  const handleSaveTheme = async (brandId: string) => {
    const { error } = await supabase
      .from("brands")
      .update({
        theme_primary_color: themeDraft.primary_color,
        theme_accent_color: themeDraft.accent_color,
        theme_button_color: themeDraft.button_color,
        theme_button_foreground_color: themeDraft.button_foreground_color,
      })
      .eq("id", brandId);
    if (error) {
      if (error.message.toLowerCase().includes("theme_")) {
        setStoredBrandThemeOverride(brandId, themeDraft);
        toast({ title: "Theme saved locally", description: "Database columns not available yet." });
        setThemeEditingId(null);
        return;
      }
      toast({ title: "Theme save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Theme saved", description: "Brand colors synced to database." });
    setThemeEditingId(null);
    refetch();
  };

  const handleResetTheme = async (brandId: string) => {
    const { error } = await supabase
      .from("brands")
      .update({
        theme_primary_color: null,
        theme_accent_color: null,
        theme_button_color: null,
        theme_button_foreground_color: null,
      })
      .eq("id", brandId);
    if (error) {
      if (error.message.toLowerCase().includes("theme_")) {
        removeStoredBrandThemeOverride(brandId);
        toast({ title: "Theme reset locally", description: "Database columns not available yet." });
        return;
      }
      toast({ title: "Theme reset failed", description: error.message, variant: "destructive" });
      return;
    }
    const brand = brands.find((b) => b.id === brandId);
    if (brand) startThemeEdit(brand);
    toast({ title: "Theme reset", description: "Brand colors reverted to suggested/auto palette." });
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this brand? Products under this brand will remain but will be unlinked.")) return;
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting brand", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Brand deleted" });
      refetch();
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedIds.indexOf(String(active.id));
    const newIndex = orderedIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(orderedIds, oldIndex, newIndex);
    setOrderedIds(next); // optimistic UI

    // Persist new sort_order values (10, 20, 30, ...) for stable spacing
    try {
      const updates = next.map((id, i) =>
        supabase.from("brands").update({ sort_order: (i + 1) * 10 }).eq("id", id),
      );
      const results = await Promise.all(updates);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      toast({ title: "Order saved" });
      refetch();
    } catch (err: any) {
      toast({ title: "Failed to save order", description: err.message, variant: "destructive" });
      refetch();
    }
  };

  // Build ordered brand list from local buffer
  const brandsById = new Map(brands.map((b) => [b.id, b]));
  const orderedBrands = orderedIds.map((id) => brandsById.get(id)).filter(Boolean) as DbBrand[];

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-10">
      <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Plus className="h-5 w-5" /> Manage Brands
      </h2>

      {/* Add new brand form */}
      <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 pb-6 border-b border-border">
        <div>
          <Label htmlFor="b-id">Brand ID (slug)</Label>
          <Input id="b-id" value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="e.g. ngk" required />
        </div>
        <div>
          <Label htmlFor="b-name">Brand Name</Label>
          <Input id="b-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. NGK" required />
        </div>
        <div>
          <Label htmlFor="b-logo">Emoji/Logo (optional)</Label>
          <Input id="b-logo" value={newLogo} onChange={(e) => setNewLogo(e.target.value)} placeholder="🛢️" />
        </div>
        <div>
          <Label htmlFor="b-image">Brand Image (optional)</Label>
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md border border-input bg-background text-sm text-foreground hover:bg-muted transition-colors h-10">
            <Upload className="h-4 w-4" />
            <span className="truncate">{newImage ? newImage.name : "Choose file"}</span>
            <input id="b-image" type="file" accept="image/*" className="hidden"
              onChange={(e) => setNewImage(e.target.files?.[0] || null)} />
          </label>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={submitting}>{submitting ? "Adding..." : "Add Brand"}</Button>
        </div>
      </form>

      {/* Brand list with drag-and-drop */}
      <h3 className="font-semibold text-sm text-foreground mb-1">Existing Brands ({brands.length})</h3>
      <p className="text-xs text-muted-foreground mb-3">Drag the handle to reorder. Order is saved automatically.</p>
      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderedIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {orderedBrands.map((b) => (
                <SortableBrandRow
                  key={b.id}
                  brand={b}
                  isEditing={editingId === b.id}
                  isThemeEditing={themeEditingId === b.id}
                  hasCustomTheme={Boolean(
                    b.theme_primary_color ||
                    b.theme_accent_color ||
                    b.theme_button_color ||
                    b.theme_button_foreground_color,
                  )}
                  editName={editName}
                  editLogo={editLogo}
                  editImage={editImage}
                  themeDraft={themeDraft}
                  onStartEdit={startEdit}
                  onStartThemeEdit={startThemeEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onCancelThemeEdit={() => setThemeEditingId(null)}
                  onSaveEdit={saveEdit}
                  onSaveTheme={handleSaveTheme}
                  onResetTheme={handleResetTheme}
                  onDelete={handleDelete}
                  onPreviewTheme={handlePreviewTheme}
                  setEditName={setEditName}
                  setEditLogo={setEditLogo}
                  setEditImage={setEditImage}
                  setThemeDraft={setThemeDraft}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default BrandManager;
