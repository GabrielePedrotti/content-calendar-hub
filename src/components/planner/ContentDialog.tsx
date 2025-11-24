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
import { it } from "date-fns/locale";
import { Trash2, Link2, X } from "lucide-react";
import { LinkedContentSelector } from "./LinkedContentSelector";

interface ContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content?: ContentItem;
  categories: Category[];
  preselectedCategory?: string;
  preselectedDate?: Date;
  onSave: (content: Omit<ContentItem, "id"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  allContents: ContentItem[];
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
  allContents,
}: ContentDialogProps) => {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [published, setPublished] = useState(false);
  const [notes, setNotes] = useState("");
  const [linkedContentId, setLinkedContentId] = useState<string | undefined>();
  const [showLinkedSelector, setShowLinkedSelector] = useState(false);

  useEffect(() => {
    if (content) {
      setTitle(content.title);
      setCategoryId(content.categoryId);
      setDate(format(content.date, "yyyy-MM-dd"));
      setPublished(content.published);
      setNotes(content.notes || "");
      setLinkedContentId(content.linkedContentId);
    } else {
      setTitle("");
      setCategoryId(preselectedCategory || categories[0]?.id || "");
      setDate(preselectedDate ? format(preselectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
      setPublished(false);
      setNotes("");
      setLinkedContentId(undefined);
    }
  }, [content, preselectedCategory, preselectedDate, categories, open]);

  const linkedContent = linkedContentId 
    ? allContents.find((c) => c.id === linkedContentId) 
    : undefined;
  
  const linkedCategory = linkedContent
    ? categories.find((cat) => cat.id === linkedContent.categoryId)
    : undefined;

  const handleSave = () => {
    if (title && categoryId && date) {
      onSave({
        id: content?.id,
        title,
        categoryId,
        date: new Date(date),
        published,
        notes: notes || undefined,
        linkedContentId,
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

          <div className="grid gap-2">
            <Label>Contenuto Collegato</Label>
            {linkedContent ? (
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
                <Link2 className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {linkedContent.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {linkedCategory?.name} – {format(linkedContent.date, "d MMM yyyy", { locale: it })}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLinkedContentId(undefined)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowLinkedSelector(true)}
                className="justify-start"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Seleziona contenuto collegato
              </Button>
            )}
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

      <LinkedContentSelector
        open={showLinkedSelector}
        onOpenChange={setShowLinkedSelector}
        contents={allContents}
        categories={categories}
        currentContentId={content?.id}
        onSelect={setLinkedContentId}
      />
    </Dialog>
  );
};
