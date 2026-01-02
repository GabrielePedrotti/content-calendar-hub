import { ContentItem, Category } from "@/types/planner";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Check, MoreVertical, Copy, Link2, Plus, Trash2, LayoutTemplate } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface CompactCellProps {
  contents: ContentItem[];
  category: Category;
  isSunday: boolean;
  date: Date;
  isVacation: boolean;
  vacationLabel?: string;
  onEdit: (content?: ContentItem, templateId?: string) => void;
  onDragStart: (content: ContentItem, isAltDrag: boolean) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDuplicate: (content: ContentItem) => void;
  onTogglePublished: (content: ContentItem) => void;
  onDelete: (content: ContentItem) => void;
  onQuickEdit: (content: ContentItem | undefined, newTitle: string) => void;
  onLinkHover: (contentId: string | null) => void;
  onLinkClick: (content: ContentItem) => void;
  allContents: ContentItem[];
  allCategories: Category[];
  highlightedContentId?: string | null;
  cellOpacity: { empty: number; filled: number };
  maxContentsInRow: number;
  maxVisibleContents?: number;
  isDisabled?: boolean;
  isPrimaryTemplateMode?: boolean;
  isSecondaryTemplateMode?: boolean;
  templates?: { id: string; name: string; defaultCategoryId?: string }[];
  onCategoryHover?: (categoryId: string | null) => void;
  onDateHover?: (date: Date | null) => void;
  onContentHover?: (contentId: string | null) => void;
  cellDate?: Date;
  showMonthBoundary?: boolean;
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
  onDelete,
  onQuickEdit,
  onLinkHover,
  onLinkClick,
  allContents,
  allCategories,
  highlightedContentId,
  cellOpacity,
  maxContentsInRow,
  maxVisibleContents = 2,
  isDisabled = false,
  isPrimaryTemplateMode = false,
  isSecondaryTemplateMode = false,
  templates = [],
  onCategoryHover,
  onDateHover,
  onContentHover,
  cellDate,
  showMonthBoundary = false,
}: CompactCellProps) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | undefined>();
  const [editValue, setEditValue] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
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
    if (isDisabled) return;
    
    // Shift, Ctrl, or Alt + Click = open full details
    if (e.shiftKey || e.ctrlKey || e.altKey) {
      onEdit(content);
      return;
    }
    
    // 1 or 2 key pressed = open popup with template
    if (!content && (isPrimaryTemplateMode || isSecondaryTemplateMode)) {
      const templateId = isSecondaryTemplateMode 
        ? category.secondaryTemplateId 
        : category.defaultTemplateId;
      onEdit(undefined, templateId);
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

  // Usa minRowHeight dalla categoria
  const minHeight = category.minRowHeight || 44;
  const cellHeight = maxContentsInRow <= 1 ? `${minHeight}px` : `${minHeight + (maxContentsInRow - 1) * 16}px`;
  
  // Determina quanti contenuti mostrare inline
  const visibleContents = contents.slice(0, maxVisibleContents);
  const remainingCount = Math.max(0, contents.length - maxVisibleContents);

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

    // Bordo divisorio tra mesi diversi (endless mode)
    if (showMonthBoundary) {
      baseStyle.borderLeftWidth = '2px';
      baseStyle.borderLeftColor = 'hsl(var(--month-divider))';
    }
    
    return baseStyle;
  };

  // Context menu for single content
  const renderContextMenu = (content: ContentItem, children: React.ReactNode) => (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => onDuplicate(content)}
        >
          <Copy className="h-4 w-4 mr-2" />
          Duplica
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onTogglePublished(content)}
        >
          <Check className="h-4 w-4 mr-2" />
          {content.published ? "Segna non pubblicato" : "Segna pubblicato"}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onDelete(content)}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Elimina
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  // Get templates for this category only
  const categoryTemplates = templates.filter(
    (t) => t.defaultCategoryId === category.id
  );

  // Empty cell context menu - show templates directly without submenu
  const renderEmptyCellContextMenu = (children: React.ReactNode) => (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => {
          // Reset editing state before opening dialog
          setIsEditing(false);
          setEditingContent(undefined);
          onEdit();
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuovo contenuto
        </ContextMenuItem>
        {categoryTemplates.map((template) => (
          <ContextMenuItem
            key={template.id}
            onClick={() => {
              // Reset editing state before opening dialog
              setIsEditing(false);
              setEditingContent(undefined);
              onEdit(undefined, template.id);
            }}
          >
            <LayoutTemplate className="h-4 w-4 mr-2" />
            {template.name}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );

  return (
    <div
      ref={cellRef}
      style={{
        ...getCellStyle(),
        height: cellHeight,
      }}
      className={cn(
        "border-l border-r border-grid-border transition-all relative group flex flex-col items-center justify-center px-1.5 py-1",
        isDisabled 
          ? "opacity-30 cursor-not-allowed bg-muted/10" 
          : "cursor-pointer",
        !isDisabled && contents.length === 0 && "hover:brightness-110",
        !isDisabled && contents.length > 0 && "hover:brightness-125",
        isDraggingOver && "ring-2 ring-primary",
        isHighlighted && "ring-2 ring-primary animate-pulse"
      )}
      onClick={(e) => !isDisabled && handleClick(e)}
      onMouseEnter={() => {
        onCategoryHover?.(category.id);
        onDateHover?.(cellDate || date);
      }}
      onMouseLeave={() => {
        onCategoryHover?.(null);
        onDateHover?.(null);
      }}
      onDragOver={!isDisabled ? handleDragOver : undefined}
      onDragLeave={!isDisabled ? handleDragLeave : undefined}
      onDrop={!isDisabled ? handleDrop : undefined}
    >
      {contents.length === 0 ? (
        renderEmptyCellContextMenu(
          <span className={cn(
            "text-[10px] transition-colors w-full h-full flex items-center justify-center",
            isDisabled 
              ? "text-muted-foreground/20" 
              : "text-muted-foreground/0 group-hover:text-muted-foreground/60"
          )}>
            +
          </span>
        )
      ) : contents.length === 1 ? (
        // Single content - centered display with context menu
        renderContextMenu(contents[0], 
          <div 
            className="flex items-center gap-1.5 w-full" 
            data-content-id={contents[0].id}
            onMouseEnter={() => onContentHover?.(contents[0].id)}
            onMouseLeave={() => onContentHover?.(null)}
          >
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
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(contents[0]);
                    }}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )
      ) : contents.length === 2 ? (
        // Two contents - show both with per-item context menu (no TooltipProvider wrapping ContextMenuTrigger)
        <div className="w-full space-y-1 overflow-hidden py-0.5">
          <TooltipProvider>
            {contents.map((content) => (
              <ContextMenu key={content.id}>
                <ContextMenuTrigger asChild>
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
                    onMouseEnter={() => onContentHover?.(content.id)}
                    onMouseLeave={() => onContentHover?.(null)}
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

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={cn(
                            "truncate flex-1 font-medium leading-tight",
                            content.published && "opacity-75",
                          )}
                        >
                          {content.title}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[300px]">{content.title}</p>
                        {content.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{content.notes}</p>
                        )}
                      </TooltipContent>
                    </Tooltip>

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
                </ContextMenuTrigger>

                <ContextMenuContent>
                  <ContextMenuItem onClick={() => onDuplicate(content)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplica
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => onTogglePublished(content)}>
                    <Check className="h-4 w-4 mr-2" />
                    {content.published ? "Segna non pubblicato" : "Segna pubblicato"}
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => onDelete(content)}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </TooltipProvider>
        </div>
      ) : (
        // More than 2 contents - show first one + popover with all (with context menu)
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <div
              className="w-full space-y-1 overflow-hidden py-0.5 cursor-pointer"
              onMouseEnter={() => setPopoverOpen(true)}
            >
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <div
                    data-content-id={contents[0].id}
                    className="flex items-center gap-1.5 text-[11px] hover:bg-background/30 px-1 py-0.5 rounded transition-colors"
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      onDragStart(contents[0], e.altKey);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick(e, contents[0]);
                    }}
                    onMouseEnter={() => onContentHover?.(contents[0].id)}
                    onMouseLeave={() => onContentHover?.(null)}
                  >
                    <button
                      onClick={(e) => handleTogglePublished(e, contents[0])}
                      className="flex-shrink-0 hover:scale-110 transition-transform"
                    >
                      {contents[0].published ? (
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="h-1.5 w-1.5 text-white" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="h-2.5 w-2.5 rounded-full bg-background border-2 border-muted-foreground/40" />
                      )}
                    </button>
                    <span
                      className={cn(
                        "truncate flex-1 font-medium leading-tight",
                        contents[0].published && "opacity-75",
                      )}
                    >
                      {contents[0].title}
                    </span>
                    {contents[0].linkedContentId && (
                      <button
                        onMouseEnter={() => onLinkHover(contents[0].linkedContentId!)}
                        onMouseLeave={() => onLinkHover(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onLinkClick(contents[0]);
                        }}
                        className="flex-shrink-0 hover:scale-110 transition-transform"
                      >
                        <Link2 className="h-2.5 w-2.5 text-primary" />
                      </button>
                    )}
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => onDuplicate(contents[0])}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplica
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => onTogglePublished(contents[0])}>
                    <Check className="h-4 w-4 mr-2" />
                    {contents[0].published ? "Segna non pubblicato" : "Segna pubblicato"}
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => onDelete(contents[0])}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-[10px] text-muted-foreground hover:text-foreground w-full text-center py-0.5 hover:bg-background/20 rounded transition-colors font-medium"
              >
                +{remainingCount} {remainingCount === 1 ? "altro" : "altri"}
              </button>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-2 max-h-[400px] overflow-y-auto"
            onMouseLeave={() => setPopoverOpen(false)}
          >
            <div className="space-y-1">
              {contents.map((content) => (
                <ContextMenu key={content.id}>
                  <ContextMenuTrigger asChild>
                    <div
                      data-content-id={content.id}
                      className="flex items-center gap-2 text-sm hover:bg-accent px-2 py-1.5 rounded transition-colors cursor-pointer"
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        onDragStart(content, e.altKey);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPopoverOpen(false);
                        handleClick(e, content);
                      }}
                      onMouseEnter={() => onContentHover?.(content.id)}
                      onMouseLeave={() => onContentHover?.(null)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePublished(e, content);
                        }}
                        className="flex-shrink-0 hover:scale-110 transition-transform"
                      >
                        {content.published ? (
                          <div className="h-3 w-3 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="h-2 w-2 text-white" strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="h-3 w-3 rounded-full bg-background border-2 border-muted-foreground/40" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-medium truncate", content.published && "opacity-75")}>
                          {content.title}
                        </p>
                        {content.notes && (
                          <p className="text-xs text-muted-foreground truncate">{content.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {content.linkedContentId && (
                          <button
                            onMouseEnter={() => onLinkHover(content.linkedContentId!)}
                            onMouseLeave={() => onLinkHover(null)}
                            onClick={(e) => {
                              e.stopPropagation();
                              onLinkClick(content);
                            }}
                            className="hover:scale-110 transition-transform"
                          >
                            <Link2 className="h-3 w-3 text-primary" />
                          </button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            onClick={(e) => e.stopPropagation()}
                            className="h-6 w-6 hover:bg-background/50 rounded flex items-center justify-center"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onDuplicate(content);
                              }}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplica
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onTogglePublished(content);
                              }}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              {content.published ? "Segna non pubblicato" : "Segna pubblicato"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </ContextMenuTrigger>

                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => onDuplicate(content)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplica
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => onTogglePublished(content)}>
                      <Check className="h-4 w-4 mr-2" />
                      {content.published ? "Segna non pubblicato" : "Segna pubblicato"}
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => onDelete(content)}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Elimina
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
