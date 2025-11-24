import { Category, ContentItem, WeekDay } from "@/types/planner";
import { CategoryRow } from "./CategoryRow";
import { ContentCell } from "./ContentCell";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface WeekGridProps {
  weekDays: WeekDay[];
  categories: Category[];
  contents: ContentItem[];
  weekNumber: number;
  onEditContent: (content?: ContentItem, categoryId?: string, date?: Date) => void;
}

export const WeekGrid = ({
  weekDays,
  categories,
  contents,
  weekNumber,
  onEditContent,
}: WeekGridProps) => {
  const getContentForCell = (categoryId: string, date: Date) => {
    return contents.find(
      (c) =>
        c.categoryId === categoryId &&
        format(c.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  };

  return (
    <div className="mb-8">
      <div className="mb-2 px-4">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Settimana {weekNumber}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header row with days */}
          <div className="flex border-b border-grid-border">
            <div className="sticky left-0 z-20 bg-background min-w-[150px] border-r border-grid-border" />
            {weekDays.map((day) => (
              <div
                key={day.date.toISOString()}
                className={cn(
                  "flex-1 min-w-[140px] p-3 text-center border-r border-grid-border",
                  day.isSunday && "bg-sunday-accent"
                )}
              >
                <div className="font-semibold text-sm">
                  {format(day.date, "EEEE", { locale: it }).toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(day.date, "d MMM", { locale: it })}
                </div>
              </div>
            ))}
          </div>

          {/* Category rows */}
          {categories.map((category) => (
            <div key={category.id} className="flex border-b border-grid-border">
              <CategoryRow category={category} />
              {weekDays.map((day) => {
                const content = getContentForCell(category.id, day.date);
                return (
                  <div key={day.date.toISOString()} className="flex-1 min-w-[140px]">
                    <ContentCell
                      content={content}
                      categoryColor={category.name}
                      isSunday={day.isSunday}
                      onEdit={() => onEditContent(content, category.id, day.date)}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
