import { WeekDay, Category, ContentItem, VacationPeriod } from "@/types/planner";
import { CompactCell } from "./CompactCell";
import { format, isWithinInterval } from "date-fns";
import { it } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CompactWeekGridProps {
  weekNumber: number;
  weekDays: WeekDay[];
  categories: Category[];
  contents: ContentItem[];
  vacations: VacationPeriod[];
  onEditContent: (content?: ContentItem, categoryId?: string, date?: Date) => void;
  onDragStart: (content: ContentItem, isAltDrag: boolean) => void;
  onDragOver: (categoryId: string, date: Date) => void;
  onDrop: (categoryId: string, date: Date) => void;
  onDuplicate: (content: ContentItem, date: Date) => void;
  onTogglePublished: (content: ContentItem) => void;
  onQuickEdit: (content: ContentItem | undefined, categoryId: string, date: Date, newTitle: string) => void;
  onLinkHover: (contentId: string | null) => void;
  onLinkClick: (content: ContentItem) => void;
  highlightedContentId?: string | null;
}

export const CompactWeekGrid = ({
  weekNumber,
  weekDays,
  categories,
  contents,
  vacations,
  onEditContent,
  onDragStart,
  onDragOver,
  onDrop,
  onDuplicate,
  onTogglePublished,
  onQuickEdit,
  onLinkHover,
  onLinkClick,
  highlightedContentId,
}: CompactWeekGridProps) => {
  const getVacationForDate = (date: Date) => {
    return vacations.find((v) =>
      isWithinInterval(date, { start: v.startDate, end: v.endDate })
    );
  };

  const getContentsForCell = (categoryId: string, date: Date) => {
    return contents.filter(
      (c) =>
        c.categoryId === categoryId &&
        format(c.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  };

  const getContentCountForDay = (date: Date) => {
    return contents.filter(
      (c) => format(c.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    ).length;
  };

  return (
    <div className="mb-6">
      <div className="mb-2 px-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Settimana {weekNumber}
        </h3>
      </div>

      <div className="grid grid-cols-[auto_repeat(7,1fr)] border-l border-grid-border">
        {/* Header row with days */}
        <div className="h-12 border-r border-b border-grid-border bg-header sticky top-0 z-10" />
        {weekDays.map((day) => {
          const vacation = getVacationForDate(day.date);
          const contentCount = getContentCountForDay(day.date);
          return (
            <div
              key={day.date.toString()}
              className={cn(
                "h-12 border-r border-b border-grid-border bg-header text-center flex flex-col items-center justify-center sticky top-0 z-10 relative",
                day.isSunday && "bg-sunday-accent",
                vacation && "bg-vacation-overlay"
              )}
            >
              <div className="text-xs font-medium capitalize">
                {day.dayName.slice(0, 3)}
              </div>
              <div className="text-lg font-semibold">{day.dayNumber}</div>
              {contentCount > 0 && (
                <div className="absolute bottom-0 right-1 text-[9px] text-muted-foreground">
                  {contentCount}
                </div>
              )}
              {vacation && (
                <div className="absolute top-0 left-0 right-0 text-[8px] bg-vacation-accent text-vacation-text px-1 truncate">
                  {vacation.label}
                </div>
              )}
            </div>
          );
        })}

        {/* Category rows */}
        {categories.map((category) => (
          <div key={category.id} className="contents">
            {/* Category name cell */}
            <div className="h-[44px] border-r border-b border-grid-border bg-category-header flex items-center px-3 sticky left-0 z-10">
              <Badge
                variant="outline"
                className="text-xs font-semibold"
                style={{
                  backgroundColor: `hsl(${category.color} / 0.15)`,
                  borderColor: `hsl(${category.color} / 0.4)`,
                  color: `hsl(${category.color})`,
                }}
              >
                {category.name}
              </Badge>
            </div>

            {/* Day cells for this category */}
            {weekDays.map((day) => {
              const cellContents = getContentsForCell(category.id, day.date);
              const vacation = getVacationForDate(day.date);

              return (
                <CompactCell
                  key={`${category.id}-${day.date.toString()}`}
                  contents={cellContents}
                  category={category}
                  isSunday={day.isSunday}
                  date={day.date}
                  isVacation={!!vacation}
                  vacationLabel={vacation?.label}
                  onEdit={(content) => onEditContent(content, category.id, day.date)}
                  onDragStart={onDragStart}
                  onDragOver={(e) => {
                    e.preventDefault();
                    onDragOver(category.id, day.date);
                  }}
                  onDrop={() => onDrop(category.id, day.date)}
                  onDuplicate={(content) => onDuplicate(content, day.date)}
                  onTogglePublished={onTogglePublished}
                  onQuickEdit={(content, newTitle) =>
                    onQuickEdit(content, category.id, day.date, newTitle)
                  }
                  onLinkHover={onLinkHover}
                  onLinkClick={onLinkClick}
                  allContents={contents}
                  allCategories={categories}
                  highlightedContentId={highlightedContentId}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
