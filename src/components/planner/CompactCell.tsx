import { ContentItem, Category } from "@/types/planner";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Check, MoreVertical, Copy, Link2, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

interface CompactCellProps {
  contents: ContentItem[];
  category: Category;
  isSunday: boolean;
  date: Date;
  isVacation: boolean;
  vacationLabel?: string;
  onEdit: (content?: ContentItem) => void;
  onDragStart: (content: ContentItem, isAltDrag: boolean) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDuplicate: (content: ContentItem) => void;
  onTogglePublished: (content: ContentItem) => void;
  onQuickEdit: (content: ContentItem | undefined, newTitle: string) => void;
  onLinkHover: (contentId: string | null) => void;
  onLinkClick: (content: ContentItem) => void;
  allContents: ContentItem[];
  allCategories: Category[];
  highlightedContentId?: string | null;
  cellOpacity: { empty: number; filled: number };
  maxContentsInRow: number;
}

export const CompactCell = ({
  contents,
  category,
  isSunday,
  date,
  isVacation,
  vacationLabel,
  onEdit,
  onDragStart,
  onDragOver,
  onDrop,
  onDuplicate,
  onTogglePublished,
  onQuickEdit,
  onLinkHover,
  onLinkClick,
  allContents,
  allCategories,
  highlightedContentId,
  cellOpacity,
  maxContentsInRow,
}: CompactCellProps) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | undefined>();
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
    onDragOver(e);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    onDrop();
  };

  const handleClick = (e: React.MouseEvent, content?: ContentItem) => {
    // Shift, Ctrl, or Alt + Click = open full details
    if (e.shiftKey || e.ctrlKey || e.altKey) {
      onEdit(content);
      return;
    }

    // Normal click = inline edit
    if (content) {
      setEditingContent(content);
      setEditValue(content.title);
      setIsEditing(true);
    } else {
      setEditingContent(undefined);
      setEditValue("");
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    // If title is empty, delete the content
    if (!trimmedValue && editingContent) {
      onQuickEdit(editingContent, "");
    } else if (trimmedValue) {
      onQuickEdit(editingContent, trimmedValue);
    }
    setIsEditing(false);
    setEditingContent(undefined);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingContent(undefined);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleTogglePublished = (e: React.MouseEvent, content: ContentItem) => {
    e.stopPropagation();
    onTogglePublished(content);
  };

  const getLinkedContent = (linkedId?: string) => {
    if (!linkedId) return null;
    return allContents.find((c) => c.id === linkedId);
  };

  const getLinkedCategory = (content: ContentItem) => {
    const linked = getLinkedContent(content.linkedContentId);
    if (!linked) return null;
    return allCategories.find((cat) => cat.id === linked.categoryId);
  };

  const isHighlighted = contents.some((c) => c.id === highlightedContentId);

  const cellHeight = maxContentsInRow <= 1 ? "44px" : maxContentsInRow === 2 ? "60px" : maxContentsInRow === 3 ? "76px" : "92px";

  if (isEditing) {
    return (
      <div
        ref={cellRef}
        style={{
          backgroundColor: contents.length > 0 
            ? `hsl(${category.color} / ${cellOpacity.filled / 100})` 
            : `hsl(${category.color} / ${cellOpacity.empty / 100})`,
          height: cellHeight,
        }}
        className={cn(
          "border transition-all relative flex items-center justify-center px-2",
          isSunday && "bg-sunday-accent",
          isVacation && "bg-vacation-overlay",
          "ring-2 ring-primary"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="h-8 text-xs text-center border-0 bg-transparent focus-visible:ring-0 px-1"
          placeholder="Titolo contenuto..."
        />
      </div>
    );
  }

  const visibleContents = contents.length <= 3 ? contents : contents.slice(0, 3);
  const remainingCount = Math.max(0, contents.length - 3);

  const getCellStyle = () => {
    const baseStyle: React.CSSProperties = {};
    
    if (contents.length === 0) {
      // Empty cell - configurable transparency
      baseStyle.backgroundColor = `hsl(${category.color} / ${cellOpacity.empty / 100})`;
    } else {
      // Cell with content - configurable transparency
      baseStyle.backgroundColor = `hsl(${category.color} / ${cellOpacity.filled / 100})`;
      baseStyle.borderTopWidth = '2px';
      baseStyle.borderBottomWidth = '2px';
      baseStyle.borderTopColor = `hsl(${category.color} / 0.6)`;
      baseStyle.borderBottomColor = `hsl(${category.color} / 0.6)`;
    }
    
    return baseStyle;
  };

  return (
    <div
      ref={cellRef}
      style={{
        ...getCellStyle(),
        height: cellHeight,
      }}
      className={cn(
        "border-l border-r border-grid-border cursor-pointer transition-all relative group flex flex-col items-center justify-center px-1.5 py-1",
        contents.length === 0 && "hover:brightness-110",
        contents.length > 0 && "hover:brightness-125",
        isDraggingOver && "ring-2 ring-primary",
        isHighlighted && "ring-2 ring-primary animate-pulse"
      )}
      onClick={(e) => handleClick(e)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {contents.length === 0 ? (
        <span className="text-[10px] text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors">
          +
        </span>
      ) : contents.length === 1 ? (
        // Single content - centered display
        <div className="flex items-center gap-1.5 w-full" data-content-id={contents[0].id}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => handleTogglePublished(e, contents[0])}
                  className="flex-shrink-0 hover:scale-110 transition-transform"
                >
                  {contents[0].published ? (
                    <div className="h-3 w-3 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-2 w-2 text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="h-3 w-3 rounded-full bg-muted border-2 border-muted-foreground/30" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {contents[0].published ? "Pubblicato" : "Da fare"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "text-xs font-medium truncate flex-1 text-center",
                    contents[0].published && "opacity-80"
                  )}
                  draggable
                  onDragStart={(e) => onDragStart(contents[0], e.altKey)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick(e, contents[0]);
                  }}
                >
                  {contents[0].title}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-[300px]">{contents[0].title}</p>
                {contents[0].notes && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {contents[0].notes}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {contents[0].linkedContentId && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onMouseEnter={() => onLinkHover(contents[0].linkedContentId!)}
                    onMouseLeave={() => onLinkHover(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLinkClick(contents[0]);
                    }}
                    className="flex-shrink-0"
                  >
                    <Link2 className="h-3 w-3 text-primary" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {(() => {
                    const linked = getLinkedContent(contents[0].linkedContentId);
                    const linkedCat = linked ? allCategories.find((cat) => cat.id === linked.categoryId) : null;
                    return (
                      <>
                        <p className="text-xs font-semibold">Collegato a:</p>
                        <p className="text-xs">
                          {linkedCat?.name} – {linked?.title}
                        </p>
                      </>
                    );
                  })()}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="h-5 w-5 hover:bg-background/50 rounded flex items-center justify-center"
              >
                <MoreVertical className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(contents[0]);
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplica
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePublished(contents[0]);
                  }}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {contents[0].published ? "Segna non pubblicato" : "Segna pubblicato"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ) : (
        // Multiple contents - compact list (show all if 2-3, otherwise show 3 + remaining count)
        <div className="w-full space-y-1 overflow-hidden py-0.5">
          {visibleContents.map((content, index) => (
            <TooltipProvider key={content.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    data-content-id={content.id}
                    className="flex items-center gap-1.5 text-[11px] hover:bg-background/30 px-1 py-0.5 rounded transition-colors cursor-pointer"
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      onDragStart(content, e.altKey);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick(e, content);
                    }}
                  >
                    <button
                      onClick={(e) => handleTogglePublished(e, content)}
                      className="flex-shrink-0 hover:scale-110 transition-transform"
                    >
                      {content.published ? (
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="h-1.5 w-1.5 text-white" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="h-2.5 w-2.5 rounded-full bg-background border-2 border-muted-foreground/40" />
                      )}
                    </button>
                    <span className={cn(
                      "truncate flex-1 font-medium leading-tight",
                      content.published && "opacity-75"
                    )}>
                      {content.title}
                    </span>
                    {content.linkedContentId && (
                      <button
                        onMouseEnter={() => onLinkHover(content.linkedContentId!)}
                        onMouseLeave={() => onLinkHover(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onLinkClick(content);
                        }}
                        className="flex-shrink-0 hover:scale-110 transition-transform"
                      >
                        <Link2 className="h-2.5 w-2.5 text-primary" />
                      </button>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[300px]">{content.title}</p>
                  {content.notes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {content.notes}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          {remainingCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-[10px] text-muted-foreground hover:text-foreground w-full text-center py-0.5 hover:bg-background/20 rounded transition-colors font-medium"
            >
              +{remainingCount} altri...
            </button>
          )}
        </div>
      )}
    </div>
  );
};
