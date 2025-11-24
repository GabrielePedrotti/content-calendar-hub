import { ContentItem, Category } from "@/types/planner";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Check, MoreVertical, Copy, Link2 } from "lucide-react";
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
  content?: ContentItem;
  category: Category;
  isSunday: boolean;
  date: Date;
  onEdit: () => void;
  onDragStart: (content: ContentItem) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDuplicate: (content: ContentItem) => void;
  onTogglePublished: (content: ContentItem) => void;
  onQuickEdit: (newTitle: string) => void;
  linkedContent?: ContentItem;
  linkedCategory?: Category;
}

export const CompactCell = ({
  content,
  category,
  isSunday,
  date,
  onEdit,
  onDragStart,
  onDragOver,
  onDrop,
  onDuplicate,
  onTogglePublished,
  onQuickEdit,
  linkedContent,
  linkedCategory,
}: CompactCellProps) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleClick = (e: React.MouseEvent) => {
    // Shift, Ctrl, or Alt + Click = open full details
    if (e.shiftKey || e.ctrlKey || e.altKey) {
      onEdit();
      return;
    }

    // Normal click = inline edit
    if (content) {
      setEditValue(content.title);
      setIsEditing(true);
    } else {
      setEditValue("");
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (editValue.trim()) {
      onQuickEdit(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
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

  const handleTogglePublished = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (content) {
      onTogglePublished(content);
    }
  };

  if (isEditing) {
    return (
      <div
        className={cn(
          "h-[44px] border border-grid-border transition-all relative flex items-center justify-center px-2",
          isSunday && "bg-sunday-accent",
          content && `bg-[hsl(${category.color}/0.15)]`,
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

  return (
    <div
      className={cn(
        "h-[44px] border cursor-pointer transition-all relative group flex items-center justify-center px-2",
        isSunday && "bg-sunday-accent",
        !content && "hover:bg-cell-hover border-grid-border",
        content && `bg-[hsl(${category.color}/0.15)] hover:bg-[hsl(${category.color}/0.25)] border-[hsl(${category.color}/0.4)] border-t-2 border-b-2`,
        isDraggingOver && "ring-2 ring-primary"
      )}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      draggable={!!content}
      onDragStart={() => content && onDragStart(content)}
    >
      {content ? (
        <div className="flex items-center gap-1.5 w-full">
          {/* Publication status indicator */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleTogglePublished}
                  className="flex-shrink-0 hover:scale-110 transition-transform"
                >
                  {content.published ? (
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
                  {content.published ? "Pubblicato" : "Da fare"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Title */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn(
                  "text-xs font-medium truncate flex-1 text-center",
                  content.published && "opacity-80"
                )}>
                  {content.title}
                </span>
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

          {/* Linked content indicator */}
          {content.linkedContentId && linkedContent && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link2 className="h-3 w-3 text-primary flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-semibold">Collegato a:</p>
                  <p className="text-xs">
                    {linkedCategory?.name} – {linkedContent.title}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Actions menu */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="h-5 w-5 hover:bg-background/50 rounded flex items-center justify-center"
              >
                <MoreVertical className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(content);
                }}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplica
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onTogglePublished(content);
                }}>
                  <Check className="h-4 w-4 mr-2" />
                  {content.published ? "Segna non pubblicato" : "Segna pubblicato"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ) : (
        <span className="text-[10px] text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors">
          +
        </span>
      )}
    </div>
  );
};
