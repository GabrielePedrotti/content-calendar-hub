import { useState } from "react";
import { WeekDay, Category, ContentItem, VacationPeriod } from "@/types/planner";
import { CompactCell } from "./CompactCell";
import { DayEventsDialog } from "./DayEventsDialog";
import { format, isWithinInterval, isSameDay, isToday, getMonth } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CompactWeekGridProps {
  weekNumber: number;
  weekDays: WeekDay[];
  categories: Category[];
  contents: ContentItem[];
  vacations: VacationPeriod[];
  onEditContent: (content?: ContentItem, categoryId?: string, date?: Date, templateId?: string) => void;
  onSaveContent: (content: Omit<ContentItem, "id"> & { id?: string }) => void;
  onDragStart: (content: ContentItem, isAltDrag: boolean) => void;
  onDragOver: (categoryId: string, date: Date) => void;
  onDrop: (categoryId: string, date: Date) => void;
  onDuplicate: (content: ContentItem, date: Date) => void;
  onTogglePublished: (content: ContentItem) => void;
  onQuickEdit: (content: ContentItem | undefined, categoryId: string, date: Date, newTitle: string) => void;
  onLinkHover: (contentId: string | null) => void;
  onLinkClick: (content: ContentItem) => void;
  onDeleteContent: (id: string) => void;
  onUpdateVacation?: (vacation: VacationPeriod) => void;
  onDeleteVacation?: (id: string) => void;
  highlightedContentId?: string | null;
  cellOpacity: { empty: number; filled: number };
  endlessMode: boolean;
  monthLabelDate?: Date;
  isPrimaryTemplateMode?: boolean;
  isSecondaryTemplateMode?: boolean;
  templates?: { id: string; name: string; defaultCategoryId?: string }[];
  onCategoryHover?: (categoryId: string | null) => void;
  onDateHover?: (date: Date | null) => void;
  onContentHover?: (contentId: string | null) => void;
}

export const CompactWeekGrid = ({
  weekNumber,
  weekDays,
  categories,
  contents,
  vacations,
  onEditContent,
  onSaveContent,
  onDragStart,
  onDragOver,
  onDrop,
  onDuplicate,
  onTogglePublished,
  onQuickEdit,
  onLinkHover,
  onLinkClick,
  onDeleteContent,
  onUpdateVacation,
  onDeleteVacation,
  highlightedContentId,
  cellOpacity,
  endlessMode,
  monthLabelDate,
  isPrimaryTemplateMode = false,
  isSecondaryTemplateMode = false,
  templates = [],
  onCategoryHover,
  onDateHover,
  onContentHover,
}: CompactWeekGridProps) => {
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
    setDayDialogOpen(true);
  };

  const getVacationForDate = (date: Date) => {
    return vacations.find((v) =>
      isWithinInterval(date, { start: v.startDate, end: v.endDate })
    );
  };

  const getDayContents = (date: Date) => {
    return contents.filter((c) => isSameDay(c.date, date));
  };

  // In modalità endless, mostriamo TUTTI i giorni della settimana senza nasconderli
  // In modalità normale, non c'è mese di riferimento (tutti i giorni visibili)
  const referenceMonth = null; // Rimosso il controllo per mostrare sempre tutti i giorni

  // In endless mode, determina se la settimana attraversa due mesi
  const weekMonths = endlessMode 
    ? [...new Set(weekDays.map(day => getMonth(day.date)))]
    : [];
  const isCrossMonthWeek = weekMonths.length > 1;

  // Mese di riferimento per questa settimana (il primo mese che appare)
  const primaryMonth = endlessMode && monthLabelDate ? getMonth(monthLabelDate) : null;

  const CONTENT_LINE_HEIGHT = 24;

  // Calcola il numero massimo di contenuti per ogni riga di categoria
  const getMaxContentsInRow = (categoryId: string) => {
    let max = 0;
    weekDays.forEach((day) => {
      const count = contents.filter(
        (c) => c.categoryId === categoryId && isSameDay(c.date, day.date)
      ).length;
      max = Math.max(max, count);
    });
    return max;
  };

  // Calcola quanti contenuti mostrare per una categoria in base all'altezza minima
  const getMaxVisibleContents = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const minHeight = category?.minRowHeight || 44;
    // Ogni contenuto ha bisogno di circa 24px
    return Math.max(1, Math.floor(minHeight / CONTENT_LINE_HEIGHT));
  };

  // Calcola l'altezza della riga - usa sempre l'altezza minima della categoria
  // Si espande solo se ci sono PIÙ contenuti di quelli che l'altezza minima può mostrare
  const getRowHeight = (categoryId: string, maxContents: number) => {
    const category = categories.find(c => c.id === categoryId);
    const minHeight = category?.minRowHeight || 44;
    
    // Calcola quanti contenuti possono essere visualizzati con l'altezza minima
    const maxVisible = getMaxVisibleContents(categoryId);
    
    // Se ci sono più contenuti di quelli visibili, espandi l'altezza
    if (maxContents > maxVisible) {
      const extraContents = maxContents - maxVisible;
      return `${minHeight + extraContents * CONTENT_LINE_HEIGHT}px`;
    }
    
    // Altrimenti usa sempre l'altezza minima configurata
    return `${minHeight}px`;
  };

  // Determina se questo giorno è il primo di un mese diverso nella settimana
  const isMonthBoundary = (dayIndex: number) => {
    if (!endlessMode || !isCrossMonthWeek || dayIndex === 0) return false;
    const currentMonth = getMonth(weekDays[dayIndex].date);
    const prevMonth = getMonth(weekDays[dayIndex - 1].date);
    return currentMonth !== prevMonth;
  };

  return (
    <div className="mb-8" data-week-number={weekNumber}>
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
            {categories.map((category) => {
              const maxInRow = getMaxContentsInRow(category.id);
              const maxVisible = getMaxVisibleContents(category.id);
              return (
                <div
                  key={category.id}
                  className="border-t border-grid-border flex items-center justify-center font-semibold text-sm px-2"
                  style={{ 
                    backgroundColor: `hsl(${category.color} / 0.25)`,
                    color: `hsl(${category.color.split(' ')[0]} ${category.color.split(' ')[1]} 70%)`,
                    height: getRowHeight(category.id, maxInRow)
                  }}
                >
                  {category.name}
                </div>
              );
            })}
          </div>

      {/* Griglia giorni e celle */}
      <div className="flex-1 overflow-x-auto">
        {/* Header giorni */}
        <div className="grid grid-cols-7">
          {weekDays.map((day, dayIndex) => {
            const dayContents = contents.filter((c) =>
              isSameDay(c.date, day.date)
            );
            const contentCount = dayContents.length;
            const vacationForDay = getVacationForDate(day.date);

            const isInReferenceMonth =
              !endlessMode || !referenceMonth
                ? true
                : day.date.getMonth() === referenceMonth.getMonth() &&
                  day.date.getFullYear() === referenceMonth.getFullYear();

            const isTodayDate = isToday(day.date);
            
            // Controlla se questo giorno è di un mese diverso dal mese primario della settimana
            const dayMonth = getMonth(day.date);
            const isDifferentMonth = endlessMode && isCrossMonthWeek && primaryMonth !== null && dayMonth !== primaryMonth;
            const showMonthBoundary = isMonthBoundary(dayIndex);
            
            return (
              <div
                key={day.date.toISOString()}
                onClick={() => isInReferenceMonth && handleDayClick(day.date)}
                className={cn(
                  "p-1.5 text-center border-r border-grid-border last:border-r-0 border-b h-[60px] flex flex-col items-center justify-center relative gap-0.5 cursor-pointer transition-colors hover:bg-accent/50",
                  day.isSunday && "bg-sunday-accent",
                  vacationForDay && "bg-vacation-accent border-vacation-accent",
                  !isInReferenceMonth && "opacity-40 cursor-default hover:bg-transparent",
                  isTodayDate && "bg-[hsl(var(--today-accent)/0.15)] ring-2 ring-[hsl(var(--today-ring))] ring-inset",
                  showMonthBoundary && "border-l-2 border-l-[hsl(var(--month-divider))]"
                )}
              >
                {isInReferenceMonth ? (
                  <>
                    {/* Badge mese per giorni di mesi diversi */}
                    {isDifferentMonth && (
                      <div className="absolute top-0.5 left-0.5 text-[7px] font-bold uppercase bg-[hsl(var(--month-badge-bg))] text-[hsl(var(--month-badge-text))] px-1 py-0.5 rounded leading-none">
                        {format(day.date, "MMM", { locale: it })}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <div className={cn(
                        "text-[10px] font-medium uppercase",
                        isTodayDate && "text-[hsl(var(--today-accent))]"
                      )}>
                        {format(day.date, "EEE", { locale: it })}
                      </div>
                      <div className={cn(
                        "text-xl font-bold",
                        isTodayDate && "text-[hsl(var(--today-accent))]"
                      )}>
                        {day.dayNumber}
                      </div>
                      {isTodayDate && (
                        <div className="absolute top-1 right-1 text-[8px] font-bold bg-[hsl(var(--today-accent))] text-background px-1.5 py-0.5 rounded">
                          OGGI
                        </div>
                      )}
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
                  </>
                ) : null}
              </div>
            );
          })}
        </div>

            {/* Righe categorie */}
            {categories.map((category) => {
              const maxInRow = getMaxContentsInRow(category.id);
              const maxVisible = getMaxVisibleContents(category.id);
              return (
                <div key={category.id} className="grid grid-cols-7">
                  {weekDays.map((day, dayIndex) => {
                    const cellContents = contents.filter(
                      (c) => c.categoryId === category.id && isSameDay(c.date, day.date)
                    );
                    const vacationForDay = getVacationForDate(day.date);
                    
                    // In modalità endless, disabilita celle che non appartengono al mese di riferimento
                    const isDisabled = endlessMode && referenceMonth 
                      ? day.date.getMonth() !== referenceMonth.getMonth() || 
                        day.date.getFullYear() !== referenceMonth.getFullYear()
                      : false;

                    // Bordo divisorio tra mesi
                    const showMonthBoundary = isMonthBoundary(dayIndex);

                    return (
                      <CompactCell
                        key={`${category.id}-${day.date.toISOString()}`}
                        contents={cellContents}
                        category={category}
                        isSunday={day.isSunday}
                        date={day.date}
                        isVacation={!!vacationForDay}
                        vacationLabel={vacationForDay?.label}
                        onEdit={(content, templateId) =>
                          onEditContent(content, category.id, day.date, templateId)
                        }
                        onDragStart={onDragStart}
                        onDragOver={(e) => onDragOver(category.id, day.date)}
                        onDrop={() => onDrop(category.id, day.date)}
                        onDuplicate={(content) => onDuplicate(content, day.date)}
                        onTogglePublished={onTogglePublished}
                        onDelete={(content) => onDeleteContent(content.id)}
                        onQuickEdit={(content, newTitle) =>
                          onQuickEdit(content, category.id, day.date, newTitle)
                        }
                        onLinkHover={onLinkHover}
                        onLinkClick={onLinkClick}
                        allContents={contents}
                        allCategories={categories}
                        highlightedContentId={highlightedContentId}
                        cellOpacity={cellOpacity}
                        maxContentsInRow={maxInRow}
                        maxVisibleContents={maxVisible}
                        isDisabled={isDisabled}
                        isPrimaryTemplateMode={isPrimaryTemplateMode}
                        isSecondaryTemplateMode={isSecondaryTemplateMode}
                        templates={templates}
                        onCategoryHover={onCategoryHover}
                        onDateHover={onDateHover}
                        onContentHover={onContentHover}
                        cellDate={day.date}
                        showMonthBoundary={showMonthBoundary}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day Events Dialog */}
      {selectedDay && (
        <DayEventsDialog
          open={dayDialogOpen}
          onOpenChange={setDayDialogOpen}
          date={selectedDay}
          contents={getDayContents(selectedDay)}
          categories={categories}
          allContents={contents}
          vacations={vacations}
          onAddContent={(categoryId) => {
            setDayDialogOpen(false);
            onEditContent(undefined, categoryId, selectedDay);
          }}
          onEditContent={(content) => {
            setDayDialogOpen(false);
            onEditContent(content);
          }}
          onDeleteContent={onDeleteContent}
          onTogglePublished={onTogglePublished}
          onSaveContent={onSaveContent}
          onUpdateVacation={onUpdateVacation}
          onDeleteVacation={onDeleteVacation}
        />
      )}
    </div>
  );
};
