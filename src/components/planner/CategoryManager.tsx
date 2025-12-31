import { useState } from "react";
import { Category, CategoryFeatures, DEFAULT_CATEGORY_FEATURES, ContentTemplate } from "@/types/planner";
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
import { Settings, Trash2, Pencil, GripVertical, Plus, ChevronDown, ChevronUp, LayoutTemplate } from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ColorPicker } from "./ColorPicker";
import { cn } from "@/lib/utils";

interface CategoryManagerProps {
  categories: Category[];
  templates: ContentTemplate[];
  onAddCategory: (name: string, color: string, features?: CategoryFeatures, defaultTemplateId?: string, secondaryTemplateId?: string) => void;
  onUpdateCategory: (id: string, name: string, color: string, features?: CategoryFeatures, defaultTemplateId?: string, secondaryTemplateId?: string) => void;
  onDeleteCategory: (id: string) => void;
  onReorderCategories?: (categories: Category[]) => void;
}

const FEATURE_LABELS: Record<keyof CategoryFeatures, string> = {
  notes: "Note",
  pipeline: "Pipeline",
  checklist: "Checklist",
  priority: "Priorità",
  contentType: "Tipo Contenuto",
  linkedContent: "Contenuto Collegato",
};

export const CategoryManager = ({
  categories,
  templates,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
}: CategoryManagerProps) => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("210 100% 50%");
  const [features, setFeatures] = useState<CategoryFeatures>({ ...DEFAULT_CATEGORY_FEATURES });
  const [defaultTemplateId, setDefaultTemplateId] = useState<string | undefined>();
  const [secondaryTemplateId, setSecondaryTemplateId] = useState<string | undefined>();
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setColor(category.color);
    setFeatures(category.features || { ...DEFAULT_CATEGORY_FEATURES });
    setDefaultTemplateId(category.defaultTemplateId);
    setSecondaryTemplateId(category.secondaryTemplateId);
    setFeaturesOpen(false);
    setTemplatesOpen(false);
  };

  const handleStartAdd = () => {
    setEditingId(null);
    setName("");
    setColor("210 100% 50%");
    setFeatures({ ...DEFAULT_CATEGORY_FEATURES });
    setDefaultTemplateId(undefined);
    setSecondaryTemplateId(undefined);
    setFeaturesOpen(false);
    setTemplatesOpen(false);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    
    if (editingId) {
      onUpdateCategory(editingId, name.trim(), color, features, defaultTemplateId, secondaryTemplateId);
    } else {
      onAddCategory(name.trim(), color, features, defaultTemplateId, secondaryTemplateId);
    }
    
    setEditingId(null);
    setName("");
    setColor("210 100% 50%");
    setFeatures({ ...DEFAULT_CATEGORY_FEATURES });
    setDefaultTemplateId(undefined);
    setSecondaryTemplateId(undefined);
    setFeaturesOpen(false);
    setTemplatesOpen(false);
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

  const handleQuickFeatureToggle = (categoryId: string, featureKey: keyof CategoryFeatures, currentValue: boolean) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const updatedFeatures = {
      ...(category.features || DEFAULT_CATEGORY_FEATURES),
      [featureKey]: !currentValue,
    };
    onUpdateCategory(categoryId, category.name, category.color, updatedFeatures);
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
        <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Gestione Categorie</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {/* Add/Edit Form */}
            <div className="border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {editingId ? "Modifica Categoria" : "Nuova Categoria"}
              </h3>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
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
                
                {/* Features Toggle Section */}
                <Collapsible open={featuresOpen} onOpenChange={setFeaturesOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between text-sm">
                      <span>Feature abilitate</span>
                      {featuresOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg">
                      {(Object.keys(FEATURE_LABELS) as (keyof CategoryFeatures)[]).map((featureKey) => (
                        <div key={featureKey} className="flex items-center justify-between">
                          <Label className="text-sm font-normal">{FEATURE_LABELS[featureKey]}</Label>
                          <Switch
                            checked={features[featureKey]}
                            onCheckedChange={(checked) =>
                              setFeatures((prev) => ({ ...prev, [featureKey]: checked }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Templates Section */}
                <Collapsible open={templatesOpen} onOpenChange={setTemplatesOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <LayoutTemplate className="h-4 w-4" />
                        Template di categoria
                      </span>
                      {templatesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2">
                    <div className="grid gap-3 p-3 bg-muted/30 rounded-lg">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Template Primario (click su +)</Label>
                        <Select value={defaultTemplateId || "none"} onValueChange={(v) => setDefaultTemplateId(v === "none" ? undefined : v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Nessun template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nessun template</SelectItem>
                            {templates.map((t) => (
                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Template Secondario (tieni 2 + click)</Label>
                        <Select value={secondaryTemplateId || "none"} onValueChange={(v) => setSecondaryTemplateId(v === "none" ? undefined : v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Nessun template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nessun template</SelectItem>
                            {templates.map((t) => (
                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
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
                  (trascina per riordinare, espandi per feature)
                </span>
              </h3>
              <div className="space-y-2">
                {categories.map((cat) => {
                  const catFeatures = cat.features || DEFAULT_CATEGORY_FEATURES;
                  const isExpanded = expandedCategoryId === cat.id;
                  
                  return (
                    <div key={cat.id} className="space-y-0">
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, cat.id)}
                        onDragOver={(e) => handleDragOver(e, cat.id)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-move",
                          draggedId === cat.id && "opacity-50 ring-2 ring-primary",
                          isExpanded && "rounded-b-none"
                        )}
                        style={{
                          borderLeftWidth: "4px",
                          borderLeftColor: `hsl(${cat.color})`,
                        }}
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div
                          className="w-6 h-6 rounded flex-shrink-0"
                          style={{ backgroundColor: `hsl(${cat.color})` }}
                        />
                        <span className="flex-1 font-medium text-sm">{cat.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleStartEdit(cat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleDeleteClick(cat.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      
                      {/* Expanded Features Section */}
                      {isExpanded && (
                        <div 
                          className="border border-t-0 border-border rounded-b-lg p-3 bg-muted/20"
                          style={{ borderLeftWidth: "4px", borderLeftColor: `hsl(${cat.color})` }}
                        >
                          <div className="grid grid-cols-3 gap-2">
                            {(Object.keys(FEATURE_LABELS) as (keyof CategoryFeatures)[]).map((featureKey) => (
                              <div key={featureKey} className="flex items-center justify-between bg-background rounded px-2 py-1.5">
                                <Label className="text-xs font-normal">{FEATURE_LABELS[featureKey]}</Label>
                                <Switch
                                  checked={catFeatures[featureKey]}
                                  onCheckedChange={() => handleQuickFeatureToggle(cat.id, featureKey, catFeatures[featureKey])}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
