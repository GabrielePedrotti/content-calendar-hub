import { useState } from "react";
import { Series, ContentTemplate } from "@/types/planner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  CalendarDays,
  Plus,
  Trash2,
  Pencil,
  Repeat,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";
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

interface SeriesManagerProps {
  series: Series[];
  templates: ContentTemplate[];
  onAddSeries: (series: Series) => void;
  onUpdateSeries: (series: Series) => void;
  onDeleteSeries: (id: string) => void;
  onGenerateOccurrences: (seriesId: string) => void;
}

const PATTERN_LABELS: Record<Series["pattern"], string> = {
  daily: "Giornaliero",
  weekdays: "Giorni feriali",
  weekly: "Settimanale",
  biweekly: "Ogni 2 settimane",
  monthly: "Mensile",
};

const createDefaultSeries = (): Omit<Series, "id"> => ({
  name: "",
  templateId: "",
  pattern: "weekly",
  startDate: new Date(),
  options: {
    skipWeekends: false,
    avoidConflicts: false,
    titlePattern: "{series_name} Ep. {n}",
  },
  isActive: true,
  currentNumber: 1,
});

export const SeriesManager = ({
  series,
  templates,
  onAddSeries,
  onUpdateSeries,
  onDeleteSeries,
  onGenerateOccurrences,
}: SeriesManagerProps) => {
  const [open, setOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [formData, setFormData] = useState<Omit<Series, "id">>(createDefaultSeries());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<string | null>(null);

  const handleStartAdd = () => {
    setEditingSeries(null);
    setFormData(createDefaultSeries());
    setOpen(true);
  };

  const handleStartEdit = (s: Series) => {
    setEditingSeries(s);
    setFormData({
      name: s.name,
      templateId: s.templateId,
      pattern: s.pattern,
      startDate: s.startDate,
      endDate: s.endDate,
      occurrencesCount: s.occurrencesCount,
      options: { ...s.options },
      isActive: s.isActive,
      currentNumber: s.currentNumber,
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.templateId) return;

    if (editingSeries) {
      onUpdateSeries({
        ...formData,
        id: editingSeries.id,
      });
    } else {
      onAddSeries({
        ...formData,
        id: `series-${Date.now()}`,
      });
    }
    setOpen(false);
  };

  const handleToggleActive = (s: Series) => {
    onUpdateSeries({ ...s, isActive: !s.isActive });
  };

  const handleDeleteClick = (id: string) => {
    setSeriesToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (seriesToDelete) {
      onDeleteSeries(seriesToDelete);
    }
    setDeleteDialogOpen(false);
    setSeriesToDelete(null);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setListOpen(true)} className="gap-2">
        <Repeat className="h-4 w-4" />
        Serie
        {series.length > 0 && (
          <Badge variant="secondary" className="ml-1">
            {series.length}
          </Badge>
        )}
      </Button>

      {/* Series List Dialog */}
      <Dialog open={listOpen} onOpenChange={setListOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Gestione Serie</span>
              <Button size="sm" onClick={handleStartAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                Nuova Serie
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {series.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nessuna serie configurata. Crea una serie per generare contenuti
                ricorrenti automaticamente.
              </p>
            ) : (
              series.map((s) => {
                const template = templates.find((t) => t.id === s.templateId);
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border transition-colors",
                      s.isActive
                        ? "border-primary/30 bg-primary/5"
                        : "border-border opacity-60"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{s.name}</p>
                        {s.isActive ? (
                          <Badge variant="default" className="text-xs">
                            Attiva
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            In pausa
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {PATTERN_LABELS[s.pattern]} • Template:{" "}
                        {template?.name || "N/A"} • Ep. {s.currentNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Da {format(s.startDate, "d MMM yyyy", { locale: it })}
                        {s.endDate &&
                          ` a ${format(s.endDate, "d MMM yyyy", { locale: it })}`}
                        {s.occurrencesCount && ` (${s.occurrencesCount} episodi)`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(s)}
                        title={s.isActive ? "Metti in pausa" : "Riattiva"}
                      >
                        {s.isActive ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onGenerateOccurrences(s.id)}
                        title="Genera prossime occorrenze"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartEdit(s)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(s.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Series Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingSeries ? "Modifica Serie" : "Nuova Serie"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Serie</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="es. Minecraft Survival"
              />
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              <Select
                value={formData.templateId}
                onValueChange={(v) =>
                  setFormData({ ...formData, templateId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequenza</Label>
                <Select
                  value={formData.pattern}
                  onValueChange={(v) =>
                    setFormData({ ...formData, pattern: v as Series["pattern"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PATTERN_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Inizio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      {format(formData.startDate, "d MMM yyyy", { locale: it })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) =>
                        date && setFormData({ ...formData, startDate: date })
                      }
                      locale={it}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Fine (opzionale)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      {formData.endDate
                        ? format(formData.endDate, "d MMM yyyy", { locale: it })
                        : "Nessuna"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) =>
                        setFormData({ ...formData, endDate: date || undefined })
                      }
                      locale={it}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Numero Episodi (opzionale)</Label>
                <Input
                  type="number"
                  value={formData.occurrencesCount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      occurrencesCount: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="Illimitato"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pattern Titolo</Label>
              <Input
                value={formData.options.titlePattern || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    options: { ...formData.options, titlePattern: e.target.value },
                  })
                }
                placeholder="{series_name} Ep. {n}"
              />
              <p className="text-xs text-muted-foreground">
                Placeholder: {"{series_name}"}, {"{n}"}, {"{date}"}
              </p>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label>Salta weekend</Label>
                <Switch
                  checked={formData.options.skipWeekends}
                  onCheckedChange={(v) =>
                    setFormData({
                      ...formData,
                      options: { ...formData.options, skipWeekends: v },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Evita conflitti (sposta se occupato)</Label>
                <Switch
                  checked={formData.options.avoidConflicts}
                  onCheckedChange={(v) =>
                    setFormData({
                      ...formData,
                      options: { ...formData.options, avoidConflicts: v },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave}>
              {editingSeries ? "Salva" : "Crea Serie"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina Serie</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa serie? I contenuti già
              generati non saranno eliminati.
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
