import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ContentItem, Category } from "@/types/planner";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Search, Link2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LinkedContentSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contents: ContentItem[];
  categories: Category[];
  currentContentId?: string;
  onSelect: (contentId: string) => void;
}

export const LinkedContentSelector = ({
  open,
  onOpenChange,
  contents,
  categories,
  currentContentId,
  onSelect,
}: LinkedContentSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const filteredContents = useMemo(() => {
    return contents
      .filter((c) => c.id !== currentContentId)
      .filter((c) => !c.published) // Escludi contenuti già pubblicati
      .filter((c) => {
        const matchesSearch = !searchQuery || 
          c.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategoryId || 
          c.categoryId === selectedCategoryId;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [contents, currentContentId, searchQuery, selectedCategoryId]);

  const getCategoryForContent = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId);
  };

  const handleSelect = (contentId: string) => {
    onSelect(contentId);
    onOpenChange(false);
    setSearchQuery("");
    setSelectedCategoryId(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Seleziona Contenuto Collegato
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca contenuto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategoryId === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategoryId(null)}
            >
              Tutte
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategoryId === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategoryId(cat.id)}
                style={{
                  backgroundColor: selectedCategoryId === cat.id 
                    ? `hsl(${cat.color})` 
                    : undefined,
                }}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {filteredContents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nessun contenuto trovato
                </div>
              ) : (
                filteredContents.map((content) => {
                  const category = getCategoryForContent(content.categoryId);
                  return (
                    <button
                      key={content.id}
                      onClick={() => handleSelect(content.id)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{content.title}</div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            {category && (
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase"
                                style={{
                                  backgroundColor: `hsl(${category.color} / 0.2)`,
                                  color: `hsl(${category.color})`,
                                }}
                              >
                                {category.name}
                              </span>
                            )}
                            <span>
                              {format(content.date, "d MMM yyyy", { locale: it })}
                            </span>
                          </div>
                        </div>
                        {content.published && (
                          <div className="text-xs text-green-500">✓ Pubblicato</div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
