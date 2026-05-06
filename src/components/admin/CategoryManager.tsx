import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Pencil, Check, X, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDbCategories } from "@/hooks/useDbCategories";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CategoryManager = () => {
  const { toast } = useToast();
  const { categories } = useDbCategories();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSubmitting(true);
    const nextOrder = (categories[categories.length - 1]?.sort_order ?? 0) + 1;
    const { error } = await supabase
      .from("categories")
      .insert({ name: newName.trim(), sort_order: nextOrder });
    if (error) {
      toast({ title: "Error adding category", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Category added" });
      setNewName("");
    }
    setSubmitting(false);
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    const { error } = await supabase
      .from("categories")
      .update({ name: editName.trim() })
      .eq("id", id);
    if (error) {
      toast({ title: "Error updating", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Category updated" });
      cancelEdit();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Category deleted" });
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-10">
      <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Tag className="h-5 w-5" /> Manage Categories
      </h2>

      {/* Add */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Label htmlFor="new-cat" className="sr-only">New category</Label>
          <Input
            id="new-cat"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name (e.g. Filters)"
          />
        </div>
        <Button type="submit" disabled={submitting || !newName.trim()}>
          <Plus className="h-4 w-4 mr-1" /> Add Category
        </Button>
      </form>

      {/* List */}
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">No categories yet. Add one above.</p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background"
            >
              {editingId === cat.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button size="icon" variant="default" onClick={() => saveEdit(cat.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={cancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-foreground">{cat.name}</span>
                  <Button size="icon" variant="outline" onClick={() => startEdit(cat.id, cat.name)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{cat.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the category. Existing products keeping this category name will still display, but it won't appear in the dropdown anymore.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(cat.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
