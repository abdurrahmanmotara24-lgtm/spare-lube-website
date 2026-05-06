import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type { OperatingHour } from "@/hooks/useOperatingHours";

const OperatingHoursManager = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<OperatingHour[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = async () => {
    const { data } = await supabase
      .from("operating_hours")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("day_of_week", { ascending: true });
    setRows((data as OperatingHour[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const updateRow = (id: string, patch: Partial<OperatingHour>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const saveRow = async (row: OperatingHour) => {
    const { error } = await supabase
      .from("operating_hours")
      .update({
        label: row.label,
        is_open: row.is_open,
        open_time: row.is_open ? row.open_time : null,
        close_time: row.is_open ? row.close_time : null,
        notes: row.notes,
        sort_order: row.sort_order,
      })
      .eq("id", row.id);
    if (error) {
      toast({ title: "Could not save hours", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `${row.label} updated` });
    fetchRows();
  };

  return (
    <section className="bg-card border border-border rounded-xl p-6 mb-10">
      <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Operating Hours</h2>
      {loading ? <p className="text-sm text-muted-foreground">Loading hours...</p> : null}
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded-lg border border-border p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
              <div>
                <Label>Day label</Label>
                <Input value={row.label} onChange={(e) => updateRow(row.id, { label: e.target.value })} />
              </div>
              <div className="flex items-center gap-2 h-10">
                <Switch
                  checked={row.is_open}
                  onCheckedChange={(checked) => updateRow(row.id, { is_open: checked })}
                />
                <span className="text-sm text-muted-foreground">{row.is_open ? "Open" : "Closed"}</span>
              </div>
              <div>
                <Label>Open time</Label>
                <Input
                  type="time"
                  value={row.open_time ? row.open_time.slice(0, 5) : ""}
                  disabled={!row.is_open}
                  onChange={(e) => updateRow(row.id, { open_time: `${e.target.value}:00` })}
                />
              </div>
              <div>
                <Label>Close time</Label>
                <Input
                  type="time"
                  value={row.close_time ? row.close_time.slice(0, 5) : ""}
                  disabled={!row.is_open}
                  onChange={(e) => updateRow(row.id, { close_time: `${e.target.value}:00` })}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Input value={row.notes ?? ""} onChange={(e) => updateRow(row.id, { notes: e.target.value })} />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => void saveRow(row)}>
                Save day
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OperatingHoursManager;

