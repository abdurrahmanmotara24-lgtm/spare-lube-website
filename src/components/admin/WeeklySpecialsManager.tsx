import { useMemo, useState } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Search, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useDbProducts } from "@/hooks/useDbProducts";
import { useWeeklySpecials } from "@/hooks/useWeeklySpecials";
import { useToast } from "@/hooks/use-toast";
import { WEEKLY_SPECIAL_HEADERS, type WeeklySpecial, type WeeklySpecialHeader } from "@/types/weeklySpecials";

type ValidationErrors = {
  specialPrice?: string;
  originalPrice?: string;
};

type SpecialDraft = {
  specialPrice: string;
  originalPrice: string;
  headerLabel: WeeklySpecialHeader;
  customDescription: string;
};

const defaultDraft = (): SpecialDraft => ({
  specialPrice: "",
  originalPrice: "",
  headerLabel: "🔥 Weekly Deal",
  customDescription: "",
});

const parseAmount = (value: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Number(parsed.toFixed(2));
};

const validateDraft = (draft: SpecialDraft): ValidationErrors => {
  const errors: ValidationErrors = {};
  const specialPrice = parseAmount(draft.specialPrice);
  const originalPrice = draft.originalPrice.trim() ? parseAmount(draft.originalPrice) : null;
  if (!specialPrice) errors.specialPrice = "Enter price";
  if (specialPrice && originalPrice !== null && specialPrice >= originalPrice) {
    errors.specialPrice = "Price must be lower than original";
  }
  if (draft.originalPrice.trim() && originalPrice === null) {
    errors.originalPrice = "Enter valid original price";
  }
  return errors;
};

interface SortableSpecialCardProps {
  special: WeeklySpecial;
  onToggleActive: (special: WeeklySpecial, enabled: boolean) => void;
  onDuplicate: (special: WeeklySpecial) => void;
  onDelete: (special: WeeklySpecial) => void;
  onSaveDescription: (special: WeeklySpecial, description: string) => Promise<void>;
}

const SortableSpecialCard = ({ special, onToggleActive, onDuplicate, onDelete, onSaveDescription }: SortableSpecialCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: special.id });
  const [descDraft, setDescDraft] = useState(special.customDescription ?? "");
  const [savingDesc, setSavingDesc] = useState(false);
  const dirty = (descDraft ?? "") !== (special.customDescription ?? "");
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="rounded-xl border border-border bg-card p-3"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Drag ${special.productName}`}
          className="h-11 w-11 shrink-0 rounded-lg border border-border bg-background flex items-center justify-center touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
        {special.productImage ? (
          <img src={special.productImage} alt={special.productName} className="h-14 w-14 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="h-14 w-14 rounded-lg border border-border shrink-0 flex items-center justify-center text-xl">🛢️</div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{special.headerLabel}</p>
          <p className="font-semibold text-sm text-foreground truncate">{special.productName}</p>
          <p className="text-lg font-bold text-foreground">R{special.specialPrice.toFixed(2)}</p>
          {special.originalPrice ? <p className="text-xs text-muted-foreground line-through">R{special.originalPrice.toFixed(2)}</p> : null}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="min-h-10" onClick={() => onDuplicate(special)}>
            <Copy className="h-4 w-4 mr-1" />
            Duplicate
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-10 text-destructive hover:text-destructive"
            onClick={() => onDelete(special)}
            aria-label={`Delete ${special.productName}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">OFF</span>
          <Switch checked={special.isActive} onCheckedChange={(checked) => onToggleActive(special, checked)} />
          <span className="text-xs font-medium text-muted-foreground">ON</span>
        </div>
      </div>
      <div className="mt-3">
        <Label className="text-xs text-muted-foreground">Custom description</Label>
        <Textarea
          value={descDraft}
          onChange={(event) => setDescDraft(event.target.value)}
          placeholder="Optional — leave empty to show no description"
          rows={2}
          className="mt-1 text-sm"
        />
        <div className="mt-2 flex items-center justify-end gap-2">
          {descDraft.trim() ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={async () => {
                setSavingDesc(true);
                await onSaveDescription(special, "");
                setDescDraft("");
                setSavingDesc(false);
              }}
              disabled={savingDesc}
            >
              Clear
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            disabled={!dirty || savingDesc}
            onClick={async () => {
              setSavingDesc(true);
              await onSaveDescription(special, descDraft);
              setSavingDesc(false);
            }}
          >
            {savingDesc ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const WeeklySpecialsManager = () => {
  const { toast } = useToast();
  const { dbProducts } = useDbProducts();
  const { weeklySpecials, loading, refreshWeeklySpecials } = useWeeklySpecials(false);
  const [search, setSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickMode, setQuickMode] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);
  const [draft, setDraft] = useState<SpecialDraft>(defaultDraft);
  const [bulkDraft, setBulkDraft] = useState<SpecialDraft>(defaultDraft);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<WeeklySpecial | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 160, tolerance: 8 } }));
  const existingByProductId = useMemo(
    () => new Map(weeklySpecials.map((special) => [special.productId, special])),
    [weeklySpecials],
  );
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const source = dbProducts.filter((product) => !existingByProductId.has(product.id));
    if (!query) return source.slice(0, 20);
    return source.filter((product) => product.name.toLowerCase().includes(query)).slice(0, 20);
  }, [dbProducts, existingByProductId, search]);
  const selectedProduct = useMemo(
    () => dbProducts.find((product) => product.id === selectedProductId) ?? null,
    [dbProducts, selectedProductId],
  );

  const getNextSortOrder = () => (weeklySpecials.length + 1) * 10;

  const saveSingleSpecial = async () => {
    if (!selectedProduct) return;
    const validation = validateDraft(draft);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setSaving(true);
    const specialPrice = Number(draft.specialPrice);
    const originalPrice = draft.originalPrice.trim() ? Number(draft.originalPrice) : null;
    const { error } = await supabase.from("weekly_specials").insert({
      product_id: selectedProduct.id,
      special_price: Number(specialPrice.toFixed(2)),
      original_price: originalPrice ? Number(originalPrice.toFixed(2)) : null,
      header_label: draft.headerLabel,
      is_active: true,
      sort_order: getNextSortOrder(),
      custom_description: draft.customDescription.trim() ? draft.customDescription.trim() : null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Could not save special", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Weekly special saved" });
    setDrawerOpen(false);
    setSelectedProductId(null);
    setDraft(defaultDraft());
    setErrors({});
    refreshWeeklySpecials();
  };

  const runBulkAdd = async () => {
    if (selectedBulkIds.length === 0) {
      toast({ title: "Select at least one product", variant: "destructive" });
      return;
    }
    const validation = validateDraft(bulkDraft);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setSaving(true);
    const start = getNextSortOrder();
    const payload = selectedBulkIds.map((productId, index) => ({
      product_id: productId,
      special_price: Number(Number(bulkDraft.specialPrice).toFixed(2)),
      original_price: bulkDraft.originalPrice.trim() ? Number(Number(bulkDraft.originalPrice).toFixed(2)) : null,
      header_label: bulkDraft.headerLabel,
      is_active: true,
      sort_order: start + index * 10,
    }));
    const { error } = await supabase.from("weekly_specials").upsert(payload, { onConflict: "product_id" });
    setSaving(false);
    if (error) {
      toast({ title: "Bulk add failed", description: error.message, variant: "destructive" });
      return;
    }
    setSelectedBulkIds([]);
    setBulkDraft(defaultDraft());
    setErrors({});
    toast({ title: "Bulk weekly specials saved" });
    refreshWeeklySpecials();
  };

  const toggleActive = async (special: WeeklySpecial, enabled: boolean) => {
    const { error } = await supabase.from("weekly_specials").update({ is_active: enabled }).eq("id", special.id);
    if (error) {
      toast({ title: "Could not update status", description: error.message, variant: "destructive" });
      return;
    }
    refreshWeeklySpecials();
  };

  const duplicateSpecial = (special: WeeklySpecial) => {
    const clonedDraft: SpecialDraft = {
      specialPrice: String(special.specialPrice),
      originalPrice: special.originalPrice === null ? "" : String(special.originalPrice),
      headerLabel: special.headerLabel,
      customDescription: "",
    };
    setDraft(clonedDraft);
    setBulkDraft(clonedDraft);
    setErrors({});
    setSearch("");
    setDrawerOpen(false);
    toast({
      title: "Special copied",
      description: "Select a product above to apply the copied pricing.",
    });
  };

  const confirmDeleteSpecial = async () => {
    if (!pendingDelete) return;
    const { error } = await supabase.from("weekly_specials").delete().eq("id", pendingDelete.id);
    if (error) {
      toast({ title: "Could not delete special", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Weekly special removed" });
    setPendingDelete(null);
    refreshWeeklySpecials();
  };

  const saveCustomDescription = async (special: WeeklySpecial, description: string) => {
    const trimmed = description.trim();
    const { error } = await supabase
      .from("weekly_specials")
      .update({ custom_description: trimmed.length > 0 ? trimmed : null })
      .eq("id", special.id);
    if (error) {
      toast({ title: "Could not update description", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Description updated" });
    refreshWeeklySpecials();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = weeklySpecials.findIndex((item) => item.id === active.id);
    const newIndex = weeklySpecials.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(weeklySpecials, oldIndex, newIndex);
    const updates = reordered.map((item, index) =>
      supabase.from("weekly_specials").update({ sort_order: (index + 1) * 10 }).eq("id", item.id),
    );
    const results = await Promise.all(updates);
    const failed = results.find((result) => result.error);
    if (failed?.error) {
      toast({ title: "Failed to reorder", description: failed.error.message, variant: "destructive" });
      return;
    }
    refreshWeeklySpecials();
  };

  return (
    <section className="bg-card border border-border rounded-xl p-4 mb-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold">Weekly Specials Manager</h2>
        <div className="flex items-center gap-2">
          <Label htmlFor="quick-mode" className="text-xs">Quick mode</Label>
          <Switch id="quick-mode" checked={quickMode} onCheckedChange={setQuickMode} />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="pl-10 min-h-11"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={bulkMode} onCheckedChange={(checked) => setBulkMode(Boolean(checked))} />
            Bulk add mode
          </label>
          {bulkMode ? (
            <span className="text-xs text-muted-foreground">{selectedBulkIds.length} selected</span>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {filteredProducts.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => {
              if (bulkMode) {
                setSelectedBulkIds((prev) =>
                  prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id],
                );
                return;
              }
              setSelectedProductId(product.id);
              setErrors({});
              setDrawerOpen(true);
            }}
            className="w-full text-left rounded-lg border border-border bg-background px-3 py-3 min-h-14"
          >
            <div className="flex items-center gap-3">
              {bulkMode ? (
                <Checkbox checked={selectedBulkIds.includes(product.id)} onCheckedChange={() => undefined} />
              ) : null}
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-11 w-11 rounded-md object-cover shrink-0" />
              ) : (
                <div className="h-11 w-11 rounded-md border border-border shrink-0 flex items-center justify-center">🛢️</div>
              )}
              <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
            </div>
          </button>
        ))}
      </div>

      {bulkMode ? (
        <div className="mt-4 rounded-xl border border-border p-3 space-y-3">
          <p className="text-sm font-semibold">Bulk setup</p>
          {!quickMode ? (
            <>
              <div>
                <Label>Header</Label>
                <select
                  value={bulkDraft.headerLabel}
                  onChange={(event) =>
                    setBulkDraft((prev) => ({ ...prev, headerLabel: event.target.value as WeeklySpecialHeader }))
                  }
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm mt-1"
                >
                  {WEEKLY_SPECIAL_HEADERS.map((header) => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Original price (optional)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={bulkDraft.originalPrice}
                  onChange={(event) => setBulkDraft((prev) => ({ ...prev, originalPrice: event.target.value }))}
                  className="min-h-11 mt-1"
                />
                {errors.originalPrice ? <p className="text-xs text-destructive mt-1">{errors.originalPrice}</p> : null}
              </div>
            </>
          ) : null}
          <div>
            <Label>Special price</Label>
            <Input
              required
              type="number"
              inputMode="decimal"
              value={bulkDraft.specialPrice}
              onChange={(event) => setBulkDraft((prev) => ({ ...prev, specialPrice: event.target.value }))}
              className="min-h-11 mt-1"
            />
            {errors.specialPrice ? <p className="text-xs text-destructive mt-1">{errors.specialPrice}</p> : null}
          </div>
          <Button type="button" className="w-full min-h-12" onClick={runBulkAdd} disabled={saving}>
            {saving ? "Saving..." : "Save bulk specials"}
          </Button>
        </div>
      ) : null}

      <div className="mt-6">
        <p className="text-sm font-semibold mb-2">Current weekly specials</p>
        {loading ? <p className="text-sm text-muted-foreground">Loading specials...</p> : null}
        {!loading && weeklySpecials.length === 0 ? <p className="text-sm text-muted-foreground">No specials yet.</p> : null}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={weeklySpecials.map((special) => special.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {weeklySpecials.map((special) => (
                <SortableSpecialCard
                  key={special.id}
                  special={special}
                  onToggleActive={toggleActive}
                  onDuplicate={duplicateSpecial}
                  onDelete={(s) => setPendingDelete(s)}
                  onSaveDescription={saveCustomDescription}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{selectedProduct?.name ?? "New special"}</DrawerTitle>
            <DrawerDescription>Set mobile-ready special pricing.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 space-y-3">
            {!quickMode ? (
              <>
                <div>
                  <Label htmlFor="header">Header</Label>
                  <select
                    id="header"
                    value={draft.headerLabel}
                    onChange={(event) => setDraft((prev) => ({ ...prev, headerLabel: event.target.value as WeeklySpecialHeader }))}
                    className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm mt-1"
                  >
                    {WEEKLY_SPECIAL_HEADERS.map((header) => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="original-price">Original price (optional)</Label>
                  <Input
                    id="original-price"
                    type="number"
                    inputMode="decimal"
                    value={draft.originalPrice}
                    onChange={(event) => setDraft((prev) => ({ ...prev, originalPrice: event.target.value }))}
                    className="min-h-11 mt-1"
                  />
                  {errors.originalPrice ? <p className="text-xs text-destructive mt-1">{errors.originalPrice}</p> : null}
                </div>
              </>
            ) : null}
            <div>
              <Label htmlFor="special-price">Special price</Label>
              <Input
                id="special-price"
                required
                type="number"
                inputMode="decimal"
                value={draft.specialPrice}
                onChange={(event) => setDraft((prev) => ({ ...prev, specialPrice: event.target.value }))}
                className="min-h-11 mt-1"
              />
              {errors.specialPrice ? <p className="text-xs text-destructive mt-1">{errors.specialPrice}</p> : null}
            </div>
            <div>
              <Label htmlFor="custom-description">Custom description (optional)</Label>
              <Textarea
                id="custom-description"
                value={draft.customDescription}
                onChange={(event) => setDraft((prev) => ({ ...prev, customDescription: event.target.value }))}
                placeholder="Leave empty to show no description"
                rows={2}
                className="mt-1"
              />
            </div>
          </div>
          <DrawerFooter>
            <Button type="button" className="w-full min-h-12" onClick={saveSingleSpecial} disabled={saving}>
              <Plus className="h-4 w-4 mr-1" />
              {saving ? "Saving..." : "Save special"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove weekly special?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `"${pendingDelete.productName}" will be removed from weekly specials. You can re-add it anytime.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSpecial}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default WeeklySpecialsManager;
