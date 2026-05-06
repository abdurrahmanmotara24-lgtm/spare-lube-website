import { useEffect, useMemo, useState } from "react";
import { Box, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useDbBrands } from "@/hooks/useDbBrands";
import { useDbSizes } from "@/hooks/useDbSizes";
import { usePackSizeRules, type PackSizeRuleRow } from "@/hooks/usePackSizeRules";

const PackSizeManager = () => {
  const { toast } = useToast();
  const { brands } = useDbBrands();
  const { sizes } = useDbSizes();
  const { tableAvailable, refetch } = usePackSizeRules();
  const [brandId, setBrandId] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [unitsPerPack, setUnitsPerPack] = useState("");
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<PackSizeRuleRow[]>([]);

  const fetchRows = async () => {
    const { data, error } = await supabase
      .from("pack_size_rules")
      .select("id, brand_id, size_id, units_per_pack, brands(id, name), sizes(id, name)")
      .order("brand_id", { ascending: true })
      .order("size_id", { ascending: true });
    if (error) return;
    setRows((data as PackSizeRuleRow[]) ?? []);
  };

  useEffect(() => {
    void fetchRows();
  }, []);

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const brandA = a.brands?.name ?? "";
        const brandB = b.brands?.name ?? "";
        if (brandA !== brandB) return brandA.localeCompare(brandB);
        return (a.sizes?.name ?? "").localeCompare(b.sizes?.name ?? "");
      }),
    [rows],
  );

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = Number(unitsPerPack);
    if (!brandId || !sizeId || !Number.isFinite(parsed) || parsed <= 0) {
      toast({ title: "Please select brand, size, and valid units", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("pack_size_rules").upsert(
      {
        brand_id: brandId,
        size_id: sizeId,
        units_per_pack: Math.floor(parsed),
      },
      { onConflict: "brand_id,size_id" },
    );
    setSaving(false);
    if (error) {
      toast({ title: "Could not save pack size", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Pack size saved" });
    setUnitsPerPack("");
    await Promise.all([fetchRows(), refetch()]);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("pack_size_rules").delete().eq("id", id);
    if (error) {
      toast({ title: "Could not delete pack size", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Pack size deleted" });
    await Promise.all([fetchRows(), refetch()]);
  };

  if (!tableAvailable) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 mb-10">
        <h2 className="font-heading text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
          <Box className="h-5 w-5" /> Pack Sizes by Brand + Bottle Size
        </h2>
        <p className="text-sm text-muted-foreground">
          Pack-size table not found yet. Run the latest Supabase migration, then refresh admin.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-10">
      <h2 className="font-heading text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
        <Box className="h-5 w-5" /> Pack Sizes by Brand + Bottle Size
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Example: Shell + 5L = 3 means display as 3 x 5L and order quantity in boxes.
      </p>

      <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 pb-6 border-b border-border">
        <div>
          <Label htmlFor="pack-brand">Brand</Label>
          <select
            id="pack-brand"
            value={brandId}
            onChange={(event) => setBrandId(event.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm"
            required
          >
            <option value="">Select brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="pack-size">Bottle size</Label>
          <select
            id="pack-size"
            value={sizeId}
            onChange={(event) => setSizeId(event.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm"
            required
          >
            <option value="">Select size</option>
            {sizes.map((size) => (
              <option key={size.id} value={size.id}>
                {size.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="pack-units">Units per pack</Label>
          <Input
            id="pack-units"
            type="number"
            min={1}
            step={1}
            value={unitsPerPack}
            onChange={(event) => setUnitsPerPack(event.target.value)}
            placeholder="e.g. 3"
            required
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full" disabled={saving}>
            <Plus className="h-4 w-4 mr-1" />
            {saving ? "Saving..." : "Save rule"}
          </Button>
        </div>
      </form>

      <h3 className="font-semibold text-sm text-foreground mb-3">Existing Rules ({sortedRows.length})</h3>
      {sortedRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pack-size rules yet.</p>
      ) : (
        <div className="space-y-2">
          {sortedRows.map((row) => (
            <div key={row.id} className="bg-background border border-border rounded-lg px-3 py-2 flex items-center justify-between gap-3">
              <p className="text-sm text-foreground">
                <span className="font-medium">{row.brands?.name ?? row.brand_id}</span>
                {" · "}
                <span>{row.sizes?.name ?? row.size_id}</span>
                {" = "}
                <span className="font-semibold">{row.units_per_pack} x</span>
              </p>
              <Button type="button" size="icon" variant="ghost" onClick={() => handleDelete(row.id)} aria-label="Delete pack size rule">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PackSizeManager;
