import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDbSizes } from "@/hooks/useDbSizes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Pencil, Check, X, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SizeManager = () => {
  const { toast } = useToast();
  const { sizes, refetch } = useDbSizes();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const nextOrder = (sizes[sizes.length - 1]?.sort_order ?? 0) + 10;
    const { error } = await supabase.from("sizes").insert({ name, sort_order: nextOrder });
    if (error) {
      toast({ title: "Error adding size", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Size added" });
      setNewName("");
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this size from the library? Existing products keep their assigned sizes.")) return;
    const { error } = await supabase.from("sizes").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting size", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Size deleted" });
      refetch();
    }
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase.from("sizes").update({ name: editName.trim() }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Size updated" });
      setEditingId(null);
      refetch();
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-10">
      <h2 className="font-heading text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
        <Ruler className="h-5 w-5" /> Manage Sizes
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Global size library. Used in the product form and catalog filter.
      </p>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6 pb-6 border-b border-border">
        <div className="flex-1">
          <Label htmlFor="new-size" className="sr-only">New size</Label>
          <Input
            id="new-size"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. 1L, 5L, 200ml"
          />
        </div>
        <Button type="submit">
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </form>

      <h3 className="font-semibold text-sm text-foreground mb-3">Existing Sizes ({sizes.length})</h3>
      {sizes.length === 0 ? (
        <p className="text-muted-foreground text-sm">No sizes yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <div
              key={s.id}
              className="bg-background border border-border rounded-lg px-3 py-2 flex items-center gap-2"
            >
              {editingId === s.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-8 w-24"
                  />
                  <Button size="icon" variant="default" className="h-7 w-7" onClick={() => saveEdit(s.id)}>
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium text-foreground">{s.name}</span>
                  <button
                    onClick={() => {
                      setEditingId(s.id);
                      setEditName(s.name);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Edit size"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete size"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SizeManager;
