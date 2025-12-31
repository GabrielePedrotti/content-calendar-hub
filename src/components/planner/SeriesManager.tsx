import { useState } from "react";
import { Series, ContentTemplate, Category } from "@/types/planner";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Copy,
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
  categories: Category[];
  onAddSeries: (series: Series) => void;
  onUpdateSeries: (series: Series) => void;
  onDeleteSeries: (id: string) => void;
  onGenerateOccurrences: (seriesId: string) => void;
}

const PATTERN_LABELS: Record<Series["pattern"], string> = {
  daily: "Giornaliero",
  weekdays: "Giorni feriali (Lun-Ven)",
  weekly: "Settimanale",
  biweekly: "Ogni 2 settimane",
  monthly: "Mensile",
  custom: "Pattern personalizzato",
};

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

const createDefaultSeries = (): Omit<Series, "id"> => ({
  name: "",
  templateId: "",
  pattern: "weekly",
  customDays: [],
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
  categories,
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
      categoryId: s.categoryId,
      pattern: s.pattern,
      customDays: s.customDays || [],
      startDate: s.startDate,
      endDate: s.endDate,
      occurrencesCount: s.occurrencesCount,
      options: { ...s.options },
      isActive: s.isActive,
      currentNumber: s.currentNumber,
    });
    setOpen(true);
  };

  const handleDuplicate = (s: Series) => {
    const duplicated: Series = {
      ...s,
      id: `series-${Date.now()}`,
      name: `${s.name} (copia)`,
      currentNumber: 1,
    };
    onAddSeries(duplicated);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    // Validate custom pattern has at least one day selected
    if (formData.pattern === "custom" && (!formData.customDays || formData.customDays.length === 0)) {
      return;
    }

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

  const toggleCustomDay = (day: number) => {
    const current = formData.customDays || [];
    if (current.includes(day)) {
      setFormData({ ...formData, customDays: current.filter((d) => d !== day) });
    } else {
      setFormData({ ...formData, customDays: [...current, day].sort() });
    }
  };

  const getPatternDescription = (s: Series) => {
    if (s.pattern === "custom" && s.customDays && s.customDays.length > 0) {
      return s.customDays.map((d) => DAY_LABELS[d]).join(", ");
    }
    return PATTERN_LABELS[s.pattern];
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
        <DialogContent className="sm:max-w-[650px] h-[75vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-between">
              <span>Gestione Serie</span>
              <Button size="sm" onClick={handleStartAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                Nuova Serie
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {series.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-muted-foreground">
                  Nessuna serie configurata.
                </p>
                <p className="text-sm text-muted-foreground">
                  Crea una serie per generare contenuti ricorrenti automaticamente.
                </p>
              </div>
            ) : (
              series.map((s) => {
                const template = templates.find((t) => t.id === s.templateId);
                const category = categories.find((c) => c.id === s.categoryId);
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
                        {getPatternDescription(s)} • Template:{" "}
                        {template?.name || "N/A"} • Ep. {s.currentNumber}
                        {category && (
                          <>
                            {" "}•{" "}
                            <span style={{ color: `hsl(${category.color})` }}>
                              {category.name}
                            </span>
                          </>
                        )}
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
                        title="Genera prossima occorrenza"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicate(s)}
                        title="Duplica serie"
                      >
                        <Copy className="h-4 w-4" />
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
        <DialogContent className="sm:max-w-[550px] h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {editingSeries ? "Modifica Serie" : "Nuova Serie"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template</Label>
                <Select
                  value={formData.templateId || "none"}
                  onValueChange={(v) =>
                    setFormData({ ...formData, templateId: v === "none" ? "" : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessuno</SelectItem>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={formData.categoryId || "none"}
                  onValueChange={(v) =>
                    setFormData({ ...formData, categoryId: v === "none" ? undefined : v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Eredita da template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Eredita da template</SelectItem>
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
            </div>

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

            {/* Custom days selector */}
            {formData.pattern === "custom" && (
              <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                <Label>Giorni della settimana</Label>
                <div className="flex flex-wrap gap-2">
                  {DAY_LABELS.map((day, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant={formData.customDays?.includes(index) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCustomDay(index)}
                      className="w-12"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
                {formData.customDays && formData.customDays.length === 0 && (
                  <p className="text-xs text-destructive">
                    Seleziona almeno un giorno
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label>Numero Iniziale</Label>
                <Input
                  type="number"
                  value={formData.currentNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentNumber: parseInt(e.target.value) || 1,
                    })
                  }
                  min={1}
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

            {/* Preview */}
            {formData.name && (
              <div className="border rounded-lg p-3 bg-muted/30">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Anteprima titolo
                </p>
                <p className="text-sm">
                  {(formData.options.titlePattern || "{series_name} Ep. {n}")
                    .replace("{series_name}", formData.name)
                    .replace("{n}", formData.currentNumber.toString())
                    .replace("{date}", format(formData.startDate, "d MMM", { locale: it }))}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button 
              onClick={handleSave}
              disabled={formData.pattern === "custom" && (!formData.customDays || formData.customDays.length === 0)}
            >
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
