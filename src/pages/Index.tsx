import { useState, useMemo } from "react";
import { PlannerHeader } from "@/components/planner/PlannerHeader";
import { WeekGrid } from "@/components/planner/WeekGrid";
import { ContentDialog } from "@/components/planner/ContentDialog";
import { Category, ContentItem, WeekDay } from "@/types/planner";
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
} from "date-fns";
import { it } from "date-fns/locale";

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | undefined>();
  const [preselectedCategory, setPreselectedCategory] = useState<string | undefined>();
  const [preselectedDate, setPreselectedDate] = useState<Date | undefined>();

  const [categories] = useState<Category[]>([
    { id: "chronicles", name: "CHRONICLES", color: "chronicles" },
    { id: "gaming", name: "GAMING", color: "gaming" },
    { id: "minecraft", name: "MINECRAFT", color: "minecraft" },
    { id: "rec", name: "REC", color: "rec" },
    { id: "vod", name: "VOD", color: "vod" },
    { id: "twitch", name: "TWITCH", color: "twitch" },
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
    } else {
      const newContent: ContentItem = {
        ...content,
        id: Date.now().toString(),
      };
      setContents((prev) => [...prev, newContent]);
    }
  };

  const handleDeleteContent = (id: string) => {
    setContents((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PlannerHeader
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onAddContent={handleAddContent}
      />
      <main className="p-6">
        {weeks.map((week) => (
          <WeekGrid
            key={week.weekNumber}
            weekNumber={week.weekNumber}
            weekDays={week.days}
            categories={categories}
            contents={contents}
            onEditContent={handleEditContent}
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
      />
    </div>
  );
};

export default Index;
