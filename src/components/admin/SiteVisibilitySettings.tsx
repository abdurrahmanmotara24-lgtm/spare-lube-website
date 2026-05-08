import { useState } from "react";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type VisibilityKey =
  | "show_about"
  | "show_contact"
  | "show_operating_hours"
  | "show_weekly_specials";

const VISIBILITY_FIELDS: Array<{ key: VisibilityKey; label: string; description: string }> = [
  { key: "show_about", label: "About page", description: "Shows About route and navigation links." },
  { key: "show_contact", label: "Contact page and section", description: "Shows Contact route, links, and home contact section." },
  { key: "show_operating_hours", label: "Operating Hours page", description: "Shows Operating Hours route and navigation links." },
  { key: "show_weekly_specials", label: "Weekly Specials section", description: "Shows weekly specials block and mobile quick-nav item." },
];

const SiteVisibilitySettings = () => {
  const { settings, refetch } = useSiteSettings();
  const { toast } = useToast();
  const [savingKeys, setSavingKeys] = useState<VisibilityKey[]>([]);

  const setSaving = (key: VisibilityKey, isSaving: boolean) => {
    setSavingKeys((prev) =>
      isSaving ? (prev.includes(key) ? prev : [...prev, key]) : prev.filter((item) => item !== key),
    );
  };

  const updateVisibility = async (key: VisibilityKey, checked: boolean) => {
    setSaving(key, true);
    const { error } = await supabase.from("site_settings").upsert(
      {
        id: "main",
        [key]: checked,
      },
      { onConflict: "id" },
    );
    setSaving(key, false);

    if (error) {
      toast({
        title: "Could not update visibility",
        description: error.message,
        variant: "destructive",
      });
      await refetch();
      return;
    }

    toast({ title: "Visibility updated" });
  };

  return (
    <section className="bg-card border border-border rounded-xl p-6 mb-10">
      <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Eye className="h-5 w-5" />
        Site Visibility
      </h2>
      <div className="space-y-4">
        {VISIBILITY_FIELDS.map((field) => {
          const checked = settings[field.key];
          const saving = savingKeys.includes(field.key);
          return (
            <div key={field.key} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <Label htmlFor={field.key} className="text-sm font-semibold text-foreground">
                    {field.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                </div>
                <Switch
                  id={field.key}
                  checked={checked}
                  disabled={saving}
                  onCheckedChange={(next) => void updateVisibility(field.key, next)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SiteVisibilitySettings;
