import { Category } from "@/types/planner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-wrap items-end gap-4 p-4 border-b border-grid-border bg-card">
      <div className="flex-1 min-w-[200px]">
        <Label className="text-xs mb-1.5 block">Filtra per Categoria</Label>
        <Select
          value={selectedCategory || "all"}
          onValueChange={(v) => onCategoryChange(v === "all" ? null : v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le categorie</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!endlessMode && (
        <div className="flex gap-2">
          <Label className="text-xs mb-1.5 block w-full">Filtra per Settimana</Label>
          <div className="flex gap-1">
            <Button
              variant={selectedWeek === null ? "default" : "outline"}
              size="sm"
              onClick={() => onWeekChange(null)}
            >
              Tutte
            </Button>
            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => (
              <Button
                key={week}
                variant={selectedWeek === week ? "default" : "outline"}
                size="sm"
                onClick={() => onWeekChange(week)}
              >
                S{week}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
