import { ContentItem, Category } from "@/types/planner";
import { format, isToday, startOfDay, endOfDay } from "date-fns";
import { it } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface TaskViewProps {
  contents: ContentItem[];
  categories: Category[];
  onTogglePublished: (content: ContentItem) => void;
  onScrollToContent: (content: ContentItem) => void;
}

export const TaskView = ({
  contents,
  categories,
  onTogglePublished,
  onScrollToContent,
}: TaskViewProps) => {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  // Filtra contenuti di oggi
  const todayContents = contents.filter((c) => {
    const contentDate = startOfDay(c.date);
    return contentDate >= todayStart && contentDate <= todayEnd;
  });

  // Separa REC (produzione) da pubblicazioni
  const recCategory = categories.find((cat) => cat.name === "REC");
  const toRecord = recCategory
    ? todayContents.filter((c) => c.categoryId === recCategory.id)
    : [];
  const toPublish = todayContents.filter((c) => c.categoryId !== recCategory?.id);

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId);
  };

  const getLinkedContent = (linkedId?: string) => {
    if (!linkedId) return null;
    return contents.find((c) => c.id === linkedId);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-red-500">●</span>
            Da Registrare Oggi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {toRecord.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuna registrazione prevista oggi</p>
          ) : (
            toRecord.map((content) => {
              const linkedContent = getLinkedContent(content.linkedContentId);
              const linkedCategory = linkedContent
                ? getCategoryInfo(linkedContent.categoryId)
                : null;

              return (
                <div
                  key={content.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={content.published}
                    onCheckedChange={() => onTogglePublished(content)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{content.title}</div>
                    {content.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{content.notes}</p>
                    )}
                    {linkedContent && linkedCategory && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        → Uscirà il {format(linkedContent.date, "d MMM", { locale: it })} su{" "}
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            backgroundColor: `hsl(${linkedCategory.color} / 0.15)`,
                            borderColor: `hsl(${linkedCategory.color} / 0.4)`,
                          }}
                        >
                          {linkedCategory.name}
                        </Badge>{" "}
                        – {linkedContent.title}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onScrollToContent(content)}
                    className="p-2 hover:bg-background/50 rounded"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-green-500">●</span>
            Da Pubblicare Oggi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {toPublish.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuna pubblicazione prevista oggi</p>
          ) : (
            toPublish.map((content) => {
              const category = getCategoryInfo(content.categoryId);
              const linkedContent = getLinkedContent(content.linkedContentId);
              const linkedCategory = linkedContent
                ? getCategoryInfo(linkedContent.categoryId)
                : null;

              return (
                <div
                  key={content.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={content.published}
                    onCheckedChange={() => onTogglePublished(content)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {category && (
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            backgroundColor: `hsl(${category.color} / 0.15)`,
                            borderColor: `hsl(${category.color} / 0.4)`,
                          }}
                        >
                          {category.name}
                        </Badge>
                      )}
                      <span className="font-medium">{content.title}</span>
                    </div>
                    {content.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{content.notes}</p>
                    )}
                    {linkedContent && linkedCategory?.name === "REC" && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Registrato il {format(linkedContent.date, "d MMM", { locale: it })}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onScrollToContent(content)}
                    className="p-2 hover:bg-background/50 rounded"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};
