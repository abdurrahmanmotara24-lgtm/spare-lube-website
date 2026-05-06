import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DbSize {
  id: string;
  name: string;
  sort_order: number;
}

export function useDbSizes() {
  const [sizes, setSizes] = useState<DbSize[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSizes = useCallback(async () => {
    const { data } = await supabase
      .from("sizes")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setSizes(data as DbSize[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSizes();

    const channel = supabase
      .channel(`sizes-changes-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sizes",
        },
        (payload) => {
          console.log("Sizes updated:", payload);
          fetchSizes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSizes]);

  return { sizes, loading, refetch: fetchSizes };
}
