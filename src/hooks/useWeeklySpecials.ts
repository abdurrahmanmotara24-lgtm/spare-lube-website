import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { WeeklySpecial, WeeklySpecialHeader } from "@/types/weeklySpecials";

type WeeklySpecialRow = {
  id: string;
  product_id: string;
  special_price: number;
  original_price: number | null;
  header_label: WeeklySpecialHeader;
  is_active: boolean;
  sort_order: number;
  custom_description: string | null;
  products: {
    id: string;
    name: string;
    image_url: string | null;
  } | null;
};

const mapRowToSpecial = (row: WeeklySpecialRow): WeeklySpecial | null => {
  if (!row.products) return null;
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.products.name,
    productImage: row.products.image_url ?? "",
    specialPrice: Number(row.special_price),
    originalPrice: row.original_price === null ? null : Number(row.original_price),
    headerLabel: row.header_label,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    customDescription: row.custom_description,
  };
};

export function useWeeklySpecials(activeOnly = false) {
  const [weeklySpecials, setWeeklySpecials] = useState<WeeklySpecial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklySpecials = useCallback(async () => {
    setError(null);
    const query = supabase
      .from("weekly_specials")
      .select("id, product_id, special_price, original_price, header_label, is_active, sort_order, custom_description, products(id, name, image_url)")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    const { data, error: fetchError } = activeOnly ? await query.eq("is_active", true) : await query;
    if (fetchError) {
      setError(fetchError.message);
      setWeeklySpecials([]);
      setLoading(false);
      return;
    }
    const mapped = (data ?? [])
      .map((row) => mapRowToSpecial(row as WeeklySpecialRow))
      .filter(Boolean) as WeeklySpecial[];
    setWeeklySpecials(mapped);
    setLoading(false);
  }, [activeOnly]);

  useEffect(() => {
    fetchWeeklySpecials();
    const channel = supabase
      .channel(`weekly-specials-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "weekly_specials" }, () => {
        fetchWeeklySpecials();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchWeeklySpecials();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWeeklySpecials]);

  return { weeklySpecials, loading, error, refreshWeeklySpecials: fetchWeeklySpecials };
}
