import { useState } from "react";
import { ShortsPreset, ContentTemplate, Category } from "@/types/planner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Clapperboard, X } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface ShortsPresetManagerProps {
  presets: ShortsPreset[];
  templates: ContentTemplate[];
  categories: Category[];
  onAddPreset: (preset: ShortsPreset) => void;
  onUpdatePreset: (preset: ShortsPreset) => void;
  onDeletePreset: (id: string) => void;
}

const createDefaultPreset = (): Omit<ShortsPreset, "id"> => ({
  name: "",
  shortsCount: 2,
  offsets: [1, 2],
  titleRule: "-Short {i}: {parent_title}",
});

export const ShortsPresetManager = ({
  presets,
  templates,
  categories,
  onAddPreset,
  onUpdatePreset,
  onDeletePreset,
}: ShortsPresetManagerProps) => {
  const [open, setOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<ShortsPreset | null>(null);
  const [formData, setFormData] = useState<Omit<ShortsPreset, "id">>(createDefaultPreset());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<string | null>(null);

  const handleStartAdd = () => {
    setEditingPreset(null);
    setFormData(createDefaultPreset());
    setOpen(true);
  };

  const handleStartEdit = (preset: ShortsPreset) => {
    setEditingPreset(preset);
    setFormData({
      name: preset.name,
      shortsCount: preset.shortsCount,
      offsets: [...preset.offsets],
      shortTemplateId: preset.shortTemplateId,
      shortCategoryId: preset.shortCategoryId,
      titleRule: preset.titleRule,
      defaultTime: preset.defaultTime,
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (editingPreset) {
      onUpdatePreset({
        ...formData,
        id: editingPreset.id,
      });
    } else {
      onAddPreset({
        ...formData,
        id: `preset-${Date.now()}`,
      });
    }
    setOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setPresetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (presetToDelete) {
      onDeletePreset(presetToDelete);
    }
    setDeleteDialogOpen(false);
    setPresetToDelete(null);
  };

  const handleShortsCountChange = (count: number) => {
    const newOffsets = Array.from({ length: count }, (_, i) => i + 1);
    setFormData({
      ...formData,
      shortsCount: count,
      offsets: newOffsets,
    });
  };

  const handleOffsetChange = (index: number, value: number) => {
    const newOffsets = [...formData.offsets];
    newOffsets[index] = value;
    setFormData({ ...formData, offsets: newOffsets });
  };

  const shortTemplates = templates.filter((t) => t.contentType === "short");

  return (
    <>
      <Button variant="outline" onClick={() => setListOpen(true)} className="gap-2">
        <Clapperboard className="h-4 w-4" />
        Shorts Preset
        {presets.length > 0 && (
          <Badge variant="secondary" className="ml-1">
            {presets.length}
          </Badge>
        )}
      </Button>

      {/* Presets List Dialog */}
      <Dialog open={listOpen} onOpenChange={setListOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Shorts Preset</span>
              <Button size="sm" onClick={handleStartAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                Nuovo Preset
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {presets.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-muted-foreground">
                  Nessun preset configurato.
                </p>
                <p className="text-sm text-muted-foreground">
                  Crea un preset per generare automaticamente shorts quando crei
                  un video.
                </p>
              </div>
            ) : (
              presets.map((preset) => {
                const category = categories.find(
                  (c) => c.id === preset.shortCategoryId
                );
                return (
                  <div
                    key={preset.id}
                    className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{preset.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {preset.shortsCount} shorts • Giorni:{" "}
                        {preset.offsets.join(", ")}
                        {category && (
                          <>
                            {" "}
                            • Categoria:{" "}
                            <span
                              className="font-medium"
                              style={{ color: `hsl(${category.color})` }}
                            >
                              {category.name}
                            </span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {preset.titleRule}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStartEdit(preset)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(preset.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Preset Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPreset ? "Modifica Preset" : "Nuovo Shorts Preset"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Preset</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="es. 2 shorts in 2 giorni"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Numero Shorts</Label>
                <Select
                  value={formData.shortsCount.toString()}
                  onValueChange={(v) => handleShortsCountChange(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} short{n > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Orario Default</Label>
                <Input
                  type="time"
                  value={formData.defaultTime || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Offset Giorni (rispetto al video padre)</Label>
              <div className="flex flex-wrap gap-2">
                {formData.offsets.map((offset, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1"
                  >
                    <span className="text-xs text-muted-foreground">
                      Short {index + 1}:
                    </span>
                    <Input
                      type="number"
                      min={0}
                      value={offset}
                      onChange={(e) =>
                        handleOffsetChange(index, parseInt(e.target.value) || 0)
                      }
                      className="w-16 h-7 text-center"
                    />
                    <span className="text-xs text-muted-foreground">giorni</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                +1 = giorno dopo il video, +2 = due giorni dopo, ecc.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria Shorts</Label>
                <Select
                  value={formData.shortCategoryId || "inherit"}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      shortCategoryId: v === "inherit" ? undefined : v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Eredita dal video" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Eredita dal video</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: `hsl(${cat.color})` }}
                          />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Template Short</Label>
                <Select
                  value={formData.shortTemplateId || "none"}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      shortTemplateId: v === "none" ? undefined : v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nessuno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessuno</SelectItem>
                    {shortTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Regola Titolo</Label>
              <Input
                value={formData.titleRule}
                onChange={(e) =>
                  setFormData({ ...formData, titleRule: e.target.value })
                }
                placeholder="-Short {i}: {parent_title}"
              />
              <p className="text-xs text-muted-foreground">
                Placeholder: {"{i}"} = numero short, {"{parent_title}"} = titolo
                video
              </p>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-3 bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Anteprima (se video = "Minecraft Ep. 10")
              </p>
              <div className="space-y-1">
                {formData.offsets.map((offset, i) => (
                  <div
                    key={i}
                    className="text-sm flex items-center justify-between"
                  >
                    <span>
                      {formData.titleRule
                        .replace("{i}", (i + 1).toString())
                        .replace("{parent_title}", "Minecraft Ep. 10")}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      +{offset} giorni
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave}>
              {editingPreset ? "Salva" : "Crea Preset"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Preset</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo preset?
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
