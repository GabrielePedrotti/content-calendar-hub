import { useState, useMemo } from "react";
import { Category, ContentItem } from "@/types/planner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Filter, Calendar, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface PlannerFiltersProps {
  categories: Category[];
  contents: ContentItem[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  selectedWeek: number | null;
  onWeekChange: (week: number | null) => void;
  totalWeeks: number;
  endlessMode: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onContentClick?: (content: ContentItem) => void;
}

export const PlannerFilters = ({
  categories,
  contents,
  selectedCategory,
  onCategoryChange,
  selectedWeek,
  onWeekChange,
  totalWeeks,
  endlessMode,
  searchQuery = "",
  onSearchChange,
  onContentClick,
}: PlannerFiltersProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return contents
      .filter((c) => 
        c.title.toLowerCase().includes(query) ||
        c.notes?.toLowerCase().includes(query)
      )
      .slice(0, 10); // Limit to 10 results
  }, [contents, searchQuery]);

  const handleResultClick = (content: ContentItem) => {
    onContentClick?.(content);
    setShowSearch(false);
    onSearchChange?.("");
  };

  const getCategoryForContent = (content: ContentItem) => {
    return categories.find((c) => c.id === content.categoryId);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-transparent overflow-x-auto ml-auto">
      {/* Search */}
      <div className="relative flex items-center gap-1">
        {showSearch ? (
          <div className="flex items-center gap-1">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Cerca evento..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="h-7 w-56 pl-7 pr-7 text-xs bg-background"
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
              
              {/* Search Results Dropdown */}
              {searchQuery && isFocused && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 overflow-hidden">
                  {searchResults.length === 0 ? (
                    <div className="p-3 text-xs text-muted-foreground text-center">
                      Nessun risultato trovato
                    </div>
                  ) : (
                    <ScrollArea className="max-h-64">
                      <div className="p-1">
                        {searchResults.map((content) => {
                          const category = getCategoryForContent(content);
                          return (
                            <button
                              key={content.id}
                              className="w-full text-left px-3 py-2 rounded hover:bg-accent/50 transition-colors flex items-start gap-2"
                              onClick={() => handleResultClick(content)}
                            >
                              <div
                                className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                                style={{ backgroundColor: category ? `hsl(${category.color})` : 'hsl(var(--muted-foreground))' }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium truncate">{content.title}</span>
                                  {content.published && (
                                    <Check className="h-3 w-3 text-green-500 shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                  <Calendar className="h-2.5 w-2.5" />
                                  <span>{format(content.date, "d MMM yyyy", { locale: it })}</span>
                                  {category && (
                                    <>
                                      <span>•</span>
                                      <span>{category.name}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </div>
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
