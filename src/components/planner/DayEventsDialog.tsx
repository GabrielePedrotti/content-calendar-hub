import { useState, useMemo, useEffect } from "react";
import { ContentItem, Category, ContentType, Priority, ChecklistItem, CONTENT_TYPE_LABELS, PRIORITY_CONFIG, DEFAULT_PIPELINE_STAGES, ContentTemplate, ShortsPreset, PipelineStage } from "@/types/planner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Plus, Trash2, Edit, Check, Link, Calendar, FileText, X, Save, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChecklistEditor } from "./ChecklistEditor";
import { PipelineStepper } from "./PipelineStepper";

interface DayEventsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  contents: ContentItem[];
  categories: Category[];
  allContents: ContentItem[];
  templates?: ContentTemplate[];
  shortsPresets?: ShortsPreset[];
  onAddContent: (categoryId?: string) => void;
  onSaveContent: (content: Omit<ContentItem, "id"> & { id?: string }) => void;
  onDeleteContent: (id: string) => void;
  onTogglePublished: (content: ContentItem) => void;
}

export const DayEventsDialog = ({
  open,
  onOpenChange,
  date,
  contents,
  categories,
  allContents,
  templates = [],
  shortsPresets = [],
  onAddContent,
  onSaveContent,
  onDeleteContent,
  onTogglePublished,
}: DayEventsDialogProps) => {
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editPublished, setEditPublished] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editContentType, setEditContentType] = useState<ContentType>("video");
  const [editPriority, setEditPriority] = useState<Priority>("medium");
  const [editPipelineStageId, setEditPipelineStageId] = useState("");
  const [editChecklist, setEditChecklist] = useState<ChecklistItem[]>([]);

  // Populate form when entering edit mode
  const startEditing = (content: ContentItem) => {
    setEditTitle(content.title);
    setEditCategoryId(content.categoryId);
    setEditDate(format(content.date, "yyyy-MM-dd"));
    setEditPublished(content.published);
    setEditNotes(content.notes || "");
    setEditContentType(content.contentType || "video");
    setEditPriority(content.priority || "medium");
    setEditPipelineStageId(content.pipelineStageId || "");
    setEditChecklist(content.checklist || []);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!selectedContent || !editTitle || !editCategoryId || !editDate) return;
    
    onSaveContent({
      id: selectedContent.id,
      title: editTitle,
      categoryId: editCategoryId,
      date: new Date(editDate),
      published: editPublished,
      notes: editNotes || undefined,
      contentType: editContentType,
      priority: editPriority,
      pipelineStageId: editPipelineStageId || undefined,
      checklist: editChecklist.length > 0 ? editChecklist : undefined,
      linkedContentId: selectedContent.linkedContentId,
      parentId: selectedContent.parentId,
      seriesId: selectedContent.seriesId,
      templateId: selectedContent.templateId,
    });
    
    setIsEditing(false);
    // Update selectedContent with new values
    setSelectedContent({
      ...selectedContent,
      title: editTitle,
      categoryId: editCategoryId,
      date: new Date(editDate),
      published: editPublished,
      notes: editNotes || undefined,
      contentType: editContentType,
      priority: editPriority,
      pipelineStageId: editPipelineStageId || undefined,
      checklist: editChecklist.length > 0 ? editChecklist : undefined,
    });
  };

  // Reset selection when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedContent(null);
      setIsEditing(false);
    }
    onOpenChange(newOpen);
  };

  // Group contents by category
  const contentsByCategory = useMemo(() => {
    const grouped: Record<string, ContentItem[]> = {};
    contents.forEach((content) => {
      if (!grouped[content.categoryId]) {
        grouped[content.categoryId] = [];
      }
      grouped[content.categoryId].push(content);
    });
    return grouped;
  }, [contents]);

  // Find uncategorized contents
  const uncategorizedContents = useMemo(() => {
    return contents.filter(
      (content) => !categories.some((cat) => cat.id === content.categoryId)
    );
  }, [contents, categories]);

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId);
  };

  const getLinkedContent = (linkedId?: string) => {
    if (!linkedId) return null;
    return allContents.find((c) => c.id === linkedId);
  };

  const formatDateDisplay = format(date, "EEEE d MMMM yyyy", { locale: it });

  const pipelineStages = DEFAULT_PIPELINE_STAGES;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl capitalize">
            <Calendar className="h-5 w-5" />
            {formatDateDisplay}
            <Badge variant="secondary" className="ml-2">
              {contents.length} {contents.length === 1 ? "evento" : "eventi"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - Event details or Editor */}
          <div className="w-[420px] flex flex-col bg-muted/20 border-r">
            {selectedContent ? (
              isEditing ? (
                <EditPanel
                  title={editTitle}
                  setTitle={setEditTitle}
                  categoryId={editCategoryId}
                  setCategoryId={setEditCategoryId}
                  categories={categories}
                  date={editDate}
                  setDate={setEditDate}
                  published={editPublished}
                  setPublished={setEditPublished}
                  notes={editNotes}
                  setNotes={setEditNotes}
                  contentType={editContentType}
                  setContentType={setEditContentType}
                  priority={editPriority}
                  setPriority={setEditPriority}
                  pipelineStageId={editPipelineStageId}
                  setPipelineStageId={setEditPipelineStageId}
                  pipelineStages={pipelineStages}
                  checklist={editChecklist}
                  setChecklist={setEditChecklist}
                  onSave={handleSaveEdit}
                  onCancel={cancelEditing}
                />
              ) : (
                <EventDetails
                  content={selectedContent}
                  category={getCategoryInfo(selectedContent.categoryId)}
                  linkedContent={getLinkedContent(selectedContent.linkedContentId)}
                  onEdit={() => startEditing(selectedContent)}
                  onDelete={() => {
                    onDeleteContent(selectedContent.id);
                    setSelectedContent(null);
                  }}
                />
              )
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Seleziona un evento</p>
                  <p className="text-sm">per vedere i dettagli</p>
                </div>
              </div>
            )}
          </div>

          {/* Right panel - Events list */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b bg-muted/30">
              <Button onClick={() => onAddContent()} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Aggiungi evento
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {contents.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nessun evento per questa giornata</p>
                    <p className="text-sm">Clicca "Aggiungi evento" per crearne uno</p>
                  </div>
                ) : (
                  <>
                    {categories.map((category) => {
                      const categoryContents = contentsByCategory[category.id] || [];
                      if (categoryContents.length === 0) return null;

                      return (
                        <div key={category.id} className="space-y-2">
                          <div
                            className="flex items-center gap-2 text-sm font-semibold px-2 py-1 rounded"
                            style={{
                              backgroundColor: `hsl(${category.color} / 0.2)`,
                              color: `hsl(${category.color.split(" ")[0]} ${category.color.split(" ")[1]} 70%)`,
                            }}
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: `hsl(${category.color})` }}
                            />
                            {category.name}
                            <Badge variant="outline" className="ml-auto text-xs">
                              {categoryContents.length}
                            </Badge>
                          </div>

                          <div className="space-y-1 pl-2">
                            {categoryContents.map((content) => (
                              <EventItem
                                key={content.id}
                                content={content}
                                category={category}
                                isSelected={selectedContent?.id === content.id}
                                onClick={() => {
                                  if (isEditing) cancelEditing();
                                  setSelectedContent(content);
                                }}
                                onTogglePublished={onTogglePublished}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {uncategorizedContents.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold px-2 py-1 rounded bg-muted text-muted-foreground">
                          <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                          Non categorizzati
                          <Badge variant="outline" className="ml-auto text-xs">
                            {uncategorizedContents.length}
                          </Badge>
                        </div>

                        <div className="space-y-1 pl-2">
                          {uncategorizedContents.map((content) => (
                            <EventItem
                              key={content.id}
                              content={content}
                              category={null}
                              isSelected={selectedContent?.id === content.id}
                              onClick={() => {
                                if (isEditing) cancelEditing();
                                setSelectedContent(content);
                              }}
                              onTogglePublished={onTogglePublished}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Edit Panel Component
interface EditPanelProps {
  title: string;
  setTitle: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  categories: Category[];
  date: string;
  setDate: (v: string) => void;
  published: boolean;
  setPublished: (v: boolean) => void;
  notes: string;
  setNotes: (v: string) => void;
  contentType: ContentType;
  setContentType: (v: ContentType) => void;
  priority: Priority;
  setPriority: (v: Priority) => void;
  pipelineStageId: string;
  setPipelineStageId: (v: string) => void;
  pipelineStages: PipelineStage[];
  checklist: ChecklistItem[];
  setChecklist: (v: ChecklistItem[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

const EditPanel = ({
  title,
  setTitle,
  categoryId,
  setCategoryId,
  categories,
  date,
  setDate,
  published,
  setPublished,
  notes,
  setNotes,
  contentType,
  setContentType,
  priority,
  setPriority,
  pipelineStageId,
  setPipelineStageId,
  pipelineStages,
  checklist,
  setChecklist,
  onSave,
  onCancel,
}: EditPanelProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold">Modifica evento</h3>
        </div>
        <Button onClick={onSave} size="sm" className="gap-1">
          <Save className="h-4 w-4" />
          Salva
        </Button>
      </div>

      {/* Form */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Titolo */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-title">Titolo</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titolo evento"
            />
          </div>

          {/* Categoria e Data */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
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
            <div className="space-y-1.5">
              <Label htmlFor="edit-date">Data</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Tipo e Priorità */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
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
          </div>

          {/* Pubblicato */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="edit-published"
              checked={published}
              onCheckedChange={(checked) => setPublished(checked as boolean)}
            />
            <Label htmlFor="edit-published">Pubblicato</Label>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-notes">Note</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Aggiungi note..."
              rows={3}
            />
          </div>

          {/* Pipeline */}
          <div className="space-y-1.5">
            <Label>Pipeline</Label>
            <PipelineStepper
              stages={pipelineStages}
              currentStageId={pipelineStageId}
              onStageClick={setPipelineStageId}
            />
          </div>

          {/* Checklist */}
          <div className="space-y-1.5">
            <Label>Checklist</Label>
            <ChecklistEditor items={checklist} onChange={setChecklist} />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

// Event item component
interface EventItemProps {
  content: ContentItem;
  category: Category | null;
  isSelected: boolean;
  onClick: () => void;
  onTogglePublished: (content: ContentItem) => void;
}

const EventItem = ({
  content,
  category,
  isSelected,
  onClick,
  onTogglePublished,
}: EventItemProps) => {
  const priorityConfig = content.priority ? PRIORITY_CONFIG[content.priority] : null;

  return (
    <div
      className={cn(
        "flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors border",
        isSelected
          ? "bg-primary/10 border-primary/30"
          : "bg-background hover:bg-muted/50 border-transparent"
      )}
      onClick={onClick}
    >
      <Checkbox
        checked={content.published}
        onCheckedChange={() => onTogglePublished(content)}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "font-medium truncate text-sm",
              content.published && "line-through text-muted-foreground"
            )}
          >
            {content.title}
          </span>
          {content.linkedContentId && (
            <Link className="h-3 w-3 text-primary shrink-0" />
          )}
        </div>
        {content.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2 break-words">{content.notes}</p>
        )}
      </div>

      {priorityConfig && (
        <Badge
          variant="outline"
          className="shrink-0 text-[10px] px-1.5"
          style={{ borderColor: priorityConfig.color, color: priorityConfig.color }}
        >
          {priorityConfig.label}
        </Badge>
      )}

      {content.published && (
        <Check className="h-4 w-4 text-green-500 shrink-0" />
      )}
    </div>
  );
};

// Event details component
interface EventDetailsProps {
  content: ContentItem;
  category: Category | null | undefined;
  linkedContent: ContentItem | null;
  onEdit: () => void;
  onDelete: () => void;
}

const EventDetails = ({
  content,
  category,
  linkedContent,
  onEdit,
  onDelete,
}: EventDetailsProps) => {
  const priorityConfig = content.priority ? PRIORITY_CONFIG[content.priority] : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{content.title}</h3>
            {category && (
              <Badge
                className="mt-1"
                style={{
                  backgroundColor: `hsl(${category.color} / 0.2)`,
                  color: `hsl(${category.color.split(" ")[0]} ${category.color.split(" ")[1]} 70%)`,
                }}
              >
                {category.name}
              </Badge>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="outline" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={content.published ? "default" : "secondary"}>
              {content.published ? "Pubblicato" : "Non pubblicato"}
            </Badge>
            {content.contentType && (
              <Badge variant="outline">{CONTENT_TYPE_LABELS[content.contentType]}</Badge>
            )}
            {priorityConfig && (
              <Badge
                variant="outline"
                style={{ borderColor: `hsl(${priorityConfig.color})`, color: `hsl(${priorityConfig.color})` }}
              >
                {priorityConfig.label}
              </Badge>
            )}
          </div>

          {/* Notes */}
          {content.notes && (
            <div>
              <h4 className="text-sm font-medium mb-1 text-muted-foreground">Note</h4>
              <p className="text-sm whitespace-pre-wrap break-words">{content.notes}</p>
            </div>
          )}

          {/* Linked content */}
          {linkedContent && (
            <div>
              <h4 className="text-sm font-medium mb-1 text-muted-foreground flex items-center gap-1">
                <Link className="h-3 w-3" />
                Contenuto collegato
              </h4>
              <div className="p-2 rounded-lg bg-muted/50 border">
                <p className="font-medium text-sm">{linkedContent.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(linkedContent.date, "d MMMM yyyy", { locale: it })}
                </p>
              </div>
            </div>
          )}

          {/* Pipeline stage */}
          {content.pipelineStageId && (
            <div>
              <h4 className="text-sm font-medium mb-1 text-muted-foreground">Fase Pipeline</h4>
              <Badge variant="outline">{content.pipelineStageId}</Badge>
            </div>
          )}

          {/* Checklist */}
          {content.checklist && content.checklist.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Checklist</h4>
              <div className="space-y-1">
                {content.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox checked={item.isDone} disabled className="shrink-0" />
                    <span className={cn(item.isDone && "line-through text-muted-foreground")}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};