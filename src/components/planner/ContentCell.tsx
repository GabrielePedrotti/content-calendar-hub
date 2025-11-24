import { ContentItem } from "@/types/planner";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Check } from "lucide-react";

interface ContentCellProps {
  content?: ContentItem;
  categoryColor: string;
  isSunday: boolean;
  onEdit: (content?: ContentItem) => void;
  onTogglePublished?: (contentId: string) => void;
}

const categoryColorMap: Record<string, string> = {
  CHRONICLES: "bg-category-chronicles/30 hover:bg-category-chronicles/40 border-category-chronicles/50",
  GAMING: "bg-category-gaming/30 hover:bg-category-gaming/40 border-category-gaming/50",
  MINECRAFT: "bg-category-minecraft/30 hover:bg-category-minecraft/40 border-category-minecraft/50",
  REC: "bg-category-rec/30 hover:bg-category-rec/40 border-category-rec/50",
  VOD: "bg-category-vod/30 hover:bg-category-vod/40 border-category-vod/50",
  TWITCH: "bg-category-twitch/30 hover:bg-category-twitch/40 border-category-twitch/50",
};

export const ContentCell = ({
  content,
  categoryColor,
  isSunday,
  onEdit,
  onTogglePublished,
}: ContentCellProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "min-h-[60px] p-2 border border-grid-border cursor-pointer transition-all relative group",
        isSunday && "bg-sunday-accent",
        !content && "hover:bg-cell-hover",
        content && categoryColorMap[categoryColor]
      )}
      onClick={() => onEdit(content)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {content ? (
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium line-clamp-2">{content.title}</span>
          {content.published && (
            <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
          )}
        </div>
      ) : (
        isHovered && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
            Clicca per aggiungere
          </div>
        )
      )}
    </div>
  );
};
