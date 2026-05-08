import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/data/products";
import { normalizeCategoryName } from "@/lib/categoryNormalization";

const PRODUCTS_CACHE_TTL_MS = 30_000;
type ProductRow = {
  id: string;
  name: string;
  brand: string;
  category: string;
  sizes: string[] | null;
  image_url: string | null;
  description: string | null;
};

let cachedProducts: Product[] | null = null;
let cachedAt = 0;
let inFlightRequest: Promise<Product[]> | null = null;

const mapRowsToProducts = (rows: ProductRow[]): Product[] =>
  rows.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: normalizeCategoryName(p.category),
    sizes: p.sizes || [],
    image: p.image_url || "",
    description: p.description || "",
  }));

const fetchProductsFromDb = async (): Promise<Product[]> => {
  const withSort = await supabase
    .from("products")
    .select("id,name,brand,category,sizes,image_url,description")
    .order("brand", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const missingSortOrder = withSort.error?.message.toLowerCase().includes("sort_order");
  const { data, error } = missingSortOrder
    ? await supabase
        .from("products")
        .select("id,name,brand,category,sizes,image_url,description")
        .order("brand", { ascending: true })
        .order("created_at", { ascending: true })
    : withSort;

  if (error) {
    throw error;
  }
  return mapRowsToProducts((data ?? []) as ProductRow[]);
};

const getProducts = async (forceRefresh = false): Promise<Product[]> => {
  const now = Date.now();
  if (!forceRefresh && cachedProducts && now - cachedAt < PRODUCTS_CACHE_TTL_MS) {
    return cachedProducts;
  }
  if (!forceRefresh && inFlightRequest) {
    return inFlightRequest;
  }

  inFlightRequest = fetchProductsFromDb()
    .then((products) => {
      cachedProducts = products;
      cachedAt = Date.now();
      return products;
    })
    .finally(() => {
      inFlightRequest = null;
    });

  return inFlightRequest;
};

export function useDbProducts() {
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async (forceRefresh = false) => {
    try {
      const products = await getProducts(forceRefresh);
      setDbProducts(products);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(false);
    const channel = supabase
      .channel(`products-changes-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        void fetchProducts(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  return { dbProducts, loading };
}
