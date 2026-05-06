import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PageContent {
  id: "home" | "about" | "contact" | "operating_hours";
  eyebrow: string;
  heading: string;
  subheading: string;
  body_paragraph_1: string | null;
  body_paragraph_2: string | null;
  body_paragraph_3: string | null;
}

export function usePageContent(pageId: PageContent["id"], defaults: PageContent) {
  const [content, setContent] = useState<PageContent>(defaults);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    const { data } = await supabase
      .from("page_content")
      .select("*")
      .eq("id", pageId)
      .maybeSingle();
    setContent(data ? { ...defaults, ...(data as PageContent) } : defaults);
    setLoading(false);
  }, [defaults, pageId]);

  useEffect(() => {
    fetchContent();
    const channel = supabase
      .channel(`page-content-${pageId}-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "page_content" }, () => {
        fetchContent();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchContent, pageId]);

  return { content, loading, refreshPageContent: fetchContent };
}

