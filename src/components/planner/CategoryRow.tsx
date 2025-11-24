import { Category } from "@/types/planner";
import { cn } from "@/lib/utils";

interface CategoryRowProps {
  category: Category;
}

const categoryColorMap: Record<string, string> = {
  CHRONICLES: "bg-category-chronicles/20 text-category-chronicles border-category-chronicles/30",
  GAMING: "bg-category-gaming/20 text-category-gaming border-category-gaming/30",
  MINECRAFT: "bg-category-minecraft/20 text-category-minecraft border-category-minecraft/30",
  REC: "bg-category-rec/20 text-category-rec border-category-rec/30",
  VOD: "bg-category-vod/20 text-category-vod border-category-vod/30",
  TWITCH: "bg-category-twitch/20 text-category-twitch border-category-twitch/30",
};

export const CategoryRow = ({ category }: CategoryRowProps) => {
  return (
    <div
      className={cn(
        "sticky left-0 z-10 flex items-center justify-center px-4 py-3 font-semibold text-sm border-r border-grid-border min-w-[150px]",
        categoryColorMap[category.name] || "bg-muted/20 text-foreground border-border"
      )}
    >
      {category.name}
    </div>
  );
};
