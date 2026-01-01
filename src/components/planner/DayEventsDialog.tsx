import { useState, useMemo } from "react";
import { ContentItem, Category, ContentType, Priority, ChecklistItem, CONTENT_TYPE_LABELS, PRIORITY_CONFIG, DEFAULT_PIPELINE_STAGES, PipelineStage, VacationPeriod } from "@/types/planner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format, isWithinInterval } from "date-fns";
import { it } from "date-fns/locale";
import { Plus, Trash2, Edit, Check, Link, Calendar, FileText, X, Save, Link2, Umbrella, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { PipelineStepper } from "./PipelineStepper";
import { ChecklistEditor } from "./ChecklistEditor";
import { LinkedContentSelector } from "./LinkedContentSelector";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DayEventsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  contents: ContentItem[];
  categories: Category[];
  allContents: ContentItem[];
  vacations?: VacationPeriod[];
  onAddContent: (categoryId?: string) => void;
  onEditContent: (content: ContentItem) => void;
  onDeleteContent: (id: string) => void;
  onTogglePublished: (content: ContentItem) => void;
  onSaveContent?: (content: ContentItem) => void;
  onUpdateVacation?: (vacation: VacationPeriod) => void;
  onDeleteVacation?: (id: string) => void;
}

export const DayEventsDialog = ({
  open,
  onOpenChange,
  date,
  contents,
  categories,
  allContents,
  vacations = [],
  onAddContent,
  onEditContent,
  onDeleteContent,
  onTogglePublished,
  onSaveContent,
  onUpdateVacation,
  onDeleteVacation,
}: DayEventsDialogProps) => {
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingVacation, setEditingVacation] = useState<VacationPeriod | null>(null);
  
  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editPublished, setEditPublished] = useState(false);
  const [editContentType, setEditContentType] = useState<ContentType | "">("");
  const [editPriority, setEditPriority] = useState<Priority | "">("");
  const [editPipelineStageId, setEditPipelineStageId] = useState("");
  const [editChecklist, setEditChecklist] = useState<ChecklistItem[]>([]);
  const [editLinkedContentId, setEditLinkedContentId] = useState<string | undefined>();
  const [showLinkedSelector, setShowLinkedSelector] = useState(false);

  const startEditing = (content: ContentItem) => {
    setEditTitle(content.title);
    setEditCategoryId(content.categoryId);
    setEditDate(format(content.date, "yyyy-MM-dd"));
    setEditNotes(content.notes || "");
    setEditPublished(content.published);
    setEditContentType(content.contentType || "");
    setEditPriority(content.priority || "");
    setEditPipelineStageId(content.pipelineStageId || "");
    setEditChecklist(content.checklist || []);
    setEditLinkedContentId(content.linkedContentId);
    setShowLinkedSelector(false);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setShowLinkedSelector(false);
  };

  const handleSaveEdit = () => {
    if (!selectedContent || !onSaveContent) return;

    const updatedContent: ContentItem = {
      ...selectedContent,
      title: editTitle,
      categoryId: editCategoryId,
      date: new Date(editDate),
      notes: editNotes || undefined,
      published: editPublished,
      contentType: editContentType || undefined,
      priority: editPriority || undefined,
      pipelineStageId: editPipelineStageId || undefined,
      checklist: editChecklist.length > 0 ? editChecklist : undefined,
      linkedContentId: editLinkedContentId,
    };

    onSaveContent(updatedContent);
    setSelectedContent(updatedContent);
    setIsEditing(false);
  };

  const handleToggleChecklistItem = (itemId: string) => {
    if (!selectedContent || !onSaveContent) return;
    const checklist = selectedContent.checklist ?? [];
    const updatedContent: ContentItem = {
      ...selectedContent,
      checklist: checklist.map((it) =>
        it.id === itemId ? { ...it, isDone: !it.isDone } : it,
      ),
    };
    onSaveContent(updatedContent);
    setSelectedContent(updatedContent);
  };

  // Reset selection when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedContent(null);
      setIsEditing(false);
      setShowLinkedSelector(false);
      setEditingVacation(null);
    }
    onOpenChange(newOpen);
  };

  // Get vacation for this date
  const vacationForDate = useMemo(() => {
    return vacations.find((v) =>
      isWithinInterval(date, { start: v.startDate, end: v.endDate })
    );
  }, [vacations, date]);

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

  const uncategorizedContents = useMemo(() => {
    return contents.filter((content) => !categories.some((cat) => cat.id === content.categoryId));
  }, [contents, categories]);

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId);
  };

  const getLinkedContent = (linkedId?: string) => {
    if (!linkedId) return null;
    return allContents.find((c) => c.id === linkedId);
  };

  const formatDateDisplay = format(date, "EEEE d MMMM yyyy", { locale: it });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl capitalize">
            <Calendar className="h-5 w-5" />
            {formatDateDisplay}
            <Badge variant="secondary" className="ml-2">
              {contents.length} {contents.length === 1 ? "evento" : "eventi"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Vacation Banner */}
        {vacationForDate && (
          <div className="px-6 py-3 bg-vacation-overlay border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Umbrella className="h-4 w-4 text-vacation-foreground" />
              <span className="font-medium text-vacation-foreground">{vacationForDate.label}</span>
              <span className="text-xs text-vacation-foreground/70">
                {format(vacationForDate.startDate, "d MMM", { locale: it })} – {format(vacationForDate.endDate, "d MMM", { locale: it })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {onUpdateVacation && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-vacation-foreground hover:bg-vacation-accent"
                  onClick={() => setEditingVacation(vacationForDate)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Modifica
                </Button>
              )}
              {onDeleteVacation && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:bg-destructive/10"
                  onClick={() => onDeleteVacation(vacationForDate.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Vacation Edit Panel */}
        {editingVacation && onUpdateVacation && (
          <VacationEditPanel
            vacation={editingVacation}
            onSave={(updated) => {
              onUpdateVacation(updated);
              setEditingVacation(null);
            }}
            onCancel={() => setEditingVacation(null)}
          />
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - Events list (1/3) */}
          <div className="w-1/3 flex flex-col border-r">
            <div className="p-4 border-b bg-muted/30">
              <Button onClick={() => onAddContent()} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Aggiungi evento
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                {contents.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nessun evento</p>
                  </div>
                ) : (
                  <>
                    {categories.map((category) => {
                      const categoryContents = contentsByCategory[category.id] || [];
                      if (categoryContents.length === 0) return null;

                      return (
                        <div key={category.id} className="space-y-1">
                          <div
                            className="flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded"
                            style={{
                              backgroundColor: `hsl(${category.color} / 0.2)`,
                              color: `hsl(${category.color.split(" ")[0]} ${category.color.split(" ")[1]} 70%)`,
                            }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: `hsl(${category.color})` }}
                            />
                            {category.name}
                            <Badge variant="outline" className="ml-auto text-[10px] h-4">
                              {categoryContents.length}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            {categoryContents.map((content) => (
                              <EventItem
                                key={content.id}
                                content={content}
                                category={category}
                                isSelected={selectedContent?.id === content.id}
                                onClick={() => {
                                  setSelectedContent(content);
                                  setIsEditing(false);
                                }}
                                onTogglePublished={onTogglePublished}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {uncategorizedContents.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded bg-muted text-muted-foreground">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                          Non categorizzati
                          <Badge variant="outline" className="ml-auto text-[10px] h-4">
                            {uncategorizedContents.length}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          {uncategorizedContents.map((content) => (
                            <EventItem
                              key={content.id}
                              content={content}
                              category={null}
                              isSelected={selectedContent?.id === content.id}
                              onClick={() => {
                                setSelectedContent(content);
                                setIsEditing(false);
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

          {/* Right panel - Event details/edit (2/3) */}
          <div className="w-2/3 flex flex-col bg-muted/10">
            {selectedContent ? (
              isEditing ? (
                <EditPanel
                  content={selectedContent}
                  categories={categories}
                  allContents={allContents}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  editCategoryId={editCategoryId}
                  setEditCategoryId={setEditCategoryId}
                  editDate={editDate}
                  setEditDate={setEditDate}
                  editNotes={editNotes}
                  setEditNotes={setEditNotes}
                  editPublished={editPublished}
                  setEditPublished={setEditPublished}
                  editContentType={editContentType}
                  setEditContentType={setEditContentType}
                  editPriority={editPriority}
                  setEditPriority={setEditPriority}
                  editPipelineStageId={editPipelineStageId}
                  setEditPipelineStageId={setEditPipelineStageId}
                  editChecklist={editChecklist}
                  setEditChecklist={setEditChecklist}
                  editLinkedContentId={editLinkedContentId}
                  setEditLinkedContentId={setEditLinkedContentId}
                  showLinkedSelector={showLinkedSelector}
                  setShowLinkedSelector={setShowLinkedSelector}
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
                  onToggleChecklistItem={handleToggleChecklistItem}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Edit panel component
interface EditPanelProps {
  content: ContentItem;
  categories: Category[];
  allContents: ContentItem[];
  editTitle: string;
  setEditTitle: (v: string) => void;
  editCategoryId: string;
  setEditCategoryId: (v: string) => void;
  editDate: string;
  setEditDate: (v: string) => void;
  editNotes: string;
  setEditNotes: (v: string) => void;
  editPublished: boolean;
  setEditPublished: (v: boolean) => void;
  editContentType: ContentType | "";
  setEditContentType: (v: ContentType | "") => void;
  editPriority: Priority | "";
  setEditPriority: (v: Priority | "") => void;
  editPipelineStageId: string;
  setEditPipelineStageId: (v: string) => void;
  editChecklist: ChecklistItem[];
  setEditChecklist: (v: ChecklistItem[]) => void;
  editLinkedContentId: string | undefined;
  setEditLinkedContentId: (v: string | undefined) => void;
  showLinkedSelector: boolean;
  setShowLinkedSelector: (v: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
}

const EditPanel = ({
  content,
  categories,
  allContents,
  editTitle,
  setEditTitle,
  editCategoryId,
  setEditCategoryId,
  editDate,
  setEditDate,
  editNotes,
  setEditNotes,
  editPublished,
  setEditPublished,
  editContentType,
  setEditContentType,
  editPriority,
  setEditPriority,
  editPipelineStageId,
  setEditPipelineStageId,
  editChecklist,
  setEditChecklist,
  editLinkedContentId,
  setEditLinkedContentId,
  showLinkedSelector,
  setShowLinkedSelector,
  onSave,
  onCancel,
}: EditPanelProps) => {
  const linkedContent = editLinkedContentId 
    ? allContents.find((c) => c.id === editLinkedContentId) 
    : undefined;
  
  const linkedCategory = linkedContent
    ? categories.find((cat) => cat.id === linkedContent.categoryId)
    : undefined;

  const completedChecklist = editChecklist.filter((c) => c.isDone).length;
  const checklistProgress = editChecklist.length > 0 
    ? Math.round((completedChecklist / editChecklist.length) * 100) 
    : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-lg">Modifica evento</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Annulla
          </Button>
          <Button size="sm" onClick={onSave}>
            <Save className="h-4 w-4 mr-1" />
            Salva
          </Button>
        </div>
      </div>

      {/* Form */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Titolo</Label>
            <Input
              id="edit-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Titolo evento"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={editCategoryId} onValueChange={setEditCategoryId}>
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
            <div className="space-y-2">
              <Label htmlFor="edit-date">Data</Label>
              <Input
                id="edit-date"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
          </div>

          {/* Content Type & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo contenuto</Label>
              <Select value={editContentType || "none"} onValueChange={(v) => setEditContentType(v === "none" ? "" : v as ContentType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessuno</SelectItem>
                  {Object.entries(CONTENT_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priorità</Label>
              <Select value={editPriority || "none"} onValueChange={(v) => setEditPriority(v === "none" ? "" : v as Priority)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona priorità" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nessuna</SelectItem>
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

          {/* Published */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <Label htmlFor="edit-published">Pubblicato</Label>
            <Switch
              id="edit-published"
              checked={editPublished}
              onCheckedChange={setEditPublished}
            />
          </div>

          {/* Advanced options in accordion */}
          <Accordion type="multiple" className="w-full">
            {/* Pipeline */}
            <AccordionItem value="pipeline">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  Pipeline
                  {editPipelineStageId && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {DEFAULT_PIPELINE_STAGES.find((s) => s.id === editPipelineStageId)?.name || "N/A"}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <PipelineStepper
                  stages={DEFAULT_PIPELINE_STAGES}
                  currentStageId={editPipelineStageId}
                  onStageClick={setEditPipelineStageId}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Checklist */}
            <AccordionItem value="checklist">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  Checklist
                  {editChecklist.length > 0 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {completedChecklist}/{editChecklist.length} ({checklistProgress}%)
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ChecklistEditor items={editChecklist} onChange={setEditChecklist} />
              </AccordionContent>
            </AccordionItem>

            {/* Linked Content */}
            <AccordionItem value="linked">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  Contenuto Collegato
                  {linkedContent && (
                    <Badge variant="outline" className="text-xs font-normal">
                      <Link2 className="h-3 w-3 mr-1" />
                      {linkedContent.title.slice(0, 15)}...
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <LinkedContentSelector
                  open={showLinkedSelector}
                  onOpenChange={setShowLinkedSelector}
                  contents={allContents.filter((c) => c.id !== content.id)}
                  categories={categories}
                  currentContentId={content.id}
                  onSelect={(id) => {
                    setEditLinkedContentId(id);
                  }}
                />
                {!showLinkedSelector && linkedContent ? (
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
                      onClick={() => setEditLinkedContentId(undefined)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : !showLinkedSelector ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowLinkedSelector(true)}
                    className="w-full justify-start"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Seleziona contenuto collegato
                  </Button>
                ) : null}
              </AccordionContent>
            </AccordionItem>

            {/* Notes */}
            <AccordionItem value="notes">
              <AccordionTrigger className="text-sm">
                Note
                {editNotes && <Badge variant="outline" className="text-xs font-normal ml-2">✓</Badge>}
              </AccordionTrigger>
              <AccordionContent>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Aggiungi note..."
                  rows={4}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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

const EventItem = ({ content, category, isSelected, onClick, onTogglePublished }: EventItemProps) => {
  const priorityConfig = content.priority ? PRIORITY_CONFIG[content.priority] : null;

  return (
    <div
      className={cn(
        "flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors border",
        isSelected ? "bg-primary/10 border-primary/30" : "bg-background hover:bg-muted/50 border-transparent",
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
            className={cn("font-medium truncate text-sm", content.published && "line-through text-muted-foreground")}
          >
            {content.title}
          </span>
          {content.linkedContentId && <Link className="h-3 w-3 text-primary shrink-0" />}
        </div>
        {content.notes && (
          <p className="text-xs text-muted-foreground whitespace-normal break-words max-w-full">{content.notes}</p>
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

      {content.published && <Check className="h-4 w-4 text-green-500 shrink-0" />}
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
  onToggleChecklistItem?: (itemId: string) => void;
}

const EventDetails = ({ content, category, linkedContent, onEdit, onDelete, onToggleChecklistItem }: EventDetailsProps) => {
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
            {content.contentType && <Badge variant="outline">{CONTENT_TYPE_LABELS[content.contentType]}</Badge>}
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
              <p className="text-sm whitespace-pre-wrap">{content.notes}</p>
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
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={item.isDone}
                      onCheckedChange={() => onToggleChecklistItem?.(item.id)}
                      className="shrink-0"
                    />
                    <span className={cn(item.isDone && "line-through text-muted-foreground")}>{item.label}</span>
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

// Vacation Edit Panel
interface VacationEditPanelProps {
  vacation: VacationPeriod;
  onSave: (vacation: VacationPeriod) => void;
  onCancel: () => void;
}

const VacationEditPanel = ({ vacation, onSave, onCancel }: VacationEditPanelProps) => {
  const [label, setLabel] = useState(vacation.label);
  const [startDate, setStartDate] = useState<Date>(vacation.startDate);
  const [endDate, setEndDate] = useState<Date>(vacation.endDate);

  const handleSave = () => {
    onSave({
      ...vacation,
      label,
      startDate,
      endDate,
    });
  };

  return (
    <div className="px-6 py-4 bg-muted/30 border-b space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          <Umbrella className="h-4 w-4" />
          Modifica Ferie
        </h4>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Annulla
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Salva
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Etichetta</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Nome ferie" />
        </div>
        <div className="space-y-2">
          <Label>Data Inizio</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarDays className="h-4 w-4 mr-2" />
                {format(startDate, "d MMM yyyy", { locale: it })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={startDate}
                onSelect={(d) => d && setStartDate(d)}
                locale={it}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Data Fine</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarDays className="h-4 w-4 mr-2" />
                {format(endDate, "d MMM yyyy", { locale: it })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={endDate}
                onSelect={(d) => d && setEndDate(d)}
                locale={it}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
