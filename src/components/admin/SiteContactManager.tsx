import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_SITE_CONTACT, type SiteContact } from "@/hooks/useSiteContact";

const SiteContactManager = () => {
  const { toast } = useToast();
  const [draft, setDraft] = useState<SiteContact>(DEFAULT_SITE_CONTACT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_contact").select("*").eq("id", "main").maybeSingle();
      if (data) {
        setDraft({ ...DEFAULT_SITE_CONTACT, ...(data as SiteContact) });
      }
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_contact").upsert(
      {
        id: "main",
        whatsapp_phone: draft.whatsapp_phone,
        phone: draft.phone,
        email: draft.email,
        address_line_1: draft.address_line_1,
        address_line_2: draft.address_line_2,
        city: draft.city,
        map_url: draft.map_url,
        contact_blurb: draft.contact_blurb,
      },
      { onConflict: "id" },
    );
    setSaving(false);
    if (error) {
      toast({ title: "Could not save contact settings", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Contact settings saved" });
  };

  return (
    <section className="bg-card border border-border rounded-xl p-6 mb-10">
      <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Main Contact Channels</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="admin-whatsapp-phone">WhatsApp number for Order List</Label>
          <Input
            id="admin-whatsapp-phone"
            value={draft.whatsapp_phone}
            onChange={(e) => setDraft((prev) => ({ ...prev, whatsapp_phone: e.target.value }))}
            placeholder="e.g. 27685566344"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This number is used when customers send their order list via WhatsApp.
          </p>
        </div>
        <div>
          <Label htmlFor="admin-phone">Phone number</Label>
          <Input
            id="admin-phone"
            value={draft.phone}
            onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="e.g. +27 73 170 9975"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button size="sm" onClick={() => void save()} disabled={saving}>
          {saving ? "Saving..." : "Save contact channels"}
        </Button>
      </div>
    </section>
  );
};

export default SiteContactManager;

