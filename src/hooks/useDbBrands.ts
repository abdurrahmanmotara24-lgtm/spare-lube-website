import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DbBrand {
  id: string;
  name: string;
  image_url: string | null;
  logo: string | null;
  sort_order: number;
  theme_primary_color: string | null;
  theme_accent_color: string | null;
  theme_button_color: string | null;
  theme_button_foreground_color: string | null;
}

export function useDbBrands() {
  const [brands, setBrands] = useState<DbBrand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = useCallback(async () => {
    const { data } = await supabase
      .from("brands")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (data) setBrands(data as DbBrand[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBrands();
    const channel = supabase
      .channel(`brands-changes-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "brands" }, () => {
        fetchBrands();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBrands]);

  return { brands, loading, refetch: fetchBrands };
}
