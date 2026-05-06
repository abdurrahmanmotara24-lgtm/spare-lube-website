import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_PACK_RULES, makePackRulesMap, type PackSizeRules } from "@/lib/packSizes";

export interface PackSizeRuleRow {
  id: string;
  brand_id: string;
  size_id: string;
  units_per_pack: number;
  brands: { id: string; name: string } | null;
  sizes: { id: string; name: string } | null;
}

export function usePackSizeRules() {
  const [rules, setRules] = useState<PackSizeRules>(DEFAULT_PACK_RULES);
  const [loading, setLoading] = useState(true);
  const [tableAvailable, setTableAvailable] = useState(true);

  const fetchRules = useCallback(async () => {
    const { data, error } = await supabase
      .from("pack_size_rules")
      .select("id, brand_id, size_id, units_per_pack, brands(id, name), sizes(id, name)");

    if (error) {
      if (error.message.toLowerCase().includes("pack_size_rules")) {
        setTableAvailable(false);
      }
      setRules(DEFAULT_PACK_RULES);
      setLoading(false);
      return;
    }

    const mappedRows = (data as PackSizeRuleRow[] | null)?.flatMap((row) => {
      if (!row.brands?.name || !row.sizes?.name) return [];
      return [
        {
          brandId: row.brand_id,
          brandName: row.brands.name,
          sizeName: row.sizes.name,
          unitsPerPack: row.units_per_pack,
        },
      ];
    }) ?? [];

    const dbRules = makePackRulesMap(mappedRows);
    setRules(dbRules);
    setTableAvailable(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRules();
    const channel = supabase
      .channel(`pack-size-rules-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "pack_size_rules" }, fetchRules)
      .on("postgres_changes", { event: "*", schema: "public", table: "brands" }, fetchRules)
      .on("postgres_changes", { event: "*", schema: "public", table: "sizes" }, fetchRules)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRules]);

  return { rules, loading, tableAvailable, refetch: fetchRules };
}
