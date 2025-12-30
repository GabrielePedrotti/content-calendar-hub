import { useState, useMemo } from "react";
import { ContentItem, Category } from "@/types/planner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Plus, Trash2, Edit, Check, Link, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTENT_TYPE_LABELS, PRIORITY_CONFIG } from "@/types/planner";

interface DayEventsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  contents: ContentItem[];
  categories: Category[];
  allContents: ContentItem[];
  onAddContent: (categoryId?: string) => void;
  onEditContent: (content: ContentItem) => void;
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
  onAddContent,
  onEditContent,
  onDeleteContent,
  onTogglePublished,
}: DayEventsDialogProps) => {
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  // Reset selection when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedContent(null);
    }
    onOpenChange(newOpen);
  };

  // Group contents by category
  const contentsByCategory = useMemo(() => {
    const grouped: Record<string, ContentItem[]> = {};

    // Group categorized contents
    contents.forEach((content) => {
      if (!grouped[content.categoryId]) {
        grouped[content.categoryId] = [];
      }
      grouped[content.categoryId].push(content);
    });

    return grouped;
  }, [contents]);

  // Find uncategorized contents (contents with invalid categoryId)
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
                                onClick={() => setSelectedContent(content)}
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
                              onClick={() => setSelectedContent(content)}
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

          {/* Right panel - Event details (2/3) */}
          <div className="w-2/3 flex flex-col bg-muted/10">
            {selectedContent ? (
              <EventDetails
                content={selectedContent}
                category={getCategoryInfo(selectedContent.categoryId)}
                linkedContent={getLinkedContent(selectedContent.linkedContentId)}
                onEdit={() => {
                  onEditContent(selectedContent);
                  handleOpenChange(false);
                }}
                onDelete={() => {
                  onDeleteContent(selectedContent.id);
                  setSelectedContent(null);
                }}
              />
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
}

const EventDetails = ({ content, category, linkedContent, onEdit, onDelete }: EventDetailsProps) => {
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
                    <Checkbox checked={item.isDone} disabled className="shrink-0" />
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
