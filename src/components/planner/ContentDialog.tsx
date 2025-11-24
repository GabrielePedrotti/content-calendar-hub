import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category, ContentItem } from "@/types/planner";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

interface ContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content?: ContentItem;
  categories: Category[];
  preselectedCategory?: string;
  preselectedDate?: Date;
  onSave: (content: Omit<ContentItem, "id"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

export const ContentDialog = ({
  open,
  onOpenChange,
  content,
  categories,
  preselectedCategory,
  preselectedDate,
  onSave,
  onDelete,
}: ContentDialogProps) => {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [published, setPublished] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (content) {
      setTitle(content.title);
      setCategoryId(content.categoryId);
      setDate(format(content.date, "yyyy-MM-dd"));
      setPublished(content.published);
      setNotes(content.notes || "");
    } else {
      setTitle("");
      setCategoryId(preselectedCategory || categories[0]?.id || "");
      setDate(preselectedDate ? format(preselectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
      setPublished(false);
      setNotes("");
    }
  }, [content, preselectedCategory, preselectedDate, categories, open]);

  const handleSave = () => {
    if (title && categoryId && date) {
      onSave({
        id: content?.id,
        title,
        categoryId,
        date: new Date(date),
        published,
        notes: notes || undefined,
      });
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (content && onDelete) {
      onDelete(content.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {content ? "Modifica Contenuto" : "Nuovo Contenuto"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Titolo</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="es. Outer Wilds 1"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="published"
              checked={published}
              onCheckedChange={(checked) => setPublished(checked as boolean)}
            />
            <Label
              htmlFor="published"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Pubblicato
            </Label>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Note (opzionale)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Aggiungi note..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          {content && onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Elimina
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleSave}>Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
