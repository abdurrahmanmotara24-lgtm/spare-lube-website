import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  useSiteSettings,
  applyThemeToDocument,
  DEFAULT_SETTINGS,
  type SiteSettings,
} from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Palette, RotateCcw, Save, Upload } from "lucide-react";

// Convert HSL string "0 85% 46%" -> "#rrggbb" for the color input
function hslStringToHex(hsl: string): string {
  const m = hsl.trim().match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!m) return "#000000";
  let h = parseFloat(m[1]);
  let s = parseFloat(m[2]) / 100;
  let l = parseFloat(m[3]) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m2 = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  const to = (v: number) => Math.round((v + m2) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

function hexToHslString(hex: string): string {
  const v = hex.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16) / 255;
  const g = parseInt(v.slice(2, 4), 16) / 255;
  const b = parseInt(v.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

const COLOR_FIELDS: Array<{ key: keyof SiteSettings; label: string }> = [
  { key: "primary_color", label: "Primary brand color" },
  { key: "secondary_color", label: "Secondary color" },
  { key: "accent_color", label: "Accent color" },
  { key: "button_color", label: "Button color" },
  { key: "button_foreground_color", label: "Button text color" },
  { key: "background_color", label: "Background (light sections)" },
  { key: "foreground_color", label: "Foreground (text)" },
];

const DesignSettings = () => {
  const { settings, refetch } = useSiteSettings();
  const { toast } = useToast();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Sync draft when remote settings load/change
  useEffect(() => { setDraft(settings); }, [settings]);

  // Live preview: apply draft to document as user edits
  useEffect(() => { applyThemeToDocument(draft); }, [draft]);

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleHeroUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `hero-${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("site-images").upload(path, file);
      if (error) throw error;
      const url = supabase.storage.from("site-images").getPublicUrl(path).data.publicUrl;
      update("hero_image_url", url);
      toast({ title: "Image uploaded", description: "Click Save to publish." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert({
        id: "main",
        primary_color: draft.primary_color,
        secondary_color: draft.secondary_color,
        accent_color: draft.accent_color,
        background_color: draft.background_color,
        foreground_color: draft.foreground_color,
        button_color: draft.button_color,
        button_foreground_color: draft.button_foreground_color,
        hero_image_url: draft.hero_image_url,
        hero_overlay_opacity: draft.hero_overlay_opacity,
        hero_eyebrow: draft.hero_eyebrow,
        hero_heading: draft.hero_heading,
        hero_subheading: draft.hero_subheading,
      }, { onConflict: "id" });
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Design settings saved" });
      refetch();
    }
  };

  const handleReset = () => {
    if (!confirm("Reset all design settings to defaults? This will clear hero overrides too.")) return;
    setDraft({ ...DEFAULT_SETTINGS });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-10">
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
          <Palette className="h-5 w-5" /> Design Settings
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" /> Reset to default
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      {/* Colors */}
      <h3 className="font-semibold text-sm text-foreground mb-3">Colors</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {COLOR_FIELDS.map((f) => {
          const value = draft[f.key] as string;
          return (
            <div key={f.key} className="flex items-center gap-3">
              <input
                type="color"
                value={hslStringToHex(value)}
                onChange={(e) => update(f.key as any, hexToHslString(e.target.value) as any)}
                className="h-10 w-14 rounded border border-input bg-background cursor-pointer"
                aria-label={f.label}
              />
              <div className="flex-1">
                <Label className="text-xs">{f.label}</Label>
                <Input
                  value={value}
                  onChange={(e) => update(f.key as any, e.target.value as any)}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Hero */}
      <h3 className="font-semibold text-sm text-foreground mb-3">Hero Section</h3>
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="hero-eyebrow">Eyebrow text</Label>
          <Input id="hero-eyebrow" value={draft.hero_eyebrow}
            onChange={(e) => update("hero_eyebrow", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="hero-heading">Heading</Label>
          <Textarea id="hero-heading" rows={2} value={draft.hero_heading}
            onChange={(e) => update("hero_heading", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="hero-sub">Subheading</Label>
          <Input id="hero-sub" value={draft.hero_subheading}
            onChange={(e) => update("hero_subheading", e.target.value)} />
        </div>
        <div>
          <Label>Hero background image</Label>
          <div className="flex items-center gap-3 mt-1">
            <label className="flex items-center gap-2 cursor-pointer px-4 h-10 rounded-md border border-input bg-background text-sm hover:bg-muted">
              <Upload className="h-4 w-4" />
              <span>{uploading ? "Uploading..." : "Upload new image"}</span>
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleHeroUpload(e.target.files[0])} />
            </label>
            {draft.hero_image_url && (
              <Button variant="ghost" size="sm" onClick={() => update("hero_image_url", "")}>Clear</Button>
            )}
          </div>
          {draft.hero_image_url && (
            <img src={draft.hero_image_url} alt="Hero preview"
              className="mt-3 h-32 w-full object-cover rounded-md border border-border" />
          )}
        </div>
        <div>
          <Label>Overlay darkness ({Math.round(draft.hero_overlay_opacity * 100)}%)</Label>
          <Slider
            value={[draft.hero_overlay_opacity * 100]}
            onValueChange={(v) => update("hero_overlay_opacity", (v[0] ?? 0) / 100)}
            min={0} max={100} step={5}
            className="mt-2"
          />
        </div>
      </div>

      {/* Live preview */}
      <h3 className="font-semibold text-sm text-foreground mb-3">Live Preview</h3>
      <div className="relative overflow-hidden rounded-lg border border-border h-48">
        {draft.hero_image_url ? (
          <img src={draft.hero_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, hsl(${draft.foreground_color} / ${draft.hero_overlay_opacity}), hsl(${draft.foreground_color} / ${draft.hero_overlay_opacity * 0.85}))`,
          }}
        />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-2"
            style={{ color: `hsl(${draft.primary_color})` }}>
            {draft.hero_eyebrow}
          </p>
          <p className="font-heading text-lg sm:text-2xl font-bold uppercase mb-2"
            style={{ color: `hsl(${draft.button_foreground_color})` }}>
            {draft.hero_heading}
          </p>
          <span
            className="inline-block px-4 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider"
            style={{
              background: `hsl(${draft.button_color})`,
              color: `hsl(${draft.button_foreground_color})`,
            }}
          >
            Browse Products
          </span>
        </div>
      </div>
    </div>
  );
};

export default DesignSettings;
