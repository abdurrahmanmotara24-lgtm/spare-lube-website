import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  foreground_color: string;
  button_color: string;
  button_foreground_color: string;
  hero_image_url: string | null;
  hero_overlay_opacity: number;
  hero_eyebrow: string;
  hero_heading: string;
  hero_subheading: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  id: "main",
  primary_color: "0 85% 46%",
  secondary_color: "0 0% 96%",
  accent_color: "45 100% 51%",
  background_color: "0 0% 100%",
  foreground_color: "0 0% 8%",
  button_color: "0 85% 46%",
  button_foreground_color: "0 0% 100%",
  hero_image_url: "",
  hero_overlay_opacity: 0.85,
  hero_eyebrow: "Trusted Wholesale Partner",
  hero_heading: "Wholesale Lubricants Supplier",
  hero_subheading: "Shell, Castrol, and More",
};

interface Ctx {
  settings: SiteSettings;
  loading: boolean;
  refetch: () => Promise<void>;
}

const SiteSettingsContext = createContext<Ctx>({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refetch: async () => {},
});

export function applyThemeToDocument(s: SiteSettings) {
  const root = document.documentElement;
  root.style.setProperty("--primary", s.primary_color);
  root.style.setProperty("--ring", s.primary_color);
  root.style.setProperty("--secondary", s.secondary_color);
  root.style.setProperty("--accent", s.accent_color);
  root.style.setProperty("--background", s.background_color);
  root.style.setProperty("--foreground", s.foreground_color);
  root.style.setProperty("--primary-foreground", s.button_foreground_color);
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "main")
      .maybeSingle();
    if (data) {
      const merged = { ...DEFAULT_SETTINGS, ...(data as any) };
      setSettings(merged);
      applyThemeToDocument(merged);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
    const channel = supabase
      .channel(`site-settings-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
        () => fetchSettings(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refetch: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export const useSiteSettings = () => useContext(SiteSettingsContext);
