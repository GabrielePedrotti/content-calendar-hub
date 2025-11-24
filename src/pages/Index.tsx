import { useState, useMemo } from "react";
import { PlannerHeader } from "@/components/planner/PlannerHeader";
import { CompactWeekGrid } from "@/components/planner/CompactWeekGrid";
import { ContentDialog } from "@/components/planner/ContentDialog";
import { CategoryManager } from "@/components/planner/CategoryManager";
import { SeriesCreator } from "@/components/planner/SeriesCreator";
import { PlannerFilters } from "@/components/planner/PlannerFilters";
import { InfoDialog } from "@/components/planner/InfoDialog";
import { Category, ContentItem, WeekDay, SeriesConfig } from "@/types/planner";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSunday,
  addDays,
  isWeekend,
  addWeeks,
  format,
} from "date-fns";
import { it } from "date-fns/locale";
import { toast } from "sonner";

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | undefined>();
  const [preselectedCategory, setPreselectedCategory] = useState<string | undefined>();
  const [preselectedDate, setPreselectedDate] = useState<Date | undefined>();

  // Filtri
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  // Drag & Drop
  const [draggedContent, setDraggedContent] = useState<ContentItem | null>(null);

  const [categories, setCategories] = useState<Category[]>([
    { id: "chronicles", name: "CHRONICLES", color: "142 76% 45%" },
    { id: "gaming", name: "GAMING", color: "210 100% 50%" },
    { id: "minecraft", name: "MINECRAFT", color: "0 70% 45%" },
    { id: "rec", name: "REC", color: "270 60% 55%" },
    { id: "vod", name: "VOD", color: "25 95% 53%" },
    { id: "twitch", name: "TWITCH", color: "270 50% 70%" },
  ]);

  const [contents, setContents] = useState<ContentItem[]>([]);

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    const weeksInMonth = eachWeekOfInterval(
      {
        start: monthStart,
        end: monthEnd,
      },
      { locale: it, weekStartsOn: 1 }
    );

    return weeksInMonth.map((weekStart, index) => {
      const weekEnd = endOfWeek(weekStart, { locale: it, weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

      const weekDays: WeekDay[] = days.map((day) => ({
        date: day,
        dayName: day.toLocaleDateString("it-IT", { weekday: "long" }),
        dayNumber: day.getDate(),
        isSunday: isSunday(day),
      }));

      return {
        weekNumber: index + 1,
        days: weekDays,
      };
    });
  }, [currentDate]);

  // Filtro settimane e categorie
  const filteredWeeks = useMemo(() => {
    return weeks.filter((week) => selectedWeek === null || week.weekNumber === selectedWeek);
  }, [weeks, selectedWeek]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => selectedCategory === null || cat.id === selectedCategory);
  }, [categories, selectedCategory]);

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleAddContent = () => {
    setEditingContent(undefined);
    setPreselectedCategory(undefined);
    setPreselectedDate(undefined);
    setDialogOpen(true);
  };

  const handleEditContent = (
    content?: ContentItem,
    categoryId?: string,
    date?: Date
  ) => {
    setEditingContent(content);
    setPreselectedCategory(categoryId);
    setPreselectedDate(date);
    setDialogOpen(true);
  };

  const handleSaveContent = (
    content: Omit<ContentItem, "id"> & { id?: string }
  ) => {
    if (content.id) {
      setContents((prev) =>
        prev.map((c) => (c.id === content.id ? { ...content, id: content.id } : c))
      );
      toast.success("Contenuto aggiornato");
    } else {
      const newContent: ContentItem = {
        ...content,
        id: Date.now().toString(),
      };
      setContents((prev) => [...prev, newContent]);
      toast.success("Contenuto creato");
    }
  };

  const handleDeleteContent = (id: string) => {
    setContents((prev) => prev.filter((c) => c.id !== id));
    toast.success("Contenuto eliminato");
  };

  // Gestione categorie
  const handleAddCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color,
    };
    setCategories((prev) => [...prev, newCategory]);
    toast.success(`Categoria "${name}" aggiunta`);
  };

  const handleUpdateCategory = (id: string, name: string, color: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, name, color } : cat))
    );
    toast.success(`Categoria aggiornata`);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    setContents((prev) => prev.filter((c) => c.categoryId !== id));
    toast.success("Categoria eliminata");
  };

  // Creazione serie
  const handleCreateSeries = (config: SeriesConfig) => {
    const newContents: ContentItem[] = [];
    let currentDate = config.startDate;

    for (let i = config.startNumber; i <= config.endNumber; i++) {
      // Salta weekend se la frequenza è "weekdays"
      if (config.frequency === "weekdays") {
        while (isWeekend(currentDate)) {
          currentDate = addDays(currentDate, 1);
        }
      }

      const newContent: ContentItem = {
        id: `${Date.now()}_${i}`,
        title: `${config.baseTitle} ${i}`,
        categoryId: config.categoryId,
        date: currentDate,
        published: false,
      };
      newContents.push(newContent);

      // Avanza alla data successiva
      if (config.frequency === "daily") {
        currentDate = addDays(currentDate, 1);
      } else if (config.frequency === "weekdays") {
        currentDate = addDays(currentDate, 1);
      } else if (config.frequency === "weekly") {
        currentDate = addWeeks(currentDate, 1);
      }
    }

    setContents((prev) => [...prev, ...newContents]);
    toast.success(`Serie creata: ${newContents.length} contenuti aggiunti`);
  };

  // Drag & Drop
  const handleDragStart = (content: ContentItem) => {
    setDraggedContent(content);
  };

  const handleDragOver = (categoryId: string, date: Date) => {
    // Necessario per permettere il drop
  };

  const handleDrop = (categoryId: string, date: Date) => {
    if (!draggedContent) return;

    setContents((prev) =>
      prev.map((c) =>
        c.id === draggedContent.id
          ? { ...c, categoryId, date }
          : c
      )
    );
    setDraggedContent(null);
    toast.success("Contenuto spostato");
  };

  // Duplicazione
  const handleDuplicate = (content: ContentItem, newDate: Date) => {
    const duplicated: ContentItem = {
      ...content,
      id: Date.now().toString(),
      date: newDate,
    };
    setContents((prev) => [...prev, duplicated]);
    toast.success("Contenuto duplicato");
  };

  // Toggle pubblicato
  const handleTogglePublished = (content: ContentItem) => {
    setContents((prev) =>
      prev.map((c) =>
        c.id === content.id ? { ...c, published: !c.published } : c
      )
    );
    toast.success(content.published ? "Segnato come non pubblicato" : "Segnato come pubblicato");
  };

  // Quick edit inline
  const handleQuickEdit = (
    content: ContentItem | undefined,
    categoryId: string,
    date: Date,
    newTitle: string
  ) => {
    if (content) {
      // Update existing content
      setContents((prev) =>
        prev.map((c) => (c.id === content.id ? { ...c, title: newTitle } : c))
      );
      toast.success("Contenuto aggiornato");
    } else {
      // Create new content
      const newContent: ContentItem = {
        id: Date.now().toString(),
        title: newTitle,
        categoryId,
        date,
        published: false,
      };
      setContents((prev) => [...prev, newContent]);
      toast.success("Contenuto creato");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PlannerHeader
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onAddContent={handleAddContent}
      />

      <div className="flex items-center justify-between px-6 py-3 border-b border-grid-border">
        <div className="flex gap-2">
          <CategoryManager
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
          <SeriesCreator
            categories={categories}
            onCreateSeries={handleCreateSeries}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInfoDialogOpen(true)}
          className="gap-2"
        >
          <Info className="h-4 w-4" />
          Scorciatoie
        </Button>
      </div>

      <PlannerFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedWeek={selectedWeek}
        onWeekChange={setSelectedWeek}
        totalWeeks={weeks.length}
      />

      <main className="p-6">
        {filteredWeeks.map((week) => (
          <CompactWeekGrid
            key={week.weekNumber}
            weekNumber={week.weekNumber}
            weekDays={week.days}
            categories={filteredCategories}
            contents={contents}
            onEditContent={handleEditContent}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDuplicate={handleDuplicate}
            onTogglePublished={handleTogglePublished}
            onQuickEdit={handleQuickEdit}
          />
        ))}
      </main>

      <ContentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        content={editingContent}
        categories={categories}
        preselectedCategory={preselectedCategory}
        preselectedDate={preselectedDate}
        onSave={handleSaveContent}
        onDelete={handleDeleteContent}
        allContents={contents}
      />

      <InfoDialog
        open={infoDialogOpen}
        onOpenChange={setInfoDialogOpen}
      />
    </div>
  );
};

export default Index;
