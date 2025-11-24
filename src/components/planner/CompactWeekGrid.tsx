import { WeekDay, Category, ContentItem, VacationPeriod } from "@/types/planner";
import { CompactCell } from "./CompactCell";
import { format, isWithinInterval, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
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
  cellOpacity: { empty: number; filled: number };
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
  cellOpacity,
}: CompactWeekGridProps) => {
  const getVacationForDate = (date: Date) => {
    return vacations.find((v) =>
      isWithinInterval(date, { start: v.startDate, end: v.endDate })
    );
  };

  return (
    <div className="mb-8">
      <div className="mb-2 text-sm font-semibold text-muted-foreground px-2">
        Settimana {weekNumber}
      </div>
      <div className="border border-grid-border rounded-lg overflow-hidden">
        <div className="flex">
          {/* Colonna categorie fissa a sinistra */}
          <div className="flex-shrink-0" style={{ width: "140px" }}>
            {/* Header vuoto per allineamento */}
            <div className="h-[60px] border-b border-grid-border bg-muted/30" />
            
            {/* Lista categorie */}
            {categories.map((category) => (
              <div
                key={category.id}
                className="h-[44px] border-t border-grid-border flex items-center justify-center font-semibold text-sm px-2"
                style={{ 
                  backgroundColor: `hsl(${category.color} / 0.25)`,
                  color: `hsl(${category.color.split(' ')[0]} ${category.color.split(' ')[1]} 70%)`
                }}
              >
                {category.name}
              </div>
            ))}
          </div>

          {/* Griglia giorni e celle */}
          <div className="flex-1 overflow-x-auto">
            {/* Header giorni */}
            <div className="grid grid-cols-7">
              {weekDays.map((day) => {
                const dayContents = contents.filter((c) =>
                  isSameDay(c.date, day.date)
                );
                const contentCount = dayContents.length;
                const vacationForDay = getVacationForDate(day.date);

                return (
                  <div
                    key={day.date.toISOString()}
                    className={cn(
                      "p-1.5 text-center border-r border-grid-border last:border-r-0 border-b h-[60px] flex flex-col items-center justify-center relative gap-0.5",
                      day.isSunday && "bg-sunday-accent",
                      vacationForDay && "bg-vacation-accent border-vacation-accent"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <div className="text-[10px] font-medium uppercase">
                        {format(day.date, "EEE", { locale: it })}
                      </div>
                      <div className="text-xl font-bold">{day.dayNumber}</div>
                    </div>
                    {vacationForDay && (
                      <div className="text-[9px] font-semibold text-vacation-foreground px-1.5 py-0.5 rounded bg-vacation-badge leading-tight">
                        {vacationForDay.label}
                      </div>
                    )}
                    {contentCount > 0 && (
                      <div className="text-[9px] text-muted-foreground leading-tight">
                        {contentCount} {contentCount === 1 ? "contenuto" : "contenuti"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Righe categorie */}
            {categories.map((category) => (
              <div key={category.id} className="grid grid-cols-7">
                {weekDays.map((day) => {
                  const cellContents = contents.filter(
                    (c) => c.categoryId === category.id && isSameDay(c.date, day.date)
                  );
                  const vacationForDay = getVacationForDate(day.date);

                  return (
                    <CompactCell
                      key={`${category.id}-${day.date.toISOString()}`}
                      contents={cellContents}
                      category={category}
                      isSunday={day.isSunday}
                      date={day.date}
                      isVacation={!!vacationForDay}
                      vacationLabel={vacationForDay?.label}
                      onEdit={(content) =>
                        onEditContent(content, category.id, day.date)
                      }
                      onDragStart={onDragStart}
                      onDragOver={(e) => onDragOver(category.id, day.date)}
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
                      cellOpacity={cellOpacity}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
