import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ContactTeamMember {
  id: string;
  name: string;
  title: string;
  phone: string;
  sort_order: number;
}

const DEFAULT_CONTACTS: ContactTeamMember[] = [
  { id: "default-1", name: "Mazhar", title: "Sales Manager", phone: "073 170 9975", sort_order: 1 },
  { id: "default-2", name: "Shahed", title: "Sales Rep", phone: "068 556 6344", sort_order: 2 },
  { id: "default-3", name: "Shiraz", title: "Sales Rep", phone: "084 068 0981", sort_order: 3 },
];

export function useContactTeam() {
  const [contacts, setContacts] = useState<ContactTeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    const { data } = await supabase
      .from("contact_team")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    setContacts((data as ContactTeamMember[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContacts();
    const channel = supabase
      .channel(`contact-team-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_team" }, () => {
        fetchContacts();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchContacts]);

  return {
    contacts: contacts.length > 0 ? contacts : DEFAULT_CONTACTS,
    loading,
    refreshContactTeam: fetchContacts,
  };
}

