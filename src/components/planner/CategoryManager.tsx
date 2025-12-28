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
import { Settings, Trash2, Pencil, GripVertical, Plus } from "lucide-react";
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
import { ColorPicker } from "./ColorPicker";
import { cn } from "@/lib/utils";

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (name: string, color: string) => void;
  onUpdateCategory: (id: string, name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  onReorderCategories?: (categories: Category[]) => void;
}

export const CategoryManager = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
}: CategoryManagerProps) => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("210 100% 50%");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    
    const draggedIndex = categories.findIndex((c) => c.id === draggedId);
    const targetIndex = categories.findIndex((c) => c.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newCategories = [...categories];
    const [removed] = newCategories.splice(draggedIndex, 1);
    newCategories.splice(targetIndex, 0, removed);
    
    onReorderCategories?.(newCategories);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
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
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" />
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
                  <Label>Colore</Label>
                  <ColorPicker value={color} onChange={setColor} />
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
              <h3 className="font-semibold text-sm flex items-center gap-2">
                Categorie Esistenti
                <span className="text-xs text-muted-foreground font-normal">
                  (trascina per riordinare)
                </span>
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, cat.id)}
                    onDragOver={(e) => handleDragOver(e, cat.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-move",
                      draggedId === cat.id && "opacity-50 ring-2 ring-primary"
                    )}
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor: `hsl(${cat.color})`,
                    }}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div
                      className="w-8 h-8 rounded flex-shrink-0"
                      style={{ backgroundColor: `hsl(${cat.color})` }}
                    />
                    <span className="flex-1 font-medium">{cat.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {cat.color}
                    </span>
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
