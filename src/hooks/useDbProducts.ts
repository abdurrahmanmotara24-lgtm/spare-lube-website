import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/data/products";
import { normalizeCategoryName } from "@/lib/categoryNormalization";

export function useDbProducts() {
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    const withSort = await supabase
      .from("products")
      .select("*")
      .order("brand", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    const missingSortOrder = withSort.error?.message.toLowerCase().includes("sort_order");
    const { data } = missingSortOrder
      ? await supabase
          .from("products")
          .select("*")
          .order("brand", { ascending: true })
          .order("created_at", { ascending: true })
      : withSort;

    if (data) {
      setDbProducts(
        data.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          category: normalizeCategoryName(p.category),
          sizes: p.sizes || [],
          image: p.image_url || "",
          description: p.description || "",
        })),
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
    const channel = supabase
      .channel(`products-changes-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  return { dbProducts, loading };
}
