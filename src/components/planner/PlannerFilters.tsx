import { Category } from "@/types/planner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlannerFiltersProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  selectedWeek: number | null;
  onWeekChange: (week: number | null) => void;
  totalWeeks: number;
  endlessMode: boolean;
}

export const PlannerFilters = ({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedWeek,
  onWeekChange,
  totalWeeks,
  endlessMode,
}: PlannerFiltersProps) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-grid-border bg-muted/20 overflow-x-auto">
      <span className="text-[10px] text-muted-foreground font-medium shrink-0">Categorie:</span>
      <div className="flex items-center gap-1 flex-wrap">
        <Button
          variant={selectedCategory === null ? "default" : "ghost"}
          size="sm"
          className="h-6 px-2 text-[10px]"
          onClick={() => onCategoryChange(null)}
        >
          Tutte
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "ghost"}
            size="sm"
            className={cn(
              "h-6 px-2 text-[10px] gap-1.5",
              selectedCategory === cat.id && "ring-1 ring-primary"
            )}
            onClick={() => onCategoryChange(cat.id)}
          >
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: `hsl(${cat.color})` }}
            />
            {cat.name}
          </Button>
        ))}
      </div>

      {!endlessMode && totalWeeks > 0 && (
        <>
          <div className="w-px h-4 bg-border shrink-0 mx-1" />
          <span className="text-[10px] text-muted-foreground font-medium shrink-0">Settimane:</span>
          <div className="flex items-center gap-0.5">
            <Button
              variant={selectedWeek === null ? "default" : "ghost"}
              size="sm"
              className="h-5 w-5 p-0 text-[9px]"
              onClick={() => onWeekChange(null)}
            >
              ∞
            </Button>
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => (
              <Button
                key={week}
                variant={selectedWeek === week ? "default" : "ghost"}
                size="sm"
                className="h-5 w-5 p-0 text-[9px]"
                onClick={() => onWeekChange(week)}
              >
                {week}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
