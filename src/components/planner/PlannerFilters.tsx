import { useState } from "react";
import { Category, ContentItem } from "@/types/planner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlannerFiltersProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  selectedWeek: number | null;
  onWeekChange: (week: number | null) => void;
  totalWeeks: number;
  endlessMode: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const PlannerFilters = ({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedWeek,
  onWeekChange,
  totalWeeks,
  endlessMode,
  searchQuery = "",
  onSearchChange,
}: PlannerFiltersProps) => {
  const [showSearch, setShowSearch] = useState(false);

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-transparent overflow-x-auto ml-auto">
      {/* Search */}
      <div className="flex items-center gap-1">
        {showSearch ? (
          <div className="flex items-center gap-1">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cerca evento..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="h-7 w-40 pl-7 pr-7 text-xs bg-background"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-7 w-7"
                  onClick={() => onSearchChange?.("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setShowSearch(false);
                onSearchChange?.("");
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => setShowSearch(true)}
          >
            <Search className="h-3.5 w-3.5" />
            Cerca
          </Button>
        )}
      </div>

      <div className="w-px h-4 bg-border shrink-0" />

      {/* Category Filter Dropdown */}
      <div className="flex items-center gap-1.5">
        <Filter className="h-3 w-3 text-muted-foreground" />
        <Select
          value={selectedCategory || "all"}
          onValueChange={(value) => onCategoryChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs bg-background border-border">
            <SelectValue>
              {selectedCategory ? (
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: `hsl(${selectedCategoryData?.color})` }}
                  />
                  {selectedCategoryData?.name}
                </div>
              ) : (
                "Tutte le categorie"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            <SelectItem value="all" className="text-xs">
              Tutte le categorie
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id} className="text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: `hsl(${cat.color})` }}
                  />
                  {cat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Week filter - only in non-endless mode */}
      {!endlessMode && totalWeeks > 0 && (
        <>
          <div className="w-px h-4 bg-border shrink-0 mx-1" />
          <span className="text-[10px] text-muted-foreground font-medium shrink-0">Sett:</span>
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
