import { Category, ContentItem, WeekDay } from "@/types/planner";
import { CompactCell } from "./CompactCell";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CompactWeekGridProps {
  weekDays: WeekDay[];
  categories: Category[];
  contents: ContentItem[];
  weekNumber: number;
  onEditContent: (content?: ContentItem, categoryId?: string, date?: Date) => void;
  onDragStart: (content: ContentItem) => void;
  onDragOver: (categoryId: string, date: Date) => void;
  onDrop: (categoryId: string, date: Date) => void;
  onDuplicate: (content: ContentItem, date: Date) => void;
  onTogglePublished: (content: ContentItem) => void;
}

export const CompactWeekGrid = ({
  weekDays,
  categories,
  contents,
  weekNumber,
  onEditContent,
  onDragStart,
  onDragOver,
  onDrop,
  onDuplicate,
  onTogglePublished,
}: CompactWeekGridProps) => {
  const getContentForCell = (categoryId: string, date: Date) => {
    return contents.find(
      (c) =>
        c.categoryId === categoryId &&
        format(c.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  };

  return (
    <div className="mb-6">
      <div className="mb-2 px-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Settimana {weekNumber}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header row with days */}
          <div className="flex border-b border-grid-border">
            <div className="sticky left-0 z-20 bg-background min-w-[120px] border-r border-grid-border" />
            {weekDays.map((day) => (
              <div
                key={day.date.toISOString()}
                className={cn(
                  "flex-1 min-w-[100px] py-2 px-2 text-center border-r border-grid-border",
                  day.isSunday && "bg-sunday-accent"
                )}
              >
                <div className="font-semibold text-[11px] uppercase tracking-wide">
                  {format(day.date, "EEE", { locale: it })}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {format(day.date, "d MMM", { locale: it })}
                </div>
              </div>
            ))}
          </div>

          {/* Category rows */}
          {categories.map((category) => (
            <div key={category.id} className="flex border-b border-grid-border">
              <div
                className={cn(
                  "sticky left-0 z-10 flex items-center justify-center px-3 py-2 font-semibold text-[11px] border-r border-grid-border min-w-[120px] uppercase tracking-wide"
                )}
                style={{
                  backgroundColor: `hsl(${category.color} / 0.15)`,
                  color: `hsl(${category.color})`,
                }}
              >
                {category.name}
              </div>
              {weekDays.map((day) => {
                const content = getContentForCell(category.id, day.date);
                return (
                  <div key={day.date.toISOString()} className="flex-1 min-w-[100px]">
                    <CompactCell
                      content={content}
                      category={category}
                      isSunday={day.isSunday}
                      date={day.date}
                      onEdit={() => onEditContent(content, category.id, day.date)}
                      onDragStart={onDragStart}
                      onDragOver={(e) => onDragOver(category.id, day.date)}
                      onDrop={() => onDrop(category.id, day.date)}
                      onDuplicate={(c) => onDuplicate(c, day.date)}
                      onTogglePublished={onTogglePublished}
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
