import { ContentItem, Category } from "@/types/planner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Check, MoreVertical, Copy } from "lucide-react";
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
}: CompactCellProps) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

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

  return (
    <div
      className={cn(
        "h-[44px] border border-grid-border cursor-pointer transition-all relative group flex items-center justify-center px-2",
        isSunday && "bg-sunday-accent",
        !content && "hover:bg-cell-hover",
        content && `bg-[hsl(${category.color}/0.25)] hover:bg-[hsl(${category.color}/0.35)]`,
        isDraggingOver && "ring-2 ring-primary"
      )}
      onClick={onEdit}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      draggable={!!content}
      onDragStart={() => content && onDragStart(content)}
    >
      {content ? (
        <div className="flex items-center gap-1.5 w-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs font-medium truncate flex-1 text-center">
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

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {content.published && (
              <Check className="h-3 w-3 text-green-400 flex-shrink-0" />
            )}
            
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
