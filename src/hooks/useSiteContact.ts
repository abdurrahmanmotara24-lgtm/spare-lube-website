import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteContact {
  id: string;
  phone: string;
  whatsapp_phone: string;
  email: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  map_url: string | null;
  contact_blurb: string | null;
}

export const DEFAULT_SITE_CONTACT: SiteContact = {
  id: "main",
  phone: "+27000000000",
  whatsapp_phone: "27000000000",
  email: "sales@sparelube.co.za",
  address_line_1: "Spare Lube Distribution Centre",
  address_line_2: null,
  city: "Johannesburg",
  map_url: "https://maps.google.com",
  contact_blurb:
    "Ready to place an order or need product guidance? Reach out and our team will assist.",
};

export function useSiteContact() {
  const [contact, setContact] = useState<SiteContact>(DEFAULT_SITE_CONTACT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContact = useCallback(async () => {
    setError(null);
    const { data, error: fetchError } = await supabase
      .from("site_contact")
      .select("*")
      .eq("id", "main")
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    if (data) {
      setContact({ ...DEFAULT_SITE_CONTACT, ...data });
    } else {
      setContact(DEFAULT_SITE_CONTACT);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContact();
    const channel = supabase
      .channel(`site-contact-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "site_contact" }, () => {
        fetchContact();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchContact]);

  return { contact, loading, error, refreshContact: fetchContact };
}

