import { useState, useMemo } from "react";
import { ContentItem, Category } from "@/types/planner";
import { format, isToday, isBefore, isAfter, startOfDay } from "date-fns";
import { it } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ExternalLink,
  Search,
  SortAsc,
  SortDesc,
  Filter,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskListViewProps {
  contents: ContentItem[];
  categories: Category[];
  onTogglePublished: (content: ContentItem) => void;
  onScrollToContent: (content: ContentItem) => void;
  onEditContent: (content: ContentItem) => void;
}

type SortField = "date" | "title" | "category" | "status";
type SortDirection = "asc" | "desc";
type StatusFilter = "all" | "completed" | "pending";
type DateFilter = "all" | "today" | "past" | "future" | "week";

export const TaskListView = ({
  contents,
  categories,
  onTogglePublished,
  onScrollToContent,
  onEditContent,
}: TaskListViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId);
  };

  const filteredAndSortedContents = useMemo(() => {
    let filtered = [...contents];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.notes?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((c) => c.categoryId === selectedCategory);
    }

    // Status filter
    if (statusFilter === "completed") {
      filtered = filtered.filter((c) => c.published);
    } else if (statusFilter === "pending") {
      filtered = filtered.filter((c) => !c.published);
    }

    // Date filter
    const today = startOfDay(new Date());
    if (dateFilter === "today") {
      filtered = filtered.filter((c) => isToday(c.date));
    } else if (dateFilter === "past") {
      filtered = filtered.filter((c) => isBefore(startOfDay(c.date), today));
    } else if (dateFilter === "future") {
      filtered = filtered.filter((c) => isAfter(startOfDay(c.date), today));
    } else if (dateFilter === "week") {
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      filtered = filtered.filter(
        (c) =>
          !isBefore(startOfDay(c.date), today) &&
          !isAfter(startOfDay(c.date), weekFromNow)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "category":
          const catA = getCategoryInfo(a.categoryId)?.name || "";
          const catB = getCategoryInfo(b.categoryId)?.name || "";
          comparison = catA.localeCompare(catB);
          break;
        case "status":
          comparison = (a.published ? 1 : 0) - (b.published ? 1 : 0);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    contents,
    searchQuery,
    selectedCategory,
    statusFilter,
    dateFilter,
    sortField,
    sortDirection,
    categories,
  ]);

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const stats = useMemo(() => {
    const total = contents.length;
    const completed = contents.filter((c) => c.published).length;
    const todayCount = contents.filter((c) => isToday(c.date)).length;
    const overdueCount = contents.filter(
      (c) => !c.published && isBefore(startOfDay(c.date), startOfDay(new Date()))
    ).length;
    return { total, completed, todayCount, overdueCount };
  }, [contents]);

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Totale Task</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completati</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.todayCount}</p>
                <p className="text-xs text-muted-foreground">Oggi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/20">
                <Circle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.overdueCount}</p>
                <p className="text-xs text-muted-foreground">In ritardo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca task..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: `hsl(${cat.color})` }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="pending">Da fare</SelectItem>
                <SelectItem value="completed">Completati</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select
              value={dateFilter}
              onValueChange={(v) => setDateFilter(v as DateFilter)}
            >
              <SelectTrigger className="w-[140px]">
                <CalendarDays className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le date</SelectItem>
                <SelectItem value="today">Oggi</SelectItem>
                <SelectItem value="week">Prossimi 7 giorni</SelectItem>
                <SelectItem value="past">Passati</SelectItem>
                <SelectItem value="future">Futuri</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Ordina per" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data</SelectItem>
                <SelectItem value="title">Titolo</SelectItem>
                <SelectItem value="category">Categoria</SelectItem>
                <SelectItem value="status">Stato</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={toggleSortDirection}>
              {sortDirection === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Task ({filteredAndSortedContents.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[calc(100vh-480px)] overflow-y-auto">
          {filteredAndSortedContents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nessun task trovato con i filtri selezionati
            </p>
          ) : (
            filteredAndSortedContents.map((content) => {
              const category = getCategoryInfo(content.categoryId);
              const isPast =
                !content.published &&
                isBefore(startOfDay(content.date), startOfDay(new Date()));
              const isTodayTask = isToday(content.date);

              return (
                <div
                  key={content.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-muted/50 cursor-pointer",
                    content.published && "opacity-60",
                    isPast && "border-destructive/30 bg-destructive/5",
                    isTodayTask && !content.published && "border-primary/30 bg-primary/5"
                  )}
                  onClick={() => onEditContent(content)}
                >
                  <Checkbox
                    checked={content.published}
                    onCheckedChange={() => {
                      onTogglePublished(content);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />

                  {category && (
                    <Badge
                      variant="outline"
                      className="text-xs shrink-0"
                      style={{
                        backgroundColor: `hsl(${category.color} / 0.15)`,
                        borderColor: `hsl(${category.color} / 0.4)`,
                        color: `hsl(${category.color.split(" ")[0]} ${
                          category.color.split(" ")[1]
                        } 75%)`,
                      }}
                    >
                      {category.name}
                    </Badge>
                  )}

                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        "font-medium truncate",
                        content.published && "line-through"
                      )}
                    >
                      {content.title}
                    </div>
                    {content.notes && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {content.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                    <span
                      className={cn(
                        isTodayTask && "text-primary font-medium",
                        isPast && "text-destructive"
                      )}
                    >
                      {format(content.date, "d MMM", { locale: it })}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onScrollToContent(content);
                      }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};
