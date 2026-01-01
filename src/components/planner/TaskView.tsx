import { ContentItem, Category } from "@/types/planner";
import { format, isToday, startOfDay, endOfDay } from "date-fns";
import { it } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, Video, Upload, CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Statistiche
  const totalTasks = todayContents.length;
  const completedTasks = todayContents.filter(c => c.published).length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const recordCompleted = toRecord.filter(c => c.published).length;
  const publishCompleted = toPublish.filter(c => c.published).length;

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId);
  };

  const getLinkedContent = (linkedId?: string) => {
    if (!linkedId) return null;
    return contents.find((c) => c.id === linkedId);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header con data e statistiche */}
      <div className="text-center space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {format(today, "EEEE", { locale: it })}
          </h1>
          <p className="text-lg text-muted-foreground">
            {format(today, "d MMMM yyyy", { locale: it })}
          </p>
        </div>
        
        {/* Progress Overview */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-medium">Progresso Giornaliero</span>
              </div>
              <span className="text-2xl font-bold text-primary">
                {completedTasks}/{totalTasks}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between mt-3 text-sm text-muted-foreground">
              <span>{Math.round(progressPercentage)}% completato</span>
              <span>{totalTasks - completedTasks} rimanenti</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards delle task */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Da Registrare */}
        <Card className="border-2 border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Video className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <span className="text-lg">Da Registrare</span>
                  <p className="text-xs text-muted-foreground font-normal">Contenuti da produrre oggi</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-3">
                {recordCompleted}/{toRecord.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {toRecord.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Nessuna registrazione prevista</p>
              </div>
            ) : (
              toRecord.map((content) => {
                const linkedContent = getLinkedContent(content.linkedContentId);
                const linkedCategory = linkedContent
                  ? getCategoryInfo(linkedContent.categoryId)
                  : null;

                return (
                  <TaskCard
                    key={content.id}
                    content={content}
                    onToggle={() => onTogglePublished(content)}
                    onNavigate={() => onScrollToContent(content)}
                    linkedInfo={linkedContent && linkedCategory ? {
                      date: format(linkedContent.date, "d MMM", { locale: it }),
                      category: linkedCategory.name,
                      categoryColor: linkedCategory.color,
                      title: linkedContent.title,
                    } : undefined}
                  />
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Da Pubblicare */}
        <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Upload className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <span className="text-lg">Da Pubblicare</span>
                  <p className="text-xs text-muted-foreground font-normal">Contenuti in uscita oggi</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg px-3">
                {publishCompleted}/{toPublish.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {toPublish.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Nessuna pubblicazione prevista</p>
              </div>
            ) : (
              toPublish.map((content) => {
                const category = getCategoryInfo(content.categoryId);
                const linkedContent = getLinkedContent(content.linkedContentId);
                const linkedCategory = linkedContent
                  ? getCategoryInfo(linkedContent.categoryId)
                  : null;

                return (
                  <TaskCard
                    key={content.id}
                    content={content}
                    category={category}
                    onToggle={() => onTogglePublished(content)}
                    onNavigate={() => onScrollToContent(content)}
                    linkedInfo={linkedContent && linkedCategory?.name === "REC" ? {
                      date: format(linkedContent.date, "d MMM", { locale: it }),
                      isRecording: true,
                    } : undefined}
                  />
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Messaggio motivazionale */}
      {totalTasks > 0 && completedTasks === totalTasks && (
        <Card className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border-green-500/30">
          <CardContent className="py-6 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <h3 className="text-xl font-semibold text-green-600">Ottimo lavoro!</h3>
            <p className="text-muted-foreground">Hai completato tutte le task di oggi 🎉</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface TaskCardProps {
  content: ContentItem;
  category?: Category;
  onToggle: () => void;
  onNavigate: () => void;
  linkedInfo?: {
    date: string;
    category?: string;
    categoryColor?: string;
    title?: string;
    isRecording?: boolean;
  };
}

const TaskCard = ({ content, category, onToggle, onNavigate, linkedInfo }: TaskCardProps) => {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border bg-card/50 backdrop-blur-sm",
        "hover:bg-card hover:shadow-md transition-all duration-200",
        content.published && "opacity-60"
      )}
    >
      <button
        onClick={onToggle}
        className="mt-0.5 transition-transform hover:scale-110"
      >
        {content.published ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
        )}
      </button>
      
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
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
          <span className={cn(
            "font-medium",
            content.published && "line-through text-muted-foreground"
          )}>
            {content.title}
          </span>
        </div>
        
        {content.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {content.notes}
          </p>
        )}
        
        {linkedInfo && (
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
            {linkedInfo.isRecording ? (
              <span>📹 Registrato il {linkedInfo.date}</span>
            ) : (
              <>
                <span>→ Uscirà il {linkedInfo.date} su</span>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1"
                  style={{
                    backgroundColor: `hsl(${linkedInfo.categoryColor} / 0.15)`,
                    borderColor: `hsl(${linkedInfo.categoryColor} / 0.4)`,
                  }}
                >
                  {linkedInfo.category}
                </Badge>
                <span>– {linkedInfo.title}</span>
              </>
            )}
          </div>
        )}
      </div>
      
      <button
        onClick={onNavigate}
        className="p-2 hover:bg-muted rounded-lg transition-colors"
        title="Vai al planner"
      >
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
};
