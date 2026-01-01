import { ContentItem, Category } from "@/types/planner";
import { format, startOfWeek, endOfWeek, addWeeks, isWithinInterval, isBefore, startOfDay } from "date-fns";
import { it } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanViewProps {
  contents: ContentItem[];
  categories: Category[];
  onTogglePublished: (content: ContentItem) => void;
  onScrollToContent: (content: ContentItem) => void;
  onEditContent: (content: ContentItem) => void;
}

export const KanbanView = ({
  contents,
  categories,
  onTogglePublished,
  onScrollToContent,
  onEditContent,
}: KanbanViewProps) => {
  const today = startOfDay(new Date());
  
  // Organize contents into columns
  const overdue = contents.filter(c => 
    !c.published && isBefore(startOfDay(c.date), today)
  );
  
  const thisWeek = contents.filter(c => {
    const contentDate = startOfDay(c.date);
    const weekStart = startOfWeek(today, { locale: it });
    const weekEnd = endOfWeek(today, { locale: it });
    return isWithinInterval(contentDate, { start: weekStart, end: weekEnd }) && !isBefore(contentDate, today);
  });
  
  const nextWeek = contents.filter(c => {
    const contentDate = startOfDay(c.date);
    const nextWeekStart = startOfWeek(addWeeks(today, 1), { locale: it });
    const nextWeekEnd = endOfWeek(addWeeks(today, 1), { locale: it });
    return isWithinInterval(contentDate, { start: nextWeekStart, end: nextWeekEnd });
  });
  
  const later = contents.filter(c => {
    const contentDate = startOfDay(c.date);
    const nextWeekEnd = endOfWeek(addWeeks(today, 1), { locale: it });
    return contentDate > nextWeekEnd;
  });

  const completed = contents.filter(c => c.published);

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId);
  };

  const columns = [
    { 
      id: 'overdue', 
      title: 'In Ritardo', 
      icon: <AlertCircle className="h-4 w-4" />,
      items: overdue, 
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30'
    },
    { 
      id: 'thisWeek', 
      title: 'Questa Settimana', 
      icon: <Clock className="h-4 w-4" />,
      items: thisWeek.filter(c => !c.published), 
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30'
    },
    { 
      id: 'nextWeek', 
      title: 'Prossima Settimana', 
      icon: <Calendar className="h-4 w-4" />,
      items: nextWeek.filter(c => !c.published), 
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30'
    },
    { 
      id: 'later', 
      title: 'Più Avanti', 
      icon: <Calendar className="h-4 w-4" />,
      items: later.filter(c => !c.published), 
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50',
      borderColor: 'border-muted'
    },
    { 
      id: 'done', 
      title: 'Completati', 
      icon: <CheckCircle2 className="h-4 w-4" />,
      items: completed, 
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
  ];

  return (
    <div className="h-full p-4 overflow-x-auto">
      <div className="flex gap-4 min-w-max h-full">
        {columns.map((column) => (
          <div 
            key={column.id} 
            className={cn(
              "w-[300px] flex flex-col rounded-xl border",
              column.borderColor,
              column.bgColor
            )}
          >
            <div className={cn(
              "px-4 py-3 border-b flex items-center justify-between",
              column.borderColor
            )}>
              <div className={cn("flex items-center gap-2 font-semibold", column.color)}>
                {column.icon}
                {column.title}
              </div>
              <Badge variant="secondary" className="text-xs">
                {column.items.length}
              </Badge>
            </div>
            
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-2">
                {column.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nessun contenuto
                  </p>
                ) : (
                  column.items.map((content) => {
                    const category = getCategoryInfo(content.categoryId);
                    
                    return (
                      <Card
                        key={content.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]",
                          content.published && "opacity-70"
                        )}
                        onClick={() => onEditContent(content)}
                      >
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={content.published}
                              onCheckedChange={() => {
                                onTogglePublished(content);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "font-medium text-sm leading-tight",
                                content.published && "line-through text-muted-foreground"
                              )}>
                                {content.title}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between gap-2">
                            {category && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0"
                                style={{
                                  backgroundColor: `hsl(${category.color} / 0.15)`,
                                  borderColor: `hsl(${category.color} / 0.4)`,
                                }}
                              >
                                {category.name}
                              </Badge>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {format(content.date, "d MMM", { locale: it })}
                            </span>
                          </div>
                          
                          {content.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {content.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    </div>
  );
};
