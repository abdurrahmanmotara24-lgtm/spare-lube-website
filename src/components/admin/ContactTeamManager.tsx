import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type ContactRow = {
  id: string;
  name: string;
  title: string;
  phone: string;
  sort_order: number;
};

const ContactTeamManager = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = async () => {
    const { data } = await supabase
      .from("contact_team")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    setRows((data as ContactRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const updateField = (id: string, key: keyof ContactRow, value: string | number) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const saveRow = async (row: ContactRow) => {
    const { error } = await supabase
      .from("contact_team")
      .update({
        name: row.name,
        title: row.title,
        phone: row.phone,
        sort_order: row.sort_order,
      })
      .eq("id", row.id);
    if (error) {
      toast({ title: "Could not save contact", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Contact updated" });
    fetchRows();
  };

  const addRow = async () => {
    const nextSort = rows.reduce((max, row) => Math.max(max, row.sort_order), 0) + 1;
    const { error } = await supabase.from("contact_team").insert({
      name: "New Contact",
      title: "Sales Rep",
      phone: "000 000 0000",
      sort_order: nextSort,
    });
    if (error) {
      toast({ title: "Could not add contact", description: error.message, variant: "destructive" });
      return;
    }
    fetchRows();
  };

  const removeRow = async (id: string) => {
    const { error } = await supabase.from("contact_team").delete().eq("id", id);
    if (error) {
      toast({ title: "Could not remove contact", description: error.message, variant: "destructive" });
      return;
    }
    fetchRows();
  };

  return (
    <section className="bg-card border border-border rounded-xl p-6 mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">Contact Team</h2>
        <Button size="sm" onClick={() => void addRow()}>
          <Plus className="h-4 w-4 mr-1" /> Add Contact
        </Button>
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Loading contacts...</p> : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded-lg border border-border p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Name</Label>
                <Input value={row.name} onChange={(e) => updateField(row.id, "name", e.target.value)} />
              </div>
              <div>
                <Label>Title</Label>
                <Input value={row.title} onChange={(e) => updateField(row.id, "title", e.target.value)} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={row.phone} onChange={(e) => updateField(row.id, "phone", e.target.value)} />
              </div>
              <div>
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={row.sort_order}
                  onChange={(e) => updateField(row.id, "sort_order", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => void saveRow(row)}>Save</Button>
              <Button variant="destructive" size="sm" onClick={() => void removeRow(row.id)}>
                <Trash2 className="h-4 w-4 mr-1" /> Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContactTeamManager;

