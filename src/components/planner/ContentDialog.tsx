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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Category,
  ContentItem,
  ContentTemplate,
  ShortsPreset,
  ChecklistItem,
  ContentType,
  Priority,
  CONTENT_TYPE_LABELS,
  PRIORITY_CONFIG,
  DEFAULT_PIPELINE_STAGES,
} from "@/types/planner";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Trash2, Link2, X, Clapperboard, Sparkles, ChevronRight, CalendarDays } from "lucide-react";
import { LinkedContentSelector } from "./LinkedContentSelector";
import { PipelineStepper } from "./PipelineStepper";
import { ChecklistEditor } from "./ChecklistEditor";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content?: ContentItem;
  categories: Category[];
  preselectedCategory?: string;
  preselectedDate?: Date;
  preselectedTemplateId?: string;
  onSave: (content: Omit<ContentItem, "id"> & { id?: string }, shortsPresetId?: string) => void;
  onDelete?: (id: string) => void;
  allContents: ContentItem[];
  templates?: ContentTemplate[];
  shortsPresets?: ShortsPreset[];
}

export const ContentDialog = ({
  open,
  onOpenChange,
  content,
  categories,
  preselectedCategory,
  preselectedDate,
  preselectedTemplateId,
  onSave,
  onDelete,
  allContents,
  templates = [],
  shortsPresets = [],
}: ContentDialogProps) => {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [published, setPublished] = useState(false);
  const [notes, setNotes] = useState("");
  const [linkedContentId, setLinkedContentId] = useState<string | undefined>();
  const [showLinkedSelector, setShowLinkedSelector] = useState(false);

  // New fields
  const [contentType, setContentType] = useState<ContentType>("video");
  const [priority, setPriority] = useState<Priority>("medium");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [pipelineStageId, setPipelineStageId] = useState<string>("");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  
  // Shorts generation
  const [generateShorts, setGenerateShorts] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");

  // Get children (shorts) for this content
  const childContents = content
    ? allContents.filter((c) => c.parentId === content.id)
    : [];

  // Get parent content if this is a child
  const parentContent = content?.parentId
    ? allContents.find((c) => c.id === content.parentId)
    : undefined;

  useEffect(() => {
    if (content) {
      setTitle(content.title);
      setCategoryId(content.categoryId);
      setDate(format(content.date, "yyyy-MM-dd"));
      setPublished(content.published);
      setNotes(content.notes || "");
      setLinkedContentId(content.linkedContentId);
      setContentType(content.contentType || "video");
      setPriority(content.priority || "medium");
      setPipelineStageId(content.pipelineStageId || "");
      setChecklist(content.checklist || []);
      setSelectedTemplateId(content.templateId || "");
      setGenerateShorts(false);
      setSelectedPresetId("");
    } else {
      setTitle("");
      setCategoryId(preselectedCategory || categories[0]?.id || "");
      setDate(preselectedDate ? format(preselectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
      setPublished(false);
      setNotes("");
      setLinkedContentId(undefined);
      setContentType("video");
      setPriority("medium");
      setPipelineStageId("");
      setChecklist([]);
      setGenerateShorts(false);
      setSelectedPresetId("");
      
      // Apply preselected template if provided
      if (preselectedTemplateId) {
        const template = templates.find((t) => t.id === preselectedTemplateId);
        if (template) {
          setSelectedTemplateId(preselectedTemplateId);
          setContentType(template.contentType);
          if (template.defaultCategoryId) {
            setCategoryId(template.defaultCategoryId);
          }
          if (template.defaultPipeline.length > 0) {
            setPipelineStageId(template.defaultPipeline[0].id);
          }
          setChecklist(
            template.defaultChecklist.map((item, idx) => ({
              id: `check-${Date.now()}-${idx}`,
              label: item.label,
              isDone: false,
              order: item.order,
            }))
          );
        }
      } else {
        setSelectedTemplateId("");
      }
    }
  }, [content, preselectedCategory, preselectedDate, preselectedTemplateId, categories, templates, open]);

  // Apply template when selected
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId || templateId === "none") return;
    
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    
    setContentType(template.contentType);
    if (template.defaultCategoryId) {
      setCategoryId(template.defaultCategoryId);
    }
    if (template.defaultPipeline.length > 0) {
      setPipelineStageId(template.defaultPipeline[0].id);
    }
    setChecklist(
      template.defaultChecklist.map((item, idx) => ({
        id: `check-${Date.now()}-${idx}`,
        label: item.label,
        isDone: false,
        order: item.order,
      }))
    );
  };

  const linkedContent = linkedContentId 
    ? allContents.find((c) => c.id === linkedContentId) 
    : undefined;
  
  const linkedCategory = linkedContent
    ? categories.find((cat) => cat.id === linkedContent.categoryId)
    : undefined;

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const pipelineStages = selectedTemplate?.defaultPipeline || DEFAULT_PIPELINE_STAGES;
  
  // Get current category features
  const currentCategory = categories.find((c) => c.id === categoryId);
  const categoryFeatures = currentCategory?.features || {
    notes: true,
    pipeline: true,
    checklist: true,
    priority: true,
    contentType: true,
    linkedContent: true,
  };

  const handleSave = () => {
    if (title && categoryId && date) {
      const savedContent: Omit<ContentItem, "id"> & { id?: string } = {
        id: content?.id,
        title,
        categoryId,
        date: new Date(date),
        published,
        notes: notes || undefined,
        linkedContentId,
        contentType,
        priority,
        pipelineStageId: pipelineStageId || undefined,
        checklist: checklist.length > 0 ? checklist : undefined,
        templateId: selectedTemplateId || undefined,
        parentId: content?.parentId,
        seriesId: content?.seriesId,
      };
      
      // Pass shorts preset ID if generating shorts for new video content
      const shortsPresetToUse = !content && generateShorts && selectedPresetId && contentType === "video" 
        ? selectedPresetId 
        : undefined;
      
      onSave(savedContent, shortsPresetToUse);
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (content && onDelete) {
      onDelete(content.id);
      onOpenChange(false);
    }
  };

  const completedChecklist = checklist.filter((c) => c.isDone).length;
  const checklistProgress = checklist.length > 0 
    ? Math.round((completedChecklist / checklist.length) * 100) 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {content ? "Modifica Contenuto" : "Nuovo Contenuto"}
            {content?.parentId && (
              <Badge variant="outline" className="text-xs">
                <Link2 className="h-3 w-3 mr-1" />
                Figlio
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Template Selector (for new content) */}
          {!content && templates.length > 0 && (
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <Label className="font-medium">Usa Template</Label>
              </div>
              <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessun template</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({CONTENT_TYPE_LABELS[t.contentType]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid gap-2">
            <Label htmlFor="title">Titolo</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="es. Outer Wilds 1"
            />
          </div>

          {(categoryFeatures.contentType || categoryFeatures.priority) && (
            <div className="grid grid-cols-2 gap-4">
              {categoryFeatures.contentType && (
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CONTENT_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {categoryFeatures.priority && (
                <div className="grid gap-2">
                  <Label>Priorità</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: `hsl(${config.color})` }}
                            />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent>
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
            <div className="grid gap-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    {date ? format(parseISO(date), "d MMM yyyy", { locale: it }) : "Seleziona data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date ? parseISO(date) : undefined}
                    onSelect={(d) => d && setDate(format(d, "yyyy-MM-dd"))}
                    locale={it}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
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

          {/* Pipeline & Checklist Accordion */}
          <Accordion type="multiple" className="w-full">
            {/* Pipeline */}
            {categoryFeatures.pipeline && (
              <AccordionItem value="pipeline">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    Pipeline
                    {pipelineStageId && (
                      <Badge variant="outline" className="text-xs font-normal">
                        {pipelineStages.find((s) => s.id === pipelineStageId)?.name || "N/A"}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <PipelineStepper
                    stages={pipelineStages}
                    currentStageId={pipelineStageId}
                    onStageClick={setPipelineStageId}
                  />
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Checklist */}
            {categoryFeatures.checklist && (
              <AccordionItem value="checklist">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    Checklist
                    {checklist.length > 0 && (
                      <Badge variant="outline" className="text-xs font-normal">
                        {completedChecklist}/{checklist.length} ({checklistProgress}%)
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ChecklistEditor items={checklist} onChange={setChecklist} />
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Notes */}
            {categoryFeatures.notes && (
              <AccordionItem value="notes">
                <AccordionTrigger className="text-sm">
                  Note
                  {notes && <Badge variant="outline" className="text-xs font-normal ml-2">✓</Badge>}
                </AccordionTrigger>
                <AccordionContent>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Aggiungi note..."
                    rows={3}
                  />
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Linked Content */}
            {categoryFeatures.linkedContent && (
            <AccordionItem value="linked">
              <AccordionTrigger className="text-sm">
                Contenuto Collegato
                {linkedContent && (
                  <Badge variant="outline" className="text-xs font-normal ml-2">
                    <Link2 className="h-3 w-3 mr-1" />
                    {linkedContent.title.slice(0, 20)}...
                  </Badge>
                )}
              </AccordionTrigger>
              <AccordionContent>
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
                    className="w-full justify-start"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Seleziona contenuto collegato
                  </Button>
                )}
              </AccordionContent>
            </AccordionItem>
            )}
          </Accordion>

          {/* Shorts Generation (only for new video content) */}
          {!content && contentType === "video" && shortsPresets.length > 0 && (
            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clapperboard className="h-4 w-4 text-amber-500" />
                  <Label className="font-medium">Genera Shorts</Label>
                </div>
                <Switch
                  checked={generateShorts}
                  onCheckedChange={setGenerateShorts}
                />
              </div>
              {generateShorts && (
                <div className="mt-3">
                  <Select value={selectedPresetId} onValueChange={setSelectedPresetId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona preset..." />
                    </SelectTrigger>
                    <SelectContent>
                      {shortsPresets.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.shortsCount} shorts)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedPresetId && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Verranno creati {shortsPresets.find((p) => p.id === selectedPresetId)?.shortsCount} shorts
                      nei giorni successivi
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Parent Content Link */}
          {parentContent && (
            <div className="p-3 rounded-lg border bg-muted/30">
              <Label className="text-xs text-muted-foreground">Contenuto Padre</Label>
              <div className="flex items-center gap-2 mt-1">
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium">{parentContent.title}</span>
                <Badge variant="outline" className="text-xs">
                  {format(parentContent.date, "d MMM", { locale: it })}
                </Badge>
              </div>
            </div>
          )}

          {/* Children Contents */}
          {content && childContents.length > 0 && (
            <div className="p-3 rounded-lg border bg-muted/30">
              <Label className="text-xs text-muted-foreground mb-2 block">
                Shorts Generati ({childContents.length})
              </Label>
              <div className="space-y-1">
                {childContents.map((child) => {
                  const childCat = categories.find((c) => c.id === child.categoryId);
                  return (
                    <div
                      key={child.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          child.published ? "bg-green-500" : "bg-muted-foreground"
                        )}
                      />
                      <span className="truncate flex-1">{child.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(child.date, "d MMM", { locale: it })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
