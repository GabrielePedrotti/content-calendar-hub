import { useState } from "react";
import { Category } from "@/types/planner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Plus, Trash2, Pencil } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (name: string, color: string) => void;
  onUpdateCategory: (id: string, name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoryManager = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagerProps) => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("210 100% 50%");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setColor(category.color);
  };

  const handleStartAdd = () => {
    setEditingId(null);
    setName("");
    setColor("210 100% 50%");
  };

  const handleSave = () => {
    if (!name.trim()) return;
    
    if (editingId) {
      onUpdateCategory(editingId, name.trim(), color);
    } else {
      onAddCategory(name.trim(), color);
    }
    
    setEditingId(null);
    setName("");
    setColor("210 100% 50%");
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete);
    }
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Settings className="h-4 w-4" />
        Gestisci Categorie
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gestione Categorie</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Add/Edit Form */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">
                {editingId ? "Modifica Categoria" : "Nuova Categoria"}
              </h3>
              <div className="grid gap-3">
                <div>
                  <Label htmlFor="cat-name">Nome</Label>
                  <Input
                    id="cat-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="es. CHRONICLES"
                  />
                </div>
                <div>
                  <Label htmlFor="cat-color">Colore (HSL)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cat-color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="142 76% 45%"
                    />
                    <div
                      className="w-12 h-10 rounded border border-border flex-shrink-0"
                      style={{ backgroundColor: `hsl(${color})` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formato: "HUE SAT% LIGHT%" (es. 142 76% 45%)
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  {editingId ? "Salva Modifiche" : "Aggiungi Categoria"}
                </Button>
                {editingId && (
                  <Button variant="outline" onClick={handleStartAdd}>
                    Annulla
                  </Button>
                )}
              </div>
            </div>

            {/* Categories List */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Categorie Esistenti</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-3 p-3 rounded border border-border hover:bg-muted/50"
                  >
                    <div
                      className="w-6 h-6 rounded flex-shrink-0"
                      style={{ backgroundColor: `hsl(${cat.color})` }}
                    />
                    <span className="flex-1 font-medium">{cat.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStartEdit(cat)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(cat.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa categoria? Tutti i contenuti
              associati verranno eliminati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
